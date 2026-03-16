/**
 * Claves centralizadas para TanStack Query.
 * Usar siempre estas constantes — nunca strings inline.
 */
export const queryKeys = {
  me: ["me"] as const,

  categories: {
    all: ["categories"] as const,
  },

  maestros: {
    all: ["maestros"] as const,
    list: (filters: Record<string, unknown>) =>
      ["maestros", "list", filters] as const,
    detail: (id: string) => ["maestros", id] as const,
  },

  serviceRequests: {
    all: ["service-requests"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["service-requests", "list", filters] as const,
    detail: (id: string) => ["service-requests", id] as const,
  },

  chat: {
    rooms: ["chat", "rooms"] as const,
    messages: (roomId: string) => ["chat", "messages", roomId] as const,
  },

  ratings: {
    maestro: (maestroId: string) =>
      ["ratings", "maestro", maestroId] as const,
  },
} as const;
