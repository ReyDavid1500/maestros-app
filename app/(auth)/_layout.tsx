import { Stack, Redirect } from "expo-router";
import { useAuth } from "@hooks/useAuth";

/**
 * Layout del grupo de autenticación.
 * - Stack sin header, animación horizontal.
 * - Redirige a los usuarios ya autenticados a su área correspondiente.
 */
export default function AuthLayout() {
  const { isAuthenticated, isHydrated, user } = useAuth();

  // Esperar a que el store esté hidratado antes de decidir
  if (isHydrated && isAuthenticated) {
    if (user?.role === "MAESTRO") return <Redirect href="/(maestro)" />;
    return <Redirect href="/(client)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="register-maestro" />
      <Stack.Screen name="showcase" />
    </Stack>
  );
}
