// Recipe types based on Daily Scheduler API contracts

export type RecipeTimingType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

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
  sortOrder: number;
}

export interface RecipeIngredientsType {
  recipeId: string;
  ingredients: RecipeIngredient[];
}

export interface IngredientUsedInStep {
  foodItemId: string;
  foodItemUnitId: string;
  quantityOfFoodItemUnit: number;
}

export interface RecipeInstruction {
  id?: string;
  stepNumber: number;
  stepInstruction: string;
  ingredientsUsedInStep?: IngredientUsedInStep[];
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
  instructions?: RecipeInstruction[];
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
    sortOrder: number;
  }[];
}

export interface CreateInstructionsRequest {
  recipeId: string;
  stepByStepInstructions: {
    stepNumber: number;
    stepInstruction: string;
    ingredientsUsedInStep?: IngredientUsedInStep[];
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
