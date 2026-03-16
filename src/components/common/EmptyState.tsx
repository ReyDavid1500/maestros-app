import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@components/ui/Button";
import { useTheme } from "@hooks/useTheme";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Ionicons name={icon} size={60} color={colors.textSecondary} />

      <Text className="text-lg font-inter-semibold text-text mt-4 text-center">
        {title}
      </Text>

      <Text className="text-sm font-inter text-text-secondary mt-2 text-center leading-5">
        {message}
      </Text>

      {actionLabel && onAction ? (
        <View className="mt-6">
          <Button label={actionLabel} onPress={onAction} variant="primary" />
        </View>
      ) : null}
    </View>
  );
}
