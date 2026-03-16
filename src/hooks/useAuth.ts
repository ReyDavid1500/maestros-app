/**
 * Hook conveniente sobre authStore.
 * Expone los datos más usados y deriva flags útiles para las pantallas.
 */

import { useAuthStore } from "@stores/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const signOut = useAuthStore((s) => s.signOut);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  return {
    user,
    token,
    isLoading,
    isHydrated,
    isAuthenticated: !!user && !!token,
    isClient: user?.role === "CLIENT",
    isMaestro: user?.role === "MAESTRO",
    signOut,
    signInWithGoogle,
  };
}
