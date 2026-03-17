/**
 * Servicio de autenticación con Google usando expo-auth-session/providers/google.
 *
 * Flujo:
 * 1. Abre el navegador con Google OAuth (useIdTokenAuthRequest maneja nonce y redirect URI)
 * 2. Google redirige de vuelta con el id_token
 * 3. App envía el id_token al backend propio
 * 4. Backend verifica el id_token con Google y retorna access/refresh tokens propios
 */

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useState, useEffect } from "react";

// Necesario para que expo-auth-session complete el flujo en iOS/Android
WebBrowser.maybeCompleteAuthSession();

// ─── Hook de autenticación ────────────────────────────────────────────────────

/**
 * Hook que configura y expone la función de inicio de sesión con Google.
 * Debe usarse en un componente (es un hook, no una función pura).
 *
 * @returns `{ signInWithGoogle, isLoading }` — llamar signInWithGoogle para iniciar el flujo
 */
export function useGoogleAuth(): {
  signInWithGoogle: () => Promise<string>;
  isLoading: boolean;
} {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env["EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB"] ?? "",
    iosClientId: process.env["EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS"] ?? "",
    androidClientId: process.env["EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID"] ?? "",
  });

  // Timeout de seguridad: si el request no se construye en 3s, mostramos el botón igual
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (request) return;
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [request]);

  // En modo mock el request no llega a construirse, pero isLoading debe ser false
  const isLoading =
    process.env.EXPO_PUBLIC_USE_MOCK === "true"
      ? false
      : !request && !timedOut;

  const signInWithGoogle = async (): Promise<string> => {
    // En modo mock: retornar token falso sin abrir el navegador de Google
    if (process.env.EXPO_PUBLIC_USE_MOCK === "true") {
      return "mock-google-id-token";
    }

    const result = await promptAsync();

    if (result.type === "cancel" || result.type === "dismiss") {
      throw new Error("El usuario canceló el inicio de sesión");
    }

    if (result.type === "error") {
      throw new Error(
        result.error?.message ?? "Error en el inicio de sesión con Google"
      );
    }

    if (result.type !== "success") {
      throw new Error("Inicio de sesión con Google fallido");
    }

    const idToken = result.params["id_token"];
    if (!idToken) {
      throw new Error("No se recibió el token de Google");
    }

    // Retorna el id_token para que authStore lo intercambie en el backend
    return idToken;
  };

  void response; // La respuesta es procesada internamente por expo-auth-session

  return { signInWithGoogle, isLoading };
}
