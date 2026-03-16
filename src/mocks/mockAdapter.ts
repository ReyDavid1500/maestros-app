/**
 * Mock adapter para Axios (desarrollo / demo sin backend).
 * Se activa cuando EXPO_PUBLIC_USE_MOCK=true.
 *
 * Simula latencia realista y soporta paginación básica.
 */

import MockAdapter from "axios-mock-adapter";
import axiosInstance from "@services/api/axiosInstance";
import { logger } from "@utils/logger";
import {
  mockCurrentUser,
  mockTokens,
  mockCategories,
  mockMaestroListItems,
  mockMaestros,
  mockServiceRequests,
  mockRatings,
  mockChatMessages,
  mockChatRooms,
} from "./data";
import { getMockRoomCallback } from "@stores/chatStore";
import type { PaginatedResponse } from "@types";

// ─── Respuestas automáticas del bot en modo mock ──────────────────────────────

const BOT_REPLIES = [
  "Recibido, te confirmo pronto.",
  "Entendido, estoy revisando.",
  "Ok, en unos minutos te respondo.",
  "Claro, dame un momento.",
  "Sí, con gusto. Te aviso.",
];

function getRandomReply(): string {
  const idx = Math.floor(Math.random() * BOT_REPLIES.length);
  return BOT_REPLIES[idx] ?? BOT_REPLIES[0]!;
}

/**
 * Simula un mensaje entrante después de 2 segundos.
 * Llama al callback registrado en chatStore para actualizar el caché de React Query.
 */
