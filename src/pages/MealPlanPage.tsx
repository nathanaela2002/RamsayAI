import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import IngredientForm from '@/components/IngredientForm';
import MacroNutrientForm from '@/components/MacroNutrientForm';
import { generateMealPlanWithIngredients, MealPlanDay, MacroNutrients } from '@/lib/openai';
import { showErrorToast } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import RecipeDetailModal from '@/components/RecipeDetailModal';

const MealPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'ingredients' | 'macros' | 'results'>('ingredients');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);

  const handleBack = () => {
    if (step === 'ingredients') {
      navigate(-1);
    } else if (step === 'macros') {
      setStep('ingredients');
    } else {
      setStep('macros');
    }
  };

  const handleIngredientSubmit = (ingredients: string[]) => {
    setSelectedIngredients(ingredients);
    setStep('macros');
  };

  const handleMacroSubmit = async (values: any) => {
    try {
      setLoading(true);
      const macros: MacroNutrients = {
        calories: values.calories ? parseInt(values.calories) : undefined,
        protein: values.protein ? parseInt(values.protein) : undefined,
        carbs: values.carbs ? parseInt(values.carbs) : undefined,
        fat: values.fat ? parseInt(values.fat) : undefined,
      };
      const plan = await generateMealPlanWithIngredients(macros, selectedIngredients);
      setMealPlan(plan);
      setStep('results');
    } catch (error) {
      console.error('Meal plan error:', error);
      showErrorToast('Failed to generate meal plan. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button onClick={handleBack} className="flex items-center text-primary hover:underline mb-2 rounded-full">
            <ArrowLeft size={18} className="mr-1" />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold">Build Your Meal Plan</h1>
        </div>

        {step === 'ingredients' && <IngredientForm onSubmit={handleIngredientSubmit} initialMode="image" />}
        {step === 'macros' && (
          <MacroNutrientForm
            onSubmit={handleMacroSubmit}
            title="Daily Macro Goals"
            buttonLabel="Generate Meal Plan"
          />
        )}

        {loading && <p className="text-center mt-8 text-gray-400">Generating meal plan...</p>}

        {step === 'results' && !loading && mealPlan.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Your Weekly Meal Plan</h2>
            
            {mealPlan.map((day, dayIndex) => (
              <div key={dayIndex} className="bg-cookify-darkgray rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">{day.day}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>{day.dailyMacros.calories} kcal</span>
                    <span>{day.dailyMacros.protein}g Protein</span>
                    <span>{day.dailyMacros.carbs}g Carbs</span>
                    <span>{day.dailyMacros.fat}g Fat</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {day.meals.map((meal, mealIndex) => (
                    <div 
                      key={mealIndex}
                      className="bg-cookify-lightgray rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors border border-gray-300"
                      onClick={() => setSelectedMeal(meal)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-white mb-2">{meal.title}</h4>
                          {meal.ingredients && meal.ingredients.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm text-black mb-1">Ingredients:</p>
                              <div className="flex flex-wrap gap-2">
                                {meal.ingredients.map((ingredient, idx) => (
                                  <span 
                                    key={idx} 
                                    className="text-sm text-gray-600"
                                  >
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>{meal.macros.calories} kcal</div>
                            <div>{meal.macros.protein}g P</div>
                            <div>{meal.macros.carbs}g C</div>
                            <div>{meal.macros.fat}g F</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedMeal && (
          <RecipeDetailModal
            isOpen={!!selectedMeal}
            onClose={() => setSelectedMeal(null)}
            recipe={{
              id: 1,
              title: selectedMeal.title,
              image: '',
              readyInMinutes: 30,
              servings: 1,
              ingredients: selectedMeal.ingredients,
              macros: selectedMeal.macros,
              useAIImage: false,
            }}
            showImage={false}
          />
        )}
      </div>
    </Layout>
  );
};

export default MealPlanPage; 