// API Key from environment variable
const SPOONACULAR_API_KEY = '690d9303f13a498b9dfd175a78790988';
const API_BASE_URL = 'https://api.spoonacular.com';

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
  dishTypes?: string[];
  extendedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
  }>;
}

export interface RecipeSearchResult {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}

export const fetchPopularRecipes = async (number = 10): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=popular&number=${number}&addRecipeNutrition=true&instructionsRequired=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch popular recipes');
    }
    
    const data: RecipeSearchResult = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular recipes:', error);
    return [];
  }
};

export const fetchRecipesByCategory = async (category: string, number = 10): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${category}&number=${number}&addRecipeNutrition=true&instructionsRequired=true`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${category} recipes`);
    }
    
    const data: RecipeSearchResult = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Error fetching ${category} recipes:`, error);
    return [];
  }
};

export const fetchRecipesByMealType = async (mealType: string, number = 10): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&type=${mealType}&number=${number}&addRecipeNutrition=true&instructionsRequired=true`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${mealType} recipes`);
    }
    
    const data: RecipeSearchResult = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Error fetching ${mealType} recipes:`, error);
    return [];
  }
};

export const fetchRecipeById = async (id: number): Promise<Recipe | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recipe with id ${id}`);
    }
    
    const data: Recipe = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching recipe with id ${id}:`, error);
    return null;
  }
};

export const searchRecipes = async (query: string, number = 10): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${query}&number=${number}&addRecipeNutrition=true&instructionsRequired=true`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search recipes with query ${query}`);
    }
    
    const data: RecipeSearchResult = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Error searching recipes with query ${query}:`, error);
    return [];
  }
};

export const searchRecipesByIngredients = async (ingredients: string[], number = 10): Promise<Recipe[]> => {
  try {
    const ingredientsStr = ingredients.join(',');
    const response = await fetch(
      `${API_BASE_URL}/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredientsStr}&number=${number}&ranking=1&ignorePantry=false`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search recipes by ingredients');
    }
    
    const data = await response.json();
    
    // Get full recipe details for each recipe found
    const recipePromises = data.map((recipe: { id: number }) => 
      fetchRecipeById(recipe.id)
    );
    
    const recipes = await Promise.all(recipePromises);
    return recipes.filter(Boolean) as Recipe[];
  } catch (error) {
    console.error('Error searching recipes by ingredients:', error);
    return [];
  }
};

interface MacroNutrients {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sugar?: number;
  sodium?: number;
  fiber?: number;
}

export const searchRecipesByMacros = async (
  macros: MacroNutrients,
  number = 10
): Promise<Recipe[]> => {
  try {
    let queryParams = new URLSearchParams();
    queryParams.append('apiKey', SPOONACULAR_API_KEY);
    queryParams.append('number', number.toString());
    queryParams.append('addRecipeNutrition', 'true');
    queryParams.append('instructionsRequired', 'true');
    
    if (macros.calories) {
      queryParams.append('maxCalories', macros.calories.toString());
    }
    if (macros.protein) {
      queryParams.append('minProtein', macros.protein.toString());
    }
    if (macros.carbs) {
      queryParams.append('maxCarbs', macros.carbs.toString());
    }
    if (macros.fat) {
      queryParams.append('maxFat', macros.fat.toString());
    }
    if (macros.sugar) {
      queryParams.append('maxSugar', macros.sugar.toString());
    }
    
    const response = await fetch(
      `${API_BASE_URL}/recipes/complexSearch?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search recipes by macros');
    }
    
    const data: RecipeSearchResult = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching recipes by macros:', error);
    return [];
  }
};