function simulateIncomingMessage(
  roomId: string,
  senderId: string,
  senderRole: "CLIENT" | "MAESTRO"
): void {
  setTimeout(() => {
    const callback = getMockRoomCallback(roomId);
    if (!callback) return; // El usuario ya salió del chat

    callback({
      id: `msg-auto-${Date.now()}`,
      roomId,
      senderId,
      senderRole,
      content: getRandomReply(),
      createdAt: new Date().toISOString(),
      read: false,
    });
  }, 2000);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DELAY_MS = 800;

/** Construye un PaginatedResponse<T> desde un array completo */
function paginate<T>(
  items: T[],
  page = 0,
  size = 20
): PaginatedResponse<T> {
  const start = page * size;
  const content = items.slice(start, start + size);
  return {
    content,
    page,
    size,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    last: start + size >= items.length,
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let mockAdapterInstance: MockAdapter | null = null;

export function setupMockAdapter(): void {
  if (mockAdapterInstance) return; // Singleton: no inicializar dos veces

  mockAdapterInstance = new MockAdapter(axiosInstance, {
    delayResponse: DELAY_MS,
    onNoMatch: "throwException",
  });

  const mock = mockAdapterInstance;

  // ── Auth ──────────────────────────────────────────────────────────────────

  mock.onPost("/auth/google").reply(200, {
    ...mockTokens,
    user: mockCurrentUser,
  });

  mock.onPost("/auth/refresh").reply(200, {
    ...mockTokens,
    user: mockCurrentUser,
  });

  mock.onPost("/auth/logout").reply(204);

  // ── Users ─────────────────────────────────────────────────────────────────

  mock.onGet("/users/me").reply(200, mockCurrentUser);

  mock.onPatch("/users/me").reply((config) => {
    const body = JSON.parse(config.data as string) as Record<string, unknown>;
    return [200, { ...mockCurrentUser, ...body }];
  });

  mock.onPost("/users/me/avatar").reply(200, {
    ...mockCurrentUser,
    photoUrl: "https://i.pravatar.cc/150?img=10",
  });

  // ── Categories ────────────────────────────────────────────────────────────

  mock.onGet("/categories").reply(200, mockCategories);

  // ── Maestros ──────────────────────────────────────────────────────────────

  mock.onGet("/maestros").reply((config) => {
    const page = Number(config.params?.page ?? 0);
    const size = Number(config.params?.size ?? 20);
    const categoryId = config.params?.categoryId as string | undefined;

    const filtered = categoryId
      ? mockMaestroListItems.filter((m) =>
          m.services.some((s) => s.serviceCategory.id === categoryId)
        )
      : mockMaestroListItems;

    return [200, paginate(filtered, page, size)];
  });

  // Búsqueda por texto libre — GET /maestros/search?q=...&page=0&size=20
  mock.onGet("/maestros/search").reply((config) => {
    const q = (config.params?.q as string | undefined)?.toLowerCase().trim() ?? "";
    const page = Number(config.params?.page ?? 0);
    const size = Number(config.params?.size ?? 20);

    const results = q
      ? mockMaestroListItems.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            (m.description ?? "").toLowerCase().includes(q)
        )
      : mockMaestroListItems;

    logger.debug(`[Mock] GET /maestros/search q="${q}" → ${results.length} resultados`);
    return [200, paginate(results, page, size)];
  });

  mock.onGet(/\/maestros\/(?!me)[\w-]+$/).reply((config) => {
    const id = config.url?.split("/").pop();
    const maestro = mockMaestros.find((m) => m.id === id);
    return maestro ? [200, maestro] : [404, { message: "Maestro no encontrado" }];
  });

  mock.onPost("/maestros/me").reply(201, mockMaestros[0]);
  mock.onPatch("/maestros/me").reply(200, mockMaestros[0]);
  mock.onPatch("/maestros/me/availability").reply((config) => {
    const body = JSON.parse(config.data as string) as { isAvailable: boolean };
    return [200, { ...mockMaestros[0], isAvailable: body.isAvailable }];
  });

  // ── Service Requests ──────────────────────────────────────────────────────

  mock.onGet("/service-requests").reply((config) => {
    const page = Number(config.params?.page ?? 0);
    const size = Number(config.params?.size ?? 20);
    const status = config.params?.status as string | undefined;

    const filtered = status
      ? mockServiceRequests.filter((sr) => sr.status === status)
      : mockServiceRequests;

    return [200, paginate(filtered, page, size)];
  });

  mock.onGet(/\/service-requests\/[\w-]+$/).reply((config) => {
    const id = config.url?.split("/").pop();
    const sr = mockServiceRequests.find((r) => r.id === id);
    return sr ? [200, sr] : [404, { message: "Solicitud no encontrada" }];
  });

  mock.onPost("/service-requests").reply(201, mockServiceRequests[0]);

  // Acciones de estado
  for (const action of ["accept", "reject", "start", "complete", "cancel"]) {
    mock.onPost(new RegExp(`/service-requests/[\\w-]+/${action}$`)).reply(
      (config) => {
        const id = config.url?.split("/").at(-2);
        const sr = mockServiceRequests.find((r) => r.id === id);
        if (!sr) return [404, { message: "Solicitud no encontrada" }];
        const statusMap: Record<string, string> = {
          accept: "ACCEPTED",
          reject: "REJECTED",
          start: "IN_PROGRESS",
          complete: "COMPLETED",
          cancel: "CANCELLED",
        };
        return [200, { ...sr, status: statusMap[action] }];
      }
    );
  }

  // ── Ratings ───────────────────────────────────────────────────────────────

  mock.onGet(/\/ratings\/maestro\/[\w-]+$/).reply((config) => {
    const page = Number(config.params?.page ?? 0);
    const size = Number(config.params?.size ?? 20);
    return [200, paginate(mockRatings, page, size)];
  });

  mock
    .onPost(/\/ratings\/service-request\/[\w-]+$/)
    .reply(201, mockRatings[0]);

  // ── Chat ──────────────────────────────────────────────────────────────────

  mock.onGet("/chat/rooms").reply(200, mockChatRooms);

  mock.onGet(/\/chat\/rooms\/[\w-]+\/messages$/).reply((config) => {
    const roomId = config.url?.split("/").at(-2);
    const page = Number(config.params?.page ?? 0);
    const size = Number(config.params?.size ?? 50);
    const messages = mockChatMessages.filter((m) => m.roomId === roomId);
    return [200, paginate(messages, page, size)];
  });

  mock.onPost(/\/chat\/rooms\/[\w-]+\/messages$/).reply((config) => {
    const roomId = config.url?.split("/").at(-2) ?? "unknown";
    const body = JSON.parse(config.data as string) as { content: string };
    const newMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: mockCurrentUser.id,
      senderRole: "CLIENT" as const,
      content: body.content,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Simular respuesta automática del otro participante después de 2 segundos
    const room = mockChatRooms.find((r) => r.roomId === roomId);
    if (room) {
      const otherParticipantId = room.otherParticipant.id;
      // El rol contrario al del usuario actual (en mock siempre es CLIENT)
      simulateIncomingMessage(roomId, otherParticipantId, "MAESTRO");
    }

    return [201, newMessage];
  });

  mock.onPost(/\/chat\/rooms\/[\w-]+\/read$/).reply(204);

  logger.log("[Mock] MockAdapter configurado — backend simulado activo");
}

export function resetMockAdapter(): void {
  mockAdapterInstance?.reset();
}
