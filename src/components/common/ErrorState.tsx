import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@components/ui/Button";
import { useTheme } from "@hooks/useTheme";

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "Ocurrió un error. Por favor intenta de nuevo.",
  onRetry,
}: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <Ionicons name="alert-circle-outline" size={60} color={colors.error} />

      <Text className="text-lg font-inter-semibold text-text mt-4 text-center">
        Algo salió mal
      </Text>

      <Text className="text-sm font-inter text-text-secondary mt-2 text-center leading-5">
        {message}
      </Text>

      <View className="mt-6">
        <Button label="Reintentar" onPress={onRetry} variant="secondary" />
      </View>
    </View>
  );
}
