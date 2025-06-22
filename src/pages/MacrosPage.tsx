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
  const [commentModal, setCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [preferences, setPreferences] = useState('');
  const [lastMacros, setLastMacros] = useState<any>(null);

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
      setLastMacros(macros);
      setSearchQuery('AI Recipes');
      setStep('results');
    } catch (error) {
      console.error('Macro search error:', error);
      showErrorToast('Failed to search recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastMacros) return;
    try {
      setLoading(true);
      const newPref = preferences ? `${preferences}. ${commentText}` : commentText;
      const aiResp = await generateRecipesWithIngredients(lastMacros, selectedIngredients, newPref);
      setRecipes(aiResp);
      setPreferences(newPref);
      setCommentModal(false);
      setCommentText('');
    } catch (e) {
      showErrorToast('Failed to regenerate');
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-primary hover:underline mb-2 rounded-full"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold">Find Your Recipe</h1>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {recipes.map((r, idx) => (
                <div key={idx} className="bg-cookify-darkgray rounded-xl overflow-hidden">
                  <RecipeCard
                    id={idx}
                    title={r.title}
                    image={`https://source.unsplash.com/400x300/?food&sig=${idx}`}
                    useAIImage={true}
                    favorite={false}
                    macros={r.macros}
                    ingredients={r.ingredients}
                  />
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <button onClick={() => setCommentModal(true)} className="text-cookify-blue underline rounded-full px-3 py-1">Don't see what you like?</button>
            </div>
            {commentModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-cookify-darkgray p-6 rounded-lg w-80">
                  <h3 className="text-lg font-semibold text-white mb-4">Add comments</h3>
                  <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} rows={4} className="w-full p-2 rounded bg-cookify-lightgray text-white mb-4" />
                  <div className="flex justify-end gap-3">
                    <button onClick={()=>{setCommentModal(false);setCommentText('')}} className="px-3 py-1 text-gray-300 rounded-full">Cancel</button>
                    <button onClick={handleRegenerate} disabled={!commentText.trim()} className="px-3 py-1 bg-cookify-blue text-white rounded-full disabled:opacity-50">Regenerate</button>
                  </div>
                </div>
              </div>
            )}
          </>
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
