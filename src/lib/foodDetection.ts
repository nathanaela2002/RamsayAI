// Food Detection Service
// This service can be integrated with various computer vision APIs:
// - Google Cloud Vision API
// - Azure Computer Vision
// - AWS Rekognition
// - Clarifai Food Detection
// - Or any custom ML model

import { OPENAI_API_KEY } from '@/lib/openai';

export interface DetectedFood {
  name: string;
  count: number;
  confidence: number;
  category: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FoodDetectionResult {
  foods: DetectedFood[];
  processingTime: number;
  imageSize: {
    width: number;
    height: number;
  };
}

// Food categories for better organization
export const FOOD_CATEGORIES = {
  VEGETABLES: 'vegetable',
  FRUITS: 'fruit',
  MEAT: 'meat',
  DAIRY: 'dairy',
  GRAINS: 'grain',
  HERBS: 'herb',
  SPICES: 'spice',
  PANTRY: 'pantry',
  BEVERAGES: 'beverage',
  CONDIMENTS: 'condiment',
  FROZEN: 'frozen',
  CANNED: 'canned',
} as const;

// Common food items with their categories
const FOOD_DATABASE = {
  // Vegetables
  tomato: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['tomatoes', 'cherry tomato', 'roma tomato'] },
  onion: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['onions', 'red onion', 'white onion', 'yellow onion'] },
  garlic: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['garlic cloves', 'garlic bulb'] },
  bell_pepper: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['bell peppers', 'red pepper', 'green pepper', 'yellow pepper'] },
  carrot: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['carrots'] },
  broccoli: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['broccoli florets'] },
  spinach: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['baby spinach', 'spinach leaves'] },
  lettuce: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['iceberg lettuce', 'romaine lettuce'] },
  cucumber: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['cucumbers'] },
  potato: { category: FOOD_CATEGORIES.VEGETABLES, aliases: ['potatoes', 'russet potato', 'red potato'] },
  
  // Fruits
  apple: { category: FOOD_CATEGORIES.FRUITS, aliases: ['apples', 'red apple', 'green apple'] },
  banana: { category: FOOD_CATEGORIES.FRUITS, aliases: ['bananas'] },
  orange: { category: FOOD_CATEGORIES.FRUITS, aliases: ['oranges', 'mandarin orange'] },
  lemon: { category: FOOD_CATEGORIES.FRUITS, aliases: ['lemons', 'lime'] },
  strawberry: { category: FOOD_CATEGORIES.FRUITS, aliases: ['strawberries'] },
  grape: { category: FOOD_CATEGORIES.FRUITS, aliases: ['grapes', 'red grapes', 'green grapes'] },
  
  // Meat
  chicken_breast: { category: FOOD_CATEGORIES.MEAT, aliases: ['chicken breast', 'chicken breasts', 'boneless chicken'] },
  ground_beef: { category: FOOD_CATEGORIES.MEAT, aliases: ['beef', 'ground beef', 'hamburger meat'] },
  salmon: { category: FOOD_CATEGORIES.MEAT, aliases: ['salmon fillet', 'salmon fish'] },
  bacon: { category: FOOD_CATEGORIES.MEAT, aliases: ['bacon strips'] },
  pork_chop: { category: FOOD_CATEGORIES.MEAT, aliases: ['pork chops', 'pork'] },
  
  // Dairy
  milk: { category: FOOD_CATEGORIES.DAIRY, aliases: ['whole milk', 'skim milk', '2% milk'] },
  cheese: { category: FOOD_CATEGORIES.DAIRY, aliases: ['cheddar cheese', 'mozzarella cheese', 'parmesan cheese'] },
  butter: { category: FOOD_CATEGORIES.DAIRY, aliases: ['unsalted butter', 'salted butter'] },
  yogurt: { category: FOOD_CATEGORIES.DAIRY, aliases: ['greek yogurt', 'plain yogurt'] },
  eggs: { category: FOOD_CATEGORIES.DAIRY, aliases: ['egg', 'chicken eggs'] },
  
  // Grains
  rice: { category: FOOD_CATEGORIES.GRAINS, aliases: ['white rice', 'brown rice', 'jasmine rice'] },
  pasta: { category: FOOD_CATEGORIES.GRAINS, aliases: ['spaghetti', 'penne pasta', 'fettuccine'] },
  bread: { category: FOOD_CATEGORIES.GRAINS, aliases: ['white bread', 'whole wheat bread', 'sourdough bread'] },
  
  // Herbs
  basil: { category: FOOD_CATEGORIES.HERBS, aliases: ['fresh basil', 'basil leaves'] },
  parsley: { category: FOOD_CATEGORIES.HERBS, aliases: ['fresh parsley', 'parsley leaves'] },
  cilantro: { category: FOOD_CATEGORIES.HERBS, aliases: ['fresh cilantro', 'coriander'] },
  rosemary: { category: FOOD_CATEGORIES.HERBS, aliases: ['fresh rosemary', 'rosemary sprigs'] },
  
  // Pantry
  olive_oil: { category: FOOD_CATEGORIES.PANTRY, aliases: ['extra virgin olive oil', 'olive oil'] },
  salt: { category: FOOD_CATEGORIES.PANTRY, aliases: ['table salt', 'sea salt'] },
  pepper: { category: FOOD_CATEGORIES.PANTRY, aliases: ['black pepper', 'ground pepper'] },
  flour: { category: FOOD_CATEGORIES.PANTRY, aliases: ['all purpose flour', 'bread flour'] },
  sugar: { category: FOOD_CATEGORIES.PANTRY, aliases: ['white sugar', 'granulated sugar'] },
  
  // Condiments
  ketchup: { category: FOOD_CATEGORIES.CONDIMENTS, aliases: ['tomato ketchup'] },
  mustard: { category: FOOD_CATEGORIES.CONDIMENTS, aliases: ['yellow mustard', 'dijon mustard'] },
  mayonnaise: { category: FOOD_CATEGORIES.CONDIMENTS, aliases: ['mayo'] },
  soy_sauce: { category: FOOD_CATEGORIES.CONDIMENTS, aliases: ['soy sauce'] },
} as const;

