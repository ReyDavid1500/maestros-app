# Fase 08 — Autenticación Google

## Objetivo

Implementar el flujo completo de autenticación con Google OAuth usando expo-auth-session con PKCE, la pantalla de bienvenida, y la integración con el authStore. Al finalizar, un usuario puede iniciar sesión con Google y la app navega al área correcta según su rol.

---

## Paso 1 — Configurar Google OAuth en Google Cloud Console

**Pasos en Google Cloud Console** (documentar en el README del proyecto):

1. Crear un proyecto o usar uno existente
2. Habilitar la API de Google Identity
3. Crear credenciales OAuth 2.0:
   - Tipo: Aplicación iOS (para iOS)
   - Bundle ID: el bundle ID del app (`com.maestros.app`)
   - Anotar el `Client ID` generado
4. Crear credenciales OAuth 2.0:
   - Tipo: Aplicación Android (para Android)
   - Package name: el package name del app
   - SHA-1 de la firma de debug (obtener con `keytool`)
   - Anotar el `Client ID` de Android
5. Crear credenciales OAuth 2.0:
   - Tipo: Aplicación web (para el flujo de Expo Go en desarrollo)
   - Authorized redirect URIs: agregar el redirect URI de Expo: `https://auth.expo.io/@{username}/{slug}`
   - Anotar el `Client ID` web

Guardar todos los Client IDs en el `.env`.

---

## Paso 2 — Configurar app.config.ts para OAuth

En `app.config.ts`, agregar la configuración necesaria para expo-auth-session:

```typescript
ios: {
  bundleIdentifier: 'com.maestros.app',
  googleServicesFile: './GoogleService-Info.plist', // para FCM también
},
android: {
  package: 'com.maestros.app',
  googleServicesFile: './google-services.json', // para FCM también
},
plugins: [
  'expo-router',
  [
    'expo-auth-session',
    {
      // Scheme para manejar el redirect OAuth
    }
  ],
],
scheme: 'maestros', // Para el deep link del callback OAuth
```

---

## Paso 3 — Actualizar googleAuthService.ts

Completar `src/services/auth/googleAuthService.ts` con la implementación real:

**Función `signInWithGoogle(): Promise<string>`:**

```typescript
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

// En el componente que llama a signInWithGoogle:
const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  scopes: ['openid', 'email', 'profile'],
});
```

**Notas importantes:**
- `expo-auth-session` con `Google.useAuthRequest` maneja PKCE automáticamente
- El hook `useAuthRequest` debe llamarse en el componente (es un hook), no en un servicio
- El `idToken` está disponible en `response.params.id_token` cuando `response.type === 'success'`
- En modo mock (`EXPO_PUBLIC_USE_MOCK=true`): retornar un `idToken` falso directamente sin llamar al OAuth real

---

## Paso 4 — Actualizar authStore.signInWithGoogle()

Actualizar `src/stores/authStore.ts` para integrar con el hook de Google:

La acción `signInWithGoogle()` recibe el `idToken` como parámetro (el componente lo obtiene del hook):

```typescript
signInWithGoogle: async (idToken: string) => {
  set({ isLoading: true });
  try {
    const response = await authApi.loginWithGoogle(idToken);
    await secureStorage.saveTokens(response.data.accessToken, response.data.refreshToken);
    await secureStorage.saveUserData(response.data.user);
    set({ user: response.data.user, token: response.data.accessToken });
    // Si es nuevo usuario MAESTRO, navegar al onboarding
    // Si es nuevo usuario CLIENT o usuario existente, ya lo maneja el index.tsx
  } catch (error) {
    logger.error('Error en signInWithGoogle:', error);
    throw error; // Propagar para que el componente pueda mostrar el error
  } finally {
    set({ isLoading: false });
  }
}
```

---

## Paso 5 — Pantalla de bienvenida (auth)/welcome.tsx

Crear `app/(auth)/welcome.tsx`. Esta es la única pantalla que los usuarios ven antes de autenticarse.

