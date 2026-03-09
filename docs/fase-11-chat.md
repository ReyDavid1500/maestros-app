# Fase 11 — Chat en Tiempo Real

## Objetivo

Implementar el cliente WebSocket STOMP, las pantallas de chat (compartidas entre cliente y maestro), y los componentes de mensajería. El chat debe funcionar en tiempo real cuando el backend esté disponible, y con datos mock mientras se desarrolla.

---

## Paso 1 — Configurar el cliente STOMP

Crear `src/services/websocket/stompClient.ts`.

**Función `createStompClient(token: string): Client`:**

```typescript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const createStompClient = (token: string): Client => {
  const client = new Client({
    webSocketFactory: () => new SockJS(process.env.EXPO_PUBLIC_WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    heartbeatIncoming: 25000,
    heartbeatOutgoing: 25000,
    reconnectDelay: 5000, // Reintentar cada 5 segundos si se cae la conexión
    onConnect: () => {
      logger.debug('WebSocket conectado');
    },
    onDisconnect: () => {
      logger.debug('WebSocket desconectado');
    },
    onStompError: (frame) => {
      logger.error('Error STOMP:', frame.headers['message']);
    },
    onWebSocketError: (event) => {
      logger.error('Error WebSocket:', event);
    },
  });

  return client;
};
```

**Para el modo mock:** Si `EXPO_PUBLIC_USE_MOCK=true`, el cliente STOMP no se conecta a ningún servidor. En cambio, las funciones de `chatStore` simulan los mensajes entrantes con un `setTimeout`.

---

## Paso 2 — Actualizar chatStore con suscripciones

Completar `src/stores/chatStore.ts` agregando la lógica de suscripción:

**Acción `subscribeToRoom(roomId: string, onMessage: (msg: ChatMessage) => void)`:**
1. Si el cliente no está conectado: loggear error y retornar
2. Suscribirse al topic: `client.subscribe('/topic/chat/${roomId}', (message) => { onMessage(JSON.parse(message.body)); })`
3. Guardar la suscripción para poder cancelarla: `activeSubscriptions.set(roomId, subscription)`
4. Retornar la función de cleanup: `() => subscription.unsubscribe()`

**Acción `unsubscribeFromRoom(roomId: string)`:**
1. Buscar la suscripción en `activeSubscriptions`
2. Llamar a `subscription.unsubscribe()`
3. Eliminar del mapa

**Acción `subscribeToNotifications(userId: string, onNotification: (notification: WebSocketNotification) => void)`:**
1. Suscribirse a `/topic/notifications/${userId}`
2. Al recibir: parsear y llamar a `onNotification(payload)`

---

## Paso 3 — Componente MessageBubble

Crear `src/components/chat/MessageBubble.tsx`.

**Props:**
- `message: ChatMessage`
- `isOwnMessage: boolean` (si el `senderId === authStore.user.id`)
- `showTimestamp: boolean` (mostrar el timestamp solo cuando hay un gap de >5 minutos desde el mensaje anterior)

**Layout:**
- Si es propio: burbuja naranja alineada a la derecha
- Si es del otro: burbuja gris claro alineada a la izquierda (con nombre/avatar si se quiere indicador de quién envía)
- Timestamp pequeño debajo de la burbuja (en gris)
- Texto del mensaje: `<Text>` plano (nunca HTML)

**Estilo de burbujas:**
- Propio: `bg-primary rounded-2xl rounded-tr-sm px-4 py-2` (esquina superior derecha menos redondeada)
- Otro: `bg-surface rounded-2xl rounded-tl-sm px-4 py-2` (esquina superior izquierda menos redondeada)

---

## Paso 4 — Componente ChatInput

Crear `src/components/chat/ChatInput.tsx`.

**Props:**
- `onSend: (content: string) => void`
- `disabled: boolean` (para deshabilitar durante envío)

**Layout:**
- Fila horizontal: Input de texto + Botón enviar
- El input es multilínea pero empieza como una sola línea
- El botón de enviar es un ícono de flecha naranja
- Al tocar "Enviar": limpiar el input y llamar a `onSend`

**Throttle de envío:** Usar `useThrottledAction(onSend, 500)` para limitar a 2 mensajes por segundo.

**Indicador de escritura:** Al escribir (en `onChangeText`), enviar `chatStore.sendTypingIndicator(roomId)` con debounce de 1 segundo (no enviar en cada keystroke).

---

## Paso 5 — Componente ChatRoomItem

Crear `src/components/chat/ChatRoomItem.tsx`.

**Props:** `room: ChatRoom`, `onPress: () => void`

**Layout:**
- Fila: Avatar del otro participante (48px) + columna de info + tiempo
- Info: nombre del otro participante (bold) + último mensaje (truncado a 1 línea, gris)
- Tiempo: hora o fecha si es de otro día
- Badge de no leídos: círculo naranja con el número si `unreadCount > 0`

---

## Paso 6 — Pantalla Lista de Chats

Crear `app/(client)/chat/index.tsx` y `app/(maestro)/chat/index.tsx`.

Ambas pueden compartir el mismo componente de lista. Crear `src/components/chat/ChatRoomList.tsx` que se reutiliza en ambas rutas.

**Datos:** `useChatRooms()`

