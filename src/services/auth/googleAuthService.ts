/**
 * Servicio de autenticación con Google usando PKCE.
 * PKCE (Proof Key for Code Exchange) es el estándar de seguridad para OAuth
 * en aplicaciones móviles nativas — previene ataques de interceptación de código.
 *
 * Flujo:
 * 1. App genera code_verifier y code_challenge (expo-auth-session lo hace automáticamente)
 * 2. Abre el navegador con la URL de Google incluyendo code_challenge
 * 3. Google redirige de vuelta con el id_token
 * 4. App envía solo el id_token al backend propio (NUNCA a Google APIs directamente)
 * 5. Backend verifica el id_token con Google y retorna access/refresh tokens propios
 */

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

// Necesario para que expo-auth-session complete el flujo en iOS/Android
WebBrowser.maybeCompleteAuthSession();

// ─── Configuración de Google OAuth ────────────────────────────────────────────

const DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};

function getClientId(): string {
  if (Platform.OS === "ios") {
    return process.env["EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS"] ?? "";
  }
  if (Platform.OS === "android") {
    return process.env["EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID"] ?? "";
  }
  // web
  return process.env["EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB"] ?? "";
}

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
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "maestros", // Debe coincidir con el scheme en app.config.ts
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: getClientId(),
      scopes: ["openid", "email", "profile"],
      redirectUri,
      usePKCE: true, // PKCE activado — expo-auth-session genera code_verifier y challenge
      responseType: AuthSession.ResponseType.IdToken,
    },
    DISCOVERY
  );

  // En modo mock el request no llega a construirse, pero isLoading debe ser false
  const isLoading = process.env.EXPO_PUBLIC_USE_MOCK === "true" ? false : !request;

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

  // Manejar la respuesta automática cuando el componente se monta
  // (para casos donde el resultado llega por deep link antes de que el componente esté listo)
  void response; // La respuesta es procesada internamente por expo-auth-session

  return { signInWithGoogle, isLoading };
}
