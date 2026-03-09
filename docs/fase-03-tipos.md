# Fase 03 — Tipos TypeScript

## Objetivo

Definir todas las interfaces TypeScript del dominio de negocio. Estos tipos son el contrato compartido entre la capa de datos y la UI, y deben reflejar exactamente el contrato de la API del backend.

---

## Paso 1 — Tipos del dominio de negocio

Crear `src/types/index.ts` con todas las interfaces:

### Enums/Literales

```typescript
type UserRole = 'CLIENT' | 'MAESTRO';
type RequestStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type PaymentMethod = 'CASH';
type SenderRole = 'CLIENT' | 'MAESTRO';
type ColorScheme = 'light' | 'dark' | 'system';
```

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: string;  // ISO 8601
  hasMaestroProfile: boolean;
}
```

### ServiceCategory

```typescript
interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;  // nombre del ícono de Ionicons
}
```

### MaestroService

```typescript
interface MaestroService {
  serviceCategory: ServiceCategory;
  priceClp: number;      // entero CLP
  estimatedTime: string; // "2-3 horas"
}
```

### MaestroProfile

```typescript
interface MaestroProfile {
  id: string;            // UUID del MaestroProfile (no del User)
  userId: string;        // UUID del User
  name: string;
  photoUrl: string | null;
  description: string | null;
  services: MaestroService[];
  averageRating: number;
  totalJobs: number;
  isAvailable: boolean;
  isVerified: boolean;
  recentRatings?: Rating[];  // solo en detalle, no en listado
}
```

### MaestroListItem (versión liviana para el listado)

```typescript
interface MaestroListItem {
  id: string;
  userId: string;
  name: string;
  photoUrl: string | null;
  description: string | null;  // truncado a 150 chars
  services: MaestroService[];
  averageRating: number;
  totalJobs: number;
  isAvailable: boolean;
  isVerified: boolean;
}
```

### Address

```typescript
interface Address {
  street: string;
  number: string;
  city: string;
  additionalInstructions: string | null;
}
```

### ServiceRequest

```typescript
interface ServiceRequest {
  id: string;
  client: Pick<User, 'id' | 'name' | 'photoUrl'>;
  maestro: Pick<MaestroProfile, 'id' | 'userId' | 'name' | 'photoUrl' | 'averageRating'>;
  serviceCategory: ServiceCategory;
  description: string;
  address: Address;
  scheduledAt: string;    // ISO 8601
  paymentMethod: PaymentMethod;
  status: RequestStatus;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}
```

### Rating

```typescript
interface Rating {
  id: string;
  rater: Pick<User, 'id' | 'name' | 'photoUrl'>;
  score: number;           // 1-5
  comment: string | null;
  createdAt: string;
}
```

### ChatMessage

```typescript
interface ChatMessage {
  id: string;              // ObjectId de MongoDB
  roomId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  createdAt: string;
  read: boolean;
}
```

### ChatRoom

```typescript
interface ChatRoom {
  roomId: string;
  serviceRequestId: string;
  otherParticipant: Pick<User, 'id' | 'name' | 'photoUrl'>;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}
```

---

## Paso 2 — Tipos de la capa de datos

Agregar al mismo archivo o en un archivo `src/types/api.ts`:

### Respuesta estándar de la API

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}
```

### Respuesta paginada

```typescript
interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

### Error de la API

```typescript
interface ApiError {
  success: false;
  data: null;
  message: string;
}
```

---

## Paso 3 — Tipos de los Stores de Zustand

Definir las interfaces de los stores en el mismo archivo o en `src/types/stores.ts`:

### AuthStore

```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;  // true cuando el store terminó de cargar desde SecureStore
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  hydrateFromStorage: () => Promise<void>;  // llamar al startup
}
```

### ThemeStore

```typescript
interface ThemeStore {
  colorScheme: ColorScheme;
  resolvedTheme: 'light' | 'dark';  // 'system' se resuelve al valor real del sistema
  setColorScheme: (scheme: ColorScheme) => void;
}
```

### PendingRequestStore

```typescript
interface PendingRequest {
  maestroId: string | null;
  maestroName: string | null;  // Para mostrar en la pantalla de confirmación
  categoryId: string | null;
  categoryName: string | null;
  description: string;
  addressStreet: string;
  addressNumber: string;
  addressCity: string;
  addressInstructions: string;
  scheduledAt: string | null;
  termsAccepted: boolean;
}

