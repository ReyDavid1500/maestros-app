/**
 * Burbuja de mensaje individual.
 * - Propio (isOwnMessage=true): naranja, alineado a la derecha
 * - Otro: gris claro (surface), alineado a la izquierda
 * - El timestamp se muestra solo cuando `showTimestamp=true`
 */

import { View, Text } from "react-native";
import type { ChatMessage } from "@types";

interface MessageBubbleProps {
  message: ChatMessage;
  /** true si senderId === el userId del usuario autenticado */
  isOwnMessage: boolean;
  /** Mostrar timestamp: solo cuando hay un gap de >5 min desde el anterior */
  showTimestamp: boolean;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  isOwnMessage,
  showTimestamp,
}: MessageBubbleProps) {
  return (
    <View
      className={`px-4 mb-1 flex-row ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <View className={`max-w-[80%] ${isOwnMessage ? "items-end" : "items-start"}`}>
        {/* Burbuja */}
        <View
          className={`px-4 py-2 ${
            isOwnMessage
              ? "bg-primary rounded-2xl rounded-tr-sm"
              : "bg-surface rounded-2xl rounded-tl-sm"
          }`}
        >
          <Text
            className={`text-sm font-inter leading-5 ${
              isOwnMessage ? "text-white" : "text-text"
            }`}
            selectable
          >
            {message.content}
          </Text>
        </View>

        {/* Timestamp */}
        {showTimestamp && (
          <Text className="text-xs font-inter text-text-secondary mt-1 px-1">
            {formatTime(message.createdAt)}
          </Text>
        )}
      </View>
    </View>
  );
}
