import { View, Text, Pressable, Alert, Image } from "react-native";
import { router } from "expo-router";
import { goBack } from "@utils/navigation";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useGoogleAuth } from "@services/auth/googleAuthService";
import { useAuthStore } from "@stores/authStore";
import { useTheme } from "@hooks/useTheme";
import { LoadingSpinner } from "@components/ui/LoadingSpinner";

/**
 * Pantalla de inicio de sesión con Google.
 *
 * Usada principalmente por maestros que quieren acceder a su panel.
 * Los clientes se autentican directamente en la pantalla de confirmación
 * de solicitud (confirm.tsx en Fase 09) — no necesitan pasar por aquí.
 *
 * Flujo:
 * 1. Usuario toca "Continuar con Google"
 * 2. En modo mock → idToken falso inmediato
 *    En modo real  → se abre el navegador con Google OAuth
 * 3. authStore.signInWithGoogle(idToken) → intercambia con el backend
 * 4. index.tsx detecta el cambio de user y redirige según el rol
 */
export default function LoginScreen() {
  const { signInWithGoogle: getGoogleToken, isLoading: isOAuthLoading } =
    useGoogleAuth();
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const { colors, isDark } = useTheme();

  const isLoading = isOAuthLoading || isAuthLoading;

  const handleGoogleLogin = async () => {
    try {
      const idToken = await getGoogleToken();
      await signInWithGoogle(idToken);
      // index.tsx reacciona al cambio de user y redirige según rol
      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      // No mostrar alerta si el usuario simplemente canceló
      if (!message.toLowerCase().includes("canceló")) {
        Alert.alert("Error de inicio de sesión", message);
      }
    }
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── Encabezado con botón de retroceso ─────────────────────── */}
      <View className="pt-14 px-4">
        <Pressable
          className="w-10 h-10 items-center justify-center active:opacity-60"
          onPress={() => goBack("/(client)")}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* ── Contenido centrado ──────────────────────────────────────── */}
      <View className="flex-1 items-center justify-center px-6 pb-16">
        {/* Logo */}
        <View className="w-20 h-20 bg-primary rounded-[24px] items-center justify-center mb-8">
          <Ionicons name="construct" size={36} color="white" />
        </View>

        <Text className="text-2xl font-inter-bold text-text mb-2 text-center">
          Accede a tu cuenta
        </Text>

        <Text className="text-base font-inter text-text-secondary mb-12 text-center leading-relaxed">
          Conecta con clientes y gestiona{"\n"}tus servicios desde un solo lugar
        </Text>

        {/* Botón de Google */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Pressable
            className="w-full bg-surface border border-border rounded-xl py-3.5 flex-row items-center justify-center gap-2.5 active:opacity-70"
            onPress={handleGoogleLogin}
          >
            <Image
              source={require("../../assets/google-logo.png")}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
            <Text className="text-text font-inter-medium text-sm">
              Continuar con Google
            </Text>
          </Pressable>
        )}

        {/* Aviso legal */}
        <Text className="text-text-secondary/60 font-inter text-xs mt-10 text-center leading-relaxed">
          Al continuar, aceptas nuestros{" "}
          <Text className="text-primary/80">Términos de servicio</Text>
          {" "}y{" "}
          <Text className="text-primary/80">Política de privacidad</Text>
        </Text>
      </View>
    </View>
  );
}
