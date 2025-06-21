
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';

interface RecipeCardProps {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  image,
  readyInMinutes,
  servings,
  favorite = false,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipe/${id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  return (
    <div 
      className="recipe-card bg-cookify-darkgray rounded-xl overflow-hidden cursor-pointer relative"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
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
      </div>
    </div>
  );
};

export default RecipeCard;
