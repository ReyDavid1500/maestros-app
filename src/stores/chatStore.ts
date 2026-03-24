/**
 * Store de chat / WebSocket.
 * Gestiona la conexión STOMP y las suscripciones a rooms y notificaciones.
 *
 * El cliente STOMP y las suscripciones se guardan como variables de módulo
 * (no reactivas) para evitar re-renders innecesarios.
 * Solo `isConnected` y `activeRoomId` son estado reactivo (Zustand).
 */

import { create } from "zustand";
import type { Client, StompSubscription } from "@stomp/stompjs";
import { createStompClient } from "@services/websocket/stompClient";
import { logger } from "@utils/logger";
import type { ChatMessage } from "@types";
import type { WebSocketNotification } from "@types";

// ─── Variables de módulo (no reactivas) ──────────────────────────────────────

const isMock = process.env["EXPO_PUBLIC_USE_MOCK"] === "true";

let stompClient: Client | null = null;

/** Callbacks de suscripción por roomId — accesibles desde el mock */
const roomSubscriptions = new Map<
  string,
  { callback: (msg: ChatMessage) => void; stompSub: StompSubscription | null }
>();

let notificationSub: StompSubscription | null = null;

// ─── Export para uso desde mockAdapter ───────────────────────────────────────

/**
 * Devuelve el callback registrado para un room (para que el mock pueda
 * simular mensajes entrantes sin pasar por WebSocket real).
 */
export function getMockRoomCallback(
  roomId: string,
): ((msg: ChatMessage) => void) | null {
  return roomSubscriptions.get(roomId)?.callback ?? null;
}

// ─── Estado + Acciones ────────────────────────────────────────────────────────

interface ChatState {
  activeRoomId: string | null;
  isConnected: boolean;
}

interface ChatActions {
  /** Crea y activa el cliente STOMP con el token de autenticación */
  connect: (token: string) => void;
  /** Desactiva el cliente STOMP y limpia las suscripciones */
  disconnect: () => void;
  /** Publica un mensaje al broker STOMP (no-op en modo mock) */
  sendMessage: (roomId: string, content: string) => void;
  /** Publica un indicador de escritura (no-op en modo mock) */
  sendTypingIndicator: (roomId: string) => void;
  /** Setea el room actualmente visible */
  setActiveRoom: (roomId: string | null) => void;
  /**
   * Suscribirse a un room de chat.
   * Registra el callback para uso mock y, si hay conexión STOMP activa,
   * suscribe al topic correspondiente.
   * Retorna la función de cleanup (unsubscribe).
   */
  subscribeToRoom: (
    roomId: string,
    onMessage: (msg: ChatMessage) => void,
  ) => () => void;
  /** Cancelar la suscripción de un room */
  unsubscribeFromRoom: (roomId: string) => void;
  /**
   * Suscribirse al canal de notificaciones del usuario.
   * No-op en modo mock.
   */
  subscribeToNotifications: (
    userId: string,
    onNotification: (notification: WebSocketNotification) => void,
  ) => void;
}

export type ChatStore = ChatState & ChatActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatStore>((set, get) => ({
  // ── Estado inicial ──────────────────────────────────────────────────────────
  activeRoomId: null,
  isConnected: false,

  // ── Acciones ────────────────────────────────────────────────────────────────

  connect: (token: string) => {
    if (isMock) {
      // Mock: simular estado conectado sin abrir un WebSocket real
      set({ isConnected: true });
      logger.debug("[chatStore] Mock mode: STOMP simulado (sin conexión real)");
      return;
    }

    if (get().isConnected || stompClient?.active) return;

    stompClient = createStompClient(token);

    stompClient.onConnect = () => {
      set({ isConnected: true });
      logger.debug("[chatStore] STOMP conectado");

      // Replay any subscriptions registered while the connection was being established
      roomSubscriptions.forEach((sub, roomId) => {
        if (!sub.stompSub && stompClient) {
          const stompSub = stompClient.subscribe(
            `/topic/chat/${roomId}`,
            (frame) => {
              try {
                const msg = JSON.parse(frame.body) as ChatMessage;
                sub.callback(msg);
              } catch (e) {
                logger.error(
                  "[chatStore] Error parseando mensaje (replay):",
                  e,
                );
              }
            },
          );
          roomSubscriptions.set(roomId, { ...sub, stompSub });
        }
      });
    };

    stompClient.onDisconnect = () => {
      set({ isConnected: false });
      logger.debug("[chatStore] STOMP desconectado");
    };

    stompClient.onStompError = (frame) => {
      logger.error("[chatStore] STOMP error:", frame.headers["message"]);
      set({ isConnected: false });
    };

    stompClient.activate();
  },

  disconnect: () => {
    if (stompClient?.active) {
      stompClient.deactivate().catch(() => {
        // Ignorar errores de desconexión
      });
    }
    stompClient = null;
    roomSubscriptions.clear();
    notificationSub = null;
    set({ isConnected: false, activeRoomId: null });
  },

  sendMessage: (roomId: string, content: string) => {
    if (isMock) return; // Mock: los mensajes se envían vía REST
    if (!stompClient?.active) {
      logger.warn("[chatStore] sendMessage: no conectado");
      return;
    }
    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ roomId, content }),
    });
  },

  sendTypingIndicator: (roomId: string) => {
    if (isMock) return;
    if (!stompClient?.active) return;
    stompClient.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({ roomId }),
    });
  },

  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId });
  },

  subscribeToRoom: (roomId: string, onMessage: (msg: ChatMessage) => void) => {
    // Guardar callback para acceso desde el mock
    let stompSub: StompSubscription | null = null;

    if (!isMock && get().isConnected && stompClient) {
      stompSub = stompClient.subscribe(`/topic/chat/${roomId}`, (frame) => {
        try {
          const msg = JSON.parse(frame.body) as ChatMessage;
          onMessage(msg);
        } catch (e) {
          logger.error("[chatStore] Error parseando mensaje:", e);
        }
      });
    }

    roomSubscriptions.set(roomId, { callback: onMessage, stompSub });

    return () => get().unsubscribeFromRoom(roomId);
  },

  unsubscribeFromRoom: (roomId: string) => {
    const sub = roomSubscriptions.get(roomId);
    if (sub?.stompSub) {
      sub.stompSub.unsubscribe();
    }
    roomSubscriptions.delete(roomId);
  },

  subscribeToNotifications: (
    userId: string,
    onNotification: (notification: WebSocketNotification) => void,
  ) => {
    if (isMock) return; // Mock: no hay notificaciones de servidor
    if (!stompClient?.active) {
      logger.warn("[chatStore] subscribeToNotifications: no conectado");
      return;
    }

    // Cancelar suscripción previa si existe
    notificationSub?.unsubscribe();

    notificationSub = stompClient.subscribe(
      `/topic/notifications/${userId}`,
      (frame) => {
        try {
          const notification = JSON.parse(frame.body) as WebSocketNotification;
          onNotification(notification);
        } catch (e) {
          logger.error("[chatStore] Error parseando notificación:", e);
        }
      },
    );
  },
}));
