/**
 * Endpoints del usuario autenticado (perfil propio).
 */

import axiosInstance from "./axiosInstance";
import type { User } from "@types";
import type { UpdateProfileFormValues } from "@types";

// ─── Functions ────────────────────────────────────────────────────────────────

/** Obtiene el perfil del usuario autenticado */
export async function getMe(): Promise<User> {
  const { data } = await axiosInstance.get<User>("/users/me");
  return data;
}

/** Actualiza nombre y teléfono del usuario autenticado */
export async function updateMe(payload: UpdateProfileFormValues): Promise<User> {
  const { data } = await axiosInstance.patch<User>("/users/me", payload);
  return data;
}

/** Sube o reemplaza la foto de perfil (multipart/form-data) */
export async function uploadAvatar(imageUri: string): Promise<User> {
  const formData = new FormData();
  // React Native acepta { uri, name, type } como File-like en FormData
  formData.append("file", {
    uri: imageUri,
    name: "avatar.jpg",
    type: "image/jpeg",
  } as unknown as Blob);

  const { data } = await axiosInstance.post<User>("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
