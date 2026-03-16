/**
 * Endpoints de búsqueda y detalle de maestros.
 * También incluye la creación/actualización del perfil de maestro propio.
 */

import axiosInstance from "./axiosInstance";
import type { MaestroListItem, MaestroProfile, PaginatedResponse } from "@types";
import type { CreateMaestroProfileFormValues } from "@types";

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface ListMaestrosFilters {
  categoryId?: string;
  city?: string;
  page?: number;
  size?: number;
}

export interface SearchMaestrosFilters {
  q: string;
  page?: number;
  size?: number;
}

// ─── Functions ────────────────────────────────────────────────────────────────

/** Lista de maestros con filtros opcionales (paginada) */
export async function listMaestros(
  filters: ListMaestrosFilters = {}
): Promise<PaginatedResponse<MaestroListItem>> {
  const { data } = await axiosInstance.get<PaginatedResponse<MaestroListItem>>(
    "/maestros",
    { params: filters }
  );
  return data;
}

/** Búsqueda de maestros por texto libre (nombre o descripción) */
export async function searchMaestros(
  filters: SearchMaestrosFilters
): Promise<PaginatedResponse<MaestroListItem>> {
  const { data } = await axiosInstance.get<PaginatedResponse<MaestroListItem>>(
    "/maestros/search",
    { params: filters }
  );
  return data;
}

/** Detalle completo de un maestro incluyendo valoraciones recientes */
export async function getMaestro(id: string): Promise<MaestroProfile> {
  const { data } = await axiosInstance.get<MaestroProfile>(`/maestros/${id}`);
  return data;
}

/** Crea el perfil de maestro para el usuario autenticado */
export async function createMaestroProfile(
  payload: CreateMaestroProfileFormValues
): Promise<MaestroProfile> {
  const { data } = await axiosInstance.post<MaestroProfile>(
    "/maestros/me",
    payload
  );
  return data;
}

/** Actualiza el perfil de maestro del usuario autenticado */
export async function updateMaestroProfile(
  payload: Partial<CreateMaestroProfileFormValues>
): Promise<MaestroProfile> {
  const { data } = await axiosInstance.patch<MaestroProfile>(
    "/maestros/me",
    payload
  );
  return data;
}

/** Actualiza la disponibilidad del maestro (toggle) */
export async function setMaestroAvailability(
  isAvailable: boolean
): Promise<MaestroProfile> {
  const { data } = await axiosInstance.patch<MaestroProfile>(
    "/maestros/me/availability",
    { isAvailable }
  );
  return data;
}
