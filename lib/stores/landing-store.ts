import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiClient, isApiError } from "@/lib/api/client";
import { Todo, TodayTodosResponse } from "@/lib/types/api";

interface LandingState {
    // State
    todos: Todo[];
    counts: TodayTodosResponse["counts"];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    fetchTodos: () => Promise<void>;
    completeTodo: (id: string) => Promise<void>;
    removeTodo: (id: string) => Promise<void>;
    clearError: () => void;

    // Optimistic updates
    optimisticUpdate: (id: string, updates: Partial<Todo>) => void;
    revertOptimisticUpdate: (id: string, originalTodo: Todo) => void;
}

export const useLandingStore = create<LandingState>()(
    devtools(
        (set, get) => ({
            // Initial state
            todos: [],
            counts: { total: 0, completed: 0, remaining: 0, overdue: 0 },
            loading: false,
            error: null,
            lastFetched: null,

            // Clear any error state
            clearError: () => set({ error: null }),

            // Fetch today's todos with error handling
            fetchTodos: async () => {
                set({ loading: true, error: null });

                try {
                    const response = await apiClient.getTodayTodos();
                    set({
                        todos: response.todos,
                        counts: response.counts,
                        lastFetched: Date.now(),
                        loading: false,
                    });
                } catch (error) {
                    const errorMessage = isApiError(error)
                        ? error.message
                        : "Failed to fetch todos";

                    set({
                        error: errorMessage,
                        loading: false,
                    });

                    console.error("Failed to fetch todos:", error);
                }
            },

            // Optimistically update a todo (for immediate UI feedback)
            optimisticUpdate: (id: string, updates: Partial<Todo>) => {
                const currentTodos = get().todos;
                const updatedTodos = currentTodos.map((todo) =>
                    todo.id === id ? { ...todo, ...updates } : todo
                );

                // Recalculate counts if completion status changed
                let newCounts = get().counts;
                if ("completed" in updates) {
                    const originalTodo = currentTodos.find((t) => t.id === id);
                    if (
                        originalTodo &&
                        originalTodo.completed !== updates.completed
                    ) {
                        if (updates.completed) {
                            newCounts = {
                                ...newCounts,
                                completed: newCounts.completed + 1,
                                remaining: newCounts.remaining - 1,
                            };
                        } else {
                            newCounts = {
                                ...newCounts,
                                completed: newCounts.completed - 1,
                                remaining: newCounts.remaining + 1,
                            };
                        }
                    }
                }

                set({ todos: updatedTodos, counts: newCounts });
            },

            // Revert optimistic update on error
            revertOptimisticUpdate: (id: string, originalTodo: Todo) => {
                const currentTodos = get().todos;
                const revertedTodos = currentTodos.map((todo) =>
                    todo.id === id ? originalTodo : todo
                );

                // Recalculate counts by re-fetching (simplest approach)
                get().fetchTodos();
            },

            // Complete a todo with optimistic updates
            completeTodo: async (id: string) => {
                const currentTodos = get().todos;
                const targetTodo = currentTodos.find((t) => t.id === id);

                if (!targetTodo || targetTodo.completed) {
                    return; // Already completed or not found
                }

                // Optimistic update
                get().optimisticUpdate(id, {
                    completed: true,
                    completedAt: new Date().toISOString(),
                });

                try {
                    await apiClient.updateTodo({
                        id,
                        completed: true,
                        completedAt: new Date().toISOString(),
                    });

                    // Refresh to get any cross-domain updates (meal progress sync)
                    setTimeout(() => {
                        get().fetchTodos();
                    }, 500); // Small delay to allow backend event processing
                } catch (error) {
                    // Revert optimistic update on failure
                    get().revertOptimisticUpdate(id, targetTodo);

                    const errorMessage = isApiError(error)
                        ? error.message
                        : "Failed to complete todo";

                    set({ error: errorMessage });
                    console.error("Failed to complete todo:", error);
                }
            },

            // Remove a todo
            removeTodo: async (id: string) => {
                const currentTodos = get().todos;
                const targetTodo = currentTodos.find((t) => t.id === id);

                if (!targetTodo) {
                    return; // Not found
                }

                // Optimistic removal
                const filteredTodos = currentTodos.filter((t) => t.id !== id);
                const newCounts = {
                    ...get().counts,
                    total: get().counts.total - 1,
                    ...(targetTodo.completed
                        ? { completed: get().counts.completed - 1 }
                        : { remaining: get().counts.remaining - 1 }),
                };

                set({ todos: filteredTodos, counts: newCounts });

                try {
                    await apiClient.deleteTodo(id);
                } catch (error) {
                    // Revert on failure - re-fetch is simplest
                    get().fetchTodos();

                    const errorMessage = isApiError(error)
                        ? error.message
                        : "Failed to remove todo";

                    set({ error: errorMessage });
                    console.error("Failed to remove todo:", error);
                }
            },
        }),
        {
            name: "landing-store", // For devtools
        }
    )
);
