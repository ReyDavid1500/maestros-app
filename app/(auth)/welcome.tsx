import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

/**
 * Pantalla de bienvenida — primer punto de contacto con la app.
 *
 * Diseño: hero naranja con logo, tagline y dos CTAs.
 * NO requiere login: "Comenzar" lleva directamente al buscador de clientes.
 * El login solo ocurre en la confirmación de solicitud (clientes) o en
 * la pantalla de login (maestros).
 */
export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* ── Hero naranja (60% superior) ─────────────────────────── */}
      <View className="flex-[0.6] bg-primary items-center justify-center px-8">
        {/* Icono de la app */}
        <View className="w-28 h-28 bg-white/20 rounded-[32px] items-center justify-center mb-6">
          <Ionicons name="construct" size={56} color="white" />
        </View>

        <Text className="text-4xl font-inter-bold text-white mb-3 tracking-tight">
          Maestros
        </Text>

        <Text className="text-lg font-inter text-white/90 text-center leading-relaxed">
          Encuentra el maestro que necesitas
        </Text>

        <Text className="text-sm font-inter text-white/70 text-center mt-1">
          Servicios del hogar en Chile
        </Text>
      </View>

      {/* ── Panel inferior blanco ────────────────────────────────── */}
      <View className="flex-[0.4] bg-background px-6 pt-8 pb-6 justify-between">
        {/* Características de la app */}
        <View className="flex-row justify-around mb-8">
          {[
            { icon: "shield-checkmark-outline" as const, label: "Verificados" },
            { icon: "star-outline" as const,             label: "Con reseñas" },
            { icon: "flash-outline" as const,            label: "Rápido"      },
          ].map(({ icon, label }) => (
            <View key={label} className="items-center gap-1">
              <Ionicons name={icon} size={22} color="#F97316" />
              <Text className="text-xs font-inter text-text-secondary">{label}</Text>
            </View>
          ))}
        </View>

        {/* Botón principal — no requiere login */}
        <Pressable
          className="w-full bg-primary rounded-2xl py-4 items-center mb-3 active:opacity-80"
          onPress={() => router.replace("/(client)")}
        >
          <Text className="text-white font-inter-semibold text-base">
            Comenzar
          </Text>
        </Pressable>

        {/* CTA para maestros → pantalla de login */}
        <Pressable
          className="w-full items-center py-2 active:opacity-70"
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-text-secondary font-inter text-sm">
            ¿Eres maestro?{" "}
            <Text className="text-primary font-inter-semibold">
              Únete aquí
            </Text>
          </Text>
        </Pressable>

        {/* DEV ONLY: acceso al showcase */}
        {__DEV__ ? (
          <Pressable
            className="items-center mt-2 active:opacity-60"
            onPress={() => router.push("/(auth)/showcase")}
          >
            <Text className="text-text-secondary/40 font-inter text-xs">
              🎨 Design System
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
