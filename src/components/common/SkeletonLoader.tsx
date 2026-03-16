import { useEffect, useRef } from "react";
import { Animated, View, type ViewStyle } from "react-native";
import { useTheme } from "@hooks/useTheme";

interface SkeletonLoaderProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Bloque de placeholder animado con efecto de pulso.
 * Úsalo para imitar el layout de un componente mientras carga.
 */
export function SkeletonLoader({
  width,
  height,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? "#2D2D2D" : "#E5E7EB",
          opacity,
        },
        style,
      ]}
    />
  );
}
