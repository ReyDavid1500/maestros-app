# Fase 04 — Capa de Datos (Axios + TanStack Query)

## Objetivo

Configurar el cliente HTTP Axios con interceptores de autenticación y manejo de errores, el QueryClient de TanStack Query con política de reintentos conservadora, el modo mock para desarrollo sin backend, y todos los hooks de query para cada dominio.

---

## Paso 1 — Instancia base de Axios

Crear `src/services/api/axiosInstance.ts`.

**Configuración:**
- `baseURL`: `process.env.EXPO_PUBLIC_API_URL`
- `timeout`: 15000ms (15 segundos)
- Headers por defecto: `Content-Type: application/json`

---

## Paso 2 — Interceptores de Axios

Crear `src/services/api/interceptors.ts` con las funciones de interceptor. Registrarlos en `axiosInstance.ts`.

### Interceptor de request

Propósito: Agregar el token JWT a cada request.

Lógica:
1. Llamar a `SecureStore.getItemAsync('access_token')` para obtener el token almacenado
2. Si existe: agregar `Authorization: Bearer {token}` al header del request
3. Si no existe: dejar el request sin header de autorización (para endpoints públicos)
4. Retornar la configuración modificada

**Nota:** Este interceptor es asíncrono. Asegurarse de que Axios acepta promesas en los interceptores de request.

### Interceptor de response — manejo de 401

Propósito: Renovar el token automáticamente cuando expira.

Lógica al recibir un error 401:
1. Verificar que no es el endpoint `/auth/refresh` o `/auth/google` (evitar loop infinito)
2. Intentar obtener el refresh token: `SecureStore.getItemAsync('refresh_token')`
3. Si no hay refresh token: limpiar la sesión y navegar a `/(auth)/welcome` (llamar a `authStore.signOut()`)
4. Si hay refresh token: hacer `POST /auth/refresh` con el refresh token
5. Si el refresh es exitoso: guardar los nuevos tokens y reintentar el request original
6. Si el refresh falla (token inválido/expirado): llamar a `authStore.signOut()` y navegar a la pantalla de bienvenida

**Para evitar múltiples refreshes simultáneos:** Usar una bandera `isRefreshing` y una cola de requests pendientes. Si ya hay un refresh en curso, encolar los requests y ejecutarlos todos cuando el refresh termine.

### Interceptor de response — manejo de 429

Propósito: Detectar el rate limit y NO reintentar automáticamente.

Lógica al recibir un error 429:
1. Leer el header `Retry-After` de la respuesta
2. Crear un error tipado `RateLimitError` que incluya el `retryAfterSeconds`
3. Rechazar la promesa con este error tipado

El componente/hook que recibe este error lo mostrará con el countdown visual.

### Interceptor de response — manejo genérico de errores

Para todos los demás errores:
1. Si el servidor retornó un body JSON con `{ success: false, message: "..." }`: usar ese `message` como el error
2. Si no hay body (error de red, timeout): usar un mensaje genérico `"Error de conexión. Verifica tu internet."`
3. Crear un objeto de error con `{ message, status, isNetworkError }` para que los componentes puedan distinguir el tipo

---

## Paso 3 — QueryClient

Crear `src/services/api/queryClient.ts`.

