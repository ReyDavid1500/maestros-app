# Fase 05 — Zustand Stores

## Objetivo

Implementar los cuatro stores de Zustand: autenticación, tema, solicitud pendiente, y chat. Estos stores son el sistema nervioso de la app y coordinar la mayor parte del estado global.

---

## Paso 1 — authStore

Crear `src/stores/authStore.ts`.

**Estado:**
- `user: User | null` — usuario autenticado
- `token: string | null` — access token actual
- `isLoading: boolean` — si hay una operación de auth en curso
- `isHydrated: boolean` — si el store ya cargó los datos desde SecureStore (importante para el splash screen)

**Acciones:**

### `hydrateFromStorage()`
Llamar al inicio de la app (en `app/_layout.tsx` con `useEffect`):
1. Setear `isHydrated = false`
2. Leer `access_token` de `SecureStore.getItemAsync('access_token')`
3. Leer `user_data` de `SecureStore.getItemAsync('user_data')`
4. Si ambos existen:
   - Parsear `user_data` como `User`
   - Setear `token` y `user` en el store
5. Setear `isHydrated = true`

**Por qué SecureStore en lugar de zustand/persist:** SecureStore usa Keychain (iOS) y Keystore (Android) que son almacenamientos cifrados del sistema operativo. Es significativamente más seguro que AsyncStorage para tokens. El middleware `persist` de Zustand usa AsyncStorage por defecto, que no es cifrado.

### `setToken(token: string)` y `setUser(user: User)`
Setean el estado y persisten en SecureStore:
- `SecureStore.setItemAsync('access_token', token)`
- `SecureStore.setItemAsync('user_data', JSON.stringify(user))`

### `signInWithGoogle()`
Esta acción orquesta el flujo OAuth (ver Fase 08 para detalles):
1. Setear `isLoading = true`
2. Obtener el `idToken` de Google OAuth
3. Llamar a `authApi.loginWithGoogle(idToken)`
4. Si exitoso: guardar `accessToken`, `refreshToken`, y `user` en SecureStore
5. Setear `token` y `user` en el store
6. Setear `isLoading = false`

### `signOut()`
1. Intentar llamar a `authApi.logout()` (ignorar errores de red)
2. Eliminar todos los datos de SecureStore:
   - `SecureStore.deleteItemAsync('access_token')`
   - `SecureStore.deleteItemAsync('refresh_token')`
   - `SecureStore.deleteItemAsync('user_data')`
3. Limpiar el QueryClient: `queryClient.clear()`
4. Desconectar el WebSocket: `chatStore.getState().disconnect()`
5. Setear `user = null`, `token = null` en el store
6. Navegar a `/(auth)/welcome` con `router.replace('/(auth)/welcome')`

---

## Paso 2 — themeStore

Crear `src/stores/themeStore.ts`.

**Estado:**
- `colorScheme: ColorScheme` — `'light'` | `'dark'` | `'system'`
- `resolvedTheme: 'light' | 'dark'` — el valor real después de resolver `'system'`

**Persistencia:** Usar `zustand/middleware` `persist` con `AsyncStorage` como storage (el tema no es un secret, no necesita SecureStore):

