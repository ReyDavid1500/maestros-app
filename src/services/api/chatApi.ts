/**
 * Endpoints REST de chat.
 * Los mensajes en tiempo real llegan por WebSocket (STOMP/SockJS).
 * Este módulo cubre: listar salas, historial de mensajes y marcar como leídos.
 */

import axiosInstance from "./axiosInstance";
import type { ChatRoom, ChatMessage, PaginatedResponse } from "@types";

// ─── Functions ────────────────────────────────────────────────────────────────

/** Lista todas las salas de chat del usuario autenticado */
export async function listChatRooms(): Promise<ChatRoom[]> {
  const { data } = await axiosInstance.get<ChatRoom[]>("/chat/rooms");
  return data;
}

/** Historial de mensajes de una sala (paginado, orden DESC por defecto) */
export async function getChatMessages(
  roomId: string,
  params: { page?: number; size?: number } = {}
): Promise<PaginatedResponse<ChatMessage>> {
  const { data } = await axiosInstance.get<PaginatedResponse<ChatMessage>>(
    `/chat/rooms/${roomId}/messages`,
    { params }
  );
  return data;
}

/** Marca todos los mensajes no leídos de una sala como leídos */
export async function markRoomAsRead(roomId: string): Promise<void> {
  await axiosInstance.put(`/chat/rooms/${roomId}/read`);
}
