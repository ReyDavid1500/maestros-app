import { View, Text, type ViewStyle, type ImageStyle } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@hooks/useTheme";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 80,
  xl: 120,
};

const fontSizeMap: Record<AvatarSize, number> = {
  sm: 12,
  md: 16,
  lg: 26,
  xl: 40,
};

/**
 * Calcula las iniciales desde el nombre completo.
 * "Pedro García" → "PG", "Pedro" → "P"
 */
function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ uri, name, size = "md", style }: AvatarProps) {
  const { colors } = useTheme();
  const px = sizeMap[size];
  const fontSize = fontSizeMap[size];
  const initials = getInitials(name);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          {
            width: px,
            height: px,
            borderRadius: px / 2,
          } satisfies ImageStyle,
          style as ImageStyle,
        ]}
        cachePolicy="memory-disk"
        contentFit="cover"
        accessibilityLabel={`Avatar de ${name}`}
      />
    );
  }

  return (
    <View
      style={[
        {
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
      accessibilityLabel={`Avatar de ${name}`}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize,
          fontFamily: "Inter_600SemiBold",
          lineHeight: fontSize * 1.2,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
