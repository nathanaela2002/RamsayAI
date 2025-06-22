import React from 'react';
import { X } from 'lucide-react';
import MealCard from './MealCard';
import { MealPlanDay } from '@/lib/openai';

interface DayPlanModalProps {
  dayPlan: MealPlanDay;
  onClose: () => void;
  onMealSelect: (meal: any) => void;
}

const DayPlanModal: React.FC<DayPlanModalProps> = ({ dayPlan, onClose, onMealSelect }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-cookify-darkgray rounded-lg max-w-lg w-full p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white"
      >
        <X size={20} />
      </button>
      <h2 className="text-xl font-bold text-white mb-4">{dayPlan.day}</h2>
      <p className="text-xs text-gray-400 mb-4">
        {dayPlan.dailyMacros.calories} kcal • {dayPlan.dailyMacros.protein}g P • {dayPlan.dailyMacros.carbs}g C • {dayPlan.dailyMacros.fat}g F
      </p>
      <div className="space-y-3">
        {dayPlan.meals.map((meal, idx) => (
          <MealCard key={idx} title={meal.title} macros={meal.macros} onClick={() => onMealSelect(meal)} />
        ))}
      </div>
    </div>
  </div>
);

export default DayPlanModal; 