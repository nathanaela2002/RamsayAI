export interface GPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getGPTResponse(messages: GPTMessage[]): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'I apologize, but I encountered an error processing your request. Please try again later.';
  }
}

export async function analyzeUserInputForRecipeSearch(userInput: string): Promise<{
  ingredients?: string[];
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
    sodium?: number;
    fiber?: number;
  };
  query?: string;
}> {
  const messages: GPTMessage[] = [
    {
      role: 'system',
      content: `You are a helpful assistant that extracts the following information from user queries about recipes:
      1. Ingredients they mentioned
      2. Macro nutrient requirements (calories, protein, carbs, fat, sugar, sodium, fiber)
      3. Any other search terms or food types
      
      Respond with a JSON object containing:
      {
        "ingredients": ["ingredient1", "ingredient2"],
        "macros": {
          "calories": number or null,
          "protein": number or null,
          "carbs": number or null,
          "fat": number or null,
          "sugar": number or null,
          "sodium": number or null,
          "fiber": number or null
        },
        "query": "any other search terms"
      }
      
      If a field is not present in the user query, omit it from the JSON.`
    },
    {
      role: 'user',
      content: userInput
    }
  ];

  try {
    const response = await getGPTResponse(messages);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing user input:', error);
    return {};
  }
}

export interface MacroNutrients {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sugar?: number;
  sodium?: number;
  fiber?: number;
}

