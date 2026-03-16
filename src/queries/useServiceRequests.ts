/**
 * Hooks de TanStack Query para solicitudes de servicio.
 */

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { queryKeys } from "@constants/queryKeys";
import {
  listServiceRequests,
  getServiceRequest,
  createServiceRequest,
  acceptServiceRequest,
  rejectServiceRequest,
  startServiceRequest,
  completeServiceRequest,
  cancelServiceRequest,
  type ListServiceRequestsFilters,
} from "@services/api/serviceRequestsApi";
import type {
  ServiceRequest,
  PaginatedResponse,
  RequestStatus,
} from "@types";
import type { CreateRequestFormValues } from "@types";

// ─── Lista (infinite) ─────────────────────────────────────────────────────────

export function useServiceRequests(
  filters: Omit<ListServiceRequestsFilters, "page"> = {}
) {
  return useInfiniteQuery<
    PaginatedResponse<ServiceRequest>,
    Error,
    InfiniteData<PaginatedResponse<ServiceRequest>>,
    ReturnType<typeof queryKeys.serviceRequests.list>,
    number
  >({
    queryKey: queryKeys.serviceRequests.list(filters),
    queryFn: ({ pageParam }) =>
      listServiceRequests({ ...filters, page: pageParam, size: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
  });
}

// ─── Detalle ──────────────────────────────────────────────────────────────────

export function useServiceRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.serviceRequests.detail(id),
    queryFn: () => getServiceRequest(id),
    enabled: !!id,
  });
}

// ─── Crear solicitud (CLIENT) ──────────────────────────────────────────────────

export function useCreateServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: CreateRequestFormValues & {
        maestroId: string;
        categoryId: string;
      }
    ) => createServiceRequest(payload),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.serviceRequests.all,
      });
    },
  });
}

// ─── Acciones de estado ────────────────────────────────────────────────────────

function useStatusMutation(
  mutateFn: (id: string, ...args: unknown[]) => Promise<ServiceRequest>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutateFn(id),
    onSuccess: (updated) => {
      qc.setQueryData<ServiceRequest>(
        queryKeys.serviceRequests.detail(updated.id),
        updated
      );
      void qc.invalidateQueries({ queryKey: queryKeys.serviceRequests.all });
    },
  });
}

/** (MAESTRO) Acepta una solicitud pendiente */
export function useAcceptServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptServiceRequest,
    onSuccess: (updated) => {
      qc.setQueryData<ServiceRequest>(
        queryKeys.serviceRequests.detail(updated.id),
        updated
      );
      void qc.invalidateQueries({ queryKey: queryKeys.serviceRequests.all });
    },
  });
}

/** (MAESTRO) Rechaza una solicitud */
export function useRejectServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectServiceRequest(id, reason),
    onSuccess: (updated) => {
      qc.setQueryData<ServiceRequest>(
        queryKeys.serviceRequests.detail(updated.id),
        updated
      );
      void qc.invalidateQueries({ queryKey: queryKeys.serviceRequests.all });
    },
  });
}

/** (MAESTRO) Inicia el trabajo */
export function useStartServiceRequest() {
  return useStatusMutation(startServiceRequest);
}

/** (MAESTRO) Completa el trabajo */
export function useCompleteServiceRequest() {
  return useStatusMutation(completeServiceRequest);
}

/** (CLIENT o MAESTRO) Cancela la solicitud */
export function useCancelServiceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelServiceRequest(id, reason),
    onSuccess: (updated) => {
      qc.setQueryData<ServiceRequest>(
        queryKeys.serviceRequests.detail(updated.id),
        updated
      );
      void qc.invalidateQueries({ queryKey: queryKeys.serviceRequests.all });
    },
  });
}

// ─── Helper: flatten páginas ───────────────────────────────────────────────────

export function flattenServiceRequests(
  data: InfiniteData<PaginatedResponse<ServiceRequest>> | undefined
): ServiceRequest[] {
  return data?.pages.flatMap((p) => p.content) ?? [];
}

/** Filtra solicitudes por status del lado del cliente (útil con datos mock) */
export function filterByStatus(
  requests: ServiceRequest[],
  status: RequestStatus
): ServiceRequest[] {
  return requests.filter((r) => r.status === status);
}
