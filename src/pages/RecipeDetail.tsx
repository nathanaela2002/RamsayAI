
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { fetchRecipeById } from '@/lib/api';
import { formatNutrient, getNutrientValue, isFavorite, toggleFavorite, showErrorToast } from '@/lib/utils';
import { ArrowLeft, Clock, Users, Heart, ChevronUp, ChevronDown } from 'lucide-react';

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const recipeData = await fetchRecipeById(parseInt(id));
        
        if (!recipeData) {
          throw new Error('Recipe not found');
        }
        
        setRecipe(recipeData);
        setFavorite(isFavorite(parseInt(id)));
      } catch (error) {
        console.error('Error loading recipe:', error);
        showErrorToast('Failed to load recipe. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadRecipe();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleFavorite = () => {
    if (!recipe) return;
    const newIsFavorite = toggleFavorite(recipe.id);
    setFavorite(newIsFavorite);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-screen-lg mx-auto animate-pulse">
          <div className="h-10 w-20 bg-cookify-darkgray rounded-md mb-4"></div>
          <div className="h-60 bg-cookify-darkgray rounded-xl mb-4"></div>
          <div className="h-8 bg-cookify-darkgray rounded-md w-3/4 mb-4"></div>
          <div className="h-4 bg-cookify-darkgray rounded-md w-1/4 mb-8"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-cookify-darkgray rounded-md"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!recipe) {
    return (
      <Layout>
        <div className="max-w-screen-lg mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
          <button
            onClick={handleBack}
            className="text-cookify-blue hover:underline flex items-center justify-center mx-auto"
          >
            <ArrowLeft size={18} className="mr-1" />
            Go back
          </button>
        </div>
      </Layout>
    );
  }

  const calories = getNutrientValue(recipe, 'Calories');
  const protein = getNutrientValue(recipe, 'Protein');
  const carbs = getNutrientValue(recipe, 'Carbohydrates');
  const fat = getNutrientValue(recipe, 'Fat');

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto pb-16 animate-fade-in">
        <button
          onClick={handleBack}
          className="flex items-center text-white hover:text-cookify-blue transition-colors mb-6"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back
        </button>
        
        <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden mb-6">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={handleToggleFavorite}
              className="w-12 h-12 rounded-full bg-black bg-opacity-50 flex items-center justify-center hover:bg-opacity-70 transition-all"
            >
              <Heart
                size={24}
                className={favorite ? "fill-red-500 text-red-500" : "text-white"}
              />
            </button>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
        
        <div className="flex items-center mb-8 text-gray-400">
          {recipe.readyInMinutes && (
            <div className="flex items-center mr-6">
              <Clock size={18} className="mr-2" />
              <span>{recipe.readyInMinutes} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center">
              <Users size={18} className="mr-2" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-cookify-darkgray rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.extendedIngredients?.map((ingredient: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-cookify-blue mr-2">•</span>
                    <span>
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-cookify-darkgray rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.analyzedInstructions?.[0]?.steps.map((step: any) => (
                  <li key={step.number} className="flex">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cookify-blue text-white flex items-center justify-center mr-3 mt-0.5">
                      {step.number}
                    </span>
                    <span>{step.step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-cookify-darkgray rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Nutrition Facts</h2>
              <div className="space-y-4">
                {calories && (
                  <div className="flex justify-between">
                    <span>Calories</span>
                    <span className="font-medium">{formatNutrient(calories.amount, calories.unit)}</span>
                  </div>
                )}
                {protein && (
                  <div className="flex justify-between">
                    <span>Protein</span>
                    <span className="font-medium">{formatNutrient(protein.amount, protein.unit)}</span>
                  </div>
                )}
                {carbs && (
                  <div className="flex justify-between">
                    <span>Carbs</span>
                    <span className="font-medium">{formatNutrient(carbs.amount, carbs.unit)}</span>
                  </div>
                )}
                {fat && (
                  <div className="flex justify-between">
                    <span>Fat</span>
                    <span className="font-medium">{formatNutrient(fat.amount, fat.unit)}</span>
                  </div>
                )}
                
                <button
                  onClick={() => setShowNutrition(!showNutrition)}
                  className="flex items-center justify-between w-full text-cookify-blue hover:underline"
                >
                  <span>{showNutrition ? 'Hide full nutrition' : 'Show full nutrition'}</span>
                  {showNutrition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {showNutrition && recipe.nutrition?.nutrients && (
                  <div className="pt-2 space-y-2">
                    {recipe.nutrition.nutrients
                      .filter((n: any) => !['Calories', 'Protein', 'Carbohydrates', 'Fat'].includes(n.name))
                      .map((nutrient: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-400">{nutrient.name}</span>
                          <span>{formatNutrient(nutrient.amount, nutrient.unit)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecipeDetail;