export async function getAIRecipeSuggestions(macros: MacroNutrients): Promise<{
  suggestions: string[];
  explanation: string;
}> {
  try {
    // Check if we have any macros to work with
    const hasMacros = Object.values(macros).some(value => value !== undefined && value > 0);
    if (!hasMacros) {
      return {
        suggestions: [
          "Please enter at least one macro nutrient value to get personalized suggestions"
        ],
        explanation: "Enter your desired calories, protein, carbs, fat, sugar, sodium, or fiber to receive AI-powered recipe suggestions."
      };
    }

    const macroDescription = Object.entries(macros)
      .filter(([_, value]) => value !== undefined && value > 0)
      .map(([key, value]) => `${key}: ${value}${key === 'calories' ? ' kcal' : key === 'sodium' ? ' mg' : 'g'}`)
      .join(', ');

    console.log('Sending macros to AI:', macroDescription);

    // Create a more specific prompt based on the actual macros
    let specificGuidance = '';
    
    if (macros.protein && macros.protein > 30) {
      specificGuidance += '- High protein requirement detected. Focus on lean meats, fish, eggs, Greek yogurt, cottage cheese, and legumes.\n';
    }
    if (macros.carbs && macros.carbs < 50) {
      specificGuidance += '- Low carb requirement detected. Suggest keto-friendly alternatives like cauliflower rice, zucchini noodles, and low-carb vegetables.\n';
    }
    if (macros.calories && macros.calories < 500) {
      specificGuidance += '- Low calorie requirement detected. Focus on high-volume, low-calorie foods like vegetables, lean proteins, and broth-based soups.\n';
    }
    if (macros.fat && macros.fat > 40) {
      specificGuidance += '- Higher fat requirement detected. Include healthy fats like avocado, nuts, olive oil, and fatty fish.\n';
    }
    if (macros.fiber && macros.fiber > 25) {
      specificGuidance += '- High fiber requirement detected. Include whole grains, legumes, fruits, and vegetables.\n';
    }
    if (macros.sodium && macros.sodium < 500) {
      specificGuidance += '- Low sodium requirement detected. Use herbs, spices, and salt-free seasonings.\n';
    }

    const prompt = `As a professional nutritionist and chef, analyze these specific macro nutrient requirements: ${macroDescription}

${specificGuidance}

Based on these EXACT macros, provide:
1. 5 unique and specific recipe suggestions that would closely match these macro requirements
2. A detailed explanation of why these recipes are nutritionally suitable for these specific macros

IMPORTANT: Make each suggestion unique and tailored to the specific macro values provided. Do not give generic suggestions.

Respond in this exact JSON format:
{
  "suggestions": [
    "Specific Recipe Name - detailed description with exact macro highlights for this recipe",
    "Specific Recipe Name - detailed description with exact macro highlights for this recipe",
    "Specific Recipe Name - detailed description with exact macro highlights for this recipe",
    "Specific Recipe Name - detailed description with exact macro highlights for this recipe", 
    "Specific Recipe Name - detailed description with exact macro highlights for this recipe"
  ],
  "explanation": "Detailed explanation of how these specific recipes align with the exact macro requirements provided, including specific nutritional benefits and macro breakdown"
}`;

    console.log('Sending prompt to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert nutritionist and professional chef with deep knowledge of macro nutrients, food composition, and recipe development. You specialize in creating recipes that precisely meet specific macro nutrient requirements while being delicious and practical to prepare. Always provide unique, specific suggestions based on the exact macro values provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8, // Slightly higher temperature for more variety
        max_tokens: 1000,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('OpenAI response content:', content);
    
    try {
      const parsed = JSON.parse(content);
      console.log('Successfully parsed AI response:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw content that failed to parse:', content);
      
      // Enhanced fallback suggestions based on the actual macro patterns
      const hasHighProtein = macros.protein && macros.protein > 30;
      const hasLowCarbs = macros.carbs && macros.carbs < 50;
      const hasLowCalories = macros.calories && macros.calories < 500;
      const hasHighFat = macros.fat && macros.fat > 40;
      const hasHighFiber = macros.fiber && macros.fiber > 25;
      
      if (hasHighProtein && hasLowCarbs) {
        return {
          suggestions: [
            `Keto Chicken Caesar Salad - ${macros.protein}g protein, ${macros.carbs}g carbs, keto-friendly with romaine and parmesan`,
            `Salmon with Roasted Asparagus - ${macros.protein}g protein, ${macros.carbs}g carbs, rich in omega-3s`,
            `Turkey and Spinach Stuffed Bell Peppers - ${macros.protein}g protein, ${macros.carbs}g carbs, fiber-rich vegetables`,
            `Lean Beef Stir-Fry with Broccoli - ${macros.protein}g protein, ${macros.carbs}g carbs, iron-rich and low-carb`,
            `Tofu and Mushroom Stir-Fry - ${macros.protein}g protein, ${macros.carbs}g carbs, plant-based protein`
          ],
          explanation: `These recipes are specifically optimized for your high protein (${macros.protein}g) and low carb (${macros.carbs}g) requirements, perfect for muscle building and ketogenic diets.`
        };
      } else if (hasLowCalories) {
        return {
          suggestions: [
            `Grilled Chicken Salad with Mixed Greens - ${macros.calories} calories, high protein, nutrient-dense`,
            `Vegetable Soup with Lean Turkey - ${macros.calories} calories, high fiber, satisfying`,
            `Baked Cod with Steamed Vegetables - ${macros.calories} calories, high protein, omega-3 rich`,
            `Quinoa Bowl with Roasted Vegetables - ${macros.calories} calories, balanced macros, high fiber`,
            `Greek Yogurt with Berries - ${macros.calories} calories, protein-rich, antioxidant-packed`
          ],
          explanation: `These recipes are specifically designed for your ${macros.calories} calorie target while maintaining nutritional balance and satiety.`
        };
      } else if (hasHighFat) {
        return {
          suggestions: [
            `Avocado and Salmon Toast - ${macros.fat}g healthy fats, omega-3s, and protein`,
            `Nuts and Seeds Trail Mix - ${macros.fat}g healthy fats, fiber, and protein`,
            `Coconut Curry with Tofu - ${macros.fat}g healthy fats, plant-based protein`,
            `Olive Oil Roasted Vegetables - ${macros.fat}g healthy fats, fiber-rich`,
            `Almond Butter Smoothie Bowl - ${macros.fat}g healthy fats, protein, and fiber`
          ],
          explanation: `These recipes are specifically designed to meet your ${macros.fat}g fat requirement with healthy, unsaturated fats.`
        };
      } else {
        return {
          suggestions: [
            `Grilled Chicken Breast with Steamed Vegetables - Balanced protein and fiber for your macros`,
            `Salmon with Quinoa and Asparagus - Omega-3s, complete protein, and fiber`,
            `Turkey and Spinach Salad - Lean protein with nutrient-rich greens`,
            `Lean Beef Stir-Fry with Brown Rice - Iron-rich protein with whole grains`,
            `Tofu and Vegetable Curry - Plant-based protein with anti-inflammatory spices`
          ],
          explanation: `These balanced recipes provide a good mix of protein, carbohydrates, and healthy fats to meet your specific macro requirements.`
        };
      }
    }
  } catch (error) {
    console.error('Error getting AI recipe suggestions:', error);
    return {
      suggestions: [
        "Error: Unable to get AI suggestions. Please check your internet connection and try again."
      ],
      explanation: "There was an error connecting to the AI service. Please try again or check your internet connection."
    };
  }
}

export interface SimpleRecipe {
  title: string;
  ingredients: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export async function generateRecipesWithIngredients(
  macros: MacroNutrients,
  ingredients: string[],
  extraPreference?: string,
): Promise<SimpleRecipe[]> {
  const ingredientList = ingredients.join(', ');
  const macroString = Object.entries(macros)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const preferenceText = extraPreference ? ` Also, consider these user preferences: ${extraPreference}.` : '';
  const prompt = `You are an expert chef and nutritionist. Here is a list of AVAILABLE ingredients with their amounts (grams for weight-based items, quantity for count-based items): ${ingredientList}. Feel free to choose any combination of these ingredients—using them partially or entirely—to craft recipes that best meet the macro targets ${macroString}.${preferenceText} Create EXACTLY 3 recipe ideas that respect the specified ingredient amounts and macro limits. Respond ONLY with valid JSON (no markdown) in the following format:\n[ {\n  "title": "...",\n  "ingredients": ["item 1", "item 2"],\n  "macros": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }\n}, ... ]`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return only the recipes list. No explanations.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error('OpenAI error');
  const data = await response.json();
  const content: string = data.choices[0].message.content;
  // attempt to parse JSON
  const firstBracket = content.indexOf('[');
  const lastBracket = content.lastIndexOf(']');
  const jsonStr = firstBracket >= 0 ? content.slice(firstBracket, lastBracket + 1) : '[]';
  return JSON.parse(jsonStr);
}

export async function generateRecipeImage(recipeTitle: string): Promise<string> {
  try {
    console.log('Generating AI image for recipe:', recipeTitle);
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `A realistic, appetizing photo of ${recipeTitle} on table in natural daylight.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI DALL-E API error:', errorData);
      throw new Error(`OpenAI DALL-E API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    
    console.log('Generated image URL:', imageUrl);
    return imageUrl;
    
  } catch (error) {
    console.error('Error generating recipe image:', error);
    // Return a placeholder image or the original image on error
    return '';
  }
}

export interface AIRecipe {
  id?: number;
  title: string;
  description: string;
  readyInMinutes: number;
  servings: number;
  ingredients: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  image?: string;
  useAIImage?: boolean;
}

export async function generateRandomRecipes(count = 3): Promise<AIRecipe[]> {
  const prompt = `Create EXACTLY ${count} unique recipe ideas as JSON (no markdown) in the following format: [{"title":"...","description":"...","readyInMinutes":25,"servings":2,"ingredients":["item1","item2"],"macros":{"calories":350,"protein":20,"carbs":40,"fat":12}}]. Make them appetizing and diverse.`;

  try {
    const response = await getGPTResponse([
      { role: 'system', content: 'You are a master chef who outputs only valid JSON.' },
      { role: 'user', content: prompt },
    ]);
    const first = response.indexOf('[');
    const last = response.lastIndexOf(']');
    const json = first >= 0 ? response.slice(first, last + 1) : '[]';
    return JSON.parse(json);
  } catch (e) {
    console.error('generateRandomRecipes error', e);
    return [];
  }
}

// -------------------------- Meal plan types --------------------------
export interface MealPlanDay {
  day: string; // e.g. "Monday"
  meals: SimpleRecipe[]; // breakfast, lunch, dinner (length 3)
  dailyMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

/** Divide macro nutrient targets by a factor (e.g. 3 for per-meal) */
const divideMacros = (macros: MacroNutrients, factor = 3): MacroNutrients => {
  const divided: MacroNutrients = {};
  (Object.keys(macros) as (keyof MacroNutrients)[]).forEach((k) => {
    const val = macros[k];
    if (val !== undefined) divided[k] = Math.round(val / factor);
  });
  return divided;
};

/**
 * Generate a 7-day meal plan (3 meals per day) that collectively hit the
 * provided daily macro targets. This is a naive implementation that simply
 * reuses `generateRecipesWithIngredients` to create three recipes per day.
 * In production you would craft a single OpenAI prompt to get the entire
 * structured week at once, but breaking it up keeps latency manageable and
 * avoids giant prompts.
 */
export async function generateMealPlanWithIngredients(
  dailyMacros: MacroNutrients,
  ingredients: string[],
  extraPreference?: string,
): Promise<MealPlanDay[]> {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dailyCal = dailyMacros.calories;

  // helper to random in range
  const randPct = (min: number, max: number) => +(Math.random() * (max - min) + min).toFixed(2);

  const days: MealPlanDay[] = [];

  for (const day of weekDays) {
    // pick percentages until dinner within range
    let bPct = 0, lPct = 0, dPct = 0;
    do {
      bPct = randPct(0.20, 0.25);
      lPct = randPct(0.30, 0.35);
      dPct = 1 - (bPct + lPct);
    } while (dPct < 0.35 || dPct > 0.4);

    const pcts = [bPct, lPct, dPct];
    const mealNames = ['Breakfast', 'Lunch', 'Dinner'];

    const threeMeals: SimpleRecipe[] = [];

    for (let i = 0; i < 3; i++) {
      // build per-meal macro targets
      const pct = pcts[i];
      const perMeal: MacroNutrients = {};
      (Object.keys(dailyMacros) as (keyof MacroNutrients)[]).forEach((k) => {
        const val = dailyMacros[k];
        if (val !== undefined) {
          perMeal[k] = Math.round(val * pct);
        }
      });

      // add meal-type preference for typical foods
      const pref = `${mealNames[i]} meal with typical ${mealNames[i].toLowerCase()} foods. ${extraPreference ?? ''}`.trim();

      const recipes = await generateRecipesWithIngredients(perMeal, ingredients, pref);
      if (recipes.length > 0) threeMeals.push(recipes[0]);
    }

    // Aggregate macros
    const dailyTotal = threeMeals.reduce(
      (acc, m) => {
        acc.calories += m.macros.calories;
        acc.protein += m.macros.protein;
        acc.carbs += m.macros.carbs;
        acc.fat += m.macros.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    days.push({ day, meals: threeMeals, dailyMacros: dailyTotal });
  }

  return days;
}
