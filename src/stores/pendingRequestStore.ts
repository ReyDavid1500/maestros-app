/**
 * Store de solicitud pendiente.
 * Persiste los datos del formulario de solicitud durante el flujo OAuth.
 * El proceso de login con Google puede recargar la app (comportamiento nativo),
 * lo que perdería el estado en memoria.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PendingRequestData {
  maestroId: string | null;
  maestroName: string | null;
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

// ─── Estado inicial ────────────────────────────────────────────────────────────

const INITIAL_STATE: PendingRequestData = {
  maestroId: null,
  maestroName: null,
  categoryId: null,
  categoryName: null,
  description: "",
  addressStreet: "",
  addressNumber: "",
  addressCity: "",
  addressInstructions: "",
  scheduledAt: null,
  termsAccepted: false,
};

// ─── Estado + Acciones ────────────────────────────────────────────────────────

interface PendingRequestActions {
  /** Actualiza solo los campos provistos (merge parcial) */
  setFields: (data: Partial<PendingRequestData>) => void;
  /** Resetea todo al estado inicial. Llamar tras crear la solicitud exitosamente. */
  clear: () => void;
  /**
   * Retorna true si hay suficientes datos para crear la solicitud.
   * Útil para mostrar/ocultar el botón de confirmar.
   */
  hasData: () => boolean;
}

export type PendingRequestStore = PendingRequestData & PendingRequestActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePendingRequestStore = create<PendingRequestStore>()(
  persist(
    (set, get) => ({
      // ── Estado inicial ──────────────────────────────────────────────────────
      ...INITIAL_STATE,

      // ── Acciones ────────────────────────────────────────────────────────────

      setFields: (data) => set((state) => ({ ...state, ...data })),

      clear: () => set({ ...INITIAL_STATE }),

      hasData: () => {
        const {
          maestroId,
          categoryId,
          description,
          addressStreet,
          addressNumber,
          addressCity,
          scheduledAt,
        } = get();
        return !!(
          maestroId &&
          categoryId &&
          description &&
          addressStreet &&
          addressNumber &&
          addressCity &&
          scheduledAt
        );
      },
    }),
    {
      name: "pending-request-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
