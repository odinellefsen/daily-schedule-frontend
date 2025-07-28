// API Client for Daily Scheduler Hono Backend
// Handles all HTTP communication with proper error handling and auth

import {
    Todo,
    TodayTodosResponse,
    CreateTodoRequest,
    UpdateTodoRequest,
    Recipe,
    RecipeWithDetails,
    CreateRecipeRequest,
    CreateRecipeStepsRequest,
    CreateRecipeIngredientsRequest,
    FoodItem,
    FoodItemWithUnits,
    CreateFoodItemRequest,
    CreateFoodItemUnitRequest,
    Meal,
    MealWithDetails,
    WeeklyMealsResponse,
    CreateMealRequest,
    CreateMealResponse,
    RecipeSearchParams,
    FoodItemSearchParams,
    ApiResponse,
} from "@/lib/types/api";

class ApiClient {
    private baseURL: string;
    private getAuthToken: () => Promise<string | null>;

    constructor() {
        this.baseURL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        this.getAuthToken = this.getAuthTokenFromSession;
    }

    private async getAuthTokenFromSession(): Promise<string | null> {
        // Get the auth token from NextAuth session
        if (typeof window !== "undefined") {
            // Client-side: get from session via API call
            try {
                const response = await fetch("/api/auth/session");
                if (response.ok) {
                    const session = await response.json();
                    return session?.accessToken || null;
                }
            } catch (error) {
                console.error("Failed to get session:", error);
            }
            return null;
        } else {
            // Server-side: use auth() function
            const { getAccessToken } = await import("@/lib/auth");
            return await getAccessToken();
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const authToken = await this.getAuthToken();

        const config: RequestInit = {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(authToken && { Authorization: `Bearer ${authToken}` }),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(
                    response.status,
                    errorData.message || `HTTP Error: ${response.status}`,
                    errorData
                );
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            // Network or parsing error
            throw new ApiError(
                500,
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
                { originalError: error }
            );
        }
    }

    // ============================================================================
    // Landing Page APIs (Frictionless Experience)
    // ============================================================================

    /**
     * Get today's todos with urgency and context information
     * Used by the landing page for zero-friction execution mode
     */
    async getTodayTodos(): Promise<TodayTodosResponse> {
        return this.request<TodayTodosResponse>("/api/todo/today");
    }

    /**
     * Update a todo (most commonly for completion)
     * Supports optimistic updates with proper error handling
     */
    async updateTodo(updates: UpdateTodoRequest): Promise<Todo> {
        return this.request<Todo>("/api/todo", {
            method: "PATCH",
            body: JSON.stringify(updates),
        });
    }

    /**
     * Create a new todo (standalone or meal-related)
     */
    async createTodo(todo: CreateTodoRequest): Promise<Todo> {
        return this.request<Todo>("/api/todo", {
            method: "POST",
            body: JSON.stringify(todo),
        });
    }

    /**
     * Delete a todo
     */
    async deleteTodo(id: string): Promise<void> {
        return this.request<void>(`/api/todo/${id}`, {
            method: "DELETE",
        });
    }

    // ============================================================================
    // Configuration APIs - Meal Planning
    // ============================================================================

    /**
     * Get weekly meal plan with progress tracking
     * Used by configuration area for meal planning overview
     */
    async getWeeklyMeals(): Promise<WeeklyMealsResponse> {
        return this.request<WeeklyMealsResponse>("/api/meal/week");
    }

    /**
     * Get detailed meal information including steps and ingredients
     */
    async getMeal(id: string): Promise<MealWithDetails> {
        return this.request<MealWithDetails>(`/api/meal/${id}`);
    }

    /**
     * Create a new meal with recipe snapshots
     * This triggers the 3-event flow: meal.created, meal-instructions.created, meal-ingredients.created
     */
    async createMeal(meal: CreateMealRequest): Promise<CreateMealResponse> {
        return this.request<CreateMealResponse>("/api/meal", {
            method: "POST",
            body: JSON.stringify(meal),
        });
    }

    /**
     * Update meal metadata (add/remove recipes)
     * This rebuilds all meal instructions and ingredients
     */
    async updateMeal(
        id: string,
        updates: Partial<CreateMealRequest>
    ): Promise<MealWithDetails> {
        return this.request<MealWithDetails>("/api/meal", {
            method: "PATCH",
            body: JSON.stringify({ id, ...updates }),
        });
    }

    /**
     * Delete a meal and all related data
     */
    async deleteMeal(id: string): Promise<void> {
        return this.request<void>(`/api/meal/${id}`, {
            method: "DELETE",
        });
    }

    // ============================================================================
    // Configuration APIs - Recipe Management
    // ============================================================================

    /**
     * Get all recipes with completeness metadata
     */
    async getRecipes(): Promise<Recipe[]> {
        return this.request<Recipe[]>("/api/recipe");
    }

    /**
     * Search recipes with filters
     */
    async searchRecipes(params: RecipeSearchParams): Promise<Recipe[]> {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });

