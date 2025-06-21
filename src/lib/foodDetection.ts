// Food Detection Service
// This service can be integrated with various computer vision APIs:
// - Google Cloud Vision API
// - Azure Computer Vision
// - AWS Rekognition
// - Clarifai Food Detection
// - Or any custom ML model

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

// Mock food detection function
// Replace this with actual API calls to computer vision services
export const detectFoodItems = async (base64Image: string): Promise<FoodDetectionResult> => {
  const startTime = Date.now();
  
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  // Generate random detected foods based on common items
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
      boundingBox: {
        x: Math.random() * 0.8,
        y: Math.random() * 0.8,
        width: 0.1 + Math.random() * 0.2,
        height: 0.1 + Math.random() * 0.2,
      },
    });
  }
  
  // Sort by confidence (highest first)
  detectedFoods.sort((a, b) => b.confidence - a.confidence);
  
  const processingTime = Date.now() - startTime;
  
  return {
    foods: detectedFoods,
    processingTime,
    imageSize: {
      width: 1920,
      height: 1080,
    },
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