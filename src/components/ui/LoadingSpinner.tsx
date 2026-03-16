import { ActivityIndicator, View } from "react-native";
import { useTheme } from "@hooks/useTheme";

type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: string;
  /** Si true, muestra un overlay semitransparente sobre el contenido */
  overlay?: boolean;
}

const rnSize: Record<SpinnerSize, "small" | "large"> = {
  sm: "small",
  md: "small",
  lg: "large",
};

export function LoadingSpinner({
  size = "md",
  color,
  overlay = false,
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const spinnerColor = color ?? colors.primary;

  if (overlay) {
    return (
      <View className="absolute inset-0 items-center justify-center bg-background/60 z-50">
        <ActivityIndicator size={rnSize[size]} color={spinnerColor} />
      </View>
    );
  }

  return <ActivityIndicator size={rnSize[size]} color={spinnerColor} />;
}
