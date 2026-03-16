import { useColorScheme } from "nativewind";
import { Colors, type ThemeColors } from "@constants/colors";

/**
 * Hook para acceder a los colores del tema actual.
 * Lee desde NativeWind's useColorScheme para que refleje tanto el tema del sistema
 * como los cambios manuales hechos desde themeStore (light / dark / system).
 *
 * @returns { colors, colorScheme, isDark }
 */
export function useTheme(): {
  colors: ThemeColors;
  colorScheme: "light" | "dark";
  isDark: boolean;
} {
  const { colorScheme: raw } = useColorScheme();
  // NativeWind puede devolver undefined antes de inicializarse — fallback a "light"
  const colorScheme: "light" | "dark" = raw ?? "light";

  return {
    colors: Colors[colorScheme],
    colorScheme,
    isDark: colorScheme === "dark",
  };
}
