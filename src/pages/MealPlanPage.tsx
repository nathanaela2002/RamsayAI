import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import IngredientForm from '@/components/IngredientForm';
import MacroNutrientForm from '@/components/MacroNutrientForm';
import { generateMealPlanWithIngredients, MealPlanDay, MacroNutrients } from '@/lib/openai';
import { showErrorToast } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import RecipeDetailModal from '@/components/RecipeDetailModal';
import DayPlanModal from '@/components/DayPlanModal';

const MealPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'ingredients' | 'macros' | 'results'>('ingredients');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  const [selectedDayPlan, setSelectedDayPlan] = useState<MealPlanDay | null>(null);

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

        {step === 'results' && !loading && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Weekly Plan</h2>
            <div className="bg-cookify-darkgray rounded-lg p-4">
              {(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth();
                const firstOfMonth = new Date(year, month, 1);
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const startWeekday = firstOfMonth.getDay(); // 0=Sun
                const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7; // full weeks

                const header = (
                  <div className="grid grid-cols-7 text-center text-sm text-gray-400 mb-2">
                    {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
                  </div>
                );

                const cells = Array.from({ length: totalCells }).map((_, idx) => {
                  const dateNum = idx - startWeekday + 1;
                  const inMonth = dateNum >= 1 && dateNum <= daysInMonth;

                  if (!inMonth) {
                    return <div key={`blank-${idx}`}></div>;
                  }

                  const cellDate = new Date(year, month, dateNum);
                  const mealIdx = Math.floor((cellDate.getTime() - today.getTime()) / (1000*60*60*24));

                  if (mealIdx >=0 && mealIdx < mealPlan.length) {
                    const dayPlan = mealPlan[mealIdx];
                    return (
                      <button
                        key={dayPlan.day}
                        onClick={() => setSelectedDayPlan(dayPlan)}
                        className="border border-cookify-lightgray rounded-md p-2 hover:border-cookify-blue focus:outline-none text-left h-24"
                      >
                        <span className="text-xs font-semibold text-white">{dateNum}</span>
                        <ul className="mt-1 space-y-0.5">
                          {dayPlan.meals.map(m => (
                            <li key={m.title} className="text-[10px] truncate text-gray-300">{m.title}</li>
                          ))}
                        </ul>
                      </button>
                    );
                  }

                  return (
                    <div key={idx} className="border border-cookify-lightgray rounded-md p-2 text-left text-xs text-gray-500 h-24">
                      {dateNum}
                    </div>
                  );
                });

                return (
                  <>
                    {header}
                    <div className="grid grid-cols-7 gap-1">
                      {cells}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {selectedDayPlan && (
          <DayPlanModal
            dayPlan={selectedDayPlan}
            onClose={()=>setSelectedDayPlan(null)}
            onMealSelect={(meal)=>setSelectedMeal(meal)}
          />
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
              useAIImage: true,
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default MealPlanPage; 