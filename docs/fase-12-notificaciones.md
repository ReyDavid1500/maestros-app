# Fase 12 — Push Notifications

## Objetivo

Implementar el sistema de notificaciones push con expo-notifications: solicitar permisos, registrar el token del dispositivo en el backend, manejar notificaciones en foreground y background, y configurar el deep linking para navegar a la pantalla correcta al tocar una notificación.

---

## Paso 1 — Configurar expo-notifications en app.config.ts

Agregar el plugin de `expo-notifications` a `app.config.ts`:

```typescript
plugins: [
  'expo-router',
  [
    'expo-notifications',
    {
      icon: './assets/images/notification-icon.png',  // ícono de la notificación (fondo blanco, ícono de la app)
      color: '#F97316',  // color de acento naranja
      sounds: ['./assets/sounds/notification.wav'],   // sonido opcional
    }
  ],
],
```

Para Android: las notificaciones requieren el archivo `google-services.json` (FCM). Para iOS: requiere configurar APNs en Apple Developer Console.

---

## Paso 2 — Servicio de notificaciones

Crear `src/services/notifications/notificationService.ts`.

### Función `requestPermissions(): Promise<boolean>`
1. Verificar si el dispositivo es físico: `Device.isDevice` — los emuladores/simuladores no soportan push notifications
2. Si no es dispositivo físico: retornar false (o true en desarrollo para no bloquear el flujo)
3. Solicitar permisos: `await Notifications.requestPermissionsAsync()`
4. Si el status es `'granted'`: retornar true
5. Si fue denegado: mostrar un Alert explicando por qué la app necesita las notificaciones y cómo habilitarlas en Configuración
6. Retornar false si no se otorgaron permisos

### Función `getExpoPushToken(): Promise<string | null>`
1. Llamar a `requestPermissions()`. Si retorna false: retornar null
2. Obtener el Expo Push Token: `await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })`
3. Retornar `token.data` (el string del token, ej. `"ExponentPushToken[xxxxx]"`)

### Función `registerPushToken(): Promise<void>`
1. Llamar a `getExpoPushToken()`
2. Si el token es null: retornar (no hacer el request)
3. Llamar a `usersApi.updateFcmToken(token)` — `PUT /api/v1/users/me/fcm-token`
4. Guardar el token en AsyncStorage (`'push_token'`) para no registrarlo en cada login si no cambió
5. Loggear el resultado

---

## Paso 3 — Configurar los canales de notificación (Android)

En Android, las notificaciones pertenecen a un canal. Crear los canales al inicio de la app:

En `app/_layout.tsx`, agregar al `useEffect` de inicialización:

```typescript
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Notificaciones',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#F97316',
  });

  Notifications.setNotificationChannelAsync('chat', {
    name: 'Mensajes de chat',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250],
  });
}
```

---

## Paso 4 — Registrar el token al hacer login

En el `useEffect` que se ejecuta cuando `authStore.user` cambia de null a un valor (el usuario acaba de hacer login):

```typescript
useEffect(() => {
  if (user) {
    notificationService.registerPushToken();
  }
}, [user]);
```

Esto asegura que el token se registra en el backend cada vez que el usuario inicia sesión.

---

## Paso 5 — Manejar notificaciones en foreground

Cuando la app está abierta y llega una notificación, por defecto no se muestra nada. Configurar el comportamiento:

En `app/_layout.tsx`:

