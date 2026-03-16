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

export function RequestCard({ request, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Card onPress={onPress} className="mb-3">
      {/* Fila superior: estado + fecha creación */}
      <View className="flex-row items-center justify-between mb-3">
        <RequestStatusBadge status={request.status} size="sm" />
        <Text className="text-xs font-inter text-text-secondary">
          {formatDateShort(request.createdAt)}
        </Text>
      </View>

      {/* Fila media: avatar del maestro + nombre + fecha agendada */}
      <View className="flex-row items-center gap-2.5">
        <Avatar uri={request.maestro.photoUrl} name={request.maestro.name} size="sm" />
        <View className="flex-1">
          <Text
            className="text-sm font-inter-semibold text-text"
            numberOfLines={1}
          >
            {request.maestro.name}
          </Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
            <Text className="text-xs font-inter text-text-secondary">
              {formatDateShort(request.scheduledAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Categoría del servicio */}
      <View className="flex-row items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border">
        <Ionicons
          name={request.serviceCategory.iconName as keyof typeof Ionicons.glyphMap}
          size={14}
          color={colors.primary}
        />
        <Text className="text-xs font-inter text-text-secondary">
          {request.serviceCategory.name}
        </Text>
      </View>
    </Card>
  );
}
