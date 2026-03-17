import { View, Text, ScrollView, Pressable, Alert, Switch, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Avatar } from "@components/ui/Avatar";
import { useAuth } from "@hooks/useAuth";
import { useThemeStore } from "@stores/themeStore";
import { useTheme } from "@hooks/useTheme";
import type { ColorScheme } from "@types";

export default function ClientProfileScreen() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { colorScheme, setColorScheme } = useThemeStore();
  const { colors, isDark } = useTheme();

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      if (window.confirm("¿Deseas cerrar sesión?")) void signOut();
      return;
    }
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: () => void signOut() },
      ]
    );
  };

  const toggleDarkMode = () => {
    const next: ColorScheme = isDark ? "light" : "dark";
    setColorScheme(next);
  };

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View className="px-5 pt-14 pb-4">
        <Text className="text-2xl font-inter-bold text-text">
          Perfil
        </Text>
      </View>

      {isAuthenticated && user ? (
        <>
          {/* Info del usuario */}
          <View className="mx-5 bg-surface rounded-2xl p-5 mb-4 items-center">
            <Avatar uri={user.photoUrl} name={user.name} size="lg" />
            <Text className="text-xl font-inter-bold text-text mt-3">
              {user.name}
            </Text>
            <Text className="text-sm font-inter text-text-secondary">{user.email}</Text>
            {user.phone ? (
              <Text className="text-sm font-inter text-text-secondary">{user.phone}</Text>
            ) : null}
          </View>

          {/* Ajustes */}
          <View className="mx-5 bg-surface rounded-2xl overflow-hidden mb-4">
            <Text className="text-xs font-inter-semibold text-text-secondary uppercase px-4 pt-4 pb-2">
              Apariencia
            </Text>

            <View
              className="flex-row items-center justify-between px-4 py-4"
              style={{ borderTopWidth: 1, borderTopColor: colors.border }}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={20}
                  color={colors.primary}
                />
                <Text className="text-sm font-inter-medium text-text">
                  Modo oscuro
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>
        </>
      ) : (
        /* Usuario no autenticado — invitado */
        <View className="mx-5 bg-surface rounded-2xl p-6 mb-4 items-center">
          <Ionicons name="person-circle-outline" size={64} color={colors.textSecondary} />
          <Text className="text-base font-inter-semibold text-text mt-3">
            No has iniciado sesión
          </Text>
          <Text className="text-sm font-inter text-text-secondary text-center mt-1">
            Inicia sesión para ver tu perfil y gestionar tus solicitudes.
          </Text>
          <Pressable
            className="mt-4 bg-primary rounded-2xl px-6 py-3 active:opacity-80"
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-white font-inter-semibold">Iniciar sesión</Text>
          </Pressable>
        </View>
      )}

      {/* Apariencia (visible también si no está logueado) */}
      {!isAuthenticated && (
        <View className="mx-5 bg-surface rounded-2xl overflow-hidden mb-4">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-3">
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color={colors.primary}
              />
              <Text className="text-sm font-inter-medium text-text">
                Modo oscuro
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="white"
            />
          </View>
        </View>
      )}

      {/* Cerrar sesión */}
      {isAuthenticated && (
        <View className="mx-5 mb-8">
          <Pressable
            className="w-full rounded-2xl py-4 items-center active:opacity-80"
            style={{ backgroundColor: colors.error + "15", borderWidth: 1, borderColor: colors.error + "40" }}
            onPress={handleSignOut}
          >
            <Text className="font-inter-semibold" style={{ color: colors.error }}>
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
