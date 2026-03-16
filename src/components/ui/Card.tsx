import { Pressable, View, type ViewStyle } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  className?: string;
}

/**
 * Contenedor de tarjeta con fondo superficie, bordes redondeados y sombra suave.
 * Si se pasa `onPress`, la card es tappable con feedback de opacidad.
 */
export function Card({ children, onPress, style, className = "" }: CardProps) {
  const baseClass =
    "bg-surface rounded-2xl p-4 shadow-sm " + className;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={style}
        className={baseClass + " active:opacity-75"}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={style} className={baseClass}>
      {children}
    </View>
  );
}
