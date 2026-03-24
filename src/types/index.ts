/**
 * Tipos centrales del dominio de negocio — Maestros App.
 * Reflejan exactamente el contrato de la API del backend.
 * Re-exporta todos los sub-módulos para importar desde @types.
 */

// ─── Literales / Enums ────────────────────────────────────────────────────────

export type UserRole = "CLIENT" | "MAESTRO";

export type RequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type PaymentMethod = "CASH";

export type SenderRole = "CLIENT" | "MAESTRO";

export type ColorScheme = "light" | "dark" | "system";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: string; // ISO 8601
  hasMaestroProfile: boolean;
}

// ─── ServiceCategory ──────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string; // nombre del ícono de Ionicons
}

// ─── MaestroService ───────────────────────────────────────────────────────────

export interface MaestroService {
  serviceCategory: ServiceCategory;
  priceClp: number; // entero CLP
  estimatedTime: string; // "2-3 horas"
}

// ─── MaestroProfile ───────────────────────────────────────────────────────────

export interface MaestroProfile {
  id: string; // UUID del MaestroProfile (no del User)
  userId: string; // UUID del User
  name: string;
  photoUrl: string | null;
  description: string | null;
  services: MaestroService[];
  averageRating: number;
  totalJobs: number;
  isAvailable: boolean;
  isVerified: boolean;
  recentRatings?: Rating[]; // solo en detalle, no en listado
}

/** Versión liviana usada en el listado de búsqueda */
export interface MaestroListItem {
  id: string;
  userId: string;
  name: string;
  photoUrl: string | null;
  description: string | null; // truncado a 150 chars
  services: MaestroService[];
  averageRating: number;
  totalJobs: number;
  isAvailable: boolean;
  isVerified: boolean;
}

// ─── Address ──────────────────────────────────────────────────────────────────

export interface Address {
  street: string;
  number: string;
  city: string;
  additionalInstructions: string | null;
}

// ─── ServiceRequest ───────────────────────────────────────────────────────────

export interface ServiceRequest {
  id: string;
  client: Pick<User, "id" | "name" | "photoUrl">;
  maestro: Pick<
    MaestroProfile,
    "id" | "userId" | "name" | "photoUrl" | "averageRating"
  >;
  serviceCategory: ServiceCategory;
  description: string;
  address: Address;
  scheduledAt: string; // ISO 8601
  paymentMethod: PaymentMethod;
  status: RequestStatus;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  roomId: string | null; // set by the backend when the request is accepted
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export interface Rating {
  id: string;
  rater: Pick<User, "id" | "name" | "photoUrl">;
  score: number; // 1-5
  comment: string | null;
  createdAt: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string; // ObjectId de MongoDB
  roomId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface ChatRoom {
  roomId: string;
  serviceRequestId: string;
  otherParticipant: Pick<User, "id" | "name" | "photoUrl">;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

// ─── Re-exports de sub-módulos ────────────────────────────────────────────────

export type { ApiResponse, PaginatedResponse, ApiError } from "./api";
export type {
  AuthStore,
  ThemeStore,
  PendingRequest,
  PendingRequestStore,
  ChatStore,
} from "./stores";
export type {
  CreateRequestFormValues,
  UpdateProfileFormValues,
  CreateMaestroProfileFormValues,
  RatingFormValues,
} from "./forms";
export type {
  MaestroDetailParams,
  RequestDetailParams,
  ChatRoomParams,
  RatingModalParams,
} from "./navigation";
export type {
  WebSocketNotification,
  WebSocketChatMessage,
  TypingIndicatorPayload,
} from "./websocket";
