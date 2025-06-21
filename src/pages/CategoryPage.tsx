
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import RecipeCard from '@/components/RecipeCard';
import { fetchRecipesByCategory, Recipe } from '@/lib/api';
import { isFavorite, toggleFavorite, showErrorToast } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesMap, setFavoritesMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadCategoryRecipes = async () => {
      if (!category) return;
      
      try {
        setLoading(true);
        const results = await fetchRecipesByCategory(category, 12);
        setRecipes(results);
        
        // Initialize favorites map
        const initialFavoritesMap: Record<number, boolean> = {};
        results.forEach(recipe => {
          initialFavoritesMap[recipe.id] = isFavorite(recipe.id);
        });
        setFavoritesMap(initialFavoritesMap);
      } catch (error) {
        console.error(`Failed to load ${category} recipes:`, error);
        showErrorToast('Failed to load recipes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategoryRecipes();
  }, [category]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleFavorite = (recipeId: number) => {
    const newIsFavorite = toggleFavorite(recipeId);
    setFavoritesMap(prev => ({
      ...prev,
      [recipeId]: newIsFavorite
    }));
  };

  const displayCategory = category ? category.toUpperCase() : '';

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-white hover:text-cookify-blue transition-colors mr-4"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold">{displayCategory}</h1>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-cookify-darkgray rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
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
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-gray-400">
              We couldn't find any recipes for this category
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