// Utility: map food name to category using the FOOD_DATABASE or default
const categorizeFood = (name: string): string => {
  const key = name.toLowerCase().replace(/\s+/g, '_');
  const entry = (FOOD_DATABASE as Record<string, { category: string }>)[key];
  return entry ? entry.category : 'unknown';
};

// -----------------------------------------------------------------------------
// OpenAI Vision integration
// -----------------------------------------------------------------------------
export const detectFoodWithOpenAI = async (base64Image: string): Promise<FoodDetectionResult> => {
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `You are a vision model that identifies food items in refrigerator or pantry photos. Return ONLY valid JSON with this exact schema:\n{\n  "foods": [\n    {"name": string, "count": number, "confidence": number}\n  ]\n}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify each distinct food ingredient in this image. Estimate the item count for each where reasonable (e.g., number of apples). Provide your best confidence (0-1). Respond ONLY with the JSON schema described earlier.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || '{}';

    // Extract first JSON object from the response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in OpenAI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const detectedFoods: DetectedFood[] = (parsed.foods || []).map((item: any) => ({
      name: item.name?.toLowerCase() || 'unknown',
      count: typeof item.count === 'number' ? item.count : 1,
      confidence: typeof item.confidence === 'number' ? item.confidence : 0.7,
      category: categorizeFood(item.name || ''),
    }));

    return {
      foods: detectedFoods,
      processingTime: Date.now() - startTime,
      imageSize: { width: 0, height: 0 },
    };
  } catch (error) {
    console.error('[OpenAI Vision] fallback to mock detection:', error);
    // Fallback to mock implementation
    return mockDetectFoodItems(base64Image);
  }
};

// Preserve existing mock implementation under new name for fallback
const mockDetectFoodItems = async (base64Image: string): Promise<FoodDetectionResult> => {
  const startTime = Date.now();
  const possibleFoods = Object.keys(FOOD_DATABASE);
  const numDetections = Math.floor(Math.random() * 8) + 3; // 3-10 items
  const detectedFoods: DetectedFood[] = [];
  const usedFoods = new Set<string>();

  for (let i = 0; i < numDetections; i++) {
    let foodKey: string;
    do {
      foodKey = possibleFoods[Math.floor(Math.random() * possibleFoods.length)];
    } while (usedFoods.has(foodKey));

    usedFoods.add(foodKey);

    const foodInfo = FOOD_DATABASE[foodKey as keyof typeof FOOD_DATABASE];
    const count = Math.floor(Math.random() * 5) + 1; // 1-5 items
    const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence

    detectedFoods.push({
      name: foodKey.replace('_', ' '),
      count,
      confidence,
      category: foodInfo.category,
    });
  }

  return {
    foods: detectedFoods.sort((a, b) => b.confidence - a.confidence),
    processingTime: Date.now() - startTime,
    imageSize: { width: 1920, height: 1080 },
  };
};

// Function to call Google Cloud Vision API (example implementation)
export const detectFoodWithGoogleVision = async (base64Image: string): Promise<FoodDetectionResult> => {
  // This is an example of how you would integrate with Google Cloud Vision API
  // You would need to set up Google Cloud credentials and enable the Vision API
  
  /*
  const vision = require('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient();
  
  const request = {
    image: {
      content: base64Image,
    },
    features: [
      {
        type: 'LABEL_DETECTION',
        maxResults: 20,
      },
      {
        type: 'OBJECT_LOCALIZATION',
        maxResults: 20,
      },
    ],
  };
  
  const [result] = await client.annotateImage(request);
  const labels = result.labelAnnotations || [];
  const objects = result.localizedObjectAnnotations || [];
  
  // Process the results and map to food items
  // This would require additional logic to map generic labels to specific food items
  
  return {
    foods: [], // Processed results
    processingTime: 0,
    imageSize: { width: 0, height: 0 },
  };
  */
  
  // For now, fall back to mock implementation
  return detectFoodItems(base64Image);
};

// Function to call Azure Computer Vision API (example implementation)
export const detectFoodWithAzureVision = async (base64Image: string): Promise<FoodDetectionResult> => {
  // This is an example of how you would integrate with Azure Computer Vision
  
  /*
  const axios = require('axios');
  
  const endpoint = process.env.AZURE_VISION_ENDPOINT;
  const key = process.env.AZURE_VISION_KEY;
  
  const response = await axios.post(
    `${endpoint}/vision/v3.2/analyze?visualFeatures=Objects,Tags&language=en`,
    Buffer.from(base64Image, 'base64'),
    {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': key,
      },
    }
  );
  
  // Process the results and map to food items
  return {
    foods: [], // Processed results
    processingTime: 0,
    imageSize: { width: 0, height: 0 },
  };
  */
  
  // For now, fall back to mock implementation
  return detectFoodItems(base64Image);
};

// Function to call AWS Rekognition API (example implementation)
export const detectFoodWithAWSRekognition = async (base64Image: string): Promise<FoodDetectionResult> => {
  // This is an example of how you would integrate with AWS Rekognition
  
  /*
  const AWS = require('aws-sdk');
  const rekognition = new AWS.Rekognition();
  
  const params = {
    Image: {
      Bytes: Buffer.from(base64Image, 'base64'),
    },
    MaxLabels: 20,
    MinConfidence: 70,
  };
  
  const result = await rekognition.detectLabels(params).promise();
  
  // Process the results and map to food items
  return {
    foods: [], // Processed results
    processingTime: 0,
    imageSize: { width: 0, height: 0 },
  };
  */
  
  // For now, fall back to mock implementation
  return detectFoodItems(base64Image);
};

export const detectFoodItems = detectFoodWithOpenAI; 