
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNutrient(amount: number, unit: string): string {
  return `${Math.round(amount * 10) / 10}${unit}`;
}

export function getNutrientValue(
  recipe: any,
  nutrientName: string
): { amount: number; unit: string } | undefined {
  if (!recipe?.nutrition?.nutrients) return undefined;
  
  const nutrient = recipe.nutrition.nutrients.find(
    (n: { name: string }) => n.name.toLowerCase() === nutrientName.toLowerCase()
  );
  
  return nutrient;
}

export function showSuccessToast(message: string) {
  toast.success(message);
}

export function showErrorToast(message: string) {
  toast.error(message);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Simulate storing favorites (would normally go to a database or localStorage)
let favorites: number[] = [];

export function toggleFavorite(recipeId: number): boolean {
  const index = favorites.indexOf(recipeId);
  if (index === -1) {
    favorites.push(recipeId);
    return true;
  } else {
    favorites.splice(index, 1);
    return false;
  }
}

export function isFavorite(recipeId: number): boolean {
  return favorites.includes(recipeId);
}

export function getFavorites(): number[] {
  return [...favorites];
}
