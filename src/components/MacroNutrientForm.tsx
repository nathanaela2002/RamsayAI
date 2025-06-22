import React, { useState } from 'react';

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
  title?: string;
  buttonLabel?: string;
}

const MacroNutrientForm: React.FC<MacroNutrientFormProps> = ({ onSubmit, title = 'Macro Nutrients', buttonLabel = 'Generate Recipes' }) => {
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

  return (
    <>
      <div className="bg-cookify-darkgray rounded-xl overflow-hidden mb-6 animate-fade-in p-4">
        <h2 className="text-lg font-semibold mb-1">{title}</h2>
        <p className="text-gray-400 text-sm mb-4">Leave blank if you don't care about a particular value.</p>
        <form onSubmit={handleSubmit} className="pt-0">
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
                  className="w-full p-3 rounded bg-cookify-lightgray text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
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
                  className="w-full p-3 rounded bg-cookify-lightgray text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
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
                  className="w-full p-3 rounded bg-cookify-lightgray text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
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
                  className="w-full p-3 rounded bg-cookify-lightgray text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
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
                  className="w-full p-3 rounded bg-cookify-lightgray text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
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
                  className="w-full p-3 rounded bg-cookify-lightgray text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
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
                  className="w-full p-3 rounded bg-cookify-lightgray text-white placeholder-gray-400 border-none focus:outline-none focus:ring-2 focus:ring-cookify-blue"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  g
                </span>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="px-6 py-4 rounded-lg bg-cookify-blue text-white font-medium hover:bg-blue-600 transition-colors"
          >
            {buttonLabel}
          </button>
        </form>
      </div>
    </>
  );
};

export default MacroNutrientForm;
