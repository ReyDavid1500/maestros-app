/**
 * Endpoints de solicitudes de servicio.
 * Los clientes crean solicitudes; los maestros las gestionan.
 */

import axiosInstance from "./axiosInstance";
import type {
  ServiceRequest,
  RequestStatus,
  PaginatedResponse,
} from "@types";
import type { CreateRequestFormValues } from "@types";

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface ListServiceRequestsFilters {
  status?: RequestStatus;
  page?: number;
  size?: number;
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Lista de solicitudes del usuario autenticado.
 * - CLIENT: sus solicitudes como cliente
 * - MAESTRO: solicitudes que le asignaron o que están pendientes
 */
export async function listServiceRequests(
  filters: ListServiceRequestsFilters = {}
): Promise<PaginatedResponse<ServiceRequest>> {
  const { data } = await axiosInstance.get<PaginatedResponse<ServiceRequest>>(
    "/service-requests",
    { params: filters }
  );
  return data;
}

/** Detalle de una solicitud */
export async function getServiceRequest(id: string): Promise<ServiceRequest> {
  const { data } = await axiosInstance.get<ServiceRequest>(
    `/service-requests/${id}`
  );
  return data;
}

/** (CLIENT) Crea una nueva solicitud de servicio */
export async function createServiceRequest(
  payload: CreateRequestFormValues & { maestroId: string; categoryId: string }
): Promise<ServiceRequest> {
  // El backend espera serviceCategoryId, no categoryId
  const { categoryId, ...rest } = payload;
  const { data } = await axiosInstance.post<ServiceRequest>(
    "/service-requests",
    { ...rest, serviceCategoryId: categoryId }
  );
  return data;
}

/** (MAESTRO) Acepta una solicitud pendiente */
export async function acceptServiceRequest(id: string): Promise<ServiceRequest> {
  const { data } = await axiosInstance.put<ServiceRequest>(
    `/service-requests/${id}/accept`
  );
  return data;
}

/** (MAESTRO) Rechaza una solicitud pendiente */
export async function rejectServiceRequest(id: string): Promise<ServiceRequest> {
  const { data } = await axiosInstance.put<ServiceRequest>(
    `/service-requests/${id}/reject`
  );
  return data;
}

/** (MAESTRO) Marca el trabajo como iniciado */
export async function startServiceRequest(id: string): Promise<ServiceRequest> {
  const { data } = await axiosInstance.put<ServiceRequest>(
    `/service-requests/${id}/start`
  );
  return data;
}

/** (MAESTRO) Marca el trabajo como completado */
export async function completeServiceRequest(id: string): Promise<ServiceRequest> {
  const { data } = await axiosInstance.put<ServiceRequest>(
    `/service-requests/${id}/complete`
  );
  return data;
}

/** (CLIENT) Cancela una solicitud (solo en estado PENDING) */
export async function cancelServiceRequest(id: string): Promise<ServiceRequest> {
  const { data } = await axiosInstance.put<ServiceRequest>(
    `/service-requests/${id}/cancel`
  );
  return data;
}
