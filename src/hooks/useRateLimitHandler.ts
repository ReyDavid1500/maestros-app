/**
 * Hook para manejar errores 429 (Rate Limit) en la UI.
 * Muestra un countdown al usuario y deshabilita el botón hasta poder reintentar.
 *
 * Uso:
 * ```tsx
 * const { isRateLimited, countdown, handleError } = useRateLimitHandler();
 *
 * <Button
 *   onPress={handleSubmit}
 *   disabled={isRateLimited}
 *   label={isRateLimited ? `Intenta en ${countdown}s` : 'Enviar'}
 * />
 * ```
 */

import { useState, useRef, useCallback } from "react";
import { isRateLimitError } from "@services/api/interceptors";

interface RateLimitState {
  /** true mientras el countdown está activo */
  isRateLimited: boolean;
  /** segundos restantes hasta poder reintentar */
  countdown: number;
  /** Llamar en el onError de una mutation para activar el countdown */
  handleError: (error: unknown) => void;
}

export function useRateLimitHandler(): RateLimitState {
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((seconds: number) => {
    // Limpiar cualquier countdown anterior
    if (intervalRef.current) clearInterval(intervalRef.current);

    setRetryAfterSeconds(seconds);
    setCountdown(seconds);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setRetryAfterSeconds(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      if (isRateLimitError(error)) {
        const seconds = error.retryAfterSeconds ?? 60;
        startCountdown(seconds);
      }
    },
    [startCountdown]
  );

  return {
    isRateLimited: retryAfterSeconds !== null,
    countdown,
    handleError,
  };
}
