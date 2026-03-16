import { View, Text, ScrollView, Alert, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { goBack } from "@utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import {
  useServiceRequest,
  useStartServiceRequest,
  useCompleteServiceRequest,
} from "@queries/useServiceRequests";
import { Avatar } from "@components/ui/Avatar";
import { Button } from "@components/ui/Button";
import { RequestStatusBadge } from "@components/request/RequestStatusBadge";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import { ErrorState } from "@components/common/ErrorState";
import { formatDate } from "@utils/formatDate";
import { useTheme } from "@hooks/useTheme";
import { useThrottledAction } from "@hooks/useThrottledAction";

/**
 * Detalle de un trabajo aceptado (estado ACCEPTED o IN_PROGRESS).
 * Permite al maestro marcar el trabajo como iniciado o completado.
 */
function JobDetailSkeleton() {
  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-5 pt-14 pb-4 gap-3">
        <SkeletonLoader width={60} height={32} borderRadius={8} />
        <SkeletonLoader width={80} height={22} borderRadius={11} />
      </View>
      <View className="px-5 mb-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <SkeletonLoader width={52} height={52} borderRadius={26} />
            <View className="gap-1.5">
              <SkeletonLoader width={60} height={11} borderRadius={4} />
              <SkeletonLoader width={140} height={22} borderRadius={6} />
            </View>
          </View>
          <SkeletonLoader width={64} height={32} borderRadius={10} />
        </View>
      </View>
      <View className="px-5 mb-4">
        <SkeletonLoader width={130} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={80} borderRadius={12} />
      </View>
      <View className="px-5 mb-4">
        <SkeletonLoader width={140} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={70} borderRadius={12} />
      </View>
      <View className="px-5 mb-4">
        <SkeletonLoader width={100} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={44} borderRadius={12} />
      </View>
    </View>
  );
}

export default function MaestroJobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const { data: request, isLoading, isError, refetch } = useServiceRequest(id ?? "");
  const startMutation = useStartServiceRequest();
  const completeMutation = useCompleteServiceRequest();

  const [throttledStart] = useThrottledAction(() => {
    if (!request) return;
    startMutation.mutate(request.id);
  }, 3000);

  const handleComplete = () => {
    if (!request) return;
    Alert.alert(
      "Completar trabajo",
      "¿Confirmas que el trabajo fue completado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            completeMutation.mutate(request.id, {
              onSuccess: () => router.replace("/(maestro)"),
            });
          },
        },
      ]
    );
  };

  const openMaps = () => {
    if (!request) return;
    const { street, number, city } = request.address;
    const query = encodeURIComponent(`${street} ${number}, ${city}`);
    void Linking.openURL(`https://maps.google.com/?q=${query}`);
  };

  if (isLoading) {
    return <JobDetailSkeleton />;
  }

  if (isError || !request) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-5 pt-14 pb-2">
          <Button
            label="← Volver"
            onPress={() => goBack("/(maestro)")}
            variant="ghost"
            size="sm"
          />
        </View>
        <ErrorState
          message="No se pudo cargar el trabajo."
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  const isAccepted = request.status === "ACCEPTED";
  const isInProgress = request.status === "IN_PROGRESS";

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Header */}
        <View className="px-5 pt-14 pb-4 flex-row items-center gap-3">
          <Button
            label="← Volver"
            onPress={() => goBack("/(maestro)")}
            variant="ghost"
            size="sm"
          />
          <RequestStatusBadge status={request.status} />
        </View>

        {/* Cliente + botón chat */}
        <View className="px-5 mb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <Avatar
                uri={request.client.photoUrl}
                name={request.client.name}
                size="lg"
              />
              <View className="flex-1">
                <Text className="text-xs font-inter text-text-secondary uppercase tracking-wide">
                  Cliente
                </Text>
                <Text className="text-xl font-inter-bold text-text mt-0.5">
                  {request.client.name}
                </Text>
              </View>
            </View>
            <Button
              label="Chat"
              onPress={() => router.push(`/(maestro)/chat/${request.id}`)}
              variant="secondary"
              size="sm"
              accessibilityLabel="Chatear con el cliente"
            />
          </View>
        </View>

        {/* Dirección + enlace a Google Maps */}
        <View className="px-5 mb-4">
          <Text className="text-xs font-inter text-text-secondary uppercase tracking-wide mb-1.5">
            Dirección del trabajo
          </Text>
          <View className="bg-surface rounded-xl px-4 py-3">
            <View className="flex-row items-start gap-2 mb-2">
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.textSecondary}
                style={{ marginTop: 1 }}
              />
              <Text className="text-sm font-inter text-text flex-1">
                {request.address.street} {request.address.number},{" "}
                {request.address.city}
              </Text>
            </View>
            {request.address.additionalInstructions ? (
              <View className="flex-row items-start gap-2 mb-2">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.textSecondary}
                  style={{ marginTop: 1 }}
                />
                <Text className="text-sm font-inter text-text-secondary flex-1">
                  {request.address.additionalInstructions}
                </Text>
              </View>
            ) : null}
            <Button
              label="Abrir en Google Maps"
              onPress={openMaps}
              variant="ghost"
              size="sm"
              accessibilityLabel="Abrir dirección en Google Maps"
            />
          </View>
        </View>

        {/* Descripción */}
        <View className="px-5 mb-4">
          <Text className="text-xs font-inter text-text-secondary uppercase tracking-wide mb-1.5">
            Descripción del trabajo
          </Text>
          <View className="bg-surface rounded-xl px-4 py-3">
            <Text className="text-sm font-inter text-text leading-6">
              {request.description}
            </Text>
          </View>
        </View>

        {/* Fecha agendada */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-inter text-text-secondary uppercase tracking-wide mb-1.5">
            Fecha agendada
          </Text>
          <View className="bg-surface rounded-xl px-4 py-3 flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text className="text-sm font-inter-semibold text-text">
              {formatDate(request.scheduledAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón de acción según estado */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-5 pt-4 pb-8">
        {isAccepted && (
          <Button
            label="Marcar como iniciado"
            onPress={throttledStart}
            variant="primary"
            size="lg"
            fullWidth
            loading={startMutation.isPending}
            accessibilityLabel="Marcar trabajo como iniciado"
          />
        )}
        {isInProgress && (
          <Button
            label="Marcar como completado"
            onPress={handleComplete}
            variant="primary"
            size="lg"
            fullWidth
            loading={completeMutation.isPending}
            accessibilityLabel="Marcar trabajo como completado"
          />
        )}
      </View>
    </View>
  );
}
