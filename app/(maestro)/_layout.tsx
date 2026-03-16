import { useEffect } from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@stores/authStore";
import { useTheme } from "@hooks/useTheme";
import {
  useServiceRequests,
  flattenServiceRequests,
} from "@queries/useServiceRequests";

/** Conteo de solicitudes PENDING para el badge del tab Trabajos */
function usePendingCount(): number {
  const { data } = useServiceRequests();
  return flattenServiceRequests(data).filter((r) => r.status === "PENDING")
    .length;
}

/**
 * Layout de tabs del maestro.
 * 3 tabs: Trabajos, Chats, Perfil.
 * Redirige a /(client) si el usuario autenticado tiene role CLIENT.
 */
export default function MaestroLayout() {
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const pendingCount = usePendingCount();
  const { colors } = useTheme();

  useEffect(() => {
    if (isHydrated && user?.role === "CLIENT") {
      router.replace("/(client)");
    }
  }, [isHydrated, user]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trabajos",
          ...(pendingCount > 0 ? { tabBarBadge: pendingCount } : {}),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Rutas ocultas del tab bar */}
      <Tabs.Screen name="request" options={{ href: null }} />
      <Tabs.Screen name="job" options={{ href: null }} />
    </Tabs>
  );
}
