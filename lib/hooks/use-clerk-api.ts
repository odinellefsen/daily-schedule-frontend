import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { apiClient } from "@/lib/api/client";

/**
 * Custom hook that automatically sets the Clerk auth token in the API client
 * This ensures all API calls are authenticated when used in client components
 */
export function useClerkApi() {
    const { getToken, isLoaded, userId } = useAuth();

    useEffect(() => {
        if (isLoaded) {
            const updateToken = async () => {
                try {
                    const token = await getToken();
                    apiClient.setToken(token);
                } catch (error) {
                    console.error("Failed to get Clerk token:", error);
                    apiClient.setToken(null);
                }
            };

            updateToken();
        }
    }, [getToken, isLoaded, userId]);

    return {
        isAuthenticated: !!userId,
        isLoaded,
        userId,
    };
}
