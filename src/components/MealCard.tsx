import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MealCardProps {
  title: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onClick?: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ title, macros, onClick }) => (
  <Card
    className="bg-cookify-darkgray border-cookify-lightgray cursor-pointer hover:border-cookify-blue transition-colors"
    onClick={onClick}
  >
    <CardContent className="p-4">
      <h4 className="text-white font-semibold mb-2 truncate" title={title}>{title}</h4>
      <div className="text-xs text-gray-400 space-x-2">
        <span>{macros.calories} kcal</span>
        <span>{macros.protein}g P</span>
        <span>{macros.carbs}g C</span>
        <span>{macros.fat}g F</span>
      </div>
    </CardContent>
  </Card>
);

export default MealCard; 