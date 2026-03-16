/**
 * Store de tema (light / dark / system).
 * Persiste en AsyncStorage (no es información sensible).
 * Se sincroniza con el sistema operativo cuando colorScheme === 'system'.
 *
 * IMPORTANTE: Llama a `colorScheme.set()` de NativeWind para que las clases
 * `dark:` de Tailwind se activen correctamente tanto en web como en nativo.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { colorScheme as nwColorScheme } from "nativewind";
import type { ColorScheme } from "@types";

// ─── Estado + Acciones ────────────────────────────────────────────────────────

interface ThemeState {
  colorScheme: ColorScheme;
  resolvedTheme: "light" | "dark";
}

interface ThemeActions {
  /** Cambia el tema, actualiza NativeWind y persiste la preferencia */
  setColorScheme: (scheme: ColorScheme) => void;
  /** Actualiza resolvedTheme cuando el SO cambia el tema (solo si colorScheme === 'system') */
  syncWithSystem: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

// ─── Helper ───────────────────────────────────────────────────────────────────

function resolveTheme(scheme: ColorScheme): "light" | "dark" {
  if (scheme === "system") {
    return Appearance.getColorScheme() === "dark" ? "dark" : "light";
  }
  return scheme;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // ── Estado inicial ──────────────────────────────────────────────────────
      colorScheme: "system",
      resolvedTheme: resolveTheme("system"),

      // ── Acciones ────────────────────────────────────────────────────────────

      setColorScheme: (scheme) => {
        // Notificar a NativeWind para que active/desactive las clases dark:
        nwColorScheme.set(scheme);
        set({ colorScheme: scheme, resolvedTheme: resolveTheme(scheme) });
      },

      syncWithSystem: () => {
        if (get().colorScheme === "system") {
          nwColorScheme.set("system");
          set({ resolvedTheme: resolveTheme("system") });
        }
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Solo persistir colorScheme — resolvedTheme se recalcula al hidratar
      partialize: (state) => ({ colorScheme: state.colorScheme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalcular resolvedTheme y sincronizar NativeWind tras hidratación
          state.resolvedTheme = resolveTheme(state.colorScheme);
          nwColorScheme.set(state.colorScheme);
        }
      },
    }
  )
);
