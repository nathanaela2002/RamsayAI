import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, Loader2, CheckCircle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { detectFoodItems, DetectedFood } from '@/lib/foodDetection';
import { getGPTResponse } from '@/lib/openai';

interface ImageUploadFormProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

type FoodItem = DetectedFood & { unit: 'count' | 'grams' };

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({ onIngredientsDetected }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Camera stream refs / state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // auto start camera on mount
    openCamera();
  }, []);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDetectedFoods([]);
      // Cancel camera preview when an image is uploaded
      closeCamera();
    } else {
      setError('Please select a valid image file.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /* ------------------------------------------------------------------
   * Camera capture helpers using MediaDevices API
   * ----------------------------------------------------------------*/
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setVideoStream(stream);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Unable to access camera. Please allow camera permissions.');
    }
  };

  const closeCamera = () => {
    videoStream?.getTracks().forEach((track) => track.stop());
    setVideoStream(null);
    setIsCameraActive(false);
  };

  const snapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const targetW = 640;
    const scale = targetW / video.videoWidth;
    const targetH = video.videoHeight * scale;
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, targetW, targetH);

    // Convert the canvas image directly into a File object, so we can
    // reuse the same file-handling flow as a regular upload.
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
      handleFileSelect(file);
    }, 'image/jpeg', 0.8);

    closeCamera();
  };

  // attach stream to video element
  useEffect(() => {
    if (videoRef.current && videoStream) {
      // @ts-ignore: assigning stream to HTMLVideoElement
      videoRef.current.srcObject = videoStream;
    }
    return () => {
      videoStream?.getTracks().forEach((t) => t.stop());
    };
  }, [videoStream]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setDetectedFoods([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reopen camera immediately after image is cleared
    openCamera();
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const base64 = await fileToBase64(selectedImage);
      
      // Call the food detection API
      const result = await detectFoodItems(base64);

      // If nothing is detected, show an error prompting the user to try again
      if (result.foods.length === 0) {
        setDetectedFoods([]);
        setError('No items detected. Please retake the photo or upload a clearer image.');
        return;
      }

      // Ask OpenAI which unit fits each ingredient
      const names = Array.from(new Set(result.foods.map(f=>f.name)));
      let unitMap: Record<string,'count'|'grams'> = {};
      try {
        const prompt = `For the following ingredients decide whether they are more commonly measured by item count (qty) or by weight in grams. Respond ONLY with valid JSON like {"apple":"count","rice":"grams"}.  Ingredients: ${names.join(', ')}`;
        const resp = await getGPTResponse([
          {role:'system',content:'You output only JSON.'},
          {role:'user',content:prompt}
        ]);
        unitMap = JSON.parse(resp);
      } catch{}

      /* ------------------------------------------------------------
         🏋️‍♂️  Ask OpenAI to estimate reasonable gram weights
         for ingredients that should be measured in grams.
      ------------------------------------------------------------ */
      let weightMap: Record<string, number> = {};
      const gramIngredients = names.filter((n)=>unitMap[n]==='grams');
      if(gramIngredients.length>0){
        try{
          const weightPrompt = `Estimate a realistic single-serving weight in grams for each of these ingredients. Respond ONLY with valid JSON like {"rice":120,"flour":200}. Ingredients: ${gramIngredients.join(', ')}`;
          const weightResp = await getGPTResponse([
            {role:'system',content:'Respond only with JSON mapping ingredient to grams as numbers.'},
            {role:'user',content:weightPrompt}
          ]);
          weightMap = JSON.parse(weightResp);
        }catch{/* fallback to defaults if parsing fails */}
      }

      const foodsWithUnit = result.foods.map(f => {
        const unit = unitMap[f.name] ?? 'count';
        // If unit is grams, use estimated weight or fallback to detected count
        const count = unit==='grams' ? (weightMap[f.name] ?? f.count ?? 100) : f.count;
        return { ...f, unit, count } as FoodItem;
      });
      setDetectedFoods(foodsWithUnit);
      
      // Prevent sending if any ingredient is unnamed
      const unnamed = foodsWithUnit.find(f => !f.name.trim());
      if (unnamed) {
        setError('Please name all ingredients before continuing.');
        return;
      }

      // Convert detected foods to ingredients list (grams vs qty)
      const ingredients = foodsWithUnit.map(item => item.unit==='grams' ? `${item.count}g ${item.name}` : `${item.count} ${item.name}`);
      onIngredientsDetected(ingredients);
      
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const updateFoodCount = (index: number, newCount: number) => {
    if (newCount < 0) return;
    
    setDetectedFoods(prev => 
      prev.map((food, i) => 
        i === index ? { ...food, count: newCount } : food
      )
    );
  };

  const removeFoodItem = (index: number) => {
    setDetectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const updateFoodName = (index: number, newName: string) => {
    setDetectedFoods(prev =>
      prev.map((food, i) =>
        i === index ? { ...food, name: newName.toLowerCase() } : food
      )
    );
  };

  // Add an empty ingredient placeholder (count 1) and focus it for editing
  const addEmptyIngredient = () => {
    const newFood: FoodItem = {
      name: '',
      count: 1,
      confidence: 1,
      category: 'manual',
      unit: 'count',
    } as FoodItem;
    setDetectedFoods(prev => [...prev, newFood]);
    setEditingIndex(detectedFoods.length); // focus the new entry
  };

  // Whenever the detectedFoods state changes, send the latest list (if all names filled)
  useEffect(() => {
    if (detectedFoods.length === 0) return;
    const allNamed = detectedFoods.every(f => f.name.trim());
    if (!allNamed) return; // wait until all are named

    const ingredients = detectedFoods.map(item => item.unit==='grams' ? `${item.count}g ${item.name}` : `${item.count} ${item.name}`);
    onIngredientsDetected(ingredients);
  }, [detectedFoods, onIngredientsDetected]);

  const toggleUnit = (index:number) => {
    setDetectedFoods(prev => prev.map((f,i)=> i===index? { ...f, unit: f.unit==='count'?'grams':'count'}:f));
  };

  const handleCountChange = (index:number, value:number) => {
    if(value<0) return;
    setDetectedFoods(prev=> prev.map((f,i)=> i===index? { ...f, count:value }:f));
  };

  return (
    <div className="space-y-4">
      <Card className="bg-cookify-darkgray border-cookify-lightgray">
        <CardContent className="p-6">
          {/* Camera preview & capture */}
          
          {isCameraActive ? (
            /* -------------------- Live camera preview -------------------- */
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-h-[480px] object-contain bg-black"
                />
                {/* bottom bezel */}
                <div className="absolute bottom-0 left-0 w-full h-16 bg-black flex items-center justify-center">
                  <Button
                    type="button"
                    onClick={snapPhoto}
                    className="bg-white rounded-full w-12 h-12 p-0"
                  >
                    <span className="sr-only">Capture</span>
                  </Button>
                </div>
              </div>

              {/* Upload button always below camera */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-4 bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          ) : previewUrl ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[480px] object-contain rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 border-red-600 text-white hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                type="button"
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="px-6 py-4 bg-cookify-blue text-white hover:bg-blue-600"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  'Analyze Food Items'
                )}
              </Button>
            </div>
          ) : (
            /* ------------------- Default drop zone ------------------- */
            <div
              className="border-2 border-dashed border-cookify-lightgray rounded-lg p-8 text-center hover:border-cookify-blue transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-white mb-2">
                Drag and drop an image here, or click to select
              </p>
              <div className="flex gap-2 mt-4 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-6 py-4 bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCamera();
                  }}
                  className="px-6 py-4 bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Detected Foods */}
      {detectedFoods.length > 0 && (
        <Card className="bg-cookify-darkgray border-cookify-lightgray">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Detected Food Items
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={addEmptyIngredient}
                  variant="outline"
                  size="sm"
                  className="px-6 py-4 bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
                >
                  Add more ingredients
                </Button>
               
              </div>
            </div>
            
            <div className="space-y-3">
              {detectedFoods.map((food, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-cookify-lightgray rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={food.name}
                          autoFocus
                          onChange={e => updateFoodName(index, e.target.value)}
                          onBlur={() => setEditingIndex(null)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setEditingIndex(null);
                            }
                          }}
                          className="w-full bg-transparent border-b border-cookify-blue outline-none text-white placeholder-gray-400 capitalize"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingIndex(index)}
                          className="flex items-center gap-1 text-white font-medium capitalize focus:outline-none"
                        >
                          {food.name}
                          <Pencil className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {food.unit==='count' && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateFoodCount(index, food.count - 1)}
                          className="h-8 w-8 p-0 bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
                        >-
                        </Button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={food.count}
                          onChange={e=>handleCountChange(index, parseInt(e.target.value)||0)}
                          className="w-16 text-center bg-transparent border-b-2 border-transparent focus:border-cookify-blue text-white focus:outline-none"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateFoodCount(index, food.count + 1)}
                          className="h-8 w-8 p-0 bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
                        >+
                        </Button>
                      </>
                    )}
                    {food.unit==='grams' && (
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={food.count}
                        onChange={e=>handleCountChange(index, parseInt(e.target.value)||0)}
                        className="w-20 text-center bg-transparent border-b-2 border-transparent focus:border-cookify-blue text-white focus:outline-none"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => toggleUnit(index)}
                      className="text-xs text-green-600 hover:underline min-w-[2.5rem]"
                    >{food.unit==='grams'?'g':'qty'}</button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUploadForm;
