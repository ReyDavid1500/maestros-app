/**
 * Tokens de color del sistema de diseño Maestros.
 * Usar estos valores para colores en StyleSheet o lógica JS (ej: useTheme()).
 * Para NativeWind className, usar directamente las clases de tailwind.config.js.
 *
 * Los valores aquí reflejan lo que los CSS vars generan en cada modo.
 */
export const Colors = {
  light: {
    primary: "#F97316",
    background: "#FFFFFF",
    surface: "#F8F8F8",
    text: "#111111",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
  dark: {
    primary: "#FB923C",
    background: "#0F0F0F",
    surface: "#1A1A1A",
    text: "#F5F5F5",
    textSecondary: "#9CA3AF",
    border: "#2D2D2D",
    success: "#4ADE80",
    error: "#F87171",
    warning: "#FBBF24",
    info: "#60A5FA",
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ColorScheme];
