import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { detectFoodItems, DetectedFood } from '@/lib/foodDetection';

interface ImageUploadFormProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({ onIngredientsDetected }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Camera stream refs / state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCount, setManualCount] = useState('1');

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

      setDetectedFoods(result.foods);
      
      // Convert detected foods to ingredients list
      const ingredients = result.foods.map(item => `${item.count} ${item.name}`);
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

  const applyDetectedFoods = () => {
    const ingredients = detectedFoods.map(item => `${item.count} ${item.name}`);
    onIngredientsDetected(ingredients);
  };

  const handleAddManualFood = () => {
    if (!manualName.trim()) return;
    const cnt = parseInt(manualCount) > 0 ? parseInt(manualCount) : 1;
    const manualFood = {
      name: manualName.trim().toLowerCase(),
      count: cnt,
      confidence: 1,
      category: 'manual',
    } as DetectedFood;
    setDetectedFoods(prev => [...prev, manualFood]);
    setManualName('');
    setManualCount('1');
    setShowManualAdd(false);
  };

  const handleManualKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddManualFood();
    }
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
                className="w-full bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
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
                className="w-full bg-cookify-blue text-white hover:bg-blue-600"
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
                  className="bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
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
                  className="bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
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
                  onClick={() => setShowManualAdd(p=>!p)}
                  variant="outline"
                  size="sm"
                  className="bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
                >
                  Add more ingredients
                </Button>
               
              </div>
            </div>
            
            {showManualAdd && (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={manualName}
                  onChange={e=>setManualName(e.target.value)}
                  onKeyDown={handleManualKey}
                  placeholder="Ingredient name"
                  className="flex-1 p-2 rounded bg-cookify-lightgray text-white placeholder-gray-400 border-none"
                />
                <input
                  type="number"
                  min="1"
                  value={manualCount}
                  onChange={e=>setManualCount(e.target.value)}
                  onKeyDown={handleManualKey}
                  className="w-20 p-2 rounded bg-cookify-lightgray text-white border-none"
                />
                <Button type="button" onClick={handleAddManualFood} className="p-2 bg-cookify-blue text-white rounded">
                  Add
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {detectedFoods.map((food, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-cookify-lightgray rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="text-white font-medium capitalize">
                        {food.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateFoodCount(index, food.count - 1)}
                        className="h-8 w-8 p-0 bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
                      >
                        -
                      </Button>
                      <span className="text-white font-medium min-w-[2rem] text-center">
                        {food.count}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateFoodCount(index, food.count + 1)}
                        className="h-8 w-8 p-0 bg-cookify-lightgray border-cookify-blue text-white hover:bg-cookify-blue"
                      >
                        +
                      </Button>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFoodItem(index)}
                      className="h-8 w-8 p-0 bg-red-600 border-red-600 text-white hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
