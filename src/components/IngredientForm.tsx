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
    // Replace the list with the latest detected ingredients, ensuring uniqueness
    const unique = Array.from(new Set(detectedIngredients.map(i => i.toLowerCase())));
    setIngredients(unique);
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
            className="px-6 py-4 rounded-lg bg-cookify-blue text-white font-medium hover:bg-blue-600 transition-colors"
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
                className="px-6 py-4 rounded-lg bg-cookify-blue text-white font-medium hover:bg-blue-600 transition-colors"
              >
                Find Recipes
              </button>
            </div>
          )}

          
        </div>
      )}
    </div>
  );
};

export default IngredientForm;
