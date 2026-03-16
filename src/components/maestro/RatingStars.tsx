import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showValue?: boolean;
}

export function RatingStars({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRate,
  showValue = false,
}: RatingStarsProps) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState<number | null>(null);

  const displayRating = hovered ?? rating;

  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayRating;
        const iconName = filled ? "star" : "star-outline";

        if (interactive) {
          return (
            <Pressable
              key={i}
              onPress={() => onRate?.(starValue)}
              onPressIn={() => setHovered(starValue)}
              onPressOut={() => setHovered(null)}
              accessibilityLabel={`${starValue} estrellas`}
              accessibilityRole="button"
            >
              <Ionicons
                name={iconName}
                size={size}
                color={filled ? colors.warning : colors.border}
              />
            </Pressable>
          );
        }

        return (
          <Ionicons
            key={i}
            name={iconName}
            size={size}
            color={filled ? colors.warning : colors.border}
          />
        );
      })}

      {showValue ? (
        <Text className="text-sm font-inter-medium text-text-secondary ml-1">
          {rating.toFixed(1)}
        </Text>
      ) : null}
    </View>
  );
}
