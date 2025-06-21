
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import RecipeCard from '@/components/RecipeCard';
import { Recipe, searchRecipes } from '@/lib/api';
import { isFavorite, toggleFavorite, showErrorToast } from '@/lib/utils';
import { Search } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoritesMap, setFavoritesMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const results = await searchRecipes(searchQuery);
      setRecipes(results);
      
      // Update favorites map
      const newFavoritesMap: Record<number, boolean> = {};
      results.forEach(recipe => {
        newFavoritesMap[recipe.id] = isFavorite(recipe.id);
      });
      setFavoritesMap(newFavoritesMap);
    } catch (error) {
      console.error('Search error:', error);
      showErrorToast('Failed to search recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setSearchParams({ q: searchQuery });
    performSearch(searchQuery);
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
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search for recipes" 
        />
        
        <div className="mt-8">
          {query && (
            <h2 className="text-xl font-bold mb-6">
              Search results for: <span className="text-cookify-blue">{query}</span>
            </h2>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-cookify-darkgray rounded-xl h-64 animate-pulse"></div>
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
          ) : query ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
              <p className="text-gray-400">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold mb-2">Search for recipes</h3>
              <p className="text-gray-400">
                Enter keywords, ingredients, or dish names
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
