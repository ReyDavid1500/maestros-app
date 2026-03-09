# Checklist de Integración Frontend ↔ Backend

Este documento define todos los pasos necesarios para conectar el frontend (desarrollado con datos mock) con el backend real cuando esté listo.

---

## Paso 1 — Variables de entorno

Actualizar el archivo `.env` con las URLs reales del backend:

```
EXPO_PUBLIC_API_URL=https://api.maestros.cl/api/v1
EXPO_PUBLIC_WS_URL=https://api.maestros.cl/ws
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=xxxxx.apps.googleusercontent.com
```

**Verificar:** Con `EXPO_PUBLIC_USE_MOCK=false`, el `mockAdapter.ts` NO debe registrar ningún handler. El axiosInstance debe hacer requests reales.

---

## Paso 2 — Desactivar el mock adapter

Verificar que en `src/mocks/mockAdapter.ts`:
- La condición `if (process.env.EXPO_PUBLIC_USE_MOCK === 'true')` esté correctamente implementada
- Con `EXPO_PUBLIC_USE_MOCK=false`, la función `setupMockAdapter()` retorna sin hacer nada

En `app/_layout.tsx`, verificar que `setupMockAdapter()` se llama en el `useEffect` inicial (ya está configurado).

---

## Paso 3 — Verificar el contrato de la API

Comparar el `contrato-api.md` del backend con las funciones en `src/services/api/`:

| Endpoint | Función frontend | Verificar |
|---|---|---|
| `POST /auth/google` | `authApi.loginWithGoogle` | Response incluye `isNewUser` |
| `POST /auth/refresh` | `authApi.refreshToken` | Rotación de tokens funciona |
| `POST /auth/logout` | `authApi.logout` | Token se invalida en backend |
| `GET /users/me` | `usersApi.getMe` | `hasMaestroProfile` presente |
| `PUT /users/me/fcm-token` | `usersApi.updateFcmToken` | FCM token llega al backend |
| `GET /categories` | `maestrosApi.getCategories` | 10 categorías con iconos |
| `GET /maestros` | `maestrosApi.getMaestros` | Paginación funciona |
| `GET /maestros/search` | `maestrosApi.searchMaestros` | Búsqueda por texto funciona |
| `GET /maestros/{id}` | `maestrosApi.getMaestro` | `recentRatings` incluido |
| `POST /maestros/me/profile` | `maestrosApi.createMyProfile` | Solo para MAESTRO |
| `POST /service-requests` | `serviceRequestsApi.createServiceRequest` | FCM al maestro |
| `GET /service-requests` | `serviceRequestsApi.getMyServiceRequests` | Filtra por role |
| `PUT /service-requests/{id}/accept` | `serviceRequestsApi.acceptRequest` | FCM al cliente |
| `POST /ratings` | `ratingsApi.createRating` | Actualiza rating del maestro |
| `GET /chat/rooms` | `chatApi.getChatRooms` | `unreadCount` correcto |
| `GET /chat/rooms/{roomId}/messages` | `chatApi.getChatMessages` | Orden DESC |

---

## Paso 4 — Verificar el formato de los datos

Para cada endpoint, verificar que el JSON de respuesta coincide con los tipos TypeScript definidos en `src/types/`:

**Puntos críticos a verificar:**
- Los UUIDs vienen como strings (no como objetos)
- Las fechas vienen en formato ISO 8601 UTC
- Los precios vienen como números enteros (no strings)
- El campo `hasMaestroProfile` está en la respuesta de `/users/me`
- El `roomId` del chat tiene el formato `{clientId}_{maestroUserId}_{serviceRequestId}` (usar los UUIDs del User, no del MaestroProfile para el maestro)
- El campo `unreadCount` en los rooms de chat es un número (no string)

Si hay discrepancias, actualizar los tipos TypeScript o coordinar con el backend para ajustar.

---

## Paso 5 — Verificar la autenticación end-to-end

**Flujo completo:**
1. Instalar la app en un dispositivo real
2. Tocar "Continuar con Google" → se abre la pantalla de selección de cuenta de Google
3. Seleccionar cuenta → la app recibe el callback con el `id_token`
4. El `id_token` se envía al backend → el backend retorna un JWT
5. El JWT se guarda en SecureStore
6. La app navega al home del cliente

**Verificar en el backend:**
- El usuario fue creado en la base de datos PostgreSQL
- El log muestra `event: "LOGIN_SUCCESS"` con el `userId` correcto

---

## Paso 6 — Verificar el WebSocket

El WebSocket no tiene modo mock en producción. Verificar la conexión real:

1. Iniciar sesión en la app
2. Abrir el chat de una solicitud existente
3. En el backend, enviar un mensaje directamente al WebSocket (con Postman o wscat)
4. Verificar que el mensaje aparece en la app en tiempo real
5. Verificar que el indicador de escritura funciona entre dos dispositivos
6. Verificar que las notificaciones de cambio de estado llegan en tiempo real

**Si el WebSocket falla:**
- Verificar que el header `Authorization: Bearer {token}` se está enviando en el handshake STOMP
- Verificar que el servidor STOMP está en la URL correcta (`EXPO_PUBLIC_WS_URL`)
- Verificar que CORS permite la conexión desde la app

---

## Paso 7 — Verificar las push notifications

**Requisitos:**
- App instalada en dispositivo físico (no simulador)
- Permisos de notificaciones otorgados
- El token de FCM registrado en el backend

