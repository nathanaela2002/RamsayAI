
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import MacroNutrientForm from '@/components/MacroNutrientForm';
import IngredientForm from '@/components/IngredientForm';
import RecipeCard from '@/components/RecipeCard';
import { searchRecipesByMacros, searchRecipesByIngredients, Recipe } from '@/lib/api';
import { analyzeUserInputForRecipeSearch } from '@/lib/openai';
import { isFavorite, toggleFavorite, showErrorToast } from '@/lib/utils';
import { ArrowLeft, MessageSquare } from 'lucide-react';

const MacrosPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesMap, setFavoritesMap] = useState<Record<number, boolean>>({});
  const [aiInputValue, setAiInputValue] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleMacroSubmit = async (values: any) => {
    try {
      setLoading(true);
      setSearchQuery('Custom Macros');
      
      const macros = {
        calories: values.calories ? parseInt(values.calories) : undefined,
        protein: values.protein ? parseInt(values.protein) : undefined,
        carbs: values.carbs ? parseInt(values.carbs) : undefined,
        fat: values.fat ? parseInt(values.fat) : undefined,
        sugar: values.sugar ? parseInt(values.sugar) : undefined,
        sodium: values.sodium ? parseInt(values.sodium) : undefined,
        fiber: values.fiber ? parseInt(values.fiber) : undefined,
      };
      
      const results = await searchRecipesByMacros(macros);
      setRecipes(results);
      
      // Update favorites map
      const newFavoritesMap: Record<number, boolean> = {};
      results.forEach(recipe => {
        newFavoritesMap[recipe.id] = isFavorite(recipe.id);
      });
      setFavoritesMap(newFavoritesMap);
    } catch (error) {
      console.error('Macro search error:', error);
      showErrorToast('Failed to search recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientSubmit = async (ingredients: string[]) => {
    try {
      setLoading(true);
      setSearchQuery(`Recipes with ${ingredients.join(', ')}`);
      
      const results = await searchRecipesByIngredients(ingredients);
      setRecipes(results);
      
      // Update favorites map
      const newFavoritesMap: Record<number, boolean> = {};
      results.forEach(recipe => {
        newFavoritesMap[recipe.id] = isFavorite(recipe.id);
      });
      setFavoritesMap(newFavoritesMap);
    } catch (error) {
      console.error('Ingredient search error:', error);
      showErrorToast('Failed to search recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (recipeId: number) => {
    const newIsFavorite = toggleFavorite(recipeId);
    setFavoritesMap(prev => ({
      ...prev,
      [recipeId]: newIsFavorite
    }));
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputValue.trim()) return;
    
    try {
      setLoading(true);
      setSearchQuery(`AI Search: ${aiInputValue}`);
      
      const analyzed = await analyzeUserInputForRecipeSearch(aiInputValue);
      
      let results: Recipe[] = [];
      
      if (analyzed.ingredients && analyzed.ingredients.length > 0) {
        results = await searchRecipesByIngredients(analyzed.ingredients);
      } else if (analyzed.macros && Object.keys(analyzed.macros).length > 0) {
        results = await searchRecipesByMacros(analyzed.macros);
      } else if (analyzed.query) {
        // Use regular search if no ingredients or macros were detected
        const searchResults = await searchRecipesByIngredients([analyzed.query]);
        results = searchResults;
      }
      
      setRecipes(results);
      
      // Update favorites map
      const newFavoritesMap: Record<number, boolean> = {};
      results.forEach(recipe => {
        newFavoritesMap[recipe.id] = isFavorite(recipe.id);
      });
      setFavoritesMap(newFavoritesMap);
    } catch (error) {
      console.error('AI search error:', error);
      showErrorToast('Failed to process your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="flex items-center text-white hover:text-cookify-blue transition-colors mr-4"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Find Your Recipe</h1>
          </div>
          
          <button
            onClick={() => setShowAiInput(!showAiInput)}
            className="flex items-center bg-cookify-darkgray hover:bg-cookify-lightgray rounded-full p-3 transition-colors"
            aria-label="Toggle AI Search"
          >
            <MessageSquare size={20} className={showAiInput ? "text-cookify-blue" : "text-white"} />
          </button>
        </div>
        
        {showAiInput && (
          <div className="bg-cookify-darkgray rounded-xl p-4 mb-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-2">Ask CookifyAI</h2>
            <p className="text-gray-400 text-sm mb-4">
              Describe what you're looking for in natural language. For example: "High protein recipes with chicken and vegetables that have less than 500 calories"
            </p>
            <form onSubmit={handleAiSubmit} className="flex">
              <input
                type="text"
                value={aiInputValue}
                onChange={(e) => setAiInputValue(e.target.value)}
                placeholder="What are you looking for?"
                className="flex-1 p-3 rounded-l bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
              />
              <button
                type="submit"
                className="px-4 rounded-r bg-cookify-blue text-white hover:bg-blue-600 transition-colors"
                disabled={!aiInputValue.trim()}
              >
                Search
              </button>
            </form>
          </div>
        )}
        
        <MacroNutrientForm onSubmit={handleMacroSubmit} />
        <IngredientForm onSubmit={handleIngredientSubmit} />
        
        {searchQuery && (
          <h2 className="text-xl font-bold mt-8 mb-6">
            Results for: <span className="text-cookify-blue">{searchQuery}</span>
          </h2>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-cookify-darkgray rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 animate-fade-in">
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                image={recipe.image}
                readyInMinutes={recipe.readyInMinutes}
                servings={recipe.servings}
                favorite={favoritesMap[recipe.id]}
                onToggleFavorite={() => handleToggleFavorite(recipe.id)}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12 mt-8">
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-gray-400">
              Try adjusting your search criteria or ingredients
            </p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default MacrosPage;
