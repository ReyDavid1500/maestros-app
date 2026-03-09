# Fase 06 — Seguridad del Cliente

## Objetivo

Implementar las capas de seguridad del lado cliente: almacenamiento seguro de tokens, logger que no expone datos en producción, protección contra doble-tap en botones críticos, esquemas de validación Yup con los mismos límites del backend, y manejo del error 429.

---

## Paso 1 — Servicio de SecureStore

Crear `src/services/auth/secureStorage.ts` como wrapper sobre `expo-secure-store`.

**Propósito:** Centralizar el acceso a SecureStore para facilitar testing y manejo de errores.

**Funciones:**

### `saveTokens(accessToken: string, refreshToken: string): Promise<void>`
Guardar ambos tokens de forma atómica:
1. `await SecureStore.setItemAsync('access_token', accessToken)`
2. `await SecureStore.setItemAsync('refresh_token', refreshToken)`

Si cualquiera falla (SecureStore puede fallar en algunos emuladores/simuladores), capturar el error y loggear.

### `getAccessToken(): Promise<string | null>`
- `return SecureStore.getItemAsync('access_token')`

### `getRefreshToken(): Promise<string | null>`
- `return SecureStore.getItemAsync('refresh_token')`

### `saveUserData(user: User): Promise<void>`
- `await SecureStore.setItemAsync('user_data', JSON.stringify(user))`

### `getUserData(): Promise<User | null>`
1. `const raw = await SecureStore.getItemAsync('user_data')`
2. Si `raw` es null: retornar null
3. `return JSON.parse(raw) as User`

### `clearAll(): Promise<void>`
Eliminar todas las claves de SecureStore:
1. `await SecureStore.deleteItemAsync('access_token')`
2. `await SecureStore.deleteItemAsync('refresh_token')`
3. `await SecureStore.deleteItemAsync('user_data')`

---

## Paso 2 — Logger que es no-op en producción

Crear `src/utils/logger.ts`.

**Propósito:** En producción, todos los `console.log`, `console.warn`, `console.error` deben ser silenciados para no exponer datos sensibles en herramientas de debug del dispositivo.

**Implementación:**

```typescript
const isDev = __DEV__;  // Variable global de Expo/React Native, true en desarrollo

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log('[LOG]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) console.error('[ERROR]', ...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.log('[DEBUG]', ...args);
  },
};
```

**Reglas de uso:**
- Usar `logger` en lugar de `console` en todo el código de la app
- **Nunca** loggear: tokens JWT, refresh tokens, datos de direcciones completas, emails
- Se puede loggear: `userId`, acciones de navegación, errores de validación

---

## Paso 3 — Hook useThrottledAction

Crear `src/hooks/useThrottledAction.ts`.

**Propósito:** Prevenir que el usuario dispare una acción crítica dos veces al hacer doble-tap, o que spam-tapee botones que hacen requests.

**Interfaz:**
```typescript
function useThrottledAction<T>(
  fn: (...args: T[]) => void | Promise<void>,
  delayMs: number
): [throttledFn: (...args: T[]) => void, isThrottled: boolean]
```

**Implementación:**
1. Usar `useRef<boolean>` para rastrear si está en el período de throttle
2. Usar `useRef<NodeJS.Timeout>` para el timer
3. La función retornada:
   - Si `isThrottled.current === true`: retornar sin hacer nada
   - Si `isThrottled.current === false`:
     - Setear `isThrottled.current = true`
     - Ejecutar `fn(...args)`
     - Iniciar un timer con `setTimeout(() => { isThrottled.current = false }, delayMs)`
4. Retornar `[throttledFn, isThrottled.current]` donde el segundo valor puede usarse para deshabilitar el botón visualmente

**Limpiar el timer** en el cleanup del `useEffect` para evitar memory leaks.

**Delay recomendado por acción:**
- Botones de formulario (Contratar, Confirmar): 2000ms
- Botones de estado (Aceptar, Rechazar, Iniciar, Completar): 3000ms (acciones irreversibles)
- Enviar calificación: 2000ms
- Enviar mensaje de chat: 500ms (throttle de mensajes)

---

## Paso 4 — Manejo de 429 en la UI

Crear `src/hooks/useRateLimitHandler.ts`.

**Propósito:** Cuando una mutation o query retorna un error 429, mostrar un countdown al usuario y deshabilitar el botón hasta que pueda reintentar.

**Implementación:**
1. Estado `retryAfterSeconds: number | null` (null = no hay rate limit activo)
2. Estado `countdown: number` (segundos restantes)
3. Cuando se detecta un error 429 (verificar el tipo del error retornado por el interceptor):
   - Leer `retryAfterSeconds` del error
   - Iniciar un `setInterval` que decrementa `countdown` cada segundo
   - Cuando `countdown` llega a 0: limpiar el interval y setear `retryAfterSeconds = null`
4. Retornar `{ isRateLimited: retryAfterSeconds !== null, countdown, handleError }`

**En el componente:** Si `isRateLimited`:
- Deshabilitar el botón
- Mostrar texto: `"Intenta en {countdown}s"`

---

## Paso 5 — Esquemas Yup con los mismos límites del backend

Crear `src/utils/validationSchemas.ts`.

**Propósito:** Los mismos límites de tamaño que el backend para evitar requests innecesarios y como primera línea de defensa.

