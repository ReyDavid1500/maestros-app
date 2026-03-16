import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { goBack } from "@utils/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@stores/authStore";
import {
  useMaestro,
  useCreateMaestroProfile,
  useUpdateMaestroProfile,
} from "@queries/useMaestros";
import { useCategories } from "@queries/useMaestros";
import { Button } from "@components/ui/Button";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import { useTheme } from "@hooks/useTheme";
import { formatCLP } from "@utils/formatCLP";
import type { CreateMaestroProfileFormValues } from "@types";
import type { Resolver } from "react-hook-form";

// ─── Validación ───────────────────────────────────────────────────────────────

const serviceSchema = yup.object({
  categoryId: yup.string().required(),
  priceClp: yup
    .number()
    .typeError("Ingresa un precio válido")
    .min(1, "El precio debe ser mayor a $0")
    .max(10_000_000, "El precio no puede superar $10.000.000")
    .required("El precio es obligatorio"),
  estimatedTime: yup.string().required("Ingresa el tiempo estimado"),
});

const schema = yup.object({
  description: yup
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .required("La descripción es obligatoria"),
  phone: yup
    .string()
    .matches(/^\+?\d{9,15}$/, "Teléfono inválido")
    .required("El teléfono es obligatorio"),
  services: yup
    .array(serviceSchema)
    .min(1, "Agrega al menos un servicio")
    .required(),
});

/**
 * Pantalla de onboarding / edición de perfil del maestro.
 * Formulario con React Hook Form + Yup.
 * Modo onboarding: POST /maestros/me/profile
 * Modo edición: PUT /maestros/me/profile
 */
function EditProfileSkeleton() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-14 pb-10">
        <View className="flex-row items-center gap-3 mb-6">
          <SkeletonLoader width={60} height={32} borderRadius={8} />
          <SkeletonLoader width={120} height={22} borderRadius={6} />
        </View>
        <SkeletonLoader width={160} height={16} borderRadius={4} style={{ marginBottom: 16 }} />
        <View className="mb-4">
          <SkeletonLoader width={60} height={13} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonLoader width="100%" height={44} borderRadius={12} />
        </View>
        <View className="mb-6">
          <SkeletonLoader width={130} height={13} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonLoader width="100%" height={100} borderRadius={12} />
        </View>
        <SkeletonLoader width={100} height={16} borderRadius={4} style={{ marginBottom: 16 }} />
        <View className="bg-surface rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <SkeletonLoader width={100} height={14} borderRadius={4} />
            <SkeletonLoader width={20} height={20} borderRadius={10} />
          </View>
          <View className="mb-2">
            <SkeletonLoader width={100} height={11} borderRadius={4} style={{ marginBottom: 4 }} />
            <SkeletonLoader width="100%" height={40} borderRadius={10} />
          </View>
          <View>
            <SkeletonLoader width={100} height={11} borderRadius={4} style={{ marginBottom: 4 }} />
            <SkeletonLoader width="100%" height={40} borderRadius={10} />
          </View>
        </View>
        <SkeletonLoader width="100%" height={52} borderRadius={14} />
      </View>
    </View>
  );
}

