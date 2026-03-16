/**
 * Interfaces de los stores de Zustand.
 * Definen el contrato de estado global de la app.
 */

import type { User, ColorScheme, ChatMessage } from "./index";

// ─── AuthStore ────────────────────────────────────────────────────────────────

export interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  /** true cuando el store terminó de cargar desde SecureStore al startup */
  isHydrated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  /** Llamar al arrancar la app para rehidratar desde SecureStore */
  hydrateFromStorage: () => Promise<void>;
}

// ─── ThemeStore ───────────────────────────────────────────────────────────────

export interface ThemeStore {
  colorScheme: ColorScheme;
  /** 'system' se resuelve al valor real del sistema operativo */
  resolvedTheme: "light" | "dark";
  setColorScheme: (scheme: ColorScheme) => void;
}

// ─── PendingRequestStore ──────────────────────────────────────────────────────

/** Datos del formulario de nueva solicitud en progreso (multi-paso) */
export interface PendingRequest {
  maestroId: string | null;
  maestroName: string | null; // Para mostrar en la pantalla de confirmación
  categoryId: string | null;
  categoryName: string | null;
  description: string;
  addressStreet: string;
  addressNumber: string;
  addressCity: string;
  addressInstructions: string;
  scheduledAt: string | null; // ISO 8601
  termsAccepted: boolean;
}

export interface PendingRequestStore extends PendingRequest {
  set: (data: Partial<PendingRequest>) => void;
  clear: () => void;
  /** true si hay suficientes datos para crear la solicitud */
  hasData: () => boolean;
}

// ─── ChatStore ────────────────────────────────────────────────────────────────

export interface ChatStore {
  activeRoomId: string | null;
  isConnected: boolean;
  setActiveRoom: (roomId: string | null) => void;
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (roomId: string, content: string) => void;
  sendTypingIndicator: (roomId: string) => void;
  subscribeToRoom: (
    roomId: string,
    onMessage: (msg: ChatMessage) => void,
  ) => () => void;
  unsubscribeFromRoom: (roomId: string) => void;
}
