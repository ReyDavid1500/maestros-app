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

/**
 * Envía un mensaje de texto.
 * En producción los mensajes se envían también por WebSocket (STOMP SEND),
 * pero este endpoint REST sirve como fallback y para persistencia inmediata.
 */
export async function sendMessage(
  roomId: string,
  content: string
): Promise<ChatMessage> {
  const { data } = await axiosInstance.post<ChatMessage>(
    `/chat/rooms/${roomId}/messages`,
    { content }
  );
  return data;
}

/** Marca todos los mensajes no leídos de una sala como leídos */
export async function markRoomAsRead(roomId: string): Promise<void> {
  await axiosInstance.post(`/chat/rooms/${roomId}/read`);
}
