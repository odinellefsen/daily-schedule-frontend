// API Client for Daily Scheduler Hono Backend
// Handles all HTTP communication with proper error handling and auth

// For client-side token access
let clientToken: string | null = null;

import {
    Todo,
    CreateTodoRequest,
    UpdateTodoRequest,
    TodayTodosResponse,
    Recipe,
    CreateRecipeRequest,
    CreateRecipeStepsRequest,
    CreateRecipeIngredientsRequest,
    FoodItem,
    CreateFoodItemRequest,
    CreateFoodItemUnitRequest,
    Meal,
    MealWithDetails,
    CreateMealRequest,
    CreateMealResponse,
    WeeklyMealsResponse,
    ApiResponse,
    RecipeWithDetails,
    FoodItemWithUnits,
    UnitOfMeasurementEnum,
} from "@/lib/types/api";

// Mock mode for development
const MOCK_API_MODE = true;

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

class ApiClient {
    private baseURL: string;

    constructor() {
        this.baseURL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    }

    // Method to set client-side token from components
    setToken(token: string | null): void {
        clientToken = token;
    }

    private async getAuthToken(): Promise<string | null> {
        return clientToken;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        // Mock responses for development
        if (MOCK_API_MODE) {
            return this.mockRequest<T>(endpoint, options);
        }

        const token = await this.getAuthToken();

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || "Request failed",
                response.status,
                errorData.code,
                errorData
            );
        }

        return response.json();
    }

    private async mockRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        // Simulate API delay
        await new Promise((resolve) =>
            setTimeout(resolve, 100 + Math.random() * 400)
        );

        const method = options.method || "GET";

        // Mock responses based on endpoint
        if (endpoint === "/api/todos/today" && method === "GET") {
            return {
                todos: [
                    {
                        id: "todo-1",
                        description: "Demo: Prep vegetables for dinner",
                        completed: false,
                        scheduledFor: new Date().toISOString().split("T")[0],
                        urgency: "MEDIUM",
                        estimatedDuration: 15,
                        context: {
                            type: "meal",
                            mealName: "Sunday Family Dinner",
                        },
                    },
                    {
                        id: "todo-2",
                        description: "Demo: Marinate chicken",
                        completed: true,
                        scheduledFor: new Date().toISOString().split("T")[0],
                        urgency: "HIGH",
                        estimatedDuration: 10,
                        completedAt: new Date().toISOString(),
                        context: {
                            type: "meal",
                            mealName: "Sunday Family Dinner",
                        },
                    },
                ],
                counts: {
                    total: 2,
                    completed: 1,
                    remaining: 1,
                    overdue: 0,
                },
            } as T;
        }

        if (endpoint === "/api/recipes" && method === "GET") {
            return [
                {
                    id: "recipe-1",
                    nameOfTheRecipe: "Demo: Chocolate Chip Cookies",
                    generalDescriptionOfTheRecipe: "Classic homemade cookies",
                    whenIsItConsumed: ["DESSERT"],
                    version: 1,
                    stepCount: 3,
                    ingredientCount: 5,
                },
                {
                    id: "recipe-2",
                    nameOfTheRecipe: "Demo: Grilled Chicken",
                    generalDescriptionOfTheRecipe:
                        "Simple grilled chicken breast",
                    whenIsItConsumed: ["LUNCH", "DINNER"],
                    version: 1,
                    stepCount: 4,
                    ingredientCount: 3,
                },
            ] as T;
        }

        if (endpoint === "/api/meals/weekly" && method === "GET") {
            const today = new Date();
            return {
                meals: [
                    {
                        id: "meal-1",
                        mealName: "Demo: Sunday Family Dinner",
                        scheduledToBeEatenAt: today.toISOString(),
                        timing: "DINNER",
                        hasMealBeenConsumed: false,
                        recipes: [
                            {
                                recipeName: "Demo: Grilled Chicken",
                            },
                        ],
                        steps: [
                            {
                                id: "step-1",
                                instruction:
                                    "Preheat grill to medium-high heat",
                                estimatedDurationMinutes: 5,
                                isStepCompleted: true,
                                assignedToDate: null,
                                todoId: null,
                                mealId: "meal-1",
                            },
                            {
                                id: "step-2",
                                instruction:
                                    "Season chicken with salt and pepper",
                                estimatedDurationMinutes: 5,
                                isStepCompleted: false,
                                assignedToDate: null,
                                todoId: null,
                                mealId: "meal-1",
                            },
                            {
                                id: "step-3",
                                instruction:
                                    "Grill chicken for 6-7 minutes per side",
                                estimatedDurationMinutes: 15,
                                isStepCompleted: false,
                                assignedToDate: null,
                                todoId: null,
                                mealId: "meal-1",
                            },
                        ],
                    },
                ],
                summary: {
                    totalMeals: 1,
                    completedMeals: 0,
                    upcomingMeals: 1,
                    overdueSteps: 0,
                },
            } as T;
        }

        // Individual recipe requests
        if (endpoint.startsWith("/api/recipes/") && method === "GET") {
            const recipeId = endpoint.split("/").pop();
            return {
                id: recipeId,
                userId: "user-1",
                nameOfTheRecipe: "Demo: Chocolate Chip Cookies",
                generalDescriptionOfTheRecipe:
                    "Classic homemade cookies perfect for any occasion",
                whenIsItConsumed: ["DESSERT"],
                version: 1,
                steps: [
                    {
                        id: "recipe-step-1",
                        recipeId: recipeId,
                        instruction: "Preheat oven to 375°F (190°C)",
                        estimatedDurationMinutes: 5,
                        sortOrder: 1,
                    },
                    {
                        id: "recipe-step-2",
                        recipeId: recipeId,
                        instruction:
                            "Mix flour, baking soda, and salt in a bowl",
                        estimatedDurationMinutes: 5,
                        sortOrder: 2,
                    },
                    {
                        id: "recipe-step-3",
                        recipeId: recipeId,
                        instruction:
                            "Cream butter and sugars, add eggs and vanilla",
                        estimatedDurationMinutes: 10,
                        sortOrder: 3,
                    },
                ],
                ingredients: [
                    {
                        id: "recipe-ing-1",
                        recipeId: recipeId,
                        ingredientText: "2¼ cups all-purpose flour",
                        sortOrder: 1,
                    },
                    {
                        id: "recipe-ing-2",
                        recipeId: recipeId,
                        ingredientText: "1 cup butter, softened",
                        sortOrder: 2,
                    },
                    {
                        id: "recipe-ing-3",
                        recipeId: recipeId,
                        ingredientText: "1 cup chocolate chips",
                        sortOrder: 3,
                    },
                ],
            } as T;
        }

        // Food item with units requests
        if (
            endpoint.includes("/api/food-items/") &&
            endpoint.endsWith("/units") &&
            method === "GET"
        ) {
            const foodItemId = endpoint.split("/")[3]; // Extract ID from /api/food-items/{id}/units
            return {
                id: foodItemId,
                name: "Demo: Chicken Breast",
                categoryHierarchy: ["Protein", "Poultry", "Chicken"],
                units: [
                    {
                        id: "unit-1",
                        foodItemId: foodItemId,
                        unitOfMeasurement: UnitOfMeasurementEnum.GRAM,
                        unitDescription: "per 100g serving",
                        calories: 165,
                        proteinInGrams: 31,
                        carbohydratesInGrams: 0,
                        fatInGrams: 3.6,
                        fiberInGrams: 0,
                        sugarInGrams: 0,
                    },
                    {
                        id: "unit-2",
                        foodItemId: foodItemId,
                        unitOfMeasurement: UnitOfMeasurementEnum.PIECE,
                        unitDescription: "medium breast (150g)",
                        calories: 248,
                        proteinInGrams: 46.5,
                        carbohydratesInGrams: 0,
                        fatInGrams: 5.4,
                        fiberInGrams: 0,
                        sugarInGrams: 0,
                    },
                ],
            } as T;
        }

        // Handle POST requests (creation)
        if (method === "POST") {
            if (endpoint === "/api/todos") {
                return {
                    id: `todo-${Date.now()}`,
                    description: "New todo created",
                    completed: false,
                    scheduledFor: new Date().toISOString().split("T")[0],
                    urgency: "MEDIUM",
                    estimatedDuration: 30,
                } as T;
            }

            if (endpoint === "/api/recipes") {
                return {
                    id: `recipe-${Date.now()}`,
                    nameOfTheRecipe: "New Recipe",
                    version: 1,
                } as T;
            }

            if (endpoint === "/api/meals") {
                return {
                    meal: {
                        id: `meal-${Date.now()}`,
                        mealName: "New Meal",
                    },
                } as T;
            }
        }

        // Default mock response
        return {} as T;
    }

    // Todo API methods
    async getTodayTodos(): Promise<TodayTodosResponse> {
        return this.request<TodayTodosResponse>("/api/todos/today");
    }

    async createTodo(data: CreateTodoRequest): Promise<Todo> {
        return this.request<Todo>("/api/todos", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateTodo(data: UpdateTodoRequest): Promise<Todo> {
        return this.request<Todo>(`/api/todos/${data.id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }

    async deleteTodo(id: string): Promise<void> {
        await this.request<void>(`/api/todos/${id}`, {
            method: "DELETE",
        });
    }

    // Recipe API methods
    async getRecipes(): Promise<Recipe[]> {
        return this.request<Recipe[]>("/api/recipes");
    }

    async getRecipe(id: string): Promise<RecipeWithDetails> {
        return this.request<RecipeWithDetails>(`/api/recipes/${id}`);
    }

    async createRecipe(data: CreateRecipeRequest): Promise<Recipe> {
        return this.request<Recipe>("/api/recipes", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async createRecipeSteps(data: CreateRecipeStepsRequest): Promise<void> {
        await this.request<void>("/api/recipes/steps", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async createRecipeIngredients(
        data: CreateRecipeIngredientsRequest
    ): Promise<void> {
        await this.request<void>("/api/recipes/ingredients", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // Food API methods
    async getFoodItems(): Promise<FoodItem[]> {
        return this.request<FoodItem[]>("/api/food-items");
    }

    async getFoodItem(id: string): Promise<FoodItem> {
        return this.request<FoodItem>(`/api/food-items/${id}`);
    }

    async getFoodItemWithUnits(id: string): Promise<FoodItemWithUnits> {
        return this.request<FoodItemWithUnits>(`/api/food-items/${id}/units`);
    }

    async createFoodItem(data: CreateFoodItemRequest): Promise<FoodItem> {
        return this.request<FoodItem>("/api/food-items", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async createFoodItemUnit(data: CreateFoodItemUnitRequest): Promise<void> {
        await this.request<void>("/api/food-items/units", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // Meal API methods
    async getWeeklyMeals(
        startDate?: string,
        endDate?: string
    ): Promise<WeeklyMealsResponse> {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const query = params.toString() ? `?${params.toString()}` : "";
        return this.request<WeeklyMealsResponse>(`/api/meals/weekly${query}`);
    }

    async getMeal(id: string): Promise<MealWithDetails> {
        return this.request<MealWithDetails>(`/api/meals/${id}`);
    }

    async createMeal(data: CreateMealRequest): Promise<CreateMealResponse> {
        return this.request<CreateMealResponse>("/api/meals", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
}

export const apiClient = new ApiClient();
