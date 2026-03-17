/**
 * Endpoints de autenticación.
 * El backend usa Google OAuth — el token ID de Google se intercambia
 * por un par access/refresh token propios de la app.
 */

import axiosInstance from "./axiosInstance";
import type { User } from "@types";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface GoogleSignInRequest {
  idToken: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  isNewUser: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ─── Functions ────────────────────────────────────────────────────────────────

/** Intercambia el idToken de Google por tokens propios de la app */
export async function googleSignIn(
  payload: GoogleSignInRequest
): Promise<AuthTokensResponse> {
  const { data } = await axiosInstance.post<AuthTokensResponse>(
    "/auth/google",
    payload
  );
  return data;
}

/**
 * Renueva el access token usando el refresh token.
 * Llamado automáticamente por el interceptor 401 — no usar directamente.
 */
export async function refreshTokens(
  payload: RefreshTokenRequest
): Promise<AuthTokensResponse> {
  const { data } = await axiosInstance.post<AuthTokensResponse>(
    "/auth/refresh",
    payload
  );
  return data;
}

/** Invalida el access token en el servidor (el Bearer va en el header automáticamente) */
export async function signOut(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}
