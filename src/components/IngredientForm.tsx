import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import ImageUploadForm from './ImageUploadForm';

interface IngredientFormProps {
  onSubmit: (ingredients: string[]) => void;
  initialMode?: 'manual' | 'image';
}

const IngredientForm: React.FC<IngredientFormProps> = ({ onSubmit, initialMode = 'manual' }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [inputMode] = useState<'manual' | 'image'>(initialMode);
  const [imageProvided, setImageProvided] = useState(false);

  // Quick manual-add option (hidden until button clicked)
  const [showManual, setShowManual] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualAmt, setManualAmt] = useState('1');

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleClearIngredients = () => setIngredients([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentIngredient.trim()) {
      const newIngredients = [...ingredients, currentIngredient.trim()];
      onSubmit(newIngredients);
      setCurrentIngredient('');
    } else {
      onSubmit(ingredients);
    }
  };

  const handleIngredientsDetected = (detectedIngredients: string[]) => {
    // Add detected ingredients to the current list, avoiding duplicates
    const newIngredients = [...ingredients];
    detectedIngredients.forEach(ingredient => {
      if (!newIngredients.includes(ingredient.toLowerCase())) {
        newIngredients.push(ingredient.toLowerCase());
      }
    });
    setIngredients(newIngredients);
    setImageProvided(true);
  };

  const handleAddManual = () => {
    if (!manualName.trim()) return;
    const amt = parseInt(manualAmt) > 0 ? parseInt(manualAmt) : 1;
    setIngredients(prev => [...prev, `${amt} ${manualName.trim().toLowerCase()}`]);
    setManualName('');
    setManualAmt('1');
  };

  const handleManualKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddManual();
    }
  };

  return (
    <div className="bg-cookify-darkgray rounded-xl p-4 mb-6 animate-fade-in">
      {/* Camera mode only */}
      <h2 className="text-lg font-semibold mb-1 text-white">Take a pic of your ingredients</h2>
      <p className="text-gray-400 mb-4">Show a refrigerator, grocery haul, or supermarket shelf</p>

      {inputMode === 'manual' ? (
        <form onSubmit={handleSubmit}>
          <div className="flex mb-4">
            <input
              type="text"
              value={currentIngredient}
              onChange={e => setCurrentIngredient(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add ingredient"
              className="flex-1 p-3 rounded-l bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue text-white placeholder-gray-400"
            />
            <button
              type="button"
              onClick={handleAddIngredient}
              className="p-3 rounded-r bg-cookify-blue text-white hover:bg-blue-600 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 rounded-lg bg-cookify-blue text-white font-medium hover:bg-blue-600 transition-colors"
            disabled={ingredients.length === 0}
          >
            Find Recipes
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <ImageUploadForm onIngredientsDetected={handleIngredientsDetected} />

          {ingredients.length > 0 && (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => onSubmit(ingredients)}
                className="w-full py-3 rounded-lg bg-cookify-blue text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Find Recipes
              </button>
            </div>
          )}

          {/* Add more ingredients */}
          {ingredients.length > 0 && (
            <div className="mt-4 space-y-2">
              {!showManual ? (
                <button
                  type="button"
                  onClick={() => setShowManual(true)}
                  className="text-cookify-blue underline text-sm"
                >
                  Add more ingredients
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualName}
                    onChange={e=>setManualName(e.target.value)}
                    onKeyDown={handleManualKey}
                    placeholder="Ingredient"
                    className="flex-1 p-2 rounded bg-cookify-lightgray text-white placeholder-gray-400 border-none"
                  />
                  <input
                    type="number"
                    min="1"
                    value={manualAmt}
                    onChange={e=>setManualAmt(e.target.value)}
                    onKeyDown={handleManualKey}
                    className="w-20 p-2 rounded bg-cookify-lightgray text-white border-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddManual}
                    className="p-2 bg-cookify-blue text-white rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IngredientForm;
