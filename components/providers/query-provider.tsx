'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes
            staleTime: 1000 * 60 * 5,
            // Refetch on window focus for landing page freshness
            refetchOnWindowFocus: true,
            // Retry on failure (good for network hiccups)
            retry: (failureCount, error) => {
              // Don't retry on auth errors or client errors
              if (error instanceof Error && 'status' in error) {
                const status = (error as unknown as { status: number }).status
                if (status >= 400 && status < 500) {
                  return false
                }
              }
              // Retry up to 3 times for other errors
              return failureCount < 3
            },
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Show error notifications for failed mutations
            onError: (error) => {
              console.error('Mutation error:', error)
              // This will be connected to toast notifications in Phase 6
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
} 