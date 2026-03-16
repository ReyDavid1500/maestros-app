/**
 * Tipos de payloads de eventos WebSocket (STOMP over SockJS).
 * Se reciben via subscripciones a /topic/... y /user/queue/...
 */

import type { ChatMessage } from "./index";

// ─── Notificación de cambio de estado de solicitud ───────────────────────────

export interface WebSocketNotification {
  type: "SERVICE_REQUEST";
  serviceRequestId: string;
  action:
    | "CREATED"
    | "ACCEPTED"
    | "REJECTED"
    | "STARTED"
    | "COMPLETED"
    | "CANCELLED";
  title: string;
  body: string;
}

// ─── Mensaje de chat en tiempo real ──────────────────────────────────────────

/** El backend envía el mismo shape que ChatMessage */
export type WebSocketChatMessage = ChatMessage;

// ─── Indicador de escritura ───────────────────────────────────────────────────

export interface TypingIndicatorPayload {
  userId: string;
  isTyping: boolean;
}
