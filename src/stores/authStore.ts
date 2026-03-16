/**
 * Store de autenticación.
 * - Persiste token y user en SecureStore (cifrado por el SO).
 * - No usa zustand/persist porque SecureStore es async y nativo.
 * - Usa secureStorage.ts como única puerta de acceso al almacenamiento seguro.
 */

import { create } from "zustand";
import { router } from "expo-router";
import { queryClient } from "@services/api/queryClient";
import { googleSignIn } from "@services/api/authApi";
import {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  saveUserData,
  getUserData,
  clearAll,
} from "@services/auth/secureStorage";
import { logger } from "@utils/logger";
import type { User } from "@types";

// ─── Estado + Acciones ────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  /** Lee tokens y usuario desde SecureStore. Llamar al inicio de la app. */
  hydrateFromStorage: () => Promise<void>;
  /** Persiste el access token en el store y en SecureStore */
  setToken: (token: string) => Promise<void>;
  /** Persiste el usuario en el store y en SecureStore */
  setUser: (user: User) => Promise<void>;
  /**
   * Intercambia el idToken de Google con el backend y persiste la sesión.
   * El hook `useGoogleAuth` obtiene el idToken; este método hace todo lo demás.
   */
  signInWithGoogle: (idToken: string) => Promise<void>;
  /** Cierra sesión: limpia SecureStore, QueryClient, WebSocket y navega al welcome */
  signOut: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set, get) => ({
  // ── Estado inicial ──────────────────────────────────────────────────────────
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  // ── Acciones ────────────────────────────────────────────────────────────────

  hydrateFromStorage: async () => {
    set({ isHydrated: false });
    try {
      const [token, user] = await Promise.all([
        getAccessToken(),
        getUserData(),
      ]);
      if (token && user) {
        set({ token, user });
        logger.log("[authStore] Sesión restaurada para userId:", user.id);
      }
    } catch (error) {
      logger.error("[authStore] Error al hidratar desde SecureStore:", error);
    } finally {
      set({ isHydrated: true });
    }
  },

  setToken: async (token) => {
    set({ token });
    await saveTokens(token, ""); // refreshToken se actualiza por separado vía interceptor
  },

  setUser: async (user) => {
    set({ user });
    await saveUserData(user);
  },

  signInWithGoogle: async (idToken: string) => {
    set({ isLoading: true });
    try {
      const { accessToken, refreshToken, user } = await googleSignIn({ idToken });
      await Promise.all([
        saveTokens(accessToken, refreshToken),
        saveUserData(user),
      ]);
      set({ token: accessToken, user });
      logger.log("[authStore] Login exitoso, userId:", user.id);
    } catch (error) {
      logger.error("[authStore] Error en signInWithGoogle:", error);
      throw error; // propagar para que el componente muestre el error
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      // Intentar logout en el servidor (ignorar errores de red)
      const { default: axiosInstance } = await import(
        "@services/api/axiosInstance"
      );
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await axiosInstance
          .post("/auth/logout", { refreshToken })
          .catch(() => {
            // Silenciar errores de red — el logout local siempre procede
          });
      }
    } catch {
      // No bloquear el logout local si el import falla
    }

    // Limpiar almacenamiento seguro
    await clearAll();

    // Limpiar QueryClient
    queryClient.clear();

    // Desconectar WebSocket (import dinámico evita circular dependency)
    try {
      const { useChatStore } = await import("./chatStore");
      useChatStore.getState().disconnect();
    } catch {
      // chatStore puede no estar disponible en tests
    }

    // Limpiar estado local
    set({ user: null, token: null, isLoading: false });

    logger.log("[authStore] Sesión cerrada");

    // Navegar a bienvenida
    router.replace("/(auth)/welcome");
  },
}));

// ─── Selector helpers (evitan re-renders innecesarios) ────────────────────────

export const authStoreState = () => useAuthStore.getState();
