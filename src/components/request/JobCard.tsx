import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@components/ui/Card";
import { Avatar } from "@components/ui/Avatar";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { formatDateShort } from "@utils/formatDate";
import { useTheme } from "@hooks/useTheme";
import type { ServiceRequest } from "@types";

interface Props {
  request: ServiceRequest;
  onPress: () => void;
}

/**
 * Tarjeta para mostrar un trabajo activo (ACCEPTED o IN_PROGRESS) en el home del maestro.
 */
export function JobCard({ request, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Card onPress={onPress} className="mb-3">
      {/* Fila superior: estado */}
      <View className="flex-row items-center justify-between mb-3">
        <RequestStatusBadge status={request.status} />
        <Text className="text-xs font-inter text-text-secondary">
          {formatDateShort(request.createdAt)}
        </Text>
      </View>

      {/* Cliente */}
      <View className="flex-row items-center gap-2.5 mb-2.5">
        <Avatar uri={request.client.photoUrl} name={request.client.name} size="sm" />
        <View className="flex-1">
          <Text className="text-xs font-inter text-text-secondary">Cliente</Text>
          <Text
            className="text-sm font-inter-semibold text-text"
            numberOfLines={1}
          >
            {request.client.name}
          </Text>
        </View>
      </View>

      {/* Dirección */}
      <View className="flex-row items-start gap-1.5 mb-2">
        <Ionicons name="location-outline" size={14} color={colors.textSecondary} style={{ marginTop: 1 }} />
        <Text className="text-xs font-inter text-text-secondary flex-1" numberOfLines={2}>
          {request.address.street} {request.address.number}, {request.address.city}
        </Text>
      </View>

      {/* Fecha agendada + categoría */}
      <View className="flex-row items-center justify-between pt-2.5 border-t border-border">
        <View className="flex-row items-center gap-1">
          <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
          <Text className="text-xs font-inter text-text-secondary">
            {formatDateShort(request.scheduledAt)}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons
            name={request.serviceCategory.iconName as keyof typeof Ionicons.glyphMap}
            size={13}
            color={colors.primary}
          />
          <Text className="text-xs font-inter text-primary" numberOfLines={1}>
            {request.serviceCategory.name}
          </Text>
        </View>
      </View>
    </Card>
  );
}
