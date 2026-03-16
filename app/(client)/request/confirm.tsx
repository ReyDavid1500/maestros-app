import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { goBack } from "@utils/navigation";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useGoogleAuth } from "@services/auth/googleAuthService";
import { useAuthStore } from "@stores/authStore";
import { usePendingRequestStore } from "@stores/pendingRequestStore";
import { useCreateServiceRequest } from "@queries/useServiceRequests";
import { Avatar } from "@components/ui/Avatar";
import { useAuth } from "@hooks/useAuth";
import { useThrottledAction } from "@hooks/useThrottledAction";
import { formatDate } from "@utils/formatDate";
import { useTheme } from "@hooks/useTheme";
import type { User } from "@types";

/**
 * Pantalla de confirmación — el único lugar donde se pide autenticación al cliente.
 *
 * Flujo sin sesión:
 *   "Continuar con Google" → Google OAuth → authStore.signInWithGoogle(idToken) → [useEffect] → createRequest
 *
 * Flujo con sesión previa:
 *   Botón "Confirmar solicitud" → createRequest directamente
 */
export default function ConfirmRequestScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const pending = usePendingRequestStore();
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const { signInWithGoogle: getGoogleToken, isLoading: isOAuthLoading } = useGoogleAuth();
  const createRequest = useCreateServiceRequest();
  const [termsAccepted, setTermsAccepted] = useState(pending.termsAccepted);
  const [isCreating, setIsCreating] = useState(false);
  const [justAuthenticated, setJustAuthenticated] = useState(false);

  const isLoading = isAuthLoading || isOAuthLoading || isCreating || createRequest.isPending;

  // Cuando el usuario se acaba de autenticar, crear la solicitud automáticamente
  useEffect(() => {
    if (justAuthenticated && isAuthenticated && pending.hasData() && !isCreating) {
      void handleCreateRequest();
    }
  }, [justAuthenticated, isAuthenticated]);

  const handleCreateRequest = async () => {
    if (!pending.maestroId || !pending.categoryId || !pending.scheduledAt) {
      Alert.alert("Error", "Faltan datos de la solicitud. Vuelve al formulario.");
      return;
    }
    setIsCreating(true);
    try {
      const sr = await createRequest.mutateAsync({
        maestroId: pending.maestroId,
        categoryId: pending.categoryId,
        description: pending.description,
        addressStreet: pending.addressStreet,
        addressNumber: pending.addressNumber,
        addressCity: pending.addressCity,
        ...(pending.addressInstructions
          ? { addressInstructions: pending.addressInstructions }
          : {}),
        scheduledAt: new Date(pending.scheduledAt),
      });
      pending.clear();
      router.replace(`/(client)/request/${sr.id}`);
    } catch {
      Alert.alert("Error", "No se pudo crear la solicitud. Intenta nuevamente.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!termsAccepted) {
      Alert.alert("Términos requeridos", "Acepta los términos y condiciones para continuar.");
      return;
    }
    try {
      const idToken = await getGoogleToken();
      await signInWithGoogle(idToken);
      setJustAuthenticated(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al iniciar sesión";
      if (!msg.toLowerCase().includes("canceló")) {
        Alert.alert("Error de inicio de sesión", msg);
      }
    }
  };

  const handleConfirm = async () => {
    if (!termsAccepted) {
      Alert.alert("Términos requeridos", "Acepta los términos y condiciones para continuar.");
      return;
    }
    await handleCreateRequest();
  };

  const [throttledConfirm] = useThrottledAction(handleConfirm, 2000);
  const [throttledGoogle] = useThrottledAction(handleGoogleLogin, 2000);

  if (!pending.hasData()) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-text-secondary font-inter text-center">
          No hay datos de solicitud. Completa el formulario primero.
        </Text>
        <Pressable className="mt-4" onPress={() => goBack("/(client)")}>
          <Text className="text-primary font-inter-semibold">Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 gap-3">
        <Pressable
          className="w-10 h-10 items-center justify-center rounded-full active:opacity-60"
          style={{ backgroundColor: colors.surface }}
          onPress={() => goBack("/(client)")}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text className="text-xl font-inter-bold text-text">
          Confirmar solicitud
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Resumen (solo lectura) ──────────────────────────── */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-sm font-inter-semibold text-text mb-3">
            Resumen de tu solicitud
          </Text>

          {/* Maestro */}
          {pending.maestroName ? (
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="person-outline" size={16} color={colors.primary} />
              <Text className="text-sm font-inter text-text-secondary">
                Maestro:{" "}
                <Text className="font-inter-medium text-text">
                  {pending.maestroName}
                </Text>
              </Text>
            </View>
          ) : null}

          {/* Descripción */}
          <View className="flex-row items-start gap-2 mb-3">
            <Ionicons name="document-text-outline" size={16} color={colors.primary} />
            <Text className="text-sm font-inter text-text-secondary flex-1" numberOfLines={3}>
              {pending.description}
            </Text>
          </View>

          {/* Dirección */}
          <View className="flex-row items-start gap-2 mb-3">
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text className="text-sm font-inter text-text-secondary flex-1">
              {pending.addressStreet} {pending.addressNumber}, {pending.addressCity}
              {pending.addressInstructions
                ? `\n${pending.addressInstructions}`
                : ""}
            </Text>
          </View>

          {/* Fecha */}
          {pending.scheduledAt ? (
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text className="text-sm font-inter text-text-secondary">
                {formatDate(pending.scheduledAt)}
              </Text>
            </View>
          ) : null}

          {/* Pago */}
          <View className="flex-row items-center gap-2">
            <Ionicons name="cash-outline" size={16} color={colors.primary} />
            <Text className="text-sm font-inter text-text-secondary">
              Pago en efectivo
            </Text>
          </View>
        </View>

        {/* ── Términos ─────────────────────────────────────────── */}
        <Pressable
          className="flex-row items-center gap-3 mb-6 active:opacity-75"
          onPress={() => setTermsAccepted((v) => !v)}
        >
          <View
            className="w-6 h-6 rounded-md items-center justify-center"
            style={{
              backgroundColor: termsAccepted ? colors.primary : "transparent",
              borderWidth: 2,
              borderColor: termsAccepted ? colors.primary : colors.border,
            }}
          >
            {termsAccepted && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
          <Text className="text-sm font-inter text-text-secondary flex-1">
            Acepto los{" "}
            <Text
              className="text-primary font-inter-semibold"
              onPress={() => router.push("/modal/terms")}
            >
              Términos y Condiciones
            </Text>
          </Text>
        </Pressable>

        {/* ── Sección de autenticación / confirmación ─────────── */}
        {isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator color={colors.primary} size="large" />
            <Text className="text-sm font-inter text-text-secondary mt-3">
              {isCreating || createRequest.isPending
                ? "Creando solicitud..."
                : "Verificando identidad..."}
            </Text>
          </View>
        ) : isAuthenticated && user ? (
          /* Usuario ya autenticado */
          <View className="gap-4">
            <View className="flex-row items-center gap-3 bg-surface rounded-2xl p-3">
              <Avatar uri={user.photoUrl} name={user.name} size="sm" />
              <View className="flex-1">
                <Text className="text-sm font-inter-semibold text-text">
                  {user.name}
                </Text>
                <Text className="text-xs font-inter text-text-secondary">{user.email}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>

            <Pressable
              className="w-full bg-primary rounded-2xl py-4 items-center active:opacity-80"
              onPress={throttledConfirm}
            >
              <Text className="text-white font-inter-semibold text-base">
                Confirmar solicitud
              </Text>
            </Pressable>
          </View>
        ) : (
          /* Usuario no autenticado */
          <View className="gap-4">
            <Pressable
              className="w-full bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-3 active:opacity-80"
              onPress={throttledGoogle}
            >
              <View className="w-6 h-6 items-center justify-center">
                <Text className="text-base font-bold">
                  <Text style={{ color: "#fff" }}>G</Text>
                </Text>
              </View>
              <Text className="text-white font-inter-semibold text-base">
                Continuar con Google
              </Text>
            </Pressable>

            <Text className="text-xs font-inter text-text-secondary text-center leading-relaxed">
              Necesitamos verificar tu identidad para que el maestro sepa quién lo contrata.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
