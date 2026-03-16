/**
 * Endpoints de valoraciones (ratings).
 * Solo los clientes pueden valorar; solo tras completar el servicio.
 */

import axiosInstance from "./axiosInstance";
import type { Rating, PaginatedResponse } from "@types";
import type { RatingFormValues } from "@types";

// ─── Functions ────────────────────────────────────────────────────────────────

/** Lista las valoraciones de un maestro (paginada) */
export async function getMaestroRatings(
  maestroId: string,
  params: { page?: number; size?: number } = {}
): Promise<PaginatedResponse<Rating>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Rating>>(
    `/ratings/maestro/${maestroId}`,
    { params }
  );
  return data;
}

/**
 * (CLIENT) Crea una valoración para un servicio completado.
 * El backend vincula la valoración al maestro a través de la solicitud.
 */
export async function createRating(
  serviceRequestId: string,
  payload: RatingFormValues
): Promise<Rating> {
  const { data } = await axiosInstance.post<Rating>(
    `/ratings/service-request/${serviceRequestId}`,
    payload
  );
  return data;
}
