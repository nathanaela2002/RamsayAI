import React from 'react';
import { Sparkles, ChefHat } from 'lucide-react';

interface AIRecipeSuggestionsProps {
  suggestions: string[];
  explanation: string;
  onClose: () => void;
}

const AIRecipeSuggestions: React.FC<AIRecipeSuggestionsProps> = ({
  suggestions,
  explanation,
  onClose
}) => {
  return (
    <div className="bg-cookify-darkgray rounded-xl p-6 mb-6 animate-fade-in border border-cookify-blue/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-cookify-blue" />
          <h3 className="text-lg font-semibold">AI Recipe Suggestions</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-300 text-sm leading-relaxed">{explanation}</p>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="flex items-start p-3 bg-cookify-lightgray rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ChefHat className="w-4 h-4 mr-3 mt-0.5 text-cookify-blue flex-shrink-0" />
            <span className="text-white text-sm">{suggestion}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-600">
        <p className="text-gray-400 text-xs">
          💡 These suggestions are AI-generated based on your macro requirements. 
          You can search for these recipes or use them as inspiration for your cooking.
        </p>
      </div>
    </div>
  );
};

export default AIRecipeSuggestions; 