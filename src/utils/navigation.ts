import { router } from "expo-router";

/**
 * Navega hacia atrás si hay historial; si no (ej. acceso directo por URL en web),
 * redirige a la ruta `fallback`.
 */
export function goBack(fallback: string) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as Parameters<typeof router.replace>[0]);
  }
}
