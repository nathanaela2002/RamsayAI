import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { getAIRecipeSuggestions, MacroNutrients } from '@/lib/openai';
import AIRecipeSuggestions from './AIRecipeSuggestions';

interface MacroFormValues {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
  sodium: string;
  fiber: string;
}

interface MacroNutrientFormProps {
  onSubmit: (values: MacroFormValues) => void;
}

const MacroNutrientForm: React.FC<MacroNutrientFormProps> = ({ onSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ suggestions: string[]; explanation: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [values, setValues] = useState<MacroFormValues>({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    sugar: '',
    sodium: '',
    fiber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const handleAISuggestions = async () => {
    const macros: MacroNutrients = {
      calories: values.calories ? parseInt(values.calories) : undefined,
      protein: values.protein ? parseInt(values.protein) : undefined,
      carbs: values.carbs ? parseInt(values.carbs) : undefined,
      fat: values.fat ? parseInt(values.fat) : undefined,
      sugar: values.sugar ? parseInt(values.sugar) : undefined,
      sodium: values.sodium ? parseInt(values.sodium) : undefined,
      fiber: values.fiber ? parseInt(values.fiber) : undefined,
    };

    // Check if at least one macro is provided
    const hasMacros = Object.values(macros).some(value => value !== undefined && value > 0);
    
    if (!hasMacros) {
      alert('Please enter at least one macro nutrient value to get AI suggestions.');
      return;
    }

    try {
      setAiLoading(true);
      const suggestions = await getAIRecipeSuggestions(macros);
      setAiSuggestions(suggestions);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      alert('Failed to get AI suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <div className="bg-cookify-darkgray rounded-xl overflow-hidden mb-6 animate-fade-in">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            <h2 className="text-lg font-semibold">Macro Nutrients</h2>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {isExpanded && (
          <form onSubmit={handleSubmit} className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 mb-1">Calories</label>
                <div className="relative">
                  <input 
                    type="number"
                    name="calories"
                    value={values.calories}
                    onChange={handleChange}
                    placeholder="Enter calories"
                    className="w-full p-3 rounded bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    kcal
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Protein</label>
                <div className="relative">
                  <input 
                    type="number"
                    name="protein"
                    value={values.protein}
                    onChange={handleChange}
                    placeholder="Enter protein"
                    className="w-full p-3 rounded bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    g
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Carbs</label>
                <div className="relative">
                  <input 
                    type="number"
                    name="carbs"
                    value={values.carbs}
                    onChange={handleChange}
                    placeholder="Enter carbs"
                    className="w-full p-3 rounded bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    g
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Fat</label>
                <div className="relative">
                  <input 
                    type="number"
                    name="fat"
                    value={values.fat}
                    onChange={handleChange}
                    placeholder="Enter fat"
                    className="w-full p-3 rounded bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    g
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Sugar</label>
                <div className="relative">
                  <input 
                    type="number"
                    name="sugar"
                    value={values.sugar}
                    onChange={handleChange}
                    placeholder="Enter sugar"
                    className="w-full p-3 rounded bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    g
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Sodium</label>
                <div className="relative">
                  <input 
                    type="number"
                    name="sodium"
                    value={values.sodium}
                    onChange={handleChange}
                    placeholder="Enter sodium"
                    className="w-full p-3 rounded bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    mg
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Fiber</label>
                <div className="relative">
                  <input 
                    type="number"
                    name="fiber"
                    value={values.fiber}
                    onChange={handleChange}
                    placeholder="Enter fiber"
                    className="w-full p-3 rounded bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    g
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                type="submit" 
                className="flex-1 py-3 px-6 rounded-lg bg-cookify-blue text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Apply Macros
              </button>
              
              <button 
                type="button"
                onClick={handleAISuggestions}
                disabled={aiLoading}
                className="flex items-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={16} />
                {aiLoading ? 'Getting Suggestions...' : 'AI Suggestions'}
              </button>
            </div>
          </form>
        )}
      </div>

      {showAISuggestions && aiSuggestions && (
        <AIRecipeSuggestions
          suggestions={aiSuggestions.suggestions}
          explanation={aiSuggestions.explanation}
          onClose={() => setShowAISuggestions(false)}
        />
      )}
    </>
  );
};

export default MacroNutrientForm;