```typescript
import * as Yup from 'yup';

// Mensajes de error en español
const REQUIRED = 'Este campo es obligatorio';

export const createRequestSchema = Yup.object({
  description: Yup.string()
    .required(REQUIRED)
    .max(1000, 'La descripción no puede superar los 1000 caracteres'),
  addressStreet: Yup.string()
    .required(REQUIRED)
    .max(200, 'La dirección no puede superar los 200 caracteres'),
  addressNumber: Yup.string()
    .required(REQUIRED)
    .max(20, 'El número no puede superar los 20 caracteres'),
  addressCity: Yup.string()
    .required(REQUIRED)
    .max(100, 'La ciudad no puede superar los 100 caracteres'),
  addressInstructions: Yup.string()
    .max(500, 'Las instrucciones no pueden superar los 500 caracteres')
    .optional(),
  scheduledAt: Yup.date()
    .required(REQUIRED)
    .min(
      new Date(Date.now() + 2 * 60 * 60 * 1000),
      'El horario debe ser al menos 2 horas desde ahora'
    ),
});

export const updateProfileSchema = Yup.object({
  name: Yup.string()
    .required(REQUIRED)
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  phone: Yup.string()
    .max(20, 'El teléfono no puede superar los 20 caracteres')
    .optional(),
});

export const ratingSchema = Yup.object({
  score: Yup.number()
    .required(REQUIRED)
    .min(1, 'Selecciona al menos una estrella')
    .max(5),
  comment: Yup.string()
    .max(500, 'El comentario no puede superar los 500 caracteres')
    .optional(),
});

export const createMaestroProfileSchema = Yup.object({
  description: Yup.string()
    .required(REQUIRED)
    .max(1000, 'La descripción no puede superar los 1000 caracteres'),
  phone: Yup.string()
    .required(REQUIRED)
    .max(20, 'El teléfono no puede superar los 20 caracteres'),
});

export const messageSchema = Yup.object({
  content: Yup.string()
    .required()
    .max(4000, 'El mensaje es demasiado largo'),
});
```

---

## Paso 6 — Flujo OAuth seguro con PKCE

Crear `src/services/auth/googleAuthService.ts`.

**Propósito:** Implementar el flujo de autenticación con Google usando PKCE (Proof Key for Code Exchange), el estándar de seguridad para OAuth en aplicaciones móviles nativas.

**Implementación con expo-auth-session:**

1. Configurar el endpoint de Google:
   ```typescript
   const discovery = {
     authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
     tokenEndpoint: 'https://oauth2.googleapis.com/token',
   };
   ```

2. Configurar el request OAuth con PKCE:
   - `usePKCE: true` — activa PKCE automáticamente en expo-auth-session
   - `responseType: ResponseType.IdToken` — pedir el `id_token` directamente
   - `scopes: ['openid', 'email', 'profile']`
   - `clientId`: el Client ID de Google (de `EXPO_PUBLIC_GOOGLE_CLIENT_ID`)

3. Verificar el `state` del callback: expo-auth-session maneja esto automáticamente, verificar que `result.type === 'success'` y que `result.params.state` coincide.

4. Extraer el `id_token` del resultado: `result.params.id_token`

5. Enviar solo el `id_token` al backend propio (`POST /auth/google`). **Nunca** usar el token para llamar directamente a APIs de Google desde el cliente.

**Función `signInWithGoogle(): Promise<string>`:**
- Retorna el `id_token` para que `authStore.signInWithGoogle()` lo use
- Lanzar error descriptivo si el usuario cancela o hay un error

---

## Paso 7 — Sanitización de contenido de mensajes

En `src/components/chat/MessageBubble.tsx` (Fase 11), cuando se renderiza el contenido de un mensaje:

- Renderizar siempre como texto plano (`<Text>` de React Native)
- React Native no ejecuta HTML en `<Text>`, por lo que no hay riesgo de XSS directo
- Si en el futuro se usa un `WebView` para renderizar contenido rico, asegurarse de sanitizar el HTML antes

Documentar esta consideración en el componente.

---

## Paso 8 — No incluir datos sensibles en URLs de navegación

**Convención:** Los parámetros de URL de Expo Router son visibles y se almacenan en el historial de navegación. Solo pasar identificadores simples (UUID) en la URL. Los datos completos se cargan desde el store o la API.

**Incorrecto:** `/(client)/request/confirm?description=...&address=...&token=...`
**Correcto:** `/(client)/request/confirm` — los datos están en `pendingRequestStore`

**Incorrecto:** `/(client)/maestro/[id]?token=...`
**Correcto:** `/(client)/maestro/[id]` — el token está en `authStore`

Documentar esta regla en el archivo `src/types/navigation.ts`.

---

## Paso 9 — Verificación final de la fase

- [ ] En producción (`__DEV__ === false`), `logger.log()` no produce output (verificar desactivando el modo desarrollo)
- [ ] Los tokens NO aparecen en ningún `console.log` del código
- [ ] Al hacer doble-tap rápido en "Contratar", el `useThrottledAction` bloquea el segundo tap
- [ ] La validación Yup en el formulario de solicitud bloquea `description` > 1000 chars antes de enviar al servidor
- [ ] Al recibir un 429 simulado, el botón muestra el countdown y se vuelve a habilitar después

---

## Archivos creados en esta fase

- `src/services/auth/secureStorage.ts`
- `src/utils/logger.ts`
- `src/hooks/useThrottledAction.ts`
- `src/hooks/useRateLimitHandler.ts`
- `src/utils/validationSchemas.ts`
- `src/services/auth/googleAuthService.ts`