        return this.request<Recipe[]>(`/api/recipe/search?${searchParams}`);
    }

    /**
     * Get detailed recipe with steps and ingredients
     */
    async getRecipe(id: string): Promise<RecipeWithDetails> {
        return this.request<RecipeWithDetails>(`/api/recipe/${id}`);
    }

    /**
     * Create a new recipe template
     */
    async createRecipe(recipe: CreateRecipeRequest): Promise<Recipe> {
        return this.request<Recipe>("/api/recipe", {
            method: "POST",
            body: JSON.stringify(recipe),
        });
    }

    /**
     * Update recipe metadata (triggers version bump)
     */
    async updateRecipe(
        id: string,
        updates: Partial<CreateRecipeRequest>
    ): Promise<Recipe> {
        return this.request<Recipe>("/api/recipe", {
            method: "PATCH",
            body: JSON.stringify({ id, ...updates }),
        });
    }

    /**
     * Add cooking instructions to recipe
     */
    async createRecipeSteps(steps: CreateRecipeStepsRequest): Promise<void> {
        return this.request<void>("/api/recipe/instructions", {
            method: "POST",
            body: JSON.stringify(steps),
        });
    }

    /**
     * Add ingredients to recipe
     */
    async createRecipeIngredients(
        ingredients: CreateRecipeIngredientsRequest
    ): Promise<void> {
        return this.request<void>("/api/recipe/ingredients", {
            method: "POST",
            body: JSON.stringify(ingredients),
        });
    }

    /**
     * Delete a recipe
     */
    async deleteRecipe(id: string): Promise<void> {
        return this.request<void>(`/api/recipe/${id}`, {
            method: "DELETE",
        });
    }

    // ============================================================================
    // Configuration APIs - Food Database
    // ============================================================================

    /**
     * Get all food items with unit counts
     */
    async getFoodItems(): Promise<FoodItem[]> {
        return this.request<FoodItem[]>("/api/food-item");
    }

    /**
     * Search food database
     */
    async searchFoodItems(params: FoodItemSearchParams): Promise<FoodItem[]> {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });

        return this.request<FoodItem[]>(
            `/api/food-item/search?${searchParams}`
        );
    }

    /**
     * Get food item with all nutritional units
     */
    async getFoodItemWithUnits(id: string): Promise<FoodItemWithUnits> {
        return this.request<FoodItemWithUnits>(`/api/food-item/${id}/units`);
    }

    /**
     * Create a new food item
     */
    async createFoodItem(foodItem: CreateFoodItemRequest): Promise<FoodItem> {
        return this.request<FoodItem>("/api/food-item", {
            method: "POST",
            body: JSON.stringify(foodItem),
        });
    }

    /**
     * Add nutritional unit to food item
     */
    async createFoodItemUnit(unit: CreateFoodItemUnitRequest): Promise<void> {
        return this.request<void>("/api/food-item/units", {
            method: "POST",
            body: JSON.stringify(unit),
        });
    }

    /**
     * Delete a food item
     */
    async deleteFoodItem(id: string): Promise<void> {
        return this.request<void>(`/api/food-item/${id}`, {
            method: "DELETE",
        });
    }

    // ============================================================================
    // General Todo Management (Configuration Area)
    // ============================================================================

    /**
     * Get all todos with relations for management
     */
    async getAllTodos(): Promise<Todo[]> {
        return this.request<Todo[]>("/api/todo");
    }
}

// Custom API Error class for better error handling
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = "ApiError";
    }

    get isNetworkError(): boolean {
        return this.status === 0 || this.status >= 500;
    }

    get isAuthError(): boolean {
        return this.status === 401 || this.status === 403;
    }

    get isValidationError(): boolean {
        return this.status === 400 || this.status === 422;
    }

    get isNotFoundError(): boolean {
        return this.status === 404;
    }
}

// Singleton instance
export const apiClient = new ApiClient();

// Type guard for API errors
export const isApiError = (error: unknown): error is ApiError => {
    return error instanceof ApiError;
};
