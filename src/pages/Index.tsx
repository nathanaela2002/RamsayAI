import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/RecipeCard';
import { AIRecipe, generateRandomRecipes, generateRecipeImage } from '@/lib/openai';

interface StaticRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  ingredients: string[];
  macros?: { calories: number; protein: number; carbs: number; fat: number };
  useAIImage?: boolean;
}

const previousRecipes: StaticRecipe[] = [
  {
    id: 1,
    title: 'Classic Spaghetti Bolognese',
    image: 'https://spoonacular.com/recipeImages/654959-636x393.jpg',
    readyInMinutes: 30,
    servings: 2,
    ingredients: ['Spaghetti', 'Ground beef', 'Tomato sauce', 'Onion'],
    macros: { calories: 450, protein: 30, carbs: 60, fat: 15 },
  },
  {
    id: 2,
    title: 'Grilled Lemon Chicken',
    image: 'https://spoonacular.com/recipeImages/638420-636x393.jpg',
    readyInMinutes: 25,
    servings: 2,
    ingredients: ['Chicken breast', 'Lemon', 'Olive oil', 'Garlic'],
    macros: { calories: 380, protein: 35, carbs: 5, fat: 20 },
  },
  {
    id: 3,
    title: 'Avocado Toast Deluxe',
    image: 'https://spoonacular.com/recipeImages/716627-636x393.jpg',
    readyInMinutes: 10,
    servings: 1,
    ingredients: ['Bread', 'Avocado', 'Egg', 'Chili flakes'],
    macros: { calories: 300, protein: 12, carbs: 28, fat: 18 },
  },
];

const Index = () => {
  const [todayPicks, setTodayPicks] = React.useState<AIRecipe[]>([]);
  React.useEffect(() => {
    const loadPicks = async () => {
      const aiRecipes = await generateRandomRecipes(3);
      const withImages = await Promise.all(
        aiRecipes.map(async (r, idx) => ({
          ...r,
          id: idx + 1,
          image: await generateRecipeImage(r.title),
          useAIImage: true,
        }))
      );
      setTodayPicks(withImages);
    };
    loadPicks();
  }, []);

  const handleSearch = (query: string) => {
    if (query) {
      window.location.href = `/myrecipes?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-md mx-auto">
        <div className="text-center mt-8">
          <img
            src="/assets/food-guide.png"
            alt="Food guide"
            className="mx-auto w-48 md:w-72 mb-6"
          />

          <p className="text-sm text-orange-500 mb-2">Unlimited recipes at your fingertips</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Start Cooking</h1>

          <div className="flex justify-center gap-4 mb-8">
            <Link to="/single-meal">
              <Button className="px-10 py-5 text-lg" variant="default">
                Single Meal
              </Button>
            </Link>
            <Link to="/meal-plan">
              <Button className="px-10 py-5 text-lg" variant="secondary">
                Meal Plan
              </Button>
            </Link>
          </div>

          {/* Search & Previous recipes section */}
          <div className="mt-20">
            <div className="w-full mb-8">
              <SearchBar onSearch={handleSearch} placeholder="Search for your favorites" />
            </div>

            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-semibold">Your previous recipes</h2>
              <Link to="/myrecipes" className="text-primary hover:underline text-sm">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {previousRecipes.map((r) => (
                <RecipeCard
                  key={r.id}
                  id={r.id}
                  title={r.title}
                  image={r.image}
                  readyInMinutes={r.readyInMinutes}
                  servings={r.servings}
                  ingredients={r.ingredients}
                  macros={r.macros}
                />
              ))}
            </div>
          </div>

          {/* Today's picks section 
          <div className="mb-16">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-lg font-semibold">Today's picks</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {todayPicks.map((r) => (
                <RecipeCard
                  key={r.id}
                  id={r.id}
                  title={r.title}
                  image={r.image}
                  readyInMinutes={r.readyInMinutes}
                  servings={r.servings}
                  ingredients={r.ingredients}
                  macros={r.macros}
                  useAIImage={r.useAIImage}
                />
              ))}
            </div>
          </div> */}

        </div>
      </div>
      <footer className="text-center text-xs text-gray-400 mt-16">Ramsay.AI 2025</footer>
    </Layout>
  );
};

export default Index;
