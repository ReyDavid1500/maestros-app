import { Redirect } from "expo-router";
import { useAuth } from "@hooks/useAuth";
import { LoadingSpinner } from "@components/ui/LoadingSpinner";

/**
 * Pantalla de entrada — redirige según estado de autenticación y rol.
 * Permanece invisible (LoadingSpinner) hasta que el authStore esté hidratado.
 *
 * Árbol de decisión:
 *  · No hidratado              → spinner (esperar SecureStore)
 *  · No autenticado            → /welcome
 *  · MAESTRO sin perfil        → /(maestro)/profile/edit  (onboarding)
 *  · MAESTRO con perfil        → /(maestro)
 *  · CLIENT                    → /(client)
 */
export default function Index() {
  const { isAuthenticated, isHydrated, user } = useAuth();

  if (!isHydrated) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user?.role === "MAESTRO") {
    // Maestro nuevo sin perfil → onboarding para crear su perfil
    if (!user.hasMaestroProfile) {
      return <Redirect href="/(maestro)/profile/edit" />;
    }
    return <Redirect href="/(maestro)" />;
  }

  return <Redirect href="/(client)" />;
}
