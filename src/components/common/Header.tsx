import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center px-4 pt-14 pb-3 bg-background border-b border-border">
      {/* Botón atrás */}
      <View className="w-10">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-surface"
            accessibilityLabel="Volver"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.text}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Título centrado */}
      <Text
        className="flex-1 text-center text-lg font-inter-semibold text-text"
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Acción derecha */}
      <View className="w-10 items-end">
        {rightAction ?? null}
      </View>
    </View>
  );
}
