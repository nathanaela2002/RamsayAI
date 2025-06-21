import React, { useState } from 'react';
import { Plus, X, Camera, Type } from 'lucide-react';
import ImageUploadForm from './ImageUploadForm';

interface IngredientFormProps {
  onSubmit: (ingredients: string[]) => void;
  initialMode?: 'manual' | 'image';
}

const IngredientForm: React.FC<IngredientFormProps> = ({ onSubmit, initialMode = 'manual' }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [inputMode, setInputMode] = useState<'manual' | 'image'>(initialMode);
  const [imageProvided, setImageProvided] = useState(false);

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

  return (
    <div className="bg-cookify-darkgray rounded-xl p-4 mb-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-white">What ingredients do you have?</h2>
      
      {/* Input Mode Toggle */}
      <div className="flex mb-4 bg-cookify-lightgray rounded-lg p-1">
        <button
          type="button"
          onClick={() => setInputMode('manual')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
            inputMode === 'manual'
              ? 'bg-cookify-blue text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          disabled={!imageProvided}
        >
          <Type size={16} className="mr-2" />
          Manual Input
        </button>
        <button
          type="button"
          onClick={() => setInputMode('image')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
            inputMode === 'image'
              ? 'bg-cookify-blue text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Camera size={16} className="mr-2" />
          Upload Image
        </button>
      </div>

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
          
          {ingredients.length > 0 && (
            <>
              <div className="mb-2">
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-cookify-lightgray text-white rounded-full px-3 py-1"
                    >
                      <span>{ingredient}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearIngredients}
                className="mb-4 text-xs text-red-400 hover:text-red-300 underline"
              >
                Clear All Ingredients
              </button>
            </>
          )}
          
          <button 
            type="submit" 
            className="w-full py-3 rounded-lg bg-cookify-blue text-white font-medium hover:bg-blue-600 transition-colors"
            disabled={!imageProvided}
          >
            Find Recipes
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <ImageUploadForm onIngredientsDetected={handleIngredientsDetected} />
          
          {ingredients.length > 0 && (
            <div className="bg-cookify-lightgray rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Current Ingredients:</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {ingredients.map((ingredient, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-cookify-darkgray text-white rounded-full px-3 py-1"
                  >
                    <span>{ingredient}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleClearIngredients}
                className="mb-4 text-xs text-red-400 hover:text-red-300 underline"
              >
                Clear All Ingredients
              </button>
              
              <button 
                type="button"
                onClick={() => onSubmit(ingredients)}
                className="w-full py-3 rounded-lg bg-cookify-blue text-white font-medium hover:bg-blue-600 transition-colors"
                disabled={!imageProvided}
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
