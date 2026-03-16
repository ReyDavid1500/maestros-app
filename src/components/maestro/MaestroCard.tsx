import { View, Text } from "react-native";
import { Card } from "@components/ui/Card";
import { Avatar } from "@components/ui/Avatar";
import { RatingStars } from "@components/maestro/RatingStars";
import { formatCLP } from "@utils/formatCLP";
import type { MaestroListItem } from "@types";

interface Props {
  maestro: MaestroListItem;
  onPress: () => void;
}

export function MaestroCard({ maestro, onPress }: Props) {
  const minPrice = Math.min(...maestro.services.map((s) => s.priceClp));
  const cheapestService = maestro.services.reduce((prev, curr) =>
    prev.priceClp <= curr.priceClp ? prev : curr
  );

  return (
    <Card onPress={onPress} className="mb-3">
      <View className="flex-row gap-3">
        {/* Avatar */}
        <Avatar uri={maestro.photoUrl} name={maestro.name} size="md" />

        {/* Info principal */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-base font-inter-semibold text-text flex-1 mr-2"
              numberOfLines={1}
            >
              {maestro.name}
            </Text>

            {/* Badge disponibilidad */}
            <View
              className={`px-2 py-0.5 rounded-full ${
                maestro.isAvailable ? "bg-success/15" : "bg-error/15"
              }`}
            >
              <Text
                className={`text-xs font-inter-medium ${
                  maestro.isAvailable ? "text-success" : "text-error"
                }`}
              >
                {maestro.isAvailable ? "Disponible" : "Ocupado"}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View className="flex-row items-center gap-1.5 mt-1">
            <RatingStars rating={maestro.averageRating} size={12} showValue />
            <Text className="text-xs font-inter text-text-secondary">
              · {maestro.totalJobs} trabajos
            </Text>
          </View>

          {/* Tags de categorías */}
          <View className="flex-row flex-wrap gap-1 mt-1.5">
            {maestro.services.slice(0, 2).map((s, i) => (
              <View key={i} className="bg-primary/10 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-inter text-primary">
                  {s.serviceCategory.name}
                </Text>
              </View>
            ))}
            {maestro.services.length > 2 && (
              <View className="bg-border/50 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-inter text-text-secondary">
                  +{maestro.services.length - 2}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Precio y tiempo mínimo */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
        <Text className="text-sm font-inter text-text-secondary">
          Desde{" "}
          <Text className="font-inter-bold text-text">
            {formatCLP(minPrice)}
          </Text>
        </Text>
        <Text className="text-xs font-inter text-text-secondary">
          {cheapestService.estimatedTime}
        </Text>
      </View>
    </Card>
  );
}