**Flujo de prueba:**
1. Cliente crea una solicitud de servicio
2. Verificar que el maestro recibe una push notification
3. El maestro acepta la solicitud
4. Verificar que el cliente recibe una push notification
5. Tocar la notificación → verificar que navega a la solicitud correcta

**Si las notificaciones no llegan:**
- Verificar en la consola de Firebase que el mensaje fue enviado
- Verificar que el `fcmToken` guardado en la base de datos es el token actual del dispositivo
- Verificar que las credenciales de Firebase en el backend son correctas
- En iOS: verificar que APNs está configurado en Firebase y en Apple Developer Console

---

## Paso 8 — Probar el flujo completo E2E

**Flujo del cliente (dispositivo A):**
1. Buscar y encontrar a un maestro
2. Tocar "Contratar" → llenar el formulario
3. Confirmar con Google OAuth
4. La solicitud se crea → notificación llega al maestro

**Flujo del maestro (dispositivo B):**
5. Recibir la notificación push
6. Abrir la solicitud → ver todos los detalles
7. Aceptar → cliente recibe notificación
8. Iniciar → cliente recibe notificación
9. Completar → cliente recibe notificación
10. Cliente abre el app → puede calificar al maestro
11. Calificar → el rating del maestro se actualiza

**Flujo del chat:**
12. Desde cualquier pantalla de solicitud, ambos pueden chatear en tiempo real

---

## Paso 9 — Activar Certificate Pinning (producción)

Certificate pinning previene ataques man-in-the-middle, especialmente relevante para maestros trabajando en campo con WiFi desconocido.

**Pasos:**
1. Obtener el certificado SSL final de Azure (el certificado del dominio `api.maestros.cl`)
2. Extraer el hash del certificado público (SHA-256 del Subject Public Key Info)
3. Configurar `expo-network-interceptor` o una librería nativa de SSL pinning
4. Agregar el hash del certificado a la configuración

**Nota:** El certificate pinning se activa después de que el certificado SSL de producción esté definitivo. Si se activa con el certificado incorrecto, la app dejará de funcionar.

---

## Paso 10 — Ajustar los IDs de maestro

**Punto de atención:** En el backend, hay dos tipos de ID relacionados con los maestros:
- `User.id` — el UUID del usuario
- `MaestroProfile.id` — el UUID del perfil de maestro

Verificar en los endpoints que se usa el ID correcto:
- `GET /maestros/{id}` → espera `MaestroProfile.id`
- `GET /ratings/maestro/{maestroId}` → espera `User.id` del maestro
- El `roomId` del chat usa `maestroUserId` que es `User.id` del maestro, no el `MaestroProfile.id`

Si hay discrepancias, coordinar con el backend o actualizar los tipos.

---

## Paso 11 — Verificar el manejo de errores end-to-end

**Errores a verificar:**
1. Token expirado → el interceptor de Axios hace refresh automáticamente
2. Refresh token expirado → el usuario es redirigido a la pantalla de bienvenida
3. Error 429 → el usuario ve el countdown y el botón se deshabilita
4. Error de red (sin internet) → aparece `ErrorState` con "Error de conexión"
5. Error 500 del servidor → aparece `ErrorState` con mensaje genérico

---

## Paso 12 — Checklist de seguridad final

Antes de lanzar a producción:

- [ ] `EXPO_PUBLIC_USE_MOCK=false` en la build de producción
- [ ] No hay `console.log` con datos sensibles (verificar con grep)
- [ ] No hay tokens en los parámetros de URL
- [ ] Los tokens se guardan en SecureStore (no AsyncStorage)
- [ ] El logger es no-op en producción (`__DEV__ === false`)
- [ ] El OAuth usa PKCE (verificar que `usePKCE: true` en expo-auth-session)
- [ ] Certificate pinning activado con el certificado final
- [ ] Las variables `EXPO_PUBLIC_*` no contienen secrets (solo URLs y IDs públicos)
- [ ] El bundle de producción no incluye los datos mock (`src/mocks/`) — verificar con tree shaking

---

## Paso 13 — Variables de entorno final para producción

```
EXPO_PUBLIC_API_URL=https://api.maestros.cl/api/v1
EXPO_PUBLIC_WS_URL=https://api.maestros.cl/ws
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=xxxxx.apps.googleusercontent.com
```

Estas variables son seguras para incluir en el bundle porque son públicas por diseño.

**NO incluir en el bundle:**
- Firebase service account JSON
- Claves privadas RSA
- Contraseñas de base de datos
- Connection strings completos

---

## Paso 14 — Build de producción

**Para Expo Go (desarrollo):**
```
npx expo start
```

**Para una build standalone (producción):**
```
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
```

Configurar `eas.json` con los perfiles de build:
- `development`: para probar en dispositivos
- `preview`: para QA
- `production`: para App Store y Play Store

---

## Problemas conocidos y workarounds

| Problema | Descripción | Workaround |
|---|---|---|
| WebSocket en emulador Android | Los emuladores usan 10.0.2.2 como IP del host | Usar `http://10.0.2.2:8080/ws` en desarrollo local |
| Push notifications en simulador | Expo Go en simulador iOS/Android no soporta push notifications reales | Usar `Notifications.scheduleNotificationAsync` para simular |
| OAuth en Expo Go | El redirect URI cambia entre Expo Go y una build standalone | Configurar ambos redirect URIs en Google Cloud Console |
| SecureStore en emulador Android | A veces falla en emuladores genéricos | Usar un emulador con Play Services |
| Role de MAESTRO | El backend actualmente asigna CLIENT por defecto | Confirmar con el backend el mecanismo final para asignar el role MAESTRO |
