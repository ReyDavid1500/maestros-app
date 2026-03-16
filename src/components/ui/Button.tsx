import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useThrottledAction } from "@hooks/useThrottledAction";
import { useTheme } from "@hooks/useTheme";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const containerVariant: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-transparent border border-primary",
  danger: "bg-error",
  ghost: "bg-transparent",
};

const textVariant: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-primary",
  danger: "text-white",
  ghost: "text-text-secondary",
};

const containerSize: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 rounded-lg",
  md: "px-5 py-3 rounded-xl",
  lg: "px-6 py-4 rounded-2xl",
};

const textSize: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) {
  const { colors } = useTheme();
  const [throttledPress, isThrottled] = useThrottledAction(onPress, 300);

  const isDisabled = disabled || loading || isThrottled;
  const spinnerColor =
    variant === "primary" || variant === "danger" ? "#FFFFFF" : colors.primary;

  return (
    <Pressable
      onPress={throttledPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={[
        "items-center justify-center flex-row",
        containerVariant[variant],
        containerSize[size],
        fullWidth ? "w-full" : "self-start",
        isDisabled ? "opacity-50" : "active:opacity-80",
      ].join(" ")}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text
          className={[
            "font-inter-semibold",
            textVariant[variant],
            textSize[size],
          ].join(" ")}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