```typescript
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useThemeStore = create(
  persist(
    (set, get) => ({
      colorScheme: 'system',
      resolvedTheme: 'light',
      // acciones...
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Acción `setColorScheme(scheme: ColorScheme)`:**
1. Setear `colorScheme = scheme`
2. Si `scheme === 'system'`: usar `Appearance.getColorScheme()` de React Native para resolver
3. Si `scheme === 'light'` o `'dark'`: usar ese valor directamente
4. Setear `resolvedTheme` con el valor resuelto

**Suscripción a cambios del sistema:** En `app/_layout.tsx`, usar `Appearance.addChangeListener` para actualizar `resolvedTheme` cuando el usuario cambie el tema del sistema (solo aplica si `colorScheme === 'system'`).

---

## Paso 3 — pendingRequestStore

Crear `src/stores/pendingRequestStore.ts`.

Este store persiste los datos del formulario de solicitud durante el flujo OAuth. El proceso de login con Google en iOS/Android puede recargar la app (comportamiento nativo), lo que perdería el estado en memoria.

**Persistencia:** Usar `zustand/middleware` `persist` con `AsyncStorage`.

**Estado inicial:**
```typescript
{
  maestroId: null,
  maestroName: null,
  categoryId: null,
  categoryName: null,
  description: '',
  addressStreet: '',
  addressNumber: '',
  addressCity: '',
  addressInstructions: '',
  scheduledAt: null,
  termsAccepted: false,
}
```

**Acciones:**

### `set(data: Partial<PendingRequest>)`
Actualiza solo los campos provistos (merge parcial, no reemplaza todo el estado):
```typescript
set: (data) => set((state) => ({ ...state, ...data }))
```

### `clear()`
Resetea todo el estado a los valores iniciales. Llamar después de crear la solicitud exitosamente.

### `hasData()`
Retorna `true` si hay suficientes datos para crear la solicitud:
```typescript
hasData: () => {
  const { maestroId, categoryId, description, addressStreet, addressNumber, addressCity, scheduledAt } = get();
  return !!(maestroId && categoryId && description && addressStreet && addressNumber && addressCity && scheduledAt);
}
```

---

## Paso 4 — chatStore

Crear `src/stores/chatStore.ts`.

**Estado:**
- `activeRoomId: string | null` — room actualmente abierto
- `isConnected: boolean` — si el cliente STOMP está conectado
- `client: Client | null` — instancia del cliente STOMP (privado, no necesita estar en el estado pero sí accesible desde las acciones)

**Nota:** La instancia del cliente STOMP se puede guardar como variable en el módulo (fuera del store) ya que no necesita ser reactiva, solo las acciones de `chatStore` la usan.

**Acción `connect(token: string)`:**
1. Si ya está conectado: no hacer nada
2. Importar la función `createStompClient` de `src/services/websocket/stompClient.ts` (Fase 11)
3. Crear el cliente STOMP con el token
4. Configurar `onConnect`: setear `isConnected = true`
5. Configurar `onDisconnect`: setear `isConnected = false`
6. Configurar `onStompError`: loggear el error, intentar reconexión automática después de 5 segundos
7. Activar el cliente: `client.activate()`

**Acción `disconnect()`:**
1. Si hay un cliente activo: `client.deactivate()`
2. Setear `isConnected = false`

**Acción `sendMessage(roomId: string, content: string)`:**
1. Si no está conectado: loggear error y retornar
2. Publicar al destino `/app/chat.send`: `client.publish({ destination: '/app/chat.send', body: JSON.stringify({ roomId, content }) })`

**Acción `sendTypingIndicator(roomId: string)`:**
1. Publicar al destino `/app/chat.typing`: `client.publish({ destination: '/app/chat.typing', body: JSON.stringify({ roomId }) })`

**Acción `setActiveRoom(roomId: string | null)`:**
Simplemente setear `activeRoomId`.

---

## Paso 5 — Inicialización de los stores en el root layout

En `app/_layout.tsx`, agregar el código de inicialización:

```typescript
useEffect(() => {
  // 1. Hidratar el authStore desde SecureStore
  authStore.hydrateFromStorage().then(() => {
    const { user, token } = authStore.getState();

    // 2. Si hay usuario autenticado, conectar el WebSocket
    if (token) {
      chatStore.getState().connect(token);
    }
  });
}, []);
```

**Mantener el splash screen** hasta que `isHydrated === true` para evitar el flash de la pantalla de bienvenida cuando en realidad el usuario ya está logueado.

---

## Paso 6 — Hook useAuth

Crear `src/hooks/useAuth.ts` como wrapper conveniente sobre `authStore`:

```typescript
export const useAuth = () => {
  const { user, token, isLoading, isHydrated, signOut, signInWithGoogle } = useAuthStore();

  return {
    user,
    token,
    isLoading,
    isHydrated,
    isAuthenticated: !!user && !!token,
    isClient: user?.role === 'CLIENT',
    isMaestro: user?.role === 'MAESTRO',
    signOut,
    signInWithGoogle,
  };
};
```

---

## Paso 7 — Actualizar la pantalla index.tsx con la lógica de redirección

En `app/index.tsx`, usar el `authStore` para redirigir al usuario:

```typescript
const App = () => {
  const { isAuthenticated, isHydrated, user } = useAuth();

  // Esperar a que el store se hidrate
  if (!isHydrated) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user?.role === 'MAESTRO') {
    return <Redirect href="/(maestro)" />;
  }

  return <Redirect href="/(client)" />;
};
```

---

## Paso 8 — Verificación final de la fase

- [ ] El store se hidrata correctamente al inicio (usuario logueado persiste entre reloads)
- [ ] `signOut()` limpia todo y navega a la bienvenida
- [ ] El tema persiste entre reinicios de la app
- [ ] El `pendingRequestStore` persiste durante una recarga de la app (verificar con `console.log` en el componente de confirmación)
- [ ] `useAuth()` retorna los flags `isAuthenticated`, `isClient`, `isMaestro` correctamente

---

## Archivos creados en esta fase

- `src/stores/authStore.ts`
- `src/stores/themeStore.ts`
- `src/stores/pendingRequestStore.ts`
- `src/stores/chatStore.ts`
- `src/hooks/useAuth.ts`
- `app/_layout.tsx` (actualizado con inicialización)
- `app/index.tsx` (actualizado con redirección real)
