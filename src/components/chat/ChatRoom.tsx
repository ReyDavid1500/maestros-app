/**
 * Componente compartido de sala de chat.
 * Usado tanto por (client)/chat/[roomId] como por (maestro)/chat/[roomId].
 *
 * Responsabilidades:
 * - Cargar historial de mensajes (infinite scroll)
 * - Suscribirse al room en el chatStore para mensajes en tiempo real / mock
 * - Marcar como leídos al entrar
 * - Renderizar burbujas + input
 * - KeyboardAvoidingView para no tapar el input
 */

import {
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useState,
} from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@components/ui/Button";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import {
  useChatMessages,
  useSendMessage,
  useMarkRoomAsRead,
  flattenMessages,
} from "@queries/useChat";
import { useChatStore } from "@stores/chatStore";
import { useAuthStore } from "@stores/authStore";
import { queryKeys } from "@constants/queryKeys";
import { useTheme } from "@hooks/useTheme";
import type { ChatMessage, PaginatedResponse } from "@types";

// ─── Constante para gap de timestamps (5 minutos) ─────────────────────────────

const TIMESTAMP_GAP_MS = 5 * 60 * 1000;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatRoomProps {
  roomId: string;
  /** Título del header (nombre del otro participante) */
  title: string;
  onBack: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

function ChatRoomSkeleton({ onBack, title }: { onBack: () => void; title: string }) {
  const bubbles: Array<{ own: boolean; width: string }> = [
    { own: false, width: "55%" },
    { own: false, width: "70%" },
    { own: true, width: "45%" },
    { own: false, width: "60%" },
    { own: true, width: "65%" },
    { own: true, width: "40%" },
    { own: false, width: "50%" },
  ];

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-3 border-b border-border gap-2">
        <Button label="←" onPress={onBack} variant="ghost" size="sm" accessibilityLabel="Volver" />
        <SkeletonLoader width={title !== "Chat" ? 140 : 80} height={16} borderRadius={4} />
      </View>
      {/* Burbujas */}
      <View className="flex-1 px-4 pt-3 gap-2.5">
        {bubbles.map((b, i) => (
          <View key={i} className={`flex-row ${b.own ? "justify-end" : "justify-start"}`}>
            <SkeletonLoader width={b.width} height={36} borderRadius={16} />
          </View>
        ))}
      </View>
      {/* Input */}
      <View className="flex-row items-center gap-2 px-4 py-2.5 border-t border-border bg-background">
        <SkeletonLoader width="82%" height={40} borderRadius={20} />
        <SkeletonLoader width={40} height={40} borderRadius={20} />
      </View>
    </View>
  );
}

export function ChatRoom({ roomId, title, onBack }: ChatRoomProps) {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [isTypingIndicatorVisible, setIsTypingIndicatorVisible] =
    useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUser = useAuthStore((s) => s.user);
  const subscribeToRoom = useChatStore((s) => s.subscribeToRoom);
  const sendTypingIndicator = useChatStore((s) => s.sendTypingIndicator);

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(roomId);

  const sendMutation = useSendMessage(roomId);
  const markReadMutation = useMarkRoomAsRead(roomId);

  // Mensajes en orden cronológico (más antiguo primero → scroll to bottom)
  const messages = useMemo(() => flattenMessages(data), [data]);

  // ── Suscripción WebSocket / mock ─────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = subscribeToRoom(roomId, (newMsg: ChatMessage) => {
      // Agregar mensaje al caché de TanStack Query
      queryClient.setQueryData<InfiniteData<PaginatedResponse<ChatMessage>>>(
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
                content: [...firstPage.content, newMsg],
              },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      // Si no es mensaje propio: marcar como leído
      if (newMsg.senderId !== currentUser?.id) {
        markReadMutation.mutate();
      }

      // Scroll al último mensaje
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return unsubscribe;
  }, [roomId, subscribeToRoom, queryClient, currentUser?.id]);

  // ── Marcar como leído al entrar ──────────────────────────────────────────

  useEffect(() => {
    markReadMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // ── Setear room activo ───────────────────────────────────────────────────

  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  useEffect(() => {
    setActiveRoom(roomId);
    return () => setActiveRoom(null);
  }, [roomId, setActiveRoom]);

  // ── Enviar mensaje ───────────────────────────────────────────────────────

  const handleSend = useCallback(
    (content: string) => {
      sendMutation.mutate(content, {
        onSuccess: () => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        },
      });
    },
    [sendMutation]
  );

  // ── Typing indicator ────────────────────────────────────────────────────

  const handleTyping = useCallback(() => {
    sendTypingIndicator(roomId);
  }, [roomId, sendTypingIndicator]);

  // Para mostrar el indicador local (en mock mode simularemos con estado)
  const showTypingIndicator = (senderName: string) => {
    setIsTypingIndicatorVisible(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTypingIndicatorVisible(false);
    }, 3000);
  };
  void showTypingIndicator; // usado en el futuro para eventos de typing entrantes

  // ── Renderizado de mensajes ──────────────────────────────────────────────

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const isOwn = item.senderId === currentUser?.id;

      // Mostrar timestamp si hay gap de >5 min con el mensaje anterior
      const prevMsg = messages[index - 1];
      const showTimestamp =
        !prevMsg ||
        new Date(item.createdAt).getTime() -
          new Date(prevMsg.createdAt).getTime() >
          TIMESTAMP_GAP_MS;

      return (
        <MessageBubble
          message={item}
          isOwnMessage={isOwn}
          showTimestamp={showTimestamp}
        />
      );
    },
    [messages, currentUser?.id]
  );

  // ── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return <ChatRoomSkeleton onBack={onBack} title={title} />;
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-3 border-b border-border gap-2">
        <Button
          label="←"
          onPress={onBack}
          variant="ghost"
          size="sm"
          accessibilityLabel="Volver"
        />
        <View className="flex-1">
          <Text
            className="text-base font-inter-semibold text-text"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 12 }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginBottom: 8 }}
            />
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons
              name="chatbubbles-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text className="text-text-secondary font-inter text-sm mt-3 text-center px-8">
              Todavía no hay mensajes.{"\n"}¡Sé el primero en escribir!
            </Text>
          </View>
        }
        onLayout={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />

      {/* Indicador de escritura */}
      {isTypingIndicatorVisible && (
        <View className="px-4 py-1">
          <Text className="text-xs font-inter text-text-secondary italic">
            escribiendo...
          </Text>
        </View>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={sendMutation.isPending}
      />
    </KeyboardAvoidingView>
  );
}