interface PendingRequestStore extends PendingRequest {
  set: (data: Partial<PendingRequest>) => void;
  clear: () => void;
  hasData: () => boolean;  // true si hay suficientes datos para crear la solicitud
}
```

### ChatStore

```typescript
interface ChatStore {
  activeRoomId: string | null;
  isConnected: boolean;
  setActiveRoom: (roomId: string | null) => void;
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (roomId: string, content: string) => void;
  sendTypingIndicator: (roomId: string) => void;
}
```

---

## Paso 4 — Tipos de request (formularios)

Definir en `src/types/forms.ts` los tipos de los formularios que se usan con React Hook Form:

```typescript
interface CreateRequestFormValues {
  description: string;
  addressStreet: string;
  addressNumber: string;
  addressCity: string;
  addressInstructions?: string;
  scheduledAt: Date;
}

interface UpdateProfileFormValues {
  name: string;
  phone?: string;
}

interface CreateMaestroProfileFormValues {
  description: string;
  phone: string;
  services: {
    categoryId: string;
    priceClp: number;
    estimatedTime: string;
  }[];
}

interface RatingFormValues {
  score: number;
  comment?: string;
}
```

---

## Paso 5 — Tipos de navegación

Expo Router maneja los tipos de rutas automáticamente si `typedRoutes: true` está activo en `app.config.ts`. Sin embargo, definir los tipos de los parámetros de rutas para mayor claridad:

Crear `src/types/navigation.ts`:

```typescript
// Parámetros de rutas con parámetros dinámicos
interface MaestroDetailParams {
  id: string;  // MaestroProfile ID
}

interface RequestDetailParams {
  id: string;  // ServiceRequest ID
}

interface ChatRoomParams {
  roomId: string;
}

interface RatingModalParams {
  serviceRequestId: string;
  maestroName: string;
}
```

---

## Paso 6 — Tipos de notificaciones WebSocket

Definir los payloads de eventos WebSocket en `src/types/websocket.ts`:

```typescript
interface WebSocketNotification {
  type: 'SERVICE_REQUEST';
  serviceRequestId: string;
  action: 'CREATED' | 'ACCEPTED' | 'REJECTED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';
  title: string;
  body: string;
}

interface WebSocketChatMessage extends ChatMessage {
  // Igual que ChatMessage, es lo que retorna el WebSocket
}

interface TypingIndicatorPayload {
  userId: string;
  isTyping: boolean;
}
```

---

## Paso 7 — Exportar todo desde un índice

Verificar que `src/types/index.ts` exporta todos los tipos necesarios, o crear un barrel export que agrupe los archivos si se separaron:

```typescript
export type { User, UserRole, MaestroProfile, MaestroListItem, MaestroService, ServiceCategory, ServiceRequest, RequestStatus, Address, Rating, ChatMessage, ChatRoom, SenderRole, PaymentMethod, ColorScheme };
export type { ApiResponse, PaginatedResponse, ApiError };
export type { AuthStore, ThemeStore, PendingRequestStore, PendingRequest, ChatStore };
export type { CreateRequestFormValues, UpdateProfileFormValues, CreateMaestroProfileFormValues, RatingFormValues };
export type { WebSocketNotification, WebSocketChatMessage, TypingIndicatorPayload };
```

---

## Paso 8 — Verificación final de la fase

Ejecutar `npx tsc --noEmit` y verificar:

- [ ] No hay errores de compilación
- [ ] Los tipos son importables desde los alias `@types`
- [ ] Los tipos son suficientemente específicos (no hay `any`)
- [ ] Los tipos opcionales usan `| null` o `?` de forma consistente

---

## Archivos creados en esta fase

- `src/types/index.ts` — tipos del dominio
- `src/types/api.ts` — tipos de respuesta de la API
- `src/types/stores.ts` — interfaces de los stores
- `src/types/forms.ts` — tipos de valores de formularios
- `src/types/navigation.ts` — parámetros de rutas
- `src/types/websocket.ts` — payloads de WebSocket