**Layout:**
- FlatList de `ChatRoomItem`
- Pull-to-refresh
- Si está vacío: `EmptyState` con `"No tienes conversaciones activas"`
- Al tocar un room: navegar a `/(client)/chat/[roomId]` o `/(maestro)/chat/[roomId]`

---

## Paso 7 — Pantalla de Chat

Crear `app/(client)/chat/[roomId].tsx` y `app/(maestro)/chat/[roomId].tsx`.

Ambas pueden ser el mismo componente. Crear `src/components/chat/ChatRoom.tsx`:

**Parámetro:** `roomId`

**Setup al montar:**
1. Cargar historial de mensajes con `useChatMessages(roomId)`
2. Suscribirse al topic WebSocket del room: `chatStore.subscribeToRoom(roomId, handleNewMessage)`
3. Marcar como leídos: `useMarkAsRead().mutate(roomId)`
4. Al desmontar: desuscribirse del topic

**Función `handleNewMessage(message: ChatMessage)`:**
1. Agregar el mensaje al cache de TanStack Query de forma optimista:
   ```typescript
   queryClient.setQueryData(queryKeys.chat.messages(roomId), (old) => {
     // Agregar el nuevo mensaje al inicio (los mensajes vienen en orden DESC)
     return { ...old, pages: [{ ...old.pages[0], content: [message, ...old.pages[0].content] }] };
   });
   ```
2. Si el mensaje no es del usuario actual: marcar como leído automáticamente
3. Hacer scroll al final de la lista (al mensaje más nuevo)

**Layout:**
- Header: nombre del otro participante + botón atrás
- FlatList invertida (`inverted={true}`) de `MessageBubble`
  - Invertida para que los mensajes nuevos aparezcan al fondo y el scroll hacia arriba cargue mensajes más antiguos
- Scroll infinito hacia arriba para cargar más mensajes (`onEndReached` con `fetchNextPage`)
- Indicador de escritura: `"Pedro está escribiendo..."` (aparece al recibir un evento de typing, desaparece después de 3 segundos)
- `ChatInput` fijado en la parte inferior

**Handling del teclado:**
- Usar `KeyboardAvoidingView` para que el ChatInput suba cuando aparece el teclado
- En iOS: `behavior="padding"`, en Android: `behavior="height"`

---

## Paso 8 — Mock del WebSocket para desarrollo

En modo mock, el chat no tiene un servidor WebSocket real. Simular mensajes entrantes:

En `src/mocks/mockAdapter.ts`, agregar una función `simulateIncomingMessage(roomId: string)`:
- Después de que el usuario envía un mensaje, esperar 2 segundos y "recibir" una respuesta automática del bot
- Llamar directamente al callback `onMessage` del `chatStore.subscribeToRoom`
- El mensaje de respuesta puede ser: "Recibido, te confirmo pronto." o similar

Esto permite testear el flujo completo del chat en modo mock.

---

## Paso 9 — Conectar el WebSocket al iniciar sesión

En `app/_layout.tsx`, después de que el `authStore` termina de hidratarse:

```typescript
useEffect(() => {
  authStore.hydrateFromStorage().then(() => {
    const { user, token } = authStore.getState();
    if (token && user) {
      chatStore.getState().connect(token);
      chatStore.getState().subscribeToNotifications(user.id, handleGlobalNotification);
    }
  });
}, []);
```

**`handleGlobalNotification`:**
- Cuando llega una notificación de cambio de estado de solicitud: invalidar el query correspondiente
- Si la app está en foreground: mostrar un toast con el mensaje de la notificación
- El toast puede implementarse con un estado en el root layout o con una librería como `react-native-toast-message`

---

## Paso 10 — Verificación final de la fase

**Flujo completo del chat:**
1. Desde el detalle de una solicitud, tocar "Chatear"
2. Navegar a la pantalla de chat del room correspondiente
3. Enviar un mensaje → aparece como burbuja propia (naranja, derecha)
4. En modo mock: después de 2 segundos aparece la respuesta automática (gris, izquierda)
5. La lista de chats muestra el último mensaje y el badge de no leídos

**Pruebas específicas:**
- [ ] Los mensajes del historial cargan correctamente (mock data)
- [ ] Los mensajes propios aparecen a la derecha y los del otro a la izquierda
- [ ] El scroll al enviar un mensaje va al fondo automáticamente
- [ ] El teclado no oculta el input en iOS y Android
- [ ] El throttle del input bloquea más de 2 mensajes por segundo (intentar enviar rápidamente)
- [ ] El indicador de escritura aparece y desaparece correctamente (simular en mock)
- [ ] `PUT /chat/rooms/{roomId}/read` se llama al entrar al chat

---

## Archivos creados en esta fase

- `src/services/websocket/stompClient.ts`
- `src/stores/chatStore.ts` (actualizado con suscripciones)
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/ChatInput.tsx`
- `src/components/chat/ChatRoomItem.tsx`
- `src/components/chat/ChatRoomList.tsx`
- `src/components/chat/ChatRoom.tsx` (componente compartido)
- `app/(client)/chat/index.tsx`
- `app/(client)/chat/[roomId].tsx`
- `app/(maestro)/chat/index.tsx`
- `app/(maestro)/chat/[roomId].tsx`