Configurar el `QueryClient` con la política de reintentos conservadora:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // No reintentar errores del cliente (4xx)
        if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
        // No reintentar rate limit
        if (isRateLimitError(error)) return false;
        // Máximo 2 reintentos para errores de red o 5xx
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // 1s, 2s, 4s... máx 10s
      staleTime: 1000 * 60 * 2,    // 2 minutos (datos frescos)
      gcTime: 1000 * 60 * 10,      // 10 minutos en cache
    },
    mutations: {
      retry: 0, // Las mutations NUNCA se reintentan automáticamente
    },
  },
});
```

---

## Paso 4 — Query Keys

Crear `src/constants/queryKeys.ts`:

```typescript
export const queryKeys = {
  categories: {
    all: ['categories'] as const,
  },
  maestros: {
    all: ['maestros'] as const,
    list: (filters: Record<string, unknown>) => ['maestros', 'list', filters] as const,
    detail: (id: string) => ['maestros', id] as const,
  },
  serviceRequests: {
    all: ['service-requests'] as const,
    list: (filters?: Record<string, unknown>) => ['service-requests', 'list', filters] as const,
    detail: (id: string) => ['service-requests', id] as const,
  },
  chat: {
    rooms: ['chat', 'rooms'] as const,
    messages: (roomId: string) => ['chat', 'messages', roomId] as const,
  },
  ratings: {
    maestro: (maestroId: string) => ['ratings', 'maestro', maestroId] as const,
  },
  me: ['me'] as const,
} as const;
```

---

## Paso 5 — Funciones de API (api functions)

Crear funciones puras de Axios por dominio, que luego se usan en los hooks:

**`src/services/api/authApi.ts`:**
- `loginWithGoogle(idToken: string): Promise<AuthResponse>`
- `refreshToken(refreshToken: string): Promise<AuthResponse>`
- `logout(): Promise<void>`

**`src/services/api/usersApi.ts`:**
- `getMe(): Promise<User>`
- `updateMe(data: Partial<UpdateProfileFormValues>): Promise<User>`
- `updateFcmToken(fcmToken: string): Promise<void>`
- `deleteMe(): Promise<void>`

**`src/services/api/maestrosApi.ts`:**
- `getCategories(): Promise<ServiceCategory[]>`
- `getMaestros(filters: MaestroFilters, page: number, size: number): Promise<PaginatedResponse<MaestroListItem>>`
- `searchMaestros(query: string, categoryId?: string, page: number, size: number): Promise<PaginatedResponse<MaestroListItem>>`
- `getMaestro(id: string): Promise<MaestroProfile>`
- `createMyProfile(data: CreateMaestroProfileFormValues): Promise<MaestroProfile>`
- `updateMyProfile(data: Partial<UpdateProfileFormValues>): Promise<MaestroProfile>`
- `updateMyServices(services: MaestroServiceInput[]): Promise<MaestroProfile>`

**`src/services/api/serviceRequestsApi.ts`:**
- `createServiceRequest(data: CreateRequestFormValues & { maestroId: string; categoryId: string }): Promise<ServiceRequest>`
- `getMyServiceRequests(page: number, size: number): Promise<PaginatedResponse<ServiceRequest>>`
- `getServiceRequest(id: string): Promise<ServiceRequest>`
- `acceptRequest(id: string): Promise<ServiceRequest>`
- `rejectRequest(id: string): Promise<ServiceRequest>`
- `startWork(id: string): Promise<ServiceRequest>`
- `completeWork(id: string): Promise<ServiceRequest>`
- `cancelRequest(id: string): Promise<ServiceRequest>`

**`src/services/api/chatApi.ts`:**
- `getChatRooms(): Promise<ChatRoom[]>`
- `getChatMessages(roomId: string, page: number, size: number): Promise<PaginatedResponse<ChatMessage>>`
- `markAsRead(roomId: string): Promise<void>`

**`src/services/api/ratingsApi.ts`:**
- `createRating(data: { serviceRequestId: string; score: number; comment?: string }): Promise<Rating>`
- `getMaestroRatings(maestroId: string, page: number, size: number): Promise<RatingsPage>`

---

## Paso 6 — Mock Adapter

Crear `src/mocks/mockAdapter.ts`.

Si `process.env.EXPO_PUBLIC_USE_MOCK === 'true'`:
1. Importar `axios-mock-adapter`
2. Crear `new MockAdapter(axiosInstance, { delayResponse: 800 })` — 800ms de delay para simular latencia
3. Registrar los handlers de cada endpoint con los datos mock del archivo `src/mocks/data.ts` (Fase 07)

**Estructura de los handlers mock:**
- `mock.onGet('/categories').reply(200, { success: true, data: mockCategories })`
- `mock.onGet(/\/maestros\/[^/]+/).reply(...)` — para rutas con ID dinámico
- etc.

Si `EXPO_PUBLIC_USE_MOCK === 'false'`: No crear el adapter (el axiosInstance hace requests reales al backend).

**Activar el mock adapter al inicializar la app:**
En `app/_layout.tsx`, importar y ejecutar `setupMockAdapter()` antes de cualquier request.

---

## Paso 7 — Hooks de TanStack Query

Crear los hooks por dominio en `src/queries/`:

### `src/queries/useMaestros.ts`

**`useCategories()`:**
- `useQuery({ queryKey: queryKeys.categories.all, queryFn: getCategories })`
- Sin staleTime (las categorías casi no cambian, usar el default)

**`useMaestros(filters)`:**
- `useInfiniteQuery` para el scroll infinito
- `queryFn` recibe `pageParam` (default: 0) y llama a `getMaestros(filters, pageParam, 10)`
- `getNextPageParam`: retornar `page + 1` si `!data.last`, else `undefined`

**`useMaestro(id)`:**
- `useQuery` simple con `queryKey: queryKeys.maestros.detail(id)`
- Solo activo si `id` es no-nulo: `enabled: !!id`

### `src/queries/useServiceRequests.ts`

**`useMyServiceRequests()`:**
- `useInfiniteQuery` con paginación

**`useServiceRequest(id)`:**
- `useQuery` simple

**`useCreateServiceRequest()`:**
- `useMutation` con `onSuccess` que:
  1. Invalida el query `serviceRequests.all`
  2. Navega al detalle de la solicitud creada

**`useUpdateRequestStatus()`:**
- `useMutation` genérica que acepta `{ id, action }` donde action es `accept/reject/start/complete/cancel`
- `onSuccess`: invalida el query de la solicitud específica y el listado

### `src/queries/useChat.ts`

**`useChatRooms()`:**
- `useQuery` con `refetchInterval: 30000` (poll cada 30s como fallback si el WebSocket se desconecta)

**`useChatMessages(roomId)`:**
- `useInfiniteQuery` para scroll hacia arriba (mensajes más antiguos)
- `getNextPageParam`: retorna `page + 1` si no es la última página

**`useMarkAsRead()`:**
- `useMutation` con `onSuccess` que invalida `chat.rooms` (actualiza el contador de no leídos)

### `src/queries/useRatings.ts`

**`useMaestroRatings(maestroId)`:**
- `useInfiniteQuery`

**`useCreateRating()`:**
- `useMutation` con `onSuccess` que invalida el detalle del maestro y las solicitudes

---

## Paso 8 — Provider de TanStack Query

En `app/_layout.tsx`, envolver la app con `QueryClientProvider`:

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@services/api/queryClient';

<QueryClientProvider client={queryClient}>
  <Stack />
</QueryClientProvider>
```

