import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { goBack } from "@utils/navigation";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useServiceRequest, useCancelServiceRequest } from "@queries/useServiceRequests";
import { RequestStatusBadge } from "@components/request/RequestStatusBadge";
import { RequestTimeline } from "@components/request/RequestTimeline";
import { Avatar } from "@components/ui/Avatar";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import { formatDate } from "@utils/formatDate";
import { useTheme } from "@hooks/useTheme";

function RequestDetailSkeleton({ colors }: { colors: ReturnType<typeof useTheme>["colors"] }) {
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 gap-3">
        <View className="w-10 h-10 rounded-full" style={{ backgroundColor: colors.surface }} />
        <SkeletonLoader width={160} height={22} borderRadius={6} />
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        {/* Status badge */}
        <View className="items-center py-6">
          <SkeletonLoader width={120} height={32} borderRadius={16} />
        </View>
        {/* Maestro card */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="flex-row items-center gap-3">
            <SkeletonLoader width={48} height={48} borderRadius={24} />
            <View className="flex-1 gap-2">
              <SkeletonLoader width={140} height={16} borderRadius={4} />
              <SkeletonLoader width={60} height={12} borderRadius={4} />
            </View>
            <SkeletonLoader width={64} height={32} borderRadius={12} />
          </View>
        </View>
        {/* Info card */}
        <View className="bg-surface rounded-2xl p-4 mb-4 gap-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="flex-row items-start gap-2">
              <SkeletonLoader width={16} height={16} borderRadius={4} />
              <View className="flex-1 gap-1.5">
                <SkeletonLoader width={100} height={11} borderRadius={4} />
                <SkeletonLoader width="80%" height={14} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
        {/* Timeline card */}
        <View className="bg-surface rounded-2xl p-4 mb-4 gap-3">
          <SkeletonLoader width={140} height={14} borderRadius={4} />
          {[1, 2].map((i) => (
            <View key={i} className="flex-row items-center gap-3">
              <SkeletonLoader width={12} height={12} borderRadius={6} />
              <SkeletonLoader width="70%" height={12} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: sr, isLoading, isError, refetch } = useServiceRequest(id ?? "");
  const cancelRequest = useCancelServiceRequest();
  const { colors } = useTheme();

  if (isLoading) return <RequestDetailSkeleton colors={colors} />;
  if (isError || !sr) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-text-secondary font-inter text-center">
          No se pudo cargar la solicitud.
        </Text>
        <Pressable className="mt-4" onPress={() => void refetch()}>
          <Text className="text-primary font-inter-semibold">Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const handleCancel = () => {
    const doCancel = () =>
      cancelRequest.mutate({ id: sr.id }, { onSuccess: () => void refetch() });

    if (Platform.OS === "web") {
      if (window.confirm("¿Deseas cancelar esta solicitud?")) doCancel();
      return;
    }
    Alert.alert(
      "Cancelar solicitud",
      "¿Estás seguro que deseas cancelar esta solicitud?",
      [
        { text: "No, mantener", style: "cancel" },
        { text: "Sí, cancelar", style: "destructive", onPress: doCancel },
      ]
    );
  };

  const handleRate = () => {
    router.push(
      `/modal/rating?serviceRequestId=${sr.id}&maestroName=${encodeURIComponent(sr.maestro.name)}`
    );
  };

  const handleChat = () => {
    router.push(`/(client)/chat/${sr.roomId}`);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 gap-3">
        <Pressable
          className="w-10 h-10 items-center justify-center rounded-full active:opacity-60"
          style={{ backgroundColor: colors.surface }}
          onPress={() => goBack("/(client)/requests")}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text className="text-xl font-inter-bold text-text">
          Detalle de solicitud
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {/* Estado prominente */}
        <View className="items-center py-6">
          <RequestStatusBadge status={sr.status} />
        </View>

        {/* Maestro + chatear */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="flex-row items-center gap-3">
            <Avatar uri={sr.maestro.photoUrl} name={sr.maestro.name} size="md" />
            <View className="flex-1">
              <Text className="text-base font-inter-semibold text-text">
                {sr.maestro.name}
              </Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text className="text-xs font-inter text-text-secondary">
                  {sr.maestro.averageRating.toFixed(1)}
                </Text>
              </View>
            </View>
            <Pressable
              className="flex-row items-center gap-1.5 bg-primary/15 rounded-xl px-3 py-2 active:opacity-75"
              onPress={handleChat}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
              <Text className="text-xs font-inter-medium text-primary">Chat</Text>
            </Pressable>
          </View>
        </View>

        {/* Info de la visita */}
        <View className="bg-surface rounded-2xl p-4 mb-4 gap-3">
          <View className="flex-row items-start gap-2">
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <View>
              <Text className="text-xs font-inter text-text-secondary">Fecha y hora agendada</Text>
              <Text className="text-sm font-inter-medium text-text">
                {formatDate(sr.scheduledAt)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-2">
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <View className="flex-1">
              <Text className="text-xs font-inter text-text-secondary">Dirección</Text>
              <Text className="text-sm font-inter-medium text-text">
                {sr.address.street} {sr.address.number}, {sr.address.city}
              </Text>
              {sr.address.additionalInstructions ? (
                <Text className="text-xs font-inter text-text-secondary">
                  {sr.address.additionalInstructions}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="flex-row items-start gap-2">
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <View className="flex-1">
              <Text className="text-xs font-inter text-text-secondary">Descripción</Text>
              <Text className="text-sm font-inter text-text-secondary">
                {sr.description}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-sm font-inter-semibold text-text mb-3">
            Historial de estados
          </Text>
          <RequestTimeline request={sr} />
        </View>
      </ScrollView>

      {/* Botones condicionales */}
      {(sr.status === "PENDING" || sr.status === "COMPLETED") && (
        <View
          className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-background/95"
          style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        >
          {sr.status === "PENDING" && (
            <Pressable
              className="w-full rounded-2xl py-4 items-center active:opacity-80"
              style={{ backgroundColor: colors.error }}
              onPress={handleCancel}
            >
              <Text className="text-white font-inter-semibold">
                Cancelar solicitud
              </Text>
            </Pressable>
          )}

          {sr.status === "COMPLETED" && (
            <Pressable
              className="w-full bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-80"
              onPress={handleRate}
            >
              <Ionicons name="star-outline" size={18} color="white" />
              <Text className="text-white font-inter-semibold">
                Calificar al maestro
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
