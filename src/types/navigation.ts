/**
 * Parámetros de rutas dinámicas de Expo Router.
 * Expo Router genera los tipos de rutas automáticamente (typedRoutes: true),
 * pero estos tipos documentan los parámetros esperados en cada ruta.
 *
 * ── REGLA DE SEGURIDAD ──────────────────────────────────────────────────────
 * Los parámetros de URL son visibles y se almacenan en el historial del SO.
 * SOLO pasar identificadores simples (UUID) en la URL.
 * Los datos completos se cargan desde el store o la API.
 *
 * ✗ INCORRECTO: /(client)/request/confirm?description=...&token=...
 * ✓ CORRECTO:   /(client)/request/confirm  (datos en pendingRequestStore)
 *
 * ✗ INCORRECTO: /(client)/maestro/[id]?token=...
 * ✓ CORRECTO:   /(client)/maestro/[id]     (token en authStore)
 * ────────────────────────────────────────────────────────────────────────────
 */

/** app/(client)/maestro/[id].tsx y app/(maestro)/... */
export interface MaestroDetailParams {
  id: string; // MaestroProfile ID
}

/** app/(client)/request/[id].tsx y app/(maestro)/request/[id].tsx */
export interface RequestDetailParams {
  id: string; // ServiceRequest ID
}

/** app/(client)/chat/[roomId].tsx y app/(maestro)/chat/[roomId].tsx */
export interface ChatRoomParams {
  roomId: string;
}

/** app/modal/rating.tsx */
export interface RatingModalParams {
  serviceRequestId: string;
  maestroName: string;
}
