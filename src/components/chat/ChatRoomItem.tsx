/**
 * Ítem de una sala de chat en la lista.
 * Muestra: avatar + nombre + último mensaje + tiempo + badge de no leídos.
 */

import { View, Text, TouchableOpacity } from "react-native";
import { Avatar } from "@components/ui/Avatar";
import { formatRelative } from "@utils/formatDate";
import type { ChatRoom } from "@types";

interface ChatRoomItemProps {
  room: ChatRoom;
  onPress: () => void;
}

export function ChatRoomItem({ room, onPress }: ChatRoomItemProps) {
  const { otherParticipant, lastMessage, unreadCount } = room;
  const hasUnread = unreadCount > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`Chat con ${otherParticipant.name}`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center px-4 py-3 gap-3 bg-background">
        {/* Avatar con badge */}
        <View className="relative">
          <Avatar
            uri={otherParticipant.photoUrl}
            name={otherParticipant.name}
            size="md"
          />
          {hasUnread && (
            <View
              className="absolute -top-1 -right-1 bg-primary rounded-full items-center justify-center"
              style={{ minWidth: 20, height: 20, paddingHorizontal: 4 }}
            >
              <Text className="text-white text-xs font-inter-bold leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text
            className={`text-sm ${
              hasUnread ? "font-inter-bold" : "font-inter-semibold"
            } text-text`}
            numberOfLines={1}
          >
            {otherParticipant.name}
          </Text>
          <Text
            className={`text-xs mt-0.5 ${
              hasUnread
                ? "font-inter-semibold text-text"
                : "font-inter text-text-secondary"
            }`}
            numberOfLines={1}
          >
            {lastMessage?.content ?? "Sin mensajes aún"}
          </Text>
        </View>

        {/* Tiempo */}
        {lastMessage && (
          <Text className="text-xs font-inter text-text-secondary">
            {formatRelative(lastMessage.createdAt)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