**Layout:**
- Fondo del color de la app (naranja o blanco)
- Logo/ícono de la app (centrado en la parte superior)
- Tagline: "Encuentra el maestro que necesitas"
- Subtítulo: "Servicios del hogar en Chile"
- Botón grande: "Comenzar" → Navega al home del cliente `/(client)` (sin necesidad de login para explorar)
- Enlace pequeño: "¿Eres maestro? Únete aquí" → `/(maestro)` (requiere login)

**Nota importante:** Esta pantalla NO pide login. El usuario puede tocar "Comenzar" y navegar directamente al buscador. El login solo se pide en la pantalla de confirmación de solicitud.

---

## Paso 6 — Pantalla de confirmación con autenticación

En `app/(client)/request/confirm.tsx` (implementada en Fase 09), el botón "Continuar con Google" usa el flujo de auth:

**Lógica completa del flujo:**

1. El usuario llena el formulario de solicitud (pantalla anterior)
2. Los datos están guardados en `pendingRequestStore`
3. En `confirm.tsx`, el usuario toca "Continuar con Google"
4. Se ejecuta `promptAsync()` del hook de Google OAuth
5. Cuando el OAuth completa: `response.type === 'success'`
6. Extraer `id_token` del response
7. Llamar a `authStore.signInWithGoogle(idToken)` → obtiene JWT del backend
8. Inmediatamente después (en el `useEffect` que reacciona al cambio de `user`): leer el `pendingRequestStore` y hacer `createServiceRequest.mutate(...)`
9. Si la solicitud se crea exitosamente: llamar a `pendingRequestStore.clear()` y navegar al detalle

**Manejo de la recarga de app (iOS/Android):**

El proceso OAuth en dispositivos reales puede cerrar y reabrir la app. Al reabrir:
- El `pendingRequestStore` sigue en AsyncStorage (persistido)
- El `authStore` se hidrata desde SecureStore
- En `confirm.tsx`, detectar si ya está autenticado Y si hay `pendingRequestStore.hasData()`
- Si ambas condiciones: proceder automáticamente a crear la solicitud sin mostrar el botón de Google

---

## Paso 7 — Manejo del rol al hacer login

Después de un login exitoso, el `app/index.tsx` ya maneja la redirección según el rol.

**Caso especial — MAESTRO nuevo sin perfil:**
Si `user.role === 'MAESTRO'` y `user.hasMaestroProfile === false`:
- Navegar a un flujo de onboarding: `/(maestro)/profile/edit`
- Este flujo permite crear el perfil de maestro

---

## Paso 8 — Layout de (auth)

Crear `app/(auth)/_layout.tsx`:
- Stack sin header visible
- Si el usuario ya está autenticado al entrar a `(auth)`, redirigirlo al área correspondiente

---

## Paso 9 — Verificación final de la fase

**Con EXPO_PUBLIC_USE_MOCK=true:**
- [ ] Tocar "Comenzar" en welcome → navega a `/(client)` sin pedir login
- [ ] El botón "Continuar con Google" en la pantalla de confirmación retorna el mock JWT sin abrir Google OAuth
- [ ] Después del mock login, el usuario es redirigido correctamente
- [ ] `authStore.user` tiene el usuario correcto
- [ ] El token está guardado en SecureStore
- [ ] Recargar la app → el usuario sigue logueado (hidratación desde SecureStore)
- [ ] "Cerrar sesión" → navega a welcome y SecureStore está vacío

**Con EXPO_PUBLIC_USE_MOCK=false (requiere backend):**
- [ ] El flujo OAuth real de Google abre la pantalla de selección de cuenta de Google
- [ ] Después de seleccionar la cuenta, el app recibe el `id_token`
- [ ] El backend crea la cuenta automáticamente si no existe

---

## Archivos creados/modificados en esta fase

- `src/services/auth/googleAuthService.ts` (completado)
- `src/stores/authStore.ts` (actualizado con signInWithGoogle real)
- `app/(auth)/_layout.tsx` (actualizado)
- `app/(auth)/welcome.tsx` (implementado)