export default function EditMaestroProfileScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const maestroId = user?.id ?? "";

  const { data: profile, isLoading: isLoadingProfile } = useMaestro(maestroId);
  const { data: categories = [], isLoading: isLoadingCats } = useCategories();

  const isOnboarding = !profile;

  const createMutation = useCreateMaestroProfile();
  const updateMutation = useUpdateMaestroProfile(maestroId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateMaestroProfileFormValues>({
    resolver: yupResolver(schema) as unknown as Resolver<CreateMaestroProfileFormValues>,
    defaultValues: {
      description: profile?.description ?? "",
      phone: user?.phone ?? "",
      services: profile?.services.map((s) => ({
        categoryId: s.serviceCategory.id,
        priceClp: s.priceClp,
        estimatedTime: s.estimatedTime,
      })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "services",
  });

  const watchedServices = watch("services");

  const onSubmit = (values: CreateMaestroProfileFormValues) => {
    if (isOnboarding) {
      createMutation.mutate(values, {
        onSuccess: () => router.back(),
      });
    } else {
      updateMutation.mutate(values, {
        onSuccess: () => router.back(),
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoadingProfile || isLoadingCats) {
    return <EditProfileSkeleton />;
  }

  // Categorías no seleccionadas todavía
  const selectedCategoryIds = watchedServices?.map((s) => s.categoryId) ?? [];
  const availableCategories = categories.filter(
    (c) => !selectedCategoryIds.includes(c.id)
  );

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-14 pb-10">
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-6">
          <Button
            label="← Volver"
            onPress={() => goBack("/(maestro)/profile")}
            variant="ghost"
            size="sm"
          />
          <Text className="text-xl font-inter-bold text-text">
            {isOnboarding ? "Crea tu perfil" : "Editar perfil"}
          </Text>
        </View>

        {/* ── Sección: Información personal ── */}
        <Text className="text-base font-inter-semibold text-text mb-4">
          Información personal
        </Text>

        {/* Teléfono */}
        <View className="mb-4">
          <Text className="text-sm font-inter-medium text-text mb-1.5">
            Teléfono
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="+56912345678"
                keyboardType="phone-pad"
                className="bg-surface border border-border rounded-xl px-4 py-3 text-sm font-inter text-text"
                placeholderTextColor={colors.textSecondary}
                accessibilityLabel="Teléfono"
              />
            )}
          />
          {errors.phone ? (
            <Text className="text-xs font-inter text-error mt-1">
              {errors.phone.message}
            </Text>
          ) : null}
        </View>

        {/* Descripción */}
        <View className="mb-6">
          <Text className="text-sm font-inter-medium text-text mb-1.5">
            Descripción profesional
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Cuéntales a los clientes sobre tu experiencia y servicios..."
                multiline
                numberOfLines={4}
                maxLength={1000}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-sm font-inter text-text"
                style={{ minHeight: 100, textAlignVertical: "top" }}
                placeholderTextColor={colors.textSecondary}
                accessibilityLabel="Descripción profesional"
              />
            )}
          />
          {errors.description ? (
            <Text className="text-xs font-inter text-error mt-1">
              {errors.description.message}
            </Text>
          ) : null}
        </View>

        {/* ── Sección: Mis servicios ── */}
        <Text className="text-base font-inter-semibold text-text mb-4">
          Mis servicios
        </Text>

        {errors.services?.root?.message || errors.services?.message ? (
          <Text className="text-xs font-inter text-error mb-3">
            {errors.services?.root?.message ?? errors.services?.message}
          </Text>
        ) : null}

        {/* Servicios ya seleccionados */}
        {fields.map((field, index) => {
          const cat = categories.find((c) => c.id === field.categoryId);
          return (
            <View
              key={field.id}
              className="bg-surface rounded-xl px-4 py-3 mb-3"
            >
              {/* Nombre + botón eliminar */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                  {cat ? (
                    <Ionicons
                      name={cat.iconName as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={colors.primary}
                    />
                  ) : null}
                  <Text className="text-sm font-inter-semibold text-text">
                    {cat?.name ?? "Servicio"}
                  </Text>
                </View>
                <Pressable
                  onPress={() => remove(index)}
                  accessibilityLabel="Eliminar servicio"
                >
                  <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                </Pressable>
              </View>

              {/* Precio */}
              <View className="mb-2">
                <Text className="text-xs font-inter text-text-secondary mb-1">
                  Precio por servicio (CLP)
                </Text>
                <Controller
                  control={control}
                  name={`services.${index}.priceClp`}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value ? String(value) : ""}
                      onChangeText={(t) => onChange(Number(t.replace(/\D/g, "")))}
                      onBlur={onBlur}
                      placeholder="35000"
                      keyboardType="numeric"
                      className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-inter text-text"
                      placeholderTextColor={colors.textSecondary}
                      accessibilityLabel={`Precio para ${cat?.name ?? "servicio"}`}
                    />
                  )}
                />
                {errors.services?.[index]?.priceClp ? (
                  <Text className="text-xs font-inter text-error mt-0.5">
                    {errors.services[index]?.priceClp?.message}
                  </Text>
                ) : null}
                {watchedServices?.[index]?.priceClp ? (
                  <Text className="text-xs font-inter text-text-secondary mt-0.5">
                    {formatCLP(watchedServices[index]?.priceClp ?? 0)}
                  </Text>
                ) : null}
              </View>

              {/* Tiempo estimado */}
              <View>
                <Text className="text-xs font-inter text-text-secondary mb-1">
                  Tiempo estimado (ej: "2-3 horas")
                </Text>
                <Controller
                  control={control}
                  name={`services.${index}.estimatedTime`}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="2-3 horas"
                      className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-inter text-text"
                      placeholderTextColor={colors.textSecondary}
                      accessibilityLabel={`Tiempo estimado para ${cat?.name ?? "servicio"}`}
                    />
                  )}
                />
                {errors.services?.[index]?.estimatedTime ? (
                  <Text className="text-xs font-inter text-error mt-0.5">
                    {errors.services[index]?.estimatedTime?.message}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}

        {/* Agregar categorías */}
        {availableCategories.length > 0 ? (
          <View className="mb-6">
            <Text className="text-xs font-inter-medium text-text-secondary mb-2">
              Agregar servicio:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {availableCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    append({ categoryId: cat.id, priceClp: 0, estimatedTime: "" })
                  }
                  className="flex-row items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-1.5 active:opacity-70"
                  accessibilityLabel={`Agregar ${cat.name}`}
                >
                  <Ionicons
                    name={cat.iconName as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={colors.primary}
                  />
                  <Text className="text-xs font-inter text-text">
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Botón guardar */}
        <Button
          label={isOnboarding ? "Crear perfil" : "Guardar cambios"}
          onPress={handleSubmit(onSubmit)}
          variant="primary"
          size="lg"
          fullWidth
          loading={isSaving}
          accessibilityLabel={isOnboarding ? "Crear perfil" : "Guardar cambios"}
        />
      </View>
    </ScrollView>
  );
}
