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
  const { data } = await axiosInstance.put<User>("/users/me", payload);
  return data;
}

/** Sube una imagen a Azure Blob Storage y retorna la URL pública */
export async function uploadAvatar(imageUri: string): Promise<string> {
  const formData = new FormData();
  // React Native acepta { uri, name, type } como File-like en FormData
  formData.append("file", {
    uri: imageUri,
    name: "avatar.jpg",
    type: "image/jpeg",
  } as unknown as Blob);
  formData.append("folder", "profiles");

  const { data } = await axiosInstance.post<{ url: string }>("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}
