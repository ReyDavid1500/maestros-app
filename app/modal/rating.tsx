import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { goBack } from "@utils/navigation";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { RatingStars } from "@components/maestro/RatingStars";
import { useCreateRating } from "@queries/useRatings";
import { useTheme } from "@hooks/useTheme";

const MAX_COMMENT = 500;

const SCORE_LABELS: Record<number, string> = {
  1: "Muy malo",
  2: "Malo",
  3: "Regular",
  4: "Bueno",
  5: "Excelente",
};

/**
 * Modal de calificación — slide-up sheet.
 *
 * Params:
 *   - serviceRequestId: string (requerido)
 *   - maestroName: string (para personalizar el mensaje)
 *
 * Flujo:
 *   1. Usuario toca estrellas interactivas (1-5)
 *   2. Escribe comentario opcional (max 500 chars)
 *   3. Toca "Enviar calificación" → mutación → router.back()
 */
export default function RatingModal() {
  const { serviceRequestId, maestroName } = useLocalSearchParams<{
    serviceRequestId: string;
    maestroName: string;
  }>();
  const { colors } = useTheme();

  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");

  const createRating = useCreateRating();

  const handleSubmit = () => {
    if (score === 0) return;

    const trimmedComment = comment.trim();
    createRating.mutate(
      {
        serviceRequestId: serviceRequestId ?? "",
        payload: { score, ...(trimmedComment ? { comment: trimmedComment } : {}) },
      },
      {
        onSuccess: () => router.back(),
        onError: () =>
          Alert.alert(
            "Error",
            "No se pudo enviar la calificación. Intenta de nuevo."
          ),
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />

      {/* Fondo semitransparente */}
      <View className="flex-1 bg-background/80 justify-end">
        <View className="bg-background rounded-t-3xl p-6 pb-10">
          {/* Handle bar */}
          <View className="w-10 h-1 bg-border rounded-full self-center mb-6" />

          {/* Título */}
          <Text className="text-xl font-inter-bold text-text text-center mb-1">
            Califica tu experiencia
          </Text>
          {maestroName ? (
            <Text className="text-sm font-inter text-text-secondary text-center mb-6">
              ¿Cómo estuvo el servicio de {maestroName}?
            </Text>
          ) : (
            <Text className="text-sm font-inter text-text-secondary text-center mb-6">
              Cuéntanos cómo fue tu experiencia
            </Text>
          )}

          {/* Estrellas interactivas */}
          <View className="items-center mb-2">
            <RatingStars
              rating={score}
              size={40}
              interactive
              onRate={setScore}
            />
          </View>

          {/* Etiqueta del score */}
          <View className="items-center mb-8" style={{ minHeight: 24 }}>
            {score > 0 ? (
              <Text className="text-sm font-inter-semibold text-primary">
                {SCORE_LABELS[score]}
              </Text>
            ) : (
              <Text className="text-xs font-inter text-text-secondary">
                Toca una estrella para calificar
              </Text>
            )}
          </View>

          {/* Comentario opcional */}
          <View className="mb-6">
            <Text className="text-sm font-inter-medium text-text mb-2">
              Comentario{" "}
              <Text className="text-text-secondary font-inter">(opcional)</Text>
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 16,
                color: colors.text,
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                textAlignVertical: "top",
                minHeight: 100,
              }}
              placeholder="Describe tu experiencia con el maestro..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={MAX_COMMENT}
              value={comment}
              onChangeText={setComment}
            />
            <Text className="text-xs font-inter text-text-secondary text-right mt-1">
              {comment.length}/{MAX_COMMENT}
            </Text>
          </View>

          {/* Botón enviar */}
          <Pressable
            className="w-full rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-80"
            style={{
              backgroundColor: score > 0 ? colors.primary : colors.border,
            }}
            onPress={handleSubmit}
            disabled={score === 0 || createRating.isPending}
          >
            {createRating.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="star" size={18} color="white" />
            )}
            <Text className="text-white font-inter-semibold">
              {createRating.isPending ? "Enviando…" : "Enviar calificación"}
            </Text>
          </Pressable>

          {/* Cancelar */}
          <Pressable
            className="items-center mt-4 py-2 active:opacity-60"
            onPress={() => goBack("/(client)/requests")}
          >
            <Text className="text-text-secondary font-inter text-sm">
              Cancelar
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
