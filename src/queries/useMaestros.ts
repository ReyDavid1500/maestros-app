/**
 * Hooks de TanStack Query para maestros y categorías.
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
  listMaestros,
  searchMaestros,
  getMaestro,
  createMaestroProfile,
  updateMaestroProfile,
  setMaestroAvailability,
  type ListMaestrosFilters,
} from "@services/api/maestrosApi";
import axiosInstance from "@services/api/axiosInstance";
import type { ServiceCategory, MaestroProfile, PaginatedResponse, MaestroListItem } from "@types";
import type { CreateMaestroProfileFormValues } from "@types";

// ─── Categorías ───────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async (): Promise<ServiceCategory[]> => {
      const { data } = await axiosInstance.get<ServiceCategory[]>("/categories");
      return data;
    },
    staleTime: 1000 * 60 * 30, // Las categorías cambian poco — 30 min
  });
}

// ─── Lista de maestros (infinite scroll) ────────────────────────────────────

export function useMaestros(filters: Omit<ListMaestrosFilters, "page"> = {}) {
  return useInfiniteQuery<
    PaginatedResponse<MaestroListItem>,
    Error,
    InfiniteData<PaginatedResponse<MaestroListItem>>,
    ReturnType<typeof queryKeys.maestros.list>,
    number
  >({
    queryKey: queryKeys.maestros.list(filters),
    queryFn: ({ pageParam }) =>
      listMaestros({ ...filters, page: pageParam, size: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
  });
}

// ─── Detalle de maestro ───────────────────────────────────────────────────────

export function useMaestro(id: string) {
  return useQuery({
    queryKey: queryKeys.maestros.detail(id),
    queryFn: () => getMaestro(id),
    enabled: !!id,
  });
}

// ─── Perfil propio del maestro ────────────────────────────────────────────────

export function useCreateMaestroProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMaestroProfileFormValues) =>
      createMaestroProfile(payload),
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.maestros.detail(profile.id), profile);
      void qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useUpdateMaestroProfile(profileId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateMaestroProfileFormValues>) =>
      updateMaestroProfile(payload),
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.maestros.detail(profileId), profile);
    },
  });
}

export function useSetMaestroAvailability(profileId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isAvailable: boolean) => setMaestroAvailability(isAvailable),
    onSuccess: (profile) => {
      qc.setQueryData<MaestroProfile>(
        queryKeys.maestros.detail(profileId),
        (old) => (old ? { ...old, isAvailable: profile.isAvailable } : old)
      );
    },
  });
}

// ─── Búsqueda por texto libre ─────────────────────────────────────────────────

export function useMaestrosSearch(q: string) {
  return useInfiniteQuery<
    PaginatedResponse<MaestroListItem>,
    Error,
    InfiniteData<PaginatedResponse<MaestroListItem>>,
    readonly ["maestros", "search", string],
    number
  >({
    queryKey: ["maestros", "search", q] as const,
    queryFn: ({ pageParam }) =>
      searchMaestros({ q, page: pageParam, size: 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    enabled: q.trim().length > 0,
  });
}
