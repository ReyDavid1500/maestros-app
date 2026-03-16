/**
 * Hooks de TanStack Query para valoraciones.
 */

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { queryKeys } from "@constants/queryKeys";
import {
  getMaestroRatings,
  createRating,
} from "@services/api/ratingsApi";
import type { Rating, PaginatedResponse } from "@types";
import type { RatingFormValues } from "@types";

// ─── Valoraciones de un maestro ───────────────────────────────────────────────

export function useMaestroRatings(maestroId: string) {
  return useInfiniteQuery<
    PaginatedResponse<Rating>,
    Error,
    InfiniteData<PaginatedResponse<Rating>>,
    ReturnType<typeof queryKeys.ratings.maestro>,
    number
  >({
    queryKey: queryKeys.ratings.maestro(maestroId),
    queryFn: ({ pageParam }) =>
      getMaestroRatings(maestroId, { page: pageParam, size: 10 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    enabled: !!maestroId,
  });
}

// ─── Crear valoración (CLIENT) ─────────────────────────────────────────────────

export function useCreateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      serviceRequestId,
      payload,
    }: {
      serviceRequestId: string;
      payload: RatingFormValues;
    }) => createRating(serviceRequestId, payload),
    onSuccess: (_rating, { serviceRequestId }) => {
      // Invalida el detalle de la solicitud (ahora tendrá rating)
      void qc.invalidateQueries({
        queryKey: queryKeys.serviceRequests.detail(serviceRequestId),
      });
      // Invalida la lista de maestros para refrescar averageRating
      void qc.invalidateQueries({ queryKey: queryKeys.maestros.all });
    },
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Aplana todas las páginas a un array plano de valoraciones */
export function flattenRatings(
  data: InfiniteData<PaginatedResponse<Rating>> | undefined
): Rating[] {
  return data?.pages.flatMap((p) => p.content) ?? [];
}