---

## Paso 9 — Verificación final de la fase

Con `EXPO_PUBLIC_USE_MOCK=true`:

- [ ] `useCategories()` retorna las 10 categorías mock después de 800ms
- [ ] `useMaestros({})` retorna la lista de maestros paginada
- [ ] `useMaestro('mock-id')` retorna el detalle de un maestro
- [ ] `useCreateServiceRequest()` crea una solicitud y navega (verificar en logs)
- [ ] Los errores de red se muestran con el formato correcto
- [ ] El retry exponencial funciona: simular un error 500 en el mock y verificar los 2 reintentos

---

## Archivos creados en esta fase

- `src/services/api/axiosInstance.ts`
- `src/services/api/interceptors.ts`
- `src/services/api/queryClient.ts`
- `src/services/api/authApi.ts`
- `src/services/api/usersApi.ts`
- `src/services/api/maestrosApi.ts`
- `src/services/api/serviceRequestsApi.ts`
- `src/services/api/chatApi.ts`
- `src/services/api/ratingsApi.ts`
- `src/mocks/mockAdapter.ts`
- `src/constants/queryKeys.ts`
- `src/queries/useMaestros.ts`
- `src/queries/useServiceRequests.ts`
- `src/queries/useChat.ts`
- `src/queries/useRatings.ts`
