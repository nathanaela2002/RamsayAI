
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface IngredientFormProps {
  onSubmit: (ingredients: string[]) => void;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ onSubmit }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');

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

  return (
    <div className="bg-cookify-darkgray rounded-xl p-4 mb-6 animate-fade-in">
      <h2 className="text-lg font-semibold mb-4">What ingredients do you have?</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="flex mb-4">
          <input
            type="text"
            value={currentIngredient}
            onChange={e => setCurrentIngredient(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add ingredient"
            className="flex-1 p-3 rounded-l bg-cookify-lightgray border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
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
          <div className="mb-4">
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
        )}
        
        <button 
          type="submit" 
          className="w-full py-3 rounded-lg bg-cookify-blue text-white font-medium hover:bg-blue-600 transition-colors"
          disabled={ingredients.length === 0 && !currentIngredient.trim()}
        >
          Find Recipes
        </button>
      </form>
    </div>
  );
};

export default IngredientForm;
