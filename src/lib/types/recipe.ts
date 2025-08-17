// Recipe types based on Daily Scheduler API contracts

export type RecipeTimingType = 'Breakfast' | 'Brunch' | 'Lunch' | 'Dinner' | 'On The Go' | 'Snack' | 'Late Night' | 'Afternoon Tea' | 'Supper';

export interface RecipeMetadataType {
  id: string;
  userId: string;
  nameOfTheRecipe: string;
  generalDescriptionOfTheRecipe?: string;
  whenIsItConsumed?: RecipeTimingType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeIngredient {
  id: string;
  ingredientText: string;
}

export interface RecipeIngredientsType {
  recipeId: string;
  ingredients: RecipeIngredient[];
}

export interface FoodItemUnitUsedInStep {
  foodItemUnitId: string;
  quantityOfFoodItemUnit: number;
}

export interface FoodItemUnit {
  id: string;
  foodItemId: string;
  foodItemName: string;
  unitOfMeasurement: string;
  unitDescription: string;
  calories: number;
  proteinInGrams: number;
  carbohydratesInGrams: number;
  fatInGrams: number;
  fiberInGrams: number;
  sugarInGrams: number;
}

export interface RecipeInstruction {
  id?: string;
  stepNumber: number;
  instruction: string;
  foodItemUnitsUsedInStep?: FoodItemUnitUsedInStep[];
}

export interface RecipeInstructionsType {
  recipeId: string;
  stepByStepInstructions: RecipeInstruction[];
}

export interface RecipeListItem {
  id: string;
  nameOfTheRecipe: string;
  generalDescriptionOfTheRecipe?: string;
  whenIsItConsumed?: RecipeTimingType[];
  ingredientCount?: number;
  stepCount?: number;
  isComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FullRecipe extends RecipeMetadataType {
  ingredients?: RecipeIngredient[];
  steps?: RecipeInstruction[];
  metadata?: {
    stepCount?: number;
    ingredientCount?: number;
    estimatedTotalTime?: number | null;
  };
  version?: number;
}

// Request types for creating recipes
export interface CreateRecipeRequest {
  nameOfTheRecipe: string;
  generalDescriptionOfTheRecipe?: string;
  whenIsItConsumed?: RecipeTimingType[];
}

export interface CreateIngredientsRequest {
  recipeId: string;
  ingredients: {
    ingredientText: string;
  }[];
}

export interface CreateInstructionsRequest {
  recipeId: string;
  stepByStepInstructions: {
    stepInstruction: string;
    foodItemUnitsUsedInStep?: FoodItemUnitUsedInStep[];
  }[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface RecipeSearchParams {
  q?: string;
  timing?: RecipeTimingType;
}
