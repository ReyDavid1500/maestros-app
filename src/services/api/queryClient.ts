import { QueryClient } from "@tanstack/react-query";
import { isAppApiError, isRateLimitError } from "./interceptors";

/**
 * Instancia global de QueryClient para TanStack Query.
 * Política de reintentos conservadora: nunca reintenta 4xx ni rate limits.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // No reintentar errores del cliente (4xx)
        if (isAppApiError(error) && error.status >= 400 && error.status < 500) {
          return false;
        }
        // No reintentar rate limit
        if (isRateLimitError(error)) return false;
        // Máximo 2 reintentos para errores de red o 5xx
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000), // 1s, 2s, 4s... máx 10s
      staleTime: 1000 * 60 * 2, // 2 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos en cache
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0, // Las mutations NUNCA se reintentan automáticamente
    },
  },
});
