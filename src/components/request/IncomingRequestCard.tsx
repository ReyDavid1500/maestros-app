import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@components/ui/Card";
import { Avatar } from "@components/ui/Avatar";
import { Button } from "@components/ui/Button";
import { formatDateShort, formatRelative } from "@utils/formatDate";
import { useTheme } from "@hooks/useTheme";
import { useThrottledAction } from "@hooks/useThrottledAction";
import type { ServiceRequest } from "@types";

interface Props {
  request: ServiceRequest;
  onAccept: () => void;
  onReject: () => void;
  onViewDetail: () => void;
}

/**
 * Tarjeta para solicitudes entrantes (estado PENDING).
 * Muestra info del trabajo y botones de acción directos.
 * Aceptar y Rechazar usan useThrottledAction (3000ms) para evitar doble-tap.
 */
export function IncomingRequestCard({
  request,
  onAccept,
  onReject,
  onViewDetail,
}: Props) {
  const { colors } = useTheme();
  const [throttledAccept, isAccepting] = useThrottledAction(onAccept, 3000);
  const [throttledReject, isRejecting] = useThrottledAction(onReject, 3000);

  return (
    <Card className="mb-3">
      {/* Encabezado: cliente + tiempo */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2.5 flex-1">
          <Avatar uri={request.client.photoUrl} name={request.client.name} size="sm" />
          <View className="flex-1">
            <Text
              className="text-sm font-inter-semibold text-text"
              numberOfLines={1}
            >
              {request.client.name}
            </Text>
            <Text className="text-xs font-inter text-text-secondary">
              {formatRelative(request.createdAt)}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1 ml-2">
          <Ionicons
            name={request.serviceCategory.iconName as keyof typeof Ionicons.glyphMap}
            size={14}
            color={colors.primary}
          />
          <Text className="text-xs font-inter text-primary" numberOfLines={1}>
            {request.serviceCategory.name}
          </Text>
        </View>
      </View>

      {/* Descripción */}
      <Text
        className="text-sm font-inter text-text mb-2.5 leading-5"
        numberOfLines={2}
      >
        {request.description}
      </Text>

      {/* Dirección (general, sin número exacto) */}
      <View className="flex-row items-center gap-1.5 mb-2">
        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
        <Text className="text-xs font-inter text-text-secondary flex-1" numberOfLines={1}>
          {request.address.street}, {request.address.city}
        </Text>
      </View>

      {/* Fecha/hora sugerida */}
      <View className="flex-row items-center gap-1.5 mb-3">
        <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
        <Text className="text-xs font-inter text-text-secondary">
          {formatDateShort(request.scheduledAt)}
        </Text>
      </View>

      {/* Botones de acción */}
      <View className="flex-row gap-2 pt-3 border-t border-border">
        <View className="flex-1">
          <Button
            label="Aceptar"
            onPress={throttledAccept}
            variant="primary"
            size="sm"
            fullWidth
            loading={isAccepting}
            accessibilityLabel="Aceptar solicitud"
          />
        </View>
        <View className="flex-1">
          <Button
            label="Ver detalle"
            onPress={onViewDetail}
            variant="secondary"
            size="sm"
            fullWidth
            accessibilityLabel="Ver detalle de la solicitud"
          />
        </View>
        <View className="flex-1">
          <Button
            label="Rechazar"
            onPress={throttledReject}
            variant="danger"
            size="sm"
            fullWidth
            loading={isRejecting}
            accessibilityLabel="Rechazar solicitud"
          />
        </View>
      </View>
    </Card>
  );
}
