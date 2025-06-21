
const OPENAI_API_KEY = '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';

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
