/**
 * Hooks de TanStack Query para chat.
 * Los mensajes en tiempo real se integran desde el WebSocket store (Phase 5).
 */

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { queryKeys } from "@constants/queryKeys";
import {
  listChatRooms,
  getChatMessages,
  markRoomAsRead,
} from "@services/api/chatApi";
import { useChatStore } from "@stores/chatStore";
import { useAuthStore } from "@stores/authStore";
import type { ChatRoom, ChatMessage, PaginatedResponse } from "@types";

// ─── Salas de chat ─────────────────────────────────────────────────────────────

export function useChatRooms() {
  return useQuery({
    queryKey: queryKeys.chat.rooms,
    queryFn: listChatRooms,
    refetchInterval: 30_000, // Polling cada 30s hasta tener WebSocket en Phase 7
  });
}

// ─── Mensajes (infinite scroll hacia atrás) ───────────────────────────────────

export function useChatMessages(roomId: string) {
  return useInfiniteQuery<
    PaginatedResponse<ChatMessage>,
    Error,
    InfiniteData<PaginatedResponse<ChatMessage>>,
    ReturnType<typeof queryKeys.chat.messages>,
    number
  >({
    queryKey: queryKeys.chat.messages(roomId),
    queryFn: ({ pageParam }) =>
      getChatMessages(roomId, { page: pageParam, size: 50 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    enabled: !!roomId,
    staleTime: 1000 * 60, // 1 minuto — se actualiza desde WS en Phase 7
  });
}

// ─── Enviar mensaje ────────────────────────────────────────────────────────────

export function useSendMessage(roomId: string) {
  const qc = useQueryClient();
  const sendViaWs = useChatStore((s) => s.sendMessage);
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (content: string) => {
      // Los mensajes se envían por WebSocket (STOMP); no hay endpoint REST
      sendViaWs(roomId, content);
      // Retornar mensaje optimista local para actualizar la UI de inmediato
      const optimistic: ChatMessage = {
        id: `temp-${Date.now()}`,
        roomId,
        senderId: user?.id ?? "",
        senderRole: user?.role ?? "CLIENT",
        content,
        createdAt: new Date().toISOString(),
        read: false,
      };
      return Promise.resolve(optimistic);
    },
    onSuccess: (newMessage) => {
      // Optimistic update: añade el mensaje al final de la primera página
      qc.setQueryData<InfiniteData<PaginatedResponse<ChatMessage>>>(
        queryKeys.chat.messages(roomId),
        (old) => {
          if (!old) return old;
          const firstPage = old.pages[0];
          if (!firstPage) return old;
          return {
            ...old,
            pages: [
              {
                ...firstPage,
                content: [...firstPage.content, newMessage],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );
      // Actualiza lastMessage en la lista de salas
      qc.setQueryData<ChatRoom[]>(queryKeys.chat.rooms, (old) => {
        if (!old) return old;
        return old.map((room) =>
          room.roomId === roomId
            ? { ...room, lastMessage: newMessage, unreadCount: 0 }
            : room
        );
      });
    },
  });
}

// ─── Marcar sala como leída ────────────────────────────────────────────────────

export function useMarkRoomAsRead(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markRoomAsRead(roomId),
    onSuccess: () => {
      qc.setQueryData<ChatRoom[]>(queryKeys.chat.rooms, (old) => {
        if (!old) return old;
        return old.map((room) =>
          room.roomId === roomId ? { ...room, unreadCount: 0 } : room
        );
      });
    },
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Aplana todas las páginas a un array plano de mensajes en orden cronológico */
export function flattenMessages(
  data: InfiniteData<PaginatedResponse<ChatMessage>> | undefined
): ChatMessage[] {
  if (!data) return [];
  // Las páginas vienen de más nuevas a más viejas; invertimos para cronológico
  return [...data.pages].reverse().flatMap((p) => p.content);
}

/** Número total de mensajes no leídos en todas las salas */
export function totalUnread(rooms: ChatRoom[] | undefined): number {
  return rooms?.reduce((acc, r) => acc + r.unreadCount, 0) ?? 0;
}
