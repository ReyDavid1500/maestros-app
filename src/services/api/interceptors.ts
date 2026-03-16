import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearAll,
} from "@services/auth/secureStorage";

// ─── Tipos de error enriquecidos ──────────────────────────────────────────────

export interface AppApiError {
  message: string;
  status: number;
  isNetworkError: boolean;
}

export interface RateLimitError extends AppApiError {
  isRateLimit: true;
  retryAfterSeconds: number;
}

export function isRateLimitError(err: unknown): err is RateLimitError {
  return (
    typeof err === "object" && err !== null && "isRateLimit" in err
  );
}

export function isAppApiError(err: unknown): err is AppApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "message" in err
  );
}

// ─── Estado del refresh ───────────────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function clearSession() {
  await clearAll();
  // TODO Fase 05: llamar a authStore.getState().signOut() para limpiar el estado
}

// ─── Aplicar interceptores a la instancia ────────────────────────────────────

export function applyInterceptors(instance: AxiosInstance): void {
  // ── Request: inyectar JWT ────────────────────────────────────────────────
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAccessToken();
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error: unknown) => Promise.reject(error),
  );

  // ── Response: manejo de errores ──────────────────────────────────────────
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      const status = error.response?.status;

      // ── 401: renovar token ─────────────────────────────────────────────
      if (
        status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/auth/refresh") &&
        !originalRequest.url?.includes("/auth/google")
      ) {
        if (isRefreshing) {
          // Encolar requests mientras se renueva el token
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
              }
              resolve(instance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const storedRefreshToken = await getRefreshToken();

          if (!storedRefreshToken) {
            await clearSession();
            return Promise.reject(buildError("Sesión expirada.", 401));
          }

          const { data } = await instance.post<{
            data: { accessToken: string; refreshToken: string };
          }>("/auth/refresh", { refreshToken: storedRefreshToken });

          const { accessToken, refreshToken: newRefreshToken } = data.data;
          await saveTokens(accessToken, newRefreshToken);

          onRefreshed(accessToken);

          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          }
          return instance(originalRequest);
        } catch {
          await clearSession();
          return Promise.reject(buildError("Sesión expirada.", 401));
        } finally {
          isRefreshing = false;
          refreshSubscribers = [];
        }
      }

      // ── 429: rate limit ────────────────────────────────────────────────
      if (status === 429) {
        const retryAfter = error.response?.headers?.["retry-after"];
        const retryAfterSeconds = retryAfter ? parseInt(String(retryAfter), 10) : 60;
        const rateLimitError: RateLimitError = {
          message: "Demasiadas solicitudes. Espera un momento.",
          status: 429,
          isNetworkError: false,
          isRateLimit: true,
          retryAfterSeconds,
        };
        return Promise.reject(rateLimitError);
      }

      // ── Error genérico ─────────────────────────────────────────────────
      const responseData = error.response?.data as
        | { success: false; message: string }
        | undefined;

      if (responseData?.message) {
        return Promise.reject(
          buildError(responseData.message, status ?? 0),
        );
      }

      if (!error.response) {
        return Promise.reject(
          buildError("Error de conexión. Verifica tu internet.", 0, true),
        );
      }

      return Promise.reject(buildError("Ocurrió un error inesperado.", status ?? 0));
    },
  );
}

function buildError(
  message: string,
  status: number,
  isNetworkError = false,
): AppApiError {
  return { message, status, isNetworkError };
}
