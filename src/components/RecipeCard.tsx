import React, { useState, useEffect } from 'react';
import { Heart, Clock, Sparkles } from 'lucide-react';
import { generateRecipeImage } from '@/lib/openai';
import RecipeDetailModal from './RecipeDetailModal';

interface RecipeCardProps {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  useAIImage?: boolean;
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
    sodium?: number;
    fiber?: number;
  };
  ingredients?: string[];
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  image,
  readyInMinutes,
  servings,
  favorite = false,
  onToggleFavorite,
  useAIImage = false,
  macros,
  ingredients,
}) => {
  const [aiImageUrl, setAiImageUrl] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (useAIImage && !aiImageUrl && !isGeneratingImage) {
      generateAIImage();
    }
  }, [useAIImage, aiImageUrl, isGeneratingImage]);

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

  const handleClick = () => {
    setShowModal(true);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Determine which image to show
  const displayImage = useAIImage && aiImageUrl && !imageError ? aiImageUrl : image;
  const showAIIndicator = useAIImage && aiImageUrl && !imageError;

  return (
    <>
      <div 
        className="recipe-card bg-gray-100 rounded-xl overflow-hidden cursor-pointer relative"
        onClick={handleClick}
      >
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
          
          {onToggleFavorite && (
            <button 
              className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
              onClick={handleFavoriteClick}
            >
              <Heart 
                size={20} 
                className={favorite ? "fill-red-500 text-red-500" : "text-white"} 
              />
            </button>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
          {(readyInMinutes || servings) && (
            <div className="flex items-center mt-2 text-gray-400 text-sm">
              {readyInMinutes && (
                <div className="flex items-center mr-4">
                  <Clock size={14} className="mr-1" />
                  <span>{readyInMinutes} min</span>
                </div>
              )}
              {servings && (
                <div>
                  <span>• {servings} servings</span>
                </div>
              )}
            </div>
          )}
          
          {ingredients && ingredients.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Ingredients:</h4>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="line-clamp-1">{ingredient}</li>
                ))}
              </ul>
            </div>
          )}
          
          {macros && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Macros:</h4>
              <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                {macros.calories && (
                  <span>{macros.calories} kcal</span>
                )}
                {macros.protein && (
                  <span>{macros.protein}g P</span>
                )}
                {macros.carbs && (
                  <span>{macros.carbs}g C</span>
                )}
                {macros.fat && (
                  <span>{macros.fat}g F</span>
                )}
                {macros.sugar && (
                  <span>{macros.sugar}g sugar</span>
                )}
                {macros.sodium && (
                  <span>{macros.sodium}mg Na</span>
                )}
                {macros.fiber && (
                  <span>{macros.fiber}g fiber</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <RecipeDetailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        recipe={{
          id,
          title,
          image: displayImage,
          readyInMinutes,
          servings,
          favorite,
          useAIImage,
          macros,
          ingredients,
        }}
        onToggleFavorite={onToggleFavorite}
      />
    </>
  );
};

export default RecipeCard;
