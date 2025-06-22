import React, { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { generateRecipeImage } from '@/lib/openai';

interface MealCardProps {
  title: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onClick?: () => void;
  readyInMinutes?: number;
  servings?: number;
  ingredients?: string[];
  useAIImage?: boolean;
  uniqueId?: string;
  showImage?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ 
  title, 
  macros, 
  onClick, 
  readyInMinutes = 30,
  servings = 2,
  ingredients = [],
  useAIImage = true,
  uniqueId = '',
  showImage = true,
}) => {
  const [aiImageUrl, setAiImageUrl] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setAiImageUrl('');
    setImageError(false);
    setIsGeneratingImage(false);
  }, [uniqueId]);

  useEffect(() => {
    if (showImage && useAIImage && !aiImageUrl && !isGeneratingImage) {
      generateAIImage();
    }
  }, [showImage, useAIImage, aiImageUrl, isGeneratingImage, uniqueId]);

  const generateAIImage = async () => {
    setIsGeneratingImage(true);
    try {
      const generatedUrl = await generateRecipeImage(title);
      if (generatedUrl) {
        setAiImageUrl(generatedUrl);
      }
    } catch (error) {
      console.error('Failed to generate AI image:', error);
      setImageError(true);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const displayImage = useAIImage && aiImageUrl && !imageError 
    ? aiImageUrl 
    : `https://source.unsplash.com/400x300/?${title.toLowerCase().replace(/\s+/g, '-')},food&sig=${uniqueId}`;
  const showAIIndicator = useAIImage && aiImageUrl && !imageError;

  return (
    <div 
      className="recipe-card bg-gray-100 rounded-xl overflow-hidden cursor-pointer relative"
      onClick={onClick}
    >
      {showImage && (
        <div className="relative h-48 overflow-hidden">
          {isGeneratingImage ? (
            <div className="w-full h-full flex items-center justify-center bg-cookify-lightgray">
              <div className="text-center">
                <Sparkles className="mx-auto h-8 w-8 text-cookify-blue animate-pulse mb-2" />
                <p className="text-sm text-gray-400">Generating AI image...</p>
              </div>
            </div>
          ) : (
            <img 
              src={displayImage} 
              alt={title} 
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          
          {showAIIndicator && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded-full px-2 py-1">
              <Sparkles size={12} className="text-cookify-blue" />
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        <div className="flex items-center mt-2 text-gray-400 text-sm">
          <div className="flex items-center mr-4">
            <Clock size={14} className="mr-1" />
            <span>{readyInMinutes} min</span>
          </div>
          <div>
            <span>• {servings} servings</span>
          </div>
        </div>
        
        {ingredients && ingredients.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
              {ingredients.slice(0, 3).map((ingredient, index) => (
                <li key={index} className="line-clamp-1">{ingredient}</li>
              ))}
              {ingredients.length > 3 && (
                <li className="text-gray-500">+{ingredients.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Macros:</h4>
          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
            <span>{macros.calories} kcal</span>
            <span>{macros.protein}g P</span>
            <span>{macros.carbs}g C</span>
            <span>{macros.fat}g F</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealCard; 