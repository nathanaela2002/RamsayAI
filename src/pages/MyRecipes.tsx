import React from 'react';
import Layout from '@/components/Layout';
import RecipeCard from '@/components/RecipeCard';
import { useSearchParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { ArrowLeft } from 'lucide-react';

const recipes = [
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
  {
    id: 4,
    title: 'Quinoa Salad Bowl',
    image: 'https://spoonacular.com/recipeImages/653969-636x393.jpg',
    readyInMinutes: 20,
    servings: 2,
    ingredients: ['Quinoa', 'Cucumber', 'Cherry tomatoes', 'Feta'],
    macros: { calories: 280, protein: 10, carbs: 40, fat: 8 },
  },
  {
    id: 5,
    title: 'Beef Stir Fry',
    image: 'https://spoonacular.com/recipeImages/716627-636x393.jpg',
    readyInMinutes: 25,
    servings: 2,
    ingredients: ['Beef', 'Broccoli', 'Soy sauce', 'Garlic'],
    macros: { calories: 520, protein: 40, carbs: 35, fat: 22 },
  },
  {
    id: 6,
    title: 'Veggie Omelette',
    image: 'https://spoonacular.com/recipeImages/715415-636x393.jpg',
    readyInMinutes: 15,
    servings: 1,
    ingredients: ['Eggs', 'Spinach', 'Bell pepper', 'Cheese'],
    macros: { calories: 260, protein: 18, carbs: 5, fat: 18 },
  },
  {
    id: 7,
    title: 'Berry Smoothie',
    image: 'https://spoonacular.com/recipeImages/715497-636x393.jpg',
    readyInMinutes: 5,
    servings: 1,
    ingredients: ['Berries', 'Banana', 'Yogurt', 'Honey'],
    macros: { calories: 190, protein: 8, carbs: 35, fat: 3 },
  },
  {
    id: 8,
    title: 'Mediterranean Salad',
    image: 'https://spoonacular.com/recipeImages/642129-636x393.jpg',
    readyInMinutes: 15,
    servings: 2,
    ingredients: ['Lettuce', 'Olives', 'Feta', 'Cucumber'],
    macros: { calories: 230, protein: 9, carbs: 12, fat: 17 },
  },
];

const MyRecipes = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q')?.toLowerCase() || '';

  const filtered = recipes.filter((r) => {
    const haystack = (
      r.title + ' ' + (r.ingredients ?? []).join(' ')
    ).toLowerCase();
    return haystack.includes(query);
  });

  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="flex items-center text-primary hover:underline">
            <ArrowLeft size={20} className="mr-1" /> Back
          </Link>
          <div className="flex-1">
            <SearchBar
              onSearch={(q) => navigate(`/myrecipes?q=${encodeURIComponent(q)}`)}
              placeholder="Search for your favorites"
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">My Recipes</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
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
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-500">No recipes found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyRecipes; 