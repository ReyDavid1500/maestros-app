import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { goBack } from "@utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import {
  useServiceRequest,
  useAcceptServiceRequest,
  useRejectServiceRequest,
} from "@queries/useServiceRequests";
import { Avatar } from "@components/ui/Avatar";
import { Button } from "@components/ui/Button";
import { RequestStatusBadge } from "@components/request/RequestStatusBadge";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import { ErrorState } from "@components/common/ErrorState";
import { formatDate, formatDateShort } from "@utils/formatDate";
import { useTheme } from "@hooks/useTheme";
import { useThrottledAction } from "@hooks/useThrottledAction";

/**
 * Detalle completo de una solicitud entrante para que el maestro decida si acepta.
 * Muestra toda la información, incluyendo dirección completa.
 */
function IncomingRequestSkeleton() {
  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-5 pt-14 pb-4 gap-3">
        <SkeletonLoader width={60} height={32} borderRadius={8} />
        <SkeletonLoader width={80} height={22} borderRadius={11} />
      </View>
      <View className="px-5 mb-5">
        <View className="flex-row items-center gap-3">
          <SkeletonLoader width={52} height={52} borderRadius={26} />
          <View className="flex-1 gap-1.5">
            <SkeletonLoader width={60} height={11} borderRadius={4} />
            <SkeletonLoader width={140} height={22} borderRadius={6} />
          </View>
        </View>
      </View>
      <View className="px-5 mb-4">
        <SkeletonLoader width={110} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={50} borderRadius={12} />
      </View>
      <View className="px-5 mb-4">
        <SkeletonLoader width={140} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={80} borderRadius={12} />
      </View>
      <View className="px-5 mb-4">
        <SkeletonLoader width={70} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={50} borderRadius={12} />
      </View>
      <View className="px-5 mb-4">
        <SkeletonLoader width={130} height={11} borderRadius={4} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="100%" height={44} borderRadius={12} />
      </View>
    </View>
  );
}

export default function MaestroIncomingRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const { data: request, isLoading, isError, refetch } = useServiceRequest(id ?? "");
  const acceptMutation = useAcceptServiceRequest();
  const rejectMutation = useRejectServiceRequest();

  const [throttledAccept, isAccepting] = useThrottledAction(() => {
    if (!request) return;
    acceptMutation.mutate(request.id, {
      onSuccess: () => router.replace(`/(maestro)/job/${request.id}`),
    });
  }, 3000);

  const handleReject = () => {
    if (!request) return;
    Alert.alert(
      "Rechazar solicitud",
      "¿Seguro que quieres rechazar este trabajo? No podrás deshacerlo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: () => {
            rejectMutation.mutate(
              { id: request.id },
              { onSuccess: () => router.back() }
            );
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <IncomingRequestSkeleton />;
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
          message="No se pudo cargar la solicitud."
          onRetry={() => void refetch()}
        />
      </View>
    );
  }

  // Precio del servicio del maestro para esta categoría (si está disponible)
  const servicePrice = request.maestro
    ? undefined
    : undefined; // Se puede ampliar cuando el MaestroProfile esté disponible

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Header de navegación */}
        <View className="px-5 pt-14 pb-4 flex-row items-center gap-3">
          <Button
            label="← Volver"
            onPress={() => goBack("/(maestro)")}
            variant="ghost"
            size="sm"
          />
          <RequestStatusBadge status={request.status} size="sm" />
        </View>

        {/* Cliente */}
        <View className="px-5 mb-5">
          <View className="flex-row items-center gap-3">
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
        </View>

        {/* Categoría */}
        <View className="px-5 mb-4">
          <Text className="text-xs font-inter text-text-secondary uppercase tracking-wide mb-1.5">
            Servicio solicitado
          </Text>
          <View className="flex-row items-center gap-2 bg-surface rounded-xl px-4 py-3">
            <Ionicons
              name={request.serviceCategory.iconName as keyof typeof Ionicons.glyphMap}
              size={22}
              color={colors.primary}
            />
            <Text className="text-base font-inter-semibold text-text">
              {request.serviceCategory.name}
            </Text>
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

        {/* Dirección completa */}
        <View className="px-5 mb-4">
          <Text className="text-xs font-inter text-text-secondary uppercase tracking-wide mb-1.5">
            Dirección
          </Text>
          <View className="bg-surface rounded-xl px-4 py-3 gap-1">
            <View className="flex-row items-start gap-2">
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
              <View className="flex-row items-start gap-2 mt-1">
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
          </View>
        </View>

        {/* Fecha y hora sugerida */}
        <View className="px-5 mb-4">
          <Text className="text-xs font-inter text-text-secondary uppercase tracking-wide mb-1.5">
            Fecha y hora sugerida
          </Text>
          <View className="bg-surface rounded-xl px-4 py-3 flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text className="text-sm font-inter-semibold text-text">
              {formatDate(request.scheduledAt)}
            </Text>
          </View>
        </View>

        {/* Solicitud recibida */}
        <View className="px-5 mb-6">
          <Text className="text-xs font-inter text-text-secondary text-center">
            Solicitud recibida el {formatDateShort(request.createdAt)}
          </Text>
        </View>
      </ScrollView>

      {/* Botones fijos en la parte inferior */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-5 pt-4 pb-8 gap-3">
        <Button
          label="Aceptar trabajo"
          onPress={throttledAccept}
          variant="primary"
          size="lg"
          fullWidth
          loading={isAccepting || acceptMutation.isPending}
          accessibilityLabel="Aceptar trabajo"
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Chatear con cliente"
              onPress={() =>
                router.push(`/(maestro)/chat/${request.id}`)
              }
              variant="secondary"
              size="md"
              fullWidth
              accessibilityLabel="Chatear con el cliente"
            />
          </View>
          <View className="flex-1">
            <Button
              label="Rechazar"
              onPress={handleReject}
              variant="danger"
              size="md"
              fullWidth
              loading={rejectMutation.isPending}
              accessibilityLabel="Rechazar solicitud"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
