import { router, useLocalSearchParams } from "expo-router";
import { useChatRooms } from "@queries/useChat";
import { ChatRoom } from "@components/chat/ChatRoom";
import { goBack } from "@utils/navigation";

/**
 * Pantalla de sala de chat del cliente.
 * Extrae el nombre del otro participante desde la lista de rooms para el header.
 */
export default function ClientChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { data: rooms } = useChatRooms();

  const room = rooms?.find((r) => r.roomId === roomId);
  const title = room?.otherParticipant.name ?? "Chat";

  if (!roomId || roomId === "undefined") return null;

  return (
    <ChatRoom
      roomId={roomId}
      title={title}
      onBack={() => goBack("/(client)/chat")}
    />
  );
}
