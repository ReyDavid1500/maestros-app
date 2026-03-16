import { useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { goBack } from "@utils/navigation";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useMaestros, useMaestrosSearch } from "@queries/useMaestros";
import { MaestroCard } from "@components/maestro/MaestroCard";
import { MaestroCardSkeleton } from "@components/maestro/MaestroCardSkeleton";
import { EmptyState } from "@components/common/EmptyState";
import { ErrorState } from "@components/common/ErrorState";
import { useTheme } from "@hooks/useTheme";
import type { MaestroListItem, PaginatedResponse } from "@types";

/**
 * Pantalla de resultados de búsqueda.
 * Acepta ?q= (texto libre) o ?categoryId=&categoryName= (filtro por categoría).
 */
export default function ResultsScreen() {
  const { q, categoryId, categoryName } = useLocalSearchParams<{
    q?: string;
    categoryId?: string;
    categoryName?: string;
  }>();
  const { colors } = useTheme();

  // Elegir hook según tipo de búsqueda
  const isTextSearch = !!q && q.trim().length > 0;

  const categoryQuery = useMaestros(
    isTextSearch ? {} : categoryId ? { categoryId } : {}
  );
  const searchQuery = useMaestrosSearch(q ?? "");

  const activeQuery = isTextSearch ? searchQuery : categoryQuery;
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    activeQuery;

  const maestros: MaestroListItem[] =
    data?.pages.flatMap((p) => p.content) ?? [];

  const title = isTextSearch
    ? `"${q}"`
    : (categoryName ?? "Resultados");

  const handleMaestroPress = useCallback((id: string) => {
    router.push(`/(client)/maestro/${id}`);
  }, []);

  if (isError) {
    return (
      <ErrorState
        message="No pudimos cargar los maestros. Verifica tu conexión."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 gap-3">
        <Pressable
          className="w-10 h-10 items-center justify-center rounded-full active:opacity-60"
          style={{ backgroundColor: colors.surface }}
          onPress={() => goBack("/(client)")}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-xl font-inter-bold text-text" numberOfLines={1}>
            {title}
          </Text>
          {!isLoading && (
            <Text className="text-xs font-inter text-text-secondary">
              {maestros.length} resultado{maestros.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>

      {/* Lista */}
      {isLoading ? (
        <View className="px-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <MaestroCardSkeleton key={i} />
          ))}
        </View>
      ) : maestros.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Sin resultados"
          message="No encontramos maestros para esta búsqueda. Intenta con otro término o categoría."
          actionLabel="Explorar categorías"
          onAction={() => router.replace("/(client)")}
        />
      ) : (
        <FlatList
          data={maestros}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <MaestroCard
              maestro={item}
              onPress={() => handleMaestroPress(item.id)}
            />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          onRefresh={() => void refetch()}
          refreshing={isLoading}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}
