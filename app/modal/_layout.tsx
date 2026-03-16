import { Stack } from "expo-router";

/**
 * Layout del grupo de modales.
 * La presentación como sheet la define el root _layout.tsx
 * (presentation: "modal"). Aquí solo configuramos el Stack interno
 * sin headers para que cada pantalla modal gestione su propio UI.
 */
export default function ModalLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
