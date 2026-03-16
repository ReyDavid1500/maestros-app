import { View, Text, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@stores/authStore";
import {
  useServiceRequests,
  useAcceptServiceRequest,
  useRejectServiceRequest,
  flattenServiceRequests,
} from "@queries/useServiceRequests";
import { JobCard } from "@components/request/JobCard";
import { IncomingRequestCard } from "@components/request/IncomingRequestCard";
import { EmptyState } from "@components/common/EmptyState";
import { SkeletonLoader } from "@components/common/SkeletonLoader";

/**
 * Tab Trabajos del maestro.
 * Sección 1: Solicitudes nuevas (PENDING) con botones de acción directos.
 * Sección 2: Trabajos en curso (ACCEPTED | IN_PROGRESS) con acceso al detalle.
 */
function MaestroHomeSkeleton() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-14 pb-4">
        <SkeletonLoader width={200} height={28} borderRadius={6} />
        <View className="mt-1.5">
          <SkeletonLoader width={160} height={14} borderRadius={4} />
        </View>
      </View>
      <View className="px-5 mb-2">
        <View className="mb-3">
          <SkeletonLoader width={140} height={18} borderRadius={4} />
        </View>
        {[1, 2].map((i) => (
          <View key={i} className="bg-surface rounded-2xl p-4 mb-3">
            <View className="flex-row items-center gap-3 mb-3">
              <SkeletonLoader width={40} height={40} borderRadius={20} />
              <View className="flex-1 gap-1.5">
                <SkeletonLoader width={130} height={14} borderRadius={4} />
                <SkeletonLoader width={90} height={12} borderRadius={4} />
              </View>
              <SkeletonLoader width={60} height={24} borderRadius={12} />
            </View>
            <View className="flex-row gap-2">
              <SkeletonLoader width="47%" height={36} borderRadius={10} />
              <SkeletonLoader width="47%" height={36} borderRadius={10} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function MaestroHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch, isRefetching } = useServiceRequests();

  const acceptMutation = useAcceptServiceRequest();
  const rejectMutation = useRejectServiceRequest();

  const all = flattenServiceRequests(data);
  const pending = all.filter((r) => r.status === "PENDING");
  const active = all.filter((r) =>
    (["ACCEPTED", "IN_PROGRESS"] as const).includes(
      r.status as "ACCEPTED" | "IN_PROGRESS"
    )
  );

  if (isLoading) {
    return <MaestroHomeSkeleton />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
        />
      }
    >
      {/* Header */}
      <View className="px-5 pt-14 pb-4">
        <Text className="text-2xl font-inter-bold text-text">
          ¡Hola, {user?.name.split(" ")[0] ?? "Maestro"}!
        </Text>
        <Text className="text-sm font-inter text-text-secondary mt-1">
          {pending.length > 0
            ? `Tienes ${pending.length} solicitud${pending.length > 1 ? "es" : ""} nueva${pending.length > 1 ? "s" : ""}`
            : "No tienes solicitudes nuevas"}
        </Text>
      </View>

      {/* Sección: Solicitudes nuevas */}
      <View className="px-5 mb-2">
        <Text className="text-base font-inter-semibold text-text mb-3">
          Solicitudes nuevas
        </Text>
        {pending.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="Sin solicitudes pendientes"
            message="Cuando un cliente te solicite un servicio, aparecerá aquí."
          />
        ) : (
          pending.map((request) => (
            <IncomingRequestCard
              key={request.id}
              request={request}
              onAccept={() => acceptMutation.mutate(request.id)}
              onReject={() => rejectMutation.mutate({ id: request.id })}
              onViewDetail={() =>
                router.push(`/(maestro)/request/${request.id}`)
              }
            />
          ))
        )}
      </View>

      {/* Sección: Trabajos en curso (solo si hay) */}
      {active.length > 0 && (
        <View className="px-5 mb-8">
          <Text className="text-base font-inter-semibold text-text mb-3">
            Trabajos en curso
          </Text>
          {active.map((request) => (
            <JobCard
              key={request.id}
              request={request}
              onPress={() => router.push(`/(maestro)/job/${request.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
