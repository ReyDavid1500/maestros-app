import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";
import { formatCLP } from "@utils/formatCLP";
import type { MaestroService } from "@types";

interface Props {
  services: MaestroService[];
}

/** Lista de servicios de un maestro con ícono, precio y tiempo estimado. */
export function MaestroServiceList({ services }: Props) {
  const { colors } = useTheme();

  return (
    <View className="gap-3">
      {services.map((service, i) => (
        <View key={i} className="flex-row items-center gap-3">
          <View
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: colors.primary + "15" }}
          >
            <Ionicons
              name={service.serviceCategory.iconName as keyof typeof Ionicons.glyphMap}
              size={18}
              color={colors.primary}
            />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-inter-medium text-text">
              {service.serviceCategory.name}
            </Text>
            <Text className="text-xs font-inter text-text-secondary">
              {service.estimatedTime}
            </Text>
          </View>

          <Text className="text-sm font-inter-semibold text-primary">
            {formatCLP(service.priceClp)}
          </Text>
        </View>
      ))}
    </View>
  );
}
