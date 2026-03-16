/**
 * Input de chat con botón de envío.
 * - Throttle de 500ms para limitar a 2 mensajes/segundo
 * - Debounce del indicador de escritura (1 segundo)
 * - Multilínea pero comienza en 1 línea
 */

import { useRef, useState, useCallback } from "react";
import { View, TextInput, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";
import { useThrottledAction } from "@hooks/useThrottledAction";

interface ChatInputProps {
  onSend: (content: string) => void;
  /** Callback para indicador de escritura (debounce aplicado internamente) */
  onTyping?: () => void;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  onTyping,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const { colors } = useTheme();

  // Ref para debounce del typing indicator
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendFn = useCallback(
    (content: string) => {
      onSend(content);
    },
    [onSend]
  );

  const [throttledSend, isThrottled] = useThrottledAction(sendFn, 500);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isThrottled) return;
    setText("");
    throttledSend(trimmed);
  };

  const handleChangeText = (value: string) => {
    setText(value);

    // Debounce del typing indicator: no enviar en cada keystroke
    if (onTyping) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTyping();
      }, 1000);
    }
  };

  const canSend = text.trim().length > 0 && !disabled && !isThrottled;

  return (
    <View className="flex-row items-center px-3 py-2 gap-2 bg-background border-t border-border">
      <TextInput
        value={text}
        onChangeText={handleChangeText}
        onSubmitEditing={Platform.OS === "web" ? handleSend : undefined}
        placeholder="Escribe un mensaje..."
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={1000}
        returnKeyType="send"
        blurOnSubmit={false}
        style={{
          flex: 1,
          minHeight: 36,
          maxHeight: 76,
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderRadius: 20,
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          color: colors.text,
          lineHeight: 20,
        }}
        accessibilityLabel="Campo de mensaje"
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={!canSend}
        accessibilityLabel="Enviar mensaje"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: canSend ? colors.primary : colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="send" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