```typescript
// Configurar cómo mostrar notificaciones en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // Mostrar alerta incluso en foreground
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

**Handler de notificación recibida:**
```typescript
const subscription = Notifications.addNotificationReceivedListener((notification) => {
  const data = notification.request.content.data as WebSocketNotification;
  logger.debug('Notificación recibida en foreground:', data.action);

  // Invalidar el query correspondiente para que la UI se actualice
  if (data.type === 'SERVICE_REQUEST') {
    queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.detail(data.serviceRequestId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.all });
  }
});
```

Limpiar la suscripción en el cleanup del `useEffect`.

---

## Paso 6 — Manejar tap en notificación (deep linking)

Cuando el usuario toca la notificación, la app se abre o se trae al frente. Navegar a la pantalla correcta:

```typescript
const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data as WebSocketNotification;

  if (data.type === 'SERVICE_REQUEST') {
    const { user } = authStore.getState();

    if (!user) {
      // El usuario no está logueado, navegar a bienvenida
      router.replace('/(auth)/welcome');
      return;
    }

    if (user.role === 'CLIENT') {
      router.push(`/(client)/request/${data.serviceRequestId}`);
    } else if (user.role === 'MAESTRO') {
      // Determinar si es una solicitud nueva o un trabajo en curso
      // Para simplificar: siempre navegar al detalle de solicitud del maestro
      router.push(`/(maestro)/request/${data.serviceRequestId}`);
    }
  }
});
```

---

## Paso 7 — Manejar notificación al abrir la app desde killed state

Cuando la app está completamente cerrada y el usuario toca la notificación:

```typescript
useEffect(() => {
  // Verificar si la app fue abierta desde una notificación
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response) {
      // La app fue abierta por una notificación
      // Esperar a que el authStore esté hidratado antes de navegar
      authStore.hydrateFromStorage().then(() => {
        const data = response.notification.request.content.data as WebSocketNotification;
        handleNotificationNavigation(data);
      });
    }
  });
}, []);
```

---

## Paso 8 — Badge de notificaciones en la tab bar

Actualizar el contador de notificaciones en la tab bar:

En `app/(maestro)/_layout.tsx`:
- Mostrar el badge en la tab "Trabajos" con el número de solicitudes PENDING
- Actualizar usando el hook `useMyServiceRequests()` y contando las PENDING

Para el badge de mensajes no leídos en la tab "Mensajes":
- Usar `useChatRooms()` y sumar todos los `unreadCount`
- Actualizar el badge `tabBarBadge` en el Tab Navigator

---

## Paso 9 — Configurar el badge del ícono de la app

Actualizar el número del badge en el ícono de la app (número rojo sobre el ícono):

```typescript
// Actualizar el badge count
const totalUnread = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);
const pendingRequests = serviceRequests.filter(r => r.status === 'PENDING').length;
Notifications.setBadgeCountAsync(totalUnread + pendingRequests);
```

---

## Paso 10 — Modo mock de notificaciones

Para desarrollo, simular notificaciones locales sin necesidad del backend:

Crear `src/mocks/notificationMock.ts` con una función `simulatePushNotification(action: string)`:
1. Usar `Notifications.scheduleNotificationAsync` con `trigger: null` (inmediato)
2. Crear el payload con los campos correctos: `title`, `body`, `data`

Esto permite probar el deep linking y el comportamiento de foreground sin backend.

---

## Paso 11 — Verificación final de la fase

**Con dispositivo físico** (las push notifications no funcionan en simuladores):

- [ ] Al hacer login, se solicitan los permisos de notificaciones
- [ ] El token se registra en el backend (`PUT /users/me/fcm-token` se llama)
- [ ] Desde el backend, enviar una push notification manual con Firebase Console y verificar que llega
- [ ] La notificación llega correctamente en foreground (se muestra la alerta)
- [ ] Al tocar la notificación con la app en background, navega a la pantalla correcta
- [ ] Al tocar la notificación con la app cerrada, navega a la pantalla correcta después de que la app carga

**Con simulador (notificaciones locales):**
- [ ] La función `simulatePushNotification` dispara una notificación local
- [ ] El deep linking funciona con la notificación local

---

## Archivos creados en esta fase

- `src/services/notifications/notificationService.ts`
- `src/mocks/notificationMock.ts`
- `app/_layout.tsx` (actualizado con todos los listeners de notificación)
- `app/(maestro)/_layout.tsx` (actualizado con badges)
- `app/(client)/_layout.tsx` (actualizado con badge de chat)
- `app.config.ts` (actualizado con plugin de expo-notifications)
