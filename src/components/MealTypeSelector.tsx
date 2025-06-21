
import React from 'react';

interface MealTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

const mealTypes = ["BREAKFAST", "LUNCH", "DINNER"];

const MealTypeSelector: React.FC<MealTypeSelectorProps> = ({
  selectedType,
  onSelect,
}) => {
  return (
    <div className="flex space-x-3 mb-6">
      {mealTypes.map((type) => (
        <button
          key={type}
          className={`meal-type-btn px-5 py-2 rounded-full text-sm font-medium ${
            selectedType === type.toLowerCase() 
              ? 'active' 
              : 'bg-cookify-darkgray text-white'
          }`}
          onClick={() => onSelect(type.toLowerCase())}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default MealTypeSelector;
