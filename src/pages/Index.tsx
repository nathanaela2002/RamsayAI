
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import RecipeCard from '@/components/RecipeCard';
import MealTypeSelector from '@/components/MealTypeSelector';
import CategoryCard from '@/components/CategoryCard';
import { fetchPopularRecipes, fetchRecipesByMealType, Recipe } from '@/lib/api';
import { isFavorite, toggleFavorite, showErrorToast } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

const categories = [
  { name: 'PASTA', image: 'https://spoonacular.com/recipeImages/654959-636x393.jpg' },
  { name: 'THAI FOOD', image: 'https://spoonacular.com/recipeImages/642093-636x393.jpg' },
  { name: 'INDIAN', image: 'https://spoonacular.com/recipeImages/642129-636x393.jpg' },
  { name: 'CHICKEN', image: 'https://spoonacular.com/recipeImages/638420-636x393.jpg' },
];

const Index = () => {
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [mealTypeRecipes, setMealTypeRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritesMap, setFavoritesMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const popular = await fetchPopularRecipes(5);
        setPopularRecipes(popular);
        
        const mealRecipes = await fetchRecipesByMealType(selectedMealType, 5);
        setMealTypeRecipes(mealRecipes);
        
        // Initialize favorites map
        const initialFavoritesMap: Record<number, boolean> = {};
        [...popular, ...mealRecipes].forEach(recipe => {
          initialFavoritesMap[recipe.id] = isFavorite(recipe.id);
        });
        setFavoritesMap(initialFavoritesMap);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        showErrorToast('Failed to load recipes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  useEffect(() => {
    const loadMealTypeRecipes = async () => {
      try {
        setLoading(true);
        const recipes = await fetchRecipesByMealType(selectedMealType, 5);
        setMealTypeRecipes(recipes);
        
        // Update favorites map with new recipes
        const newFavoritesMap = { ...favoritesMap };
        recipes.forEach(recipe => {
          newFavoritesMap[recipe.id] = isFavorite(recipe.id);
        });
        setFavoritesMap(newFavoritesMap);
      } catch (error) {
        console.error(`Failed to load ${selectedMealType} recipes:`, error);
        showErrorToast(`Failed to load ${selectedMealType} recipes. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };
    
    loadMealTypeRecipes();
  }, [selectedMealType]);
  
  const handleSearch = (query: string) => {
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };
  
  const handleToggleFavorite = (recipeId: number) => {
    const newIsFavorite = toggleFavorite(recipeId);
    setFavoritesMap(prev => ({
      ...prev,
      [recipeId]: newIsFavorite
    }));
  };

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto">
        <SearchBar onSearch={handleSearch} />
        
        <div className="my-8">
          <MealTypeSelector 
            selectedType={selectedMealType} 
            onSelect={setSelectedMealType} 
          />
          
          <div className="bg-cookify-darkgray rounded-xl overflow-hidden mb-8">
            {popularRecipes.length > 0 && (
              <div className="relative h-80">
                <img 
                  src={popularRecipes[0].image} 
                  alt={popularRecipes[0].title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <div className="mb-2">
                    <span className="bg-cookify-blue text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      POPULAR DISH OF THE WEEK
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {popularRecipes[0].title}
                  </h2>
                  <div className="flex items-center text-white">
                    <span>{popularRecipes[0].readyInMinutes} min</span>
                    <span className="mx-2">•</span>
                    <span>{popularRecipes[0].servings} servings</span>
                  </div>
                  <Link 
                    to={`/recipe/${popularRecipes[0].id}`}
                    className="mt-4 inline-flex items-center text-white hover:text-cookify-blue transition-colors"
                  >
                    Recipe
                    <ChevronRight size={18} className="ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">CATEGORIES</h2>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <CategoryCard 
                key={category.name} 
                name={category.name} 
                image={category.image} 
              />
            ))}
          </div>
        </section>
        
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">TODAY'S PICKS</h2>
            <Link 
              to="/picks" 
              className="text-cookify-blue hover:underline text-sm flex items-center"
            >
              View all
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-cookify-darkgray rounded-xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularRecipes.slice(0, 2).map((recipe) => (
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
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Index;
