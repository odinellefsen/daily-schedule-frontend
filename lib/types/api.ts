// Core API Types for Daily Scheduler Frontend
// Based on the Hono API documentation

// ============================================================================
// Todo Domain Types
// ============================================================================

export interface TodoRelation {
    mealInstruction?: {
        mealStepId: string;
        mealId: string;
        recipeId: string;
        stepNumber: number;
    };
}

export interface Todo {
    id: string;
    userId: string;
    description: string;
    completed: boolean;
    scheduledFor?: string;
    completedAt?: string;
    relations?: TodoRelation[];

    // Frontend computed properties (from /api/todo/today)
    context?: {
        type: "meal" | "standalone";
        mealName?: string;
        stepNumber?: number;
        estimatedDuration?: number;
    };
    urgency?: "overdue" | "now" | "upcoming" | "later";
    canStartNow?: boolean;
    isOverdue?: boolean;
}

export interface TodayTodosResponse {
    todos: Todo[];
    counts: {
        total: number;
        completed: number;
        remaining: number;
        overdue: number;
    };
}

export interface CreateTodoRequest {
    description: string;
    scheduledFor?: string;
    relations?: TodoRelation[];
}

export interface UpdateTodoRequest {
    id: string;
    description?: string;
    completed?: boolean;
    scheduledFor?: string;
    completedAt?: string;
    relations?: TodoRelation[];
}

// ============================================================================
// Food Domain Types
// ============================================================================

export interface FoodItem {
    id: string;
    userId: string;
    name: string;
    categoryHierarchy: string[];
    unitCount?: number; // Frontend computed - number of available units
}

export interface FoodItemUnit {
    id: string;
    foodItemId: string;
    unitOfMeasurement: string;
    unitDescription?: string;
    calories: number;
    proteinInGrams?: number;
    carbohydratesInGrams?: number;
    fatInGrams?: number;
    fiberInGrams?: number;
    sugarInGrams?: number;
}

export interface FoodItemWithUnits extends FoodItem {
    units: FoodItemUnit[];
}

export interface CreateFoodItemRequest {
    name: string;
    categoryHierarchy: string[];
}

export interface CreateFoodItemUnitRequest {
    foodItemId: string;
    unitOfMeasurement: string;
    unitDescription?: string;
    calories: number;
    proteinInGrams?: number;
    carbohydratesInGrams?: number;
    fatInGrams?: number;
    fiberInGrams?: number;
    sugarInGrams?: number;
}

// ============================================================================
// Recipe Domain Types
// ============================================================================

export interface Recipe {
    id: string;
    userId: string;
    nameOfTheRecipe: string;
    generalDescriptionOfTheRecipe?: string;
    whenIsItConsumed?: string[]; // ["BREAKFAST", "LUNCH", "DINNER", "SNACK", "DESSERT"]
    version: number;

    // Frontend computed properties
    completeness?: {
        hasSteps: boolean;
        hasIngredients: boolean;
        stepCount: number;
        ingredientCount: number;
    };
}

export interface RecipeStep {
    id: string;
    recipeId: string;
    instruction: string;
    stepNumber: number;
}

export interface RecipeIngredient {
    id: string;
    recipeId: string;
    ingredientText: string;
    sortOrder: number;
}

export interface RecipeWithDetails extends Recipe {
    steps: RecipeStep[];
    ingredients: RecipeIngredient[];
}

export interface CreateRecipeRequest {
    nameOfTheRecipe: string;
    generalDescriptionOfTheRecipe?: string;
    whenIsItConsumed?: string[];
}

export interface CreateRecipeStepsRequest {
    recipeId: string;
    instructions: string[];
}

export interface CreateRecipeIngredientsRequest {
    recipeId: string;
    ingredients: string[];
}

// ============================================================================
// Meal Domain Types
// ============================================================================

export interface MealRecipeSnapshot {
    recipeId: string;
    recipeName: string;
    recipeDescription?: string;
    recipeVersion: number;
    scalingFactor: number;
}

export interface Meal {
    id: string;
    userId: string;
    mealName: string;
    scheduledToBeEatenAt?: string;
    hasMealBeenConsumed: boolean;
    recipes: MealRecipeSnapshot[]; // JSON field with recipe snapshots

    // Frontend computed properties
    progress?: {
        completed: number;
        total: number;
        percentage: number;
    };
}

export interface MealStep {
    id: string;
    mealId: string;
    recipeId: string;
    originalRecipeStepId: string;
    instruction: string;
    stepNumber: number;
    isStepCompleted: boolean;
    estimatedDurationMinutes?: number;
    assignedToDate?: string; // YYYY-MM-DD format
    todoId?: string;
    ingredientsUsedInStep?: Record<string, unknown>[]; // JSON field
}

export interface MealIngredient {
    id: string;
    mealId: string;
    recipeId: string;
    ingredientText: string;
    sortOrder: number;
}

export interface MealWithDetails extends Meal {
    steps: MealStep[];
    ingredients: MealIngredient[];
}

export interface WeeklyMealsResponse {
    meals: MealWithDetails[];
    summary: {
        totalMeals: number;
        completedMeals: number;
        upcomingMeals: number;
        overdueSteps: number;
    };
}

export interface CreateMealRequest {
    mealName: string;
    scheduledToBeEatenAt?: string;
    recipes: {
        recipeId: string;
        scalingFactor: number;
    }[];
}

export interface CreateMealResponse {
    meal: Meal;
    instructions: MealStep[];
    ingredients: MealIngredient[];
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
    details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ============================================================================
// Search and Filter Types
// ============================================================================

export interface SearchParams {
    q?: string;
    limit?: number;
    offset?: number;
}

export interface RecipeSearchParams extends SearchParams {
    timing?: string; // Filter by when consumed
    hasSteps?: boolean;
    hasIngredients?: boolean;
}

export interface FoodItemSearchParams extends SearchParams {
    category?: string;
    hasUnits?: boolean;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
}

export interface AuthSession {
    user: User;
    accessToken: string;
    refreshToken?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type MealTiming = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | "DESSERT";

export type TodoUrgency = "overdue" | "now" | "upcoming" | "later";

export type ApiEndpoint =
    | "/api/todo/today"
    | "/api/todo"
    | "/api/meal/week"
    | "/api/meal"
    | "/api/recipe"
    | "/api/recipe/search"
    | "/api/food-item"
    | "/api/food-item/search"
    | "/api/food-item/units";

// Frontend-specific types for UI state
export interface LoadingState {
    loading: boolean;
    error: string | null;
}

export interface OptimisticUpdate<T> {
    id: string;
    data: T;
    pending: boolean;
    originalData?: T;
}
