import { useAuth } from "@clerk/nextjs";
import { useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api/client";

/**
 * Custom hook that automatically sets the Clerk auth token in the API client
 * This ensures all API calls are authenticated when used in client components
 * Includes automatic token refresh to prevent expiration issues
 */
export function useClerkApi() {
    const { getToken, isLoaded, userId } = useAuth();
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const updateToken = useCallback(async () => {
        if (!isLoaded || !userId) {
            apiClient.setToken(null);
            return;
        }

        try {
            // Always get a fresh token to avoid expiration issues
            const token = await getToken({ skipCache: true });
            apiClient.setToken(token);
            console.log("Token refreshed successfully");
        } catch (error) {
            console.error("Failed to get Clerk token:", error);
            apiClient.setToken(null);
        }
    }, [getToken, isLoaded, userId]);

    useEffect(() => {
        if (isLoaded) {
            // Initial token setup
            updateToken();

            // Register token refresh callback with API client for automatic 401 handling
            apiClient.setTokenRefreshCallback(updateToken);

            // Set up automatic token refresh every 4 minutes (240 seconds)
            // This ensures we always have a fresh token before the typical 5-minute expiration
            refreshIntervalRef.current = setInterval(
                () => {
                    updateToken();
                },
                4 * 60 * 1000
            );

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
                // Clean up the refresh callback
                apiClient.setTokenRefreshCallback(null);
            };
        }
    }, [updateToken, isLoaded]);

    // Manual token refresh function
    const refreshToken = useCallback(async () => {
        await updateToken();
    }, [updateToken]);

    return {
        isAuthenticated: !!userId,
        isLoaded,
        userId,
        refreshToken, // Expose manual refresh function
    };
}
