import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiClient, isApiError } from "@/lib/api/client";
import {
    Recipe,
    RecipeWithDetails,
    FoodItem,
    FoodItemWithUnits,
    MealWithDetails,
    WeeklyMealsResponse,
} from "@/lib/types/api";

interface ConfigState {
    // Recipes
    recipes: Recipe[];
    currentRecipe: RecipeWithDetails | null;
    recipesLoading: boolean;
    recipesError: string | null;

    // Food Items
    foodItems: FoodItem[];
    currentFoodItem: FoodItemWithUnits | null;
    foodItemsLoading: boolean;
    foodItemsError: string | null;

    // Meals
    weeklyMeals: MealWithDetails[];
    mealsSummary: WeeklyMealsResponse["summary"] | null;
    currentMeal: MealWithDetails | null;
    mealsLoading: boolean;
    mealsError: string | null;

    // UI State
    activeTab: "meals" | "recipes" | "food" | "todos";

    // Recipe Actions
    fetchRecipes: () => Promise<void>;
    fetchRecipe: (id: string) => Promise<void>;
    clearCurrentRecipe: () => void;
    clearRecipesError: () => void;

    // Food Item Actions
    fetchFoodItems: () => Promise<void>;
    fetchFoodItem: (id: string) => Promise<void>;
    clearCurrentFoodItem: () => void;
    clearFoodItemsError: () => void;

    // Meal Actions
    fetchWeeklyMeals: () => Promise<void>;
    fetchMeal: (id: string) => Promise<void>;
    clearCurrentMeal: () => void;
    clearMealsError: () => void;

    // UI Actions
    setActiveTab: (tab: "meals" | "recipes" | "food" | "todos") => void;
}

export const useConfigStore = create<ConfigState>()(
    devtools(
        (set, get) => ({
            // Initial state
            recipes: [],
            currentRecipe: null,
            recipesLoading: false,
            recipesError: null,

            foodItems: [],
            currentFoodItem: null,
            foodItemsLoading: false,
            foodItemsError: null,

            weeklyMeals: [],
            mealsSummary: null,
            currentMeal: null,
            mealsLoading: false,
            mealsError: null,

            activeTab: "meals",

            // Recipe Actions
            clearRecipesError: () => set({ recipesError: null }),
            clearCurrentRecipe: () => set({ currentRecipe: null }),

            fetchRecipes: async () => {
                set({ recipesLoading: true, recipesError: null });

                try {
                    const recipes = await apiClient.getRecipes();
                    set({ recipes, recipesLoading: false });
                } catch (error) {
                    const errorMessage = isApiError(error)
                        ? error.message
                        : "Failed to fetch recipes";

                    set({ recipesError: errorMessage, recipesLoading: false });
                    console.error("Failed to fetch recipes:", error);
                }
            },

            fetchRecipe: async (id: string) => {
                // Don't show loading if we're just switching between recipes
                const showLoading = !get().currentRecipe;

                if (showLoading) {
                    set({ recipesLoading: true, recipesError: null });
                }

                try {
                    const recipe = await apiClient.getRecipe(id);
                    set({
                        currentRecipe: recipe,
                        recipesLoading: false,
                        recipesError: null,
                    });
                } catch (error) {
                    const errorMessage = isApiError(error)
                        ? error.message
                        : "Failed to fetch recipe details";

                    set({
                        recipesError: errorMessage,
                        recipesLoading: false,
                        currentRecipe: null,
                    });
                    console.error("Failed to fetch recipe:", error);
                }
            },

            // Food Item Actions
            clearFoodItemsError: () => set({ foodItemsError: null }),
            clearCurrentFoodItem: () => set({ currentFoodItem: null }),

            fetchFoodItems: async () => {
                set({ foodItemsLoading: true, foodItemsError: null });

                try {
                    const foodItems = await apiClient.getFoodItems();
                    set({ foodItems, foodItemsLoading: false });
                } catch (error) {
                    const errorMessage = isApiError(error)
                        ? error.message
                        : "Failed to fetch food items";

                    set({
                        foodItemsError: errorMessage,
                        foodItemsLoading: false,
                    });
                    console.error("Failed to fetch food items:", error);
                }
            },

            fetchFoodItem: async (id: string) => {
                const showLoading = !get().currentFoodItem;

                if (showLoading) {
                    set({ foodItemsLoading: true, foodItemsError: null });
                }

                try {
                    const foodItem = await apiClient.getFoodItemWithUnits(id);
                    set({
                        currentFoodItem: foodItem,
                        foodItemsLoading: false,
                        foodItemsError: null,
                    });
                } catch (error) {
                    const errorMessage = isApiError(error)
                        ? error.message
                        : "Failed to fetch food item details";

                    set({
                        foodItemsError: errorMessage,
                        foodItemsLoading: false,
                        currentFoodItem: null,
                    });
                    console.error("Failed to fetch food item:", error);
                }
            },

            // Meal Actions
            clearMealsError: () => set({ mealsError: null }),
            clearCurrentMeal: () => set({ currentMeal: null }),

            fetchWeeklyMeals: async () => {
                set({ mealsLoading: true, mealsError: null });

                try {
                    const response = await apiClient.getWeeklyMeals();
                    set({
                        weeklyMeals: response.meals,
                        mealsSummary: response.summary,
                        mealsLoading: false,
                    });
                } catch (error) {
                    const errorMessage = isApiError(error)
                        ? error.message
                        : "Failed to fetch weekly meals";

                    set({ mealsError: errorMessage, mealsLoading: false });
                    console.error("Failed to fetch weekly meals:", error);
                }
            },

            fetchMeal: async (id: string) => {
                const showLoading = !get().currentMeal;

                if (showLoading) {
                    set({ mealsLoading: true, mealsError: null });
                }

                try {
                    const meal = await apiClient.getMeal(id);
                    set({
                        currentMeal: meal,
                        mealsLoading: false,
                        mealsError: null,
                    });
                } catch (error) {
                    const errorMessage = isApiError(error)
                        ? error.message
                        : "Failed to fetch meal details";

                    set({
                        mealsError: errorMessage,
                        mealsLoading: false,
                        currentMeal: null,
                    });
                    console.error("Failed to fetch meal:", error);
                }
            },

            // UI Actions
            setActiveTab: (tab: "meals" | "recipes" | "food" | "todos") => {
                set({ activeTab: tab });

                // Auto-fetch data when switching tabs if not already loaded
                const state = get();

                switch (tab) {
                    case "recipes":
                        if (
                            state.recipes.length === 0 &&
                            !state.recipesLoading
                        ) {
                            state.fetchRecipes();
                        }
                        break;
                    case "food":
                        if (
                            state.foodItems.length === 0 &&
                            !state.foodItemsLoading
                        ) {
                            state.fetchFoodItems();
                        }
                        break;
                    case "meals":
                        if (
                            state.weeklyMeals.length === 0 &&
                            !state.mealsLoading
                        ) {
                            state.fetchWeeklyMeals();
                        }
                        break;
                }
            },
        }),
        {
            name: "config-store",
        }
    )
);
