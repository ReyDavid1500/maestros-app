/**
 * Fábrica del cliente STOMP sobre SockJS.
 * Se usa cuando EXPO_PUBLIC_USE_MOCK != "true" y hay un token válido.
 *
 * En modo mock el chatStore no llama a esta función; simula la conexión
 * con datos locales y timeouts.
 */

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { logger } from "@utils/logger";

export const createStompClient = (token: string): Client => {
  const wsUrl =
    process.env["EXPO_PUBLIC_WS_URL"] ?? "http://localhost:8080/ws";

  const client = new Client({
    // SockJS se usa como transporte para los backends Spring Boot
    // que exponen un endpoint /ws con SockJS habilitado.
    webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    heartbeatIncoming: 25_000,
    heartbeatOutgoing: 25_000,
    reconnectDelay: 5_000,
    onConnect: () => {
      logger.debug("[stompClient] WebSocket conectado");
    },
    onDisconnect: () => {
      logger.debug("[stompClient] WebSocket desconectado");
    },
    onStompError: (frame) => {
      logger.error("[stompClient] Error STOMP:", frame.headers["message"]);
    },
    onWebSocketError: (event) => {
      logger.error("[stompClient] Error WebSocket:", event);
    },
  });

  return client;
};
