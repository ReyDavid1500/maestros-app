/**
 * Lista de salas de chat reutilizable por cliente y maestro.
 * Recibe `onPressRoom` para que cada layout pueda navegar a su ruta correcta.
 */

import {
  View,
  Text,
  FlatList,
  RefreshControl,
} from "react-native";
import { useChatRooms } from "@queries/useChat";
import { ChatRoomItem } from "./ChatRoomItem";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import { ErrorState } from "@components/common/ErrorState";
import { EmptyState } from "@components/common/EmptyState";

interface ChatRoomListProps {
  /** Callback al tocar un room: recibe el roomId */
  onPressRoom: (roomId: string) => void;
}

function ChatRoomListSkeleton() {
  return (
    <View className="flex-1 bg-background">
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i}>
          <View className="flex-row items-center px-4 py-3 gap-3">
            <SkeletonLoader width={40} height={40} borderRadius={20} />
            <View className="flex-1 gap-1.5">
              <SkeletonLoader width={130} height={14} borderRadius={4} />
              <SkeletonLoader width="75%" height={12} borderRadius={4} />
            </View>
            <SkeletonLoader width={36} height={11} borderRadius={4} />
          </View>
          {i < 5 && <View className="h-px bg-border mx-4" />}
        </View>
      ))}
    </View>
  );
}

export function ChatRoomList({ onPressRoom }: ChatRoomListProps) {
  const { data: rooms, isLoading, isError, refetch, isFetching } = useChatRooms();

  if (isLoading) {
    return <ChatRoomListSkeleton />;
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background">
        <ErrorState
          message="No se pudieron cargar los chats."
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState
          icon="chatbubbles-outline"
          title="Sin conversaciones"
          message="Cuando inicies un chat desde una solicitud, aparecerá aquí."
        />
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(r) => r.roomId}
      renderItem={({ item }) => (
        <ChatRoomItem
          room={item}
          onPress={() => onPressRoom(item.roomId)}
        />
      )}
      ItemSeparatorComponent={() => (
        <View className="h-px bg-border mx-4" />
      )}
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={() => void refetch()}
        />
      }
      contentContainerStyle={{ flexGrow: 1 }}
      className="flex-1 bg-background"
    />
  );
}
