import { View, Text } from "react-native";
import { router } from "expo-router";
import { ChatRoomList } from "@components/chat/ChatRoomList";

/**
 * Tab Chats del cliente.
 * Lista todas las salas de chat activas del usuario.
 */
export default function ClientChatScreen() {
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
          router.push(`/(client)/chat/${roomId}`)
        }
      />
    </View>
  );
}
