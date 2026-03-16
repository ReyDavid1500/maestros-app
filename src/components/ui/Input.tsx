import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";
import { useTheme } from "@hooks/useTheme";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  accessibilityLabel?: string;
  editable?: boolean;
  onBlur?: TextInputProps["onBlur"];
  onFocus?: TextInputProps["onFocus"];
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: TextInputProps["autoComplete"];
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  onSubmitEditing?: () => void;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  multiline = false,
  maxLength,
  keyboardType = "default",
  accessibilityLabel,
  editable = true,
  onBlur,
  onFocus,
  autoCapitalize = "sentences",
  autoComplete,
  returnKeyType,
  onSubmitEditing,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors } = useTheme();

  const borderColor = error
    ? colors.error
    : isFocused
      ? colors.primary
      : colors.border;

  return (
    <View className="w-full">
      {label ? (
        <Text className="text-sm font-inter-medium text-text mb-1.5">
          {label}
        </Text>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
        editable={editable}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e as Parameters<NonNullable<TextInputProps["onFocus"]>>[0]);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e as Parameters<NonNullable<TextInputProps["onBlur"]>>[0]);
        }}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        accessibilityLabel={accessibilityLabel ?? label}
        style={{
          borderColor,
          borderWidth: 1.5,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 10 : 0,
          height: multiline ? undefined : 48,
          minHeight: multiline ? 96 : undefined,
          backgroundColor: colors.surface,
          color: colors.text,
          fontFamily: "Inter_400Regular",
          fontSize: 15,
          textAlignVertical: multiline ? "top" : "center",
          opacity: editable ? 1 : 0.6,
        }}
      />

      {error ? (
        <Text className="text-xs font-inter text-error mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
