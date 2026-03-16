import { useEffect, useRef, useState } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput, Alert, Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { goBack } from "@utils/navigation";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePendingRequestStore } from "@stores/pendingRequestStore";
import { createRequestSchema } from "@utils/validationSchemas";
import { useTheme } from "@hooks/useTheme";
import type { CreateRequestFormValues } from "@types";

/** Opciones de hora disponibles para el horario de la visita */
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

/** Devuelve fecha como string YYYY-MM-DD para N días desde hoy */
const dateLabel = (daysFromNow: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });
};

const dateISO = (daysFromNow: number, time: string): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h!, m!, 0, 0);
  return d.toISOString();
};

/**
 * Formulario de nueva solicitud de servicio.
 * Los datos se persisten en pendingRequestStore para sobrevivir
 * la eventual recarga de la app durante el flujo OAuth.
 */
export default function CreateRequestScreen() {
  const { maestroId, maestroName, categoryId } = useLocalSearchParams<{
    maestroId: string;
    maestroName: string;
    categoryId: string;
  }>();
  const { colors } = useTheme();
  const pending = usePendingRequestStore();

  // Selector de fecha/hora simplificado (sin dep nativa)
  const [selectedDay, setSelectedDay] = useState(1); // mañana por defecto
  const [selectedTime, setSelectedTime] = useState("09:00");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateRequestFormValues>({
    resolver: yupResolver(createRequestSchema) as unknown as Resolver<CreateRequestFormValues>,
    defaultValues: {
      description: pending.description || "",
      addressStreet: pending.addressStreet || "",
      addressNumber: pending.addressNumber || "",
      addressCity: pending.addressCity || "",
      addressInstructions: pending.addressInstructions || "",
      scheduledAt: new Date(dateISO(selectedDay, selectedTime)),
    },
  });

  // Sincronizar scheduledAt cuando cambia día/hora
  useEffect(() => {
    setValue("scheduledAt", new Date(dateISO(selectedDay, selectedTime)));
  }, [selectedDay, selectedTime, setValue]);

  const onSubmit = (data: CreateRequestFormValues) => {
    pending.setFields({
      maestroId: maestroId ?? null,
      maestroName: maestroName ?? null,
      categoryId: categoryId ?? null,
      categoryName: null,
      description: data.description,
      addressStreet: data.addressStreet,
      addressNumber: data.addressNumber,
      addressCity: data.addressCity,
      addressInstructions: data.addressInstructions ?? "",
      scheduledAt: (data.scheduledAt as Date).toISOString(),
      termsAccepted: false,
    });
    router.push("/(client)/request/confirm");
  };

  const FieldError = ({ msg }: { msg: string | undefined }) =>
    msg ? <Text className="text-error text-xs mt-1 font-inter">{msg}</Text> : null;

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
        <View className="flex-1">
          <Text className="text-xl font-inter-bold text-text">
            Nueva solicitud
          </Text>
          {maestroName ? (
            <Text className="text-xs font-inter text-text-secondary" numberOfLines={1}>
              Para: {maestroName}
            </Text>
          ) : null}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Descripción ─────────────────────────────────────── */}
        <View className="mb-5">
          <Text className="text-sm font-inter-medium text-text mb-1.5">
            ¿Qué necesitas que hagan? *
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-sm font-inter text-text"
                style={{ minHeight: 120, textAlignVertical: "top", borderWidth: 1, borderColor: errors.description ? colors.error : colors.border }}
                placeholder="Describe el trabajo con detalle: qué falló, dónde está, qué necesitas..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={1000}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <View className="flex-row justify-between mt-1">
            <FieldError msg={errors.description?.message} />
            <Controller
              control={control}
              name="description"
              render={({ field: { value } }) => (
                <Text className="text-xs font-inter text-text-secondary ml-auto">
                  {value?.length ?? 0}/1000
                </Text>
              )}
            />
          </View>
        </View>

        {/* ── Dirección ───────────────────────────────────────── */}
        <Text className="text-sm font-inter-medium text-text mb-3">
          Dirección del trabajo *
        </Text>

        <View className="flex-row gap-3 mb-3">
          {/* Calle */}
          <View className="flex-[2]">
            <Controller
              control={control}
              name="addressStreet"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-surface rounded-2xl px-4 py-3 text-sm font-inter text-text"
                  style={{ borderWidth: 1, borderColor: errors.addressStreet ? colors.error : colors.border }}
                  placeholder="Calle / Av."
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <FieldError msg={errors.addressStreet?.message} />
          </View>

          {/* Número */}
          <View className="flex-1">
            <Controller
              control={control}
              name="addressNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-surface rounded-2xl px-4 py-3 text-sm font-inter text-text"
                  style={{ borderWidth: 1, borderColor: errors.addressNumber ? colors.error : colors.border }}
                  placeholder="N°"
                  placeholderTextColor={colors.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                />
              )}
            />
            <FieldError msg={errors.addressNumber?.message} />
          </View>
        </View>

        {/* Ciudad */}
        <View className="mb-3">
          <Controller
            control={control}
            name="addressCity"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-sm font-inter text-text"
                style={{ borderWidth: 1, borderColor: errors.addressCity ? colors.error : colors.border }}
                placeholder="Ciudad / Comuna"
                placeholderTextColor={colors.textSecondary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FieldError msg={errors.addressCity?.message} />
        </View>

        {/* Instrucciones adicionales */}
        <View className="mb-5">
          <Controller
            control={control}
            name="addressInstructions"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-surface rounded-2xl px-4 py-3 text-sm font-inter text-text"
                style={{ borderWidth: 1, borderColor: colors.border }}
                placeholder="Instrucciones adicionales (depto, piso, portón...) — opcional"
                placeholderTextColor={colors.textSecondary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                maxLength={500}
              />
            )}
          />
        </View>

        {/* ── Fecha ────────────────────────────────────────────── */}
        <Text className="text-sm font-inter-medium text-text mb-3">
          ¿Cuándo necesitas la visita? *
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4, marginBottom: 12 }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <Pressable
              key={day}
              className="rounded-xl px-4 py-2 items-center active:opacity-70"
              style={{
                backgroundColor: selectedDay === day ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedDay === day ? colors.primary : colors.border,
              }}
              onPress={() => setSelectedDay(day)}
            >
              <Text
                className="text-xs font-inter-medium"
                style={{ color: selectedDay === day ? "white" : colors.text }}
              >
                {dateLabel(day)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Hora ─────────────────────────────────────────────── */}
        <View className="flex-row flex-wrap gap-2 mb-5">
          {TIME_SLOTS.map((slot) => (
            <Pressable
              key={slot}
              className="rounded-xl px-3 py-2 active:opacity-70"
              style={{
                backgroundColor: selectedTime === slot ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selectedTime === slot ? colors.primary : colors.border,
              }}
              onPress={() => setSelectedTime(slot)}
            >
              <Text
                className="text-sm font-inter-medium"
                style={{ color: selectedTime === slot ? "white" : colors.text }}
              >
                {slot}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Método de pago (fijo) ─────────────────────────────── */}
        <View
          className="flex-row items-center gap-3 bg-surface rounded-2xl px-4 py-4 mb-6"
          style={{ borderWidth: 1, borderColor: colors.border }}
        >
          <Ionicons name="cash-outline" size={22} color={colors.primary} />
          <View className="flex-1">
            <Text className="text-sm font-inter-medium text-text">
              Método de pago
            </Text>
            <Text className="text-xs font-inter text-text-secondary">
              Efectivo al momento del servicio
            </Text>
          </View>
        </View>

        {/* ── Botón continuar ──────────────────────────────────── */}
        <Pressable
          className="w-full bg-primary rounded-2xl py-4 items-center active:opacity-80"
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-white font-inter-semibold text-base">
            Continuar
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
