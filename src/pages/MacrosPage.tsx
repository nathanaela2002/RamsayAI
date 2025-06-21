import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import MacroNutrientForm from '@/components/MacroNutrientForm';
import IngredientForm from '@/components/IngredientForm';
import RecipeCard from '@/components/RecipeCard';
import { generateRecipesWithIngredients, SimpleRecipe } from '@/lib/openai';
import { showErrorToast } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import MealTypeSelector from '@/components/MealTypeSelector';

const MacrosPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<SimpleRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'ingredients' | 'macros' | 'results'>('ingredients');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedMealType, setSelectedMealType] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const handleIngredientSubmit = (ingredients: string[]) => {
    setSelectedIngredients(ingredients);
    setStep('macros');
  };

  const handleMacroSubmit = async (values: any) => {
    try {
      setLoading(true);
      const macros = {
        calories: values.calories ? parseInt(values.calories) : undefined,
        protein: values.protein ? parseInt(values.protein) : undefined,
        carbs: values.carbs ? parseInt(values.carbs) : undefined,
        fat: values.fat ? parseInt(values.fat) : undefined,
        sugar: values.sugar ? parseInt(values.sugar) : undefined,
        sodium: values.sodium ? parseInt(values.sodium) : undefined,
        fiber: values.fiber ? parseInt(values.fiber) : undefined,
      };
      const aiResponse = await generateRecipesWithIngredients(macros, selectedIngredients);
      setRecipes(aiResponse);
      setSearchQuery('AI Recipes');
      setStep('results');
    } catch (error) {
      console.error('Macro search error:', error);
      showErrorToast('Failed to search recipes. Please try again later.');
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
        </div>
        
        {step === 'ingredients' && (
          <IngredientForm onSubmit={handleIngredientSubmit} initialMode="image" />
        )}
        {step === 'macros' && (
          <MacroNutrientForm onSubmit={handleMacroSubmit} />
        )}
        
        {step === 'results' && (
          <>
            <MealTypeSelector selectedType={selectedMealType} onSelect={setSelectedMealType} />
            {/* filter recipes by meal type locally */}
          </>
        )}
        
        {searchQuery && (
          <h2 className="text-xl font-bold mt-8 mb-6">
            Results for: <span className="text-cookify-blue">{searchQuery}</span>
          </h2>
        )}
        
        {loading ? (
          <p className="text-center mt-8 text-gray-400">Generating recipes...</p>
        ) : step === 'results' && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, idx) => (
              <RecipeCard
                key={idx}
                id={idx}
                title={recipe.title}
                image={`https://source.unsplash.com/400x300/?food&sig=${idx}`}
                useAIImage={true}
                favorite={false}
                macros={recipe.macros}
                ingredients={recipe.ingredients}
              />
            ))}
          </div>
        ) : step === 'results' && searchQuery ? (
          <div className="text-center py-12">
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
