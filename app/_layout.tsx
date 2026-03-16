import "../src/global.css";

import { useEffect } from "react";
import { Appearance } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@services/api/queryClient";
import { useAuthStore } from "@stores/authStore";
import { useThemeStore } from "@stores/themeStore";
import { useChatStore } from "@stores/chatStore";

// Mock adapter — solo en modo desarrollo con EXPO_PUBLIC_USE_MOCK=true
if (process.env["EXPO_PUBLIC_USE_MOCK"] === "true") {
  // Import dinámico para que no entre en el bundle de producción
  void import("@mocks/mockAdapter").then(({ setupMockAdapter }) => {
    setupMockAdapter();
  });
}

// Mantener el splash screen visible mientras se inicializa la app
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const isHydrated = useAuthStore((s) => s.isHydrated);
  const syncWithSystem = useThemeStore((s) => s.syncWithSystem);

  // ── Inicialización de stores al montar el layout ──────────────────────────
  useEffect(() => {
    // 1. Hidratar authStore desde SecureStore
    void useAuthStore.getState().hydrateFromStorage().then(() => {
      const { user, token } = useAuthStore.getState();
      // 2. Si hay sesión activa, conectar WebSocket
      if (token && user) {
        useChatStore.getState().connect(token);
      }
    });

    // 3. Escuchar cambios del tema del sistema
    const subscription = Appearance.addChangeListener(() => {
      syncWithSystem();
    });

    return () => subscription.remove();
  }, [syncWithSystem]);

  // ── Ocultar splash screen cuando todo esté listo ──────────────────────────
  useEffect(() => {
    if ((fontsLoaded || fontError) && isHydrated) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isHydrated]);

  // No renderizar hasta que las fuentes estén cargadas
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(client)" options={{ headerShown: false }} />
          <Stack.Screen name="(maestro)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
