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
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setError(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setDetectedFoods([]);
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
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedUrl(dataUrl);
    closeCamera();
  };

  const approvePhoto = () => {
    if (!capturedUrl) return;
    // Convert dataURL to File for downstream logic
    const arr = capturedUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    const file = new File([u8arr], 'captured.png', { type: mime });
    handleFileSelect(file);
    setCapturedUrl(null);
  };

  const retakePhoto = () => {
    setCapturedUrl(null);
    openCamera();
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

  return (
    <div className="space-y-4">
      <Card className="bg-cookify-darkgray border-cookify-lightgray">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Upload Refrigerator/Pantry Image
          </h3>
          
          {isCameraActive ? (
            /* -------------------- Live camera preview -------------------- */
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-lg bg-black"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={snapPhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-cookify-blue text-white hover:bg-blue-600"
              >
                Snap Photo
              </Button>
            </div>
          ) : capturedUrl ? (
            /* -------------------- Captured photo preview ------------------ */
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedUrl}
                  alt="Captured"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={approvePhoto}
                  className="flex-1 bg-cookify-blue text-white hover:bg-blue-600"
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={retakePhoto}
                  className="flex-1 border-cookify-blue text-white hover:bg-cookify-blue"
                >
                  Retake
                </Button>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
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
              <p className="text-gray-400 text-sm">
                Supports JPG, PNG, GIF up to 10MB
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
              <Button
                type="button"
                onClick={applyDetectedFoods}
                className="bg-cookify-blue text-white hover:bg-blue-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Add to Ingredients
              </Button>
            </div>
            
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
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {food.category}
                        </Badge>
                        <span className="text-gray-400 text-xs">
                          {Math.round(food.confidence * 100)}% confidence
                        </span>
                      </div>
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
