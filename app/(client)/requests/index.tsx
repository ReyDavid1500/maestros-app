import { useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useServiceRequests, flattenServiceRequests } from "@queries/useServiceRequests";
import { RequestCard } from "@components/request/RequestCard";
import { EmptyState } from "@components/common/EmptyState";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import { useTheme } from "@hooks/useTheme";
import type { ServiceRequest } from "@types";

type Tab = "activas" | "historial";

const ACTIVE_STATUSES = new Set(["PENDING", "ACCEPTED", "IN_PROGRESS"]);
const HISTORY_STATUSES = new Set(["COMPLETED", "CANCELLED", "REJECTED"]);

function RequestsListSkeleton() {
  return (
    <View className="px-5">
      {[1, 2, 3].map((i) => (
        <View key={i} className="bg-surface rounded-2xl p-4 mb-3">
          <View className="flex-row items-center gap-3 mb-2.5">
            <SkeletonLoader width={40} height={40} borderRadius={20} />
            <View className="flex-1 gap-1.5">
              <SkeletonLoader width={130} height={14} borderRadius={4} />
              <SkeletonLoader width={80} height={12} borderRadius={4} />
            </View>
            <SkeletonLoader width={60} height={22} borderRadius={11} />
          </View>
          <SkeletonLoader width="100%" height={12} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

export default function ClientRequestsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("activas");
  const { colors } = useTheme();

  const { data, isLoading, refetch } = useServiceRequests();
  const all = flattenServiceRequests(data);

  const filtered: ServiceRequest[] = all.filter((r) =>
    activeTab === "activas"
      ? ACTIVE_STATUSES.has(r.status)
      : HISTORY_STATUSES.has(r.status)
  );

  const TabButton = ({ tab, label }: { tab: Tab; label: string }) => (
    <Pressable
      className="flex-1 py-2.5 items-center rounded-xl active:opacity-75"
      style={{
        backgroundColor: activeTab === tab ? colors.primary : "transparent",
      }}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        className="text-sm font-inter-medium"
        style={{ color: activeTab === tab ? "white" : colors.textSecondary }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-14 pb-4">
        <Text className="text-2xl font-inter-bold text-text">
          Mis servicios
        </Text>
      </View>

      {/* Tabs */}
      <View
        className="mx-5 mb-4 flex-row rounded-xl p-1"
        style={{ backgroundColor: colors.surface }}
      >
        <TabButton tab="activas" label="En curso" />
        <TabButton tab="historial" label="Historial" />
      </View>

      {/* Lista */}
      {isLoading ? (
        <RequestsListSkeleton />
      ) : filtered.length === 0 ? (
        activeTab === "activas" ? (
          <EmptyState
            icon="hourglass-outline"
            title="Sin solicitudes activas"
            message="No tienes solicitudes pendientes o en curso. ¡Contrata a un maestro!"
            actionLabel="Buscar maestros"
            onAction={() => router.push("/(client)")}
          />
        ) : (
          <EmptyState
            icon="archive-outline"
            title="Sin historial"
            message="Aquí verás tus solicitudes completadas y canceladas."
          />
        )
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <RequestCard
              request={item}
              onPress={() => router.push(`/(client)/request/${item.id}`)}
            />
          )}
          onRefresh={() => void refetch()}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}
