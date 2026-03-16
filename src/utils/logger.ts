/**
 * Logger seguro para producción.
 * En producción (__DEV__ === false) todos los métodos son no-op,
 * evitando exponer datos sensibles en herramientas de debug del dispositivo.
 *
 * Reglas de uso:
 * - Usar `logger` en lugar de `console` en TODA la app
 * - NUNCA loggear: tokens JWT, refresh tokens, contraseñas, datos de tarjetas
 * - SE PUEDE loggear: userId, nombres de acciones, errores de validación
 */

const isDev = __DEV__;

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev) console.log("[LOG]", ...args);
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn("[WARN]", ...args);
  },
  error: (...args: unknown[]): void => {
    if (isDev) console.error("[ERROR]", ...args);
  },
  debug: (...args: unknown[]): void => {
    if (isDev) console.log("[DEBUG]", ...args);
  },
};
