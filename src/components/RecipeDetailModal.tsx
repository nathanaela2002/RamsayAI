import React, { useState, useEffect } from 'react';
import { X, Clock, Users, Sparkles, Star, Plus, Minus, Heart, Share2, BookOpen, ChefHat, Utensils } from 'lucide-react';
import { generateRecipeImage } from '@/lib/openai';

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: {
    id: number;
    title: string;
    image: string;
    readyInMinutes?: number;
    servings?: number;
    favorite?: boolean;
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
  };
  onToggleFavorite?: () => void;
  showImage?: boolean;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  onClose,
  recipe,
  onToggleFavorite,
  showImage = true,
}) => {
  const [aiImageUrl, setAiImageUrl] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [servings, setServings] = useState(recipe.servings || 4);
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'instructions' | 'nutrition' | 'tips'>('overview');

  useEffect(() => {
    if (showImage && recipe.useAIImage && !aiImageUrl && !isGeneratingImage) {
      generateAIImage();
    }
  }, [showImage, recipe.useAIImage, aiImageUrl, isGeneratingImage]);

  const generateAIImage = async () => {
    setIsGeneratingImage(true);
    try {
      const generatedUrl = await generateRecipeImage(recipe.title);
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

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleServingsChange = (increment: boolean) => {
    const newServings = increment ? servings + 1 : servings - 1;
    if (newServings >= 1 && newServings <= 20) {
      setServings(newServings);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${recipe.title} - ${window.location.href}`);
    }
  };

  // Determine which image to show
  const displayImage = recipe.useAIImage && aiImageUrl && !imageError ? aiImageUrl : recipe.image;
  const showAIIndicator = recipe.useAIImage && aiImageUrl && !imageError;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header Image (optional) */}
        {showImage && (
          <div className="relative">
            <div className="relative h-64 overflow-hidden rounded-t-xl">
              {isGeneratingImage ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-cookify-blue animate-pulse mb-2" />
                    <p className="text-sm text-gray-600">Generating AI image...</p>
                  </div>
                </div>
              ) : (
                <img 
                  src={displayImage} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              )}
              
              {showAIIndicator && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-full px-3 py-1 flex items-center">
                  <Sparkles size={14} className="text-cookify-blue mr-1" />
                  <span className="text-white text-sm">AI Generated</span>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title and Actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h2>
              <div className="flex items-center space-x-4 text-gray-600">
                {recipe.readyInMinutes && (
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{recipe.readyInMinutes} minutes</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{servings} servings</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-100 hover:bg-cookify-blue hover:text-white transition-colors"
              >
                <Share2 size={18} />
              </button>
              {onToggleFavorite && (
                <button
                  onClick={handleFavoriteClick}
                  className="p-2 rounded-full bg-gray-100 hover:bg-cookify-blue hover:text-white transition-colors"
                >
                  <Heart 
                    size={18} 
                    className={recipe.favorite ? "fill-red-500 text-red-500" : ""} 
                  />
                </button>
              )}
            </div>
          </div>

          {/* Servings Adjuster removed as per UI simplification */}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: BookOpen },
              { id: 'ingredients', label: 'Ingredients', icon: Utensils },
              { id: 'instructions', label: 'Instructions', icon: ChefHat },
              { id: 'nutrition', label: 'Nutrition', icon: Star },
              { id: 'tips', label: 'Tips & Variations', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-cookify-blue text-cookify-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Recipe Summary</h3>
                  <p className="text-gray-700 leading-relaxed">
                    This delicious {recipe.title.toLowerCase()} is perfect for a healthy meal that fits your macro requirements. 
                    It's quick to prepare and packed with nutritious ingredients that will keep you satisfied.
                  </p>
                </div>
                
                {recipe.macros && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-gray-900 font-medium mb-3">Nutritional Highlights</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {recipe.macros.calories && (
                        <div className="text-center">
                          <div className="text-cookify-blue font-bold">{recipe.macros.calories}</div>
                          <div className="text-gray-600 text-sm">Calories</div>
                        </div>
                      )}
                      {recipe.macros.protein && (
                        <div className="text-center">
                          <div className="text-cookify-blue font-bold">{recipe.macros.protein}g</div>
                          <div className="text-gray-600 text-sm">Protein</div>
                        </div>
                      )}
                      {recipe.macros.carbs && (
                        <div className="text-center">
                          <div className="text-cookify-blue font-bold">{recipe.macros.carbs}g</div>
                          <div className="text-gray-600 text-sm">Carbs</div>
                        </div>
                      )}
                      {recipe.macros.fat && (
                        <div className="text-center">
                          <div className="text-cookify-blue font-bold">{recipe.macros.fat}g</div>
                          <div className="text-gray-600 text-sm">Fat</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients for {servings} servings</h3>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <div className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-cookify-blue rounded-full mr-3"></div>
                        <span className="text-gray-900">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Ingredients will be generated based on the recipe requirements.</p>
                )}
              </div>
            )}

            {activeTab === 'instructions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cooking Instructions</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-cookify-blue text-white rounded-full flex items-center justify-center mr-3 mt-1">
                        1
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-medium mb-1">Prepare Ingredients</h4>
                        <p className="text-gray-700">Gather and prepare all the ingredients according to the recipe requirements.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-cookify-blue text-white rounded-full flex items-center justify-center mr-3 mt-1">
                        2
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-medium mb-1">Cook According to Recipe</h4>
                        <p className="text-gray-700">Follow the specific cooking instructions for this {recipe.title.toLowerCase()} recipe.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-cookify-blue text-white rounded-full flex items-center justify-center mr-3 mt-1">
                        3
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-medium mb-1">Serve and Enjoy</h4>
                        <p className="text-gray-700">Plate your dish and enjoy your delicious {recipe.title.toLowerCase()}!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Nutrition Information</h3>
                {recipe.macros ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-gray-900 font-medium mb-3">Macronutrients</h4>
                        <div className="space-y-2">
                          {recipe.macros.calories && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Calories</span>
                              <span className="text-gray-900 font-medium">{recipe.macros.calories} kcal</span>
                            </div>
                          )}
                          {recipe.macros.protein && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Protein</span>
                              <span className="text-gray-900 font-medium">{recipe.macros.protein}g</span>
                            </div>
                          )}
                          {recipe.macros.carbs && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Carbohydrates</span>
                              <span className="text-gray-900 font-medium">{recipe.macros.carbs}g</span>
                            </div>
                          )}
                          {recipe.macros.fat && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fat</span>
                              <span className="text-gray-900 font-medium">{recipe.macros.fat}g</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-gray-900 font-medium mb-3">Micronutrients</h4>
                        <div className="space-y-2">
                          {recipe.macros.sugar && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sugar</span>
                              <span className="text-gray-900 font-medium">{recipe.macros.sugar}g</span>
                            </div>
                          )}
                          {recipe.macros.sodium && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Sodium</span>
                              <span className="text-gray-900 font-medium">{recipe.macros.sodium}mg</span>
                            </div>
                          )}
                          {recipe.macros.fiber && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fiber</span>
                              <span className="text-gray-900 font-medium">{recipe.macros.fiber}g</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Nutritional information will be calculated based on the recipe ingredients.</p>
                )}
              </div>
            )}

            {activeTab === 'tips' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cooking Tips & Variations</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-gray-900 font-medium mb-2">💡 Pro Tips</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Use fresh ingredients for the best flavor</li>
                      <li>• Don't overcook to preserve nutrients</li>
                      <li>• Season to taste with herbs and spices</li>
                      <li>• Let the dish rest for a few minutes before serving</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-gray-900 font-medium mb-2">🔄 Variations</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Try different protein sources</li>
                      <li>• Add more vegetables for extra nutrition</li>
                      <li>• Adjust spices to your preference</li>
                      <li>• Make it vegetarian or vegan friendly</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-gray-900 font-medium mb-2">🍽️ Serving Suggestions</h4>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Pair with a fresh salad</li>
                      <li>• Serve with whole grain bread</li>
                      <li>• Add a side of steamed vegetables</li>
                      <li>• Garnish with fresh herbs</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal; 