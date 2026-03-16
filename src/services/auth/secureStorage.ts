/**
 * Wrapper sobre expo-secure-store.
 * Centraliza el acceso al almacenamiento cifrado (Keychain en iOS, Keystore en Android).
 * En web usa localStorage como fallback (SecureStore no tiene módulo nativo en browser).
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { logger } from "@utils/logger";
import type { User } from "@types";

// ─── Claves ───────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  userData: "user_data",
} as const;

// ─── Adaptador web / nativo ───────────────────────────────────────────────────

const isWeb = Platform.OS === "web";

async function storageGet(key: string): Promise<string | null> {
  if (isWeb) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  return SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string): Promise<void> {
  if (isWeb) {
    try { localStorage.setItem(key, value); } catch { /* no-op */ }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storageDelete(key: string): Promise<void> {
  if (isWeb) {
    try { localStorage.removeItem(key); } catch { /* no-op */ }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

/**
 * Guarda ambos tokens de forma atómica (Promise.all).
 * Si el almacenamiento falla, loggea pero NO lanza —
 * el usuario continuará con la sesión en memoria.
 */
export async function saveTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  try {
    await Promise.all([
      storageSet(STORAGE_KEYS.accessToken, accessToken),
      storageSet(STORAGE_KEYS.refreshToken, refreshToken),
    ]);
  } catch (error) {
    logger.error("[secureStorage] Error guardando tokens:", error);
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await storageGet(STORAGE_KEYS.accessToken);
  } catch (error) {
    logger.error("[secureStorage] Error leyendo access token:", error);
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await storageGet(STORAGE_KEYS.refreshToken);
  } catch (error) {
    logger.error("[secureStorage] Error leyendo refresh token:", error);
    return null;
  }
}

// ─── Datos de usuario ─────────────────────────────────────────────────────────

export async function saveUserData(user: User): Promise<void> {
  try {
    await storageSet(STORAGE_KEYS.userData, JSON.stringify(user));
  } catch (error) {
    logger.error("[secureStorage] Error guardando user data:", error);
  }
}

export async function getUserData(): Promise<User | null> {
  try {
    const raw = await storageGet(STORAGE_KEYS.userData);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch (error) {
    logger.error("[secureStorage] Error leyendo user data:", error);
    return null;
  }
}

// ─── Limpieza total ───────────────────────────────────────────────────────────

/** Elimina todas las claves del almacenamiento (logout) */
export async function clearAll(): Promise<void> {
  await Promise.allSettled([
    storageDelete(STORAGE_KEYS.accessToken),
    storageDelete(STORAGE_KEYS.refreshToken),
    storageDelete(STORAGE_KEYS.userData),
  ]);
}
