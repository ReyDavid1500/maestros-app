/**
 * Previene que el usuario dispare una acción crítica más de una vez por período.
 * Útil para botones de formulario, acciones de estado y envío de mensajes.
 *
 * Delays recomendados:
 * - Botones de formulario (Contratar, Confirmar): 2000ms
 * - Acciones de estado irreversibles (Aceptar, Rechazar, Completar): 3000ms
 * - Enviar calificación: 2000ms
 * - Enviar mensaje de chat: 500ms
 *
 * @returns [throttledFn, isThrottled] — isThrottled puede usarse para deshabilitar el botón
 */

import { useRef, useCallback, useEffect, useState } from "react";

export function useThrottledAction<T extends unknown[]>(
  fn: (...args: T) => void | Promise<void>,
  delayMs: number
): [throttledFn: (...args: T) => void, isThrottled: boolean] {
  const isThrottledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isThrottled, setIsThrottled] = useState(false);

  // Limpiar timer al desmontar para evitar memory leaks
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const throttledFn = useCallback(
    (...args: T) => {
      if (isThrottledRef.current) return;

      isThrottledRef.current = true;
      setIsThrottled(true);

      void fn(...args);

      timerRef.current = setTimeout(() => {
        isThrottledRef.current = false;
        setIsThrottled(false);
      }, delayMs);
    },
    [fn, delayMs]
  );

  return [throttledFn, isThrottled];
}
