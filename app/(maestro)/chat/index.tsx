import { View, Text } from "react-native";
import { router } from "expo-router";
import { ChatRoomList } from "@components/chat/ChatRoomList";

/**
 * Tab Chats del maestro.
 * Lista todas las salas de chat activas del maestro.
 */
export default function MaestroChatScreen() {
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-5 pt-14 pb-4 border-b border-border">
        <Text className="text-2xl font-inter-bold text-text">
          Chats
        </Text>
      </View>

      {/* Lista de rooms */}
      <ChatRoomList
        onPressRoom={(roomId) =>
          router.push(`/(maestro)/chat/${roomId}`)
        }
      />
    </View>
  );
}
