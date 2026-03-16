import { View, Text, ScrollView, Switch } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@stores/authStore";
import { useThemeStore } from "@stores/themeStore";
import { useMaestro, useSetMaestroAvailability } from "@queries/useMaestros";
import { Avatar } from "@components/ui/Avatar";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { MaestroServiceList } from "@components/maestro/MaestroServiceList";
import { RatingStars } from "@components/maestro/RatingStars";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import { useTheme } from "@hooks/useTheme";

/**
 * Tab Perfil del maestro.
 * Muestra datos del maestro, toggle de disponibilidad, servicios y opciones de cuenta.
 */
function MaestroProfileSkeleton() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-14 pb-8">
        <View className="items-center mb-6">
          <SkeletonLoader width={80} height={80} borderRadius={40} />
          <View className="mt-4">
            <SkeletonLoader width={160} height={26} borderRadius={6} />
          </View>
          <View className="mt-2">
            <SkeletonLoader width={120} height={16} borderRadius={4} />
          </View>
        </View>
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4 gap-1.5">
              <SkeletonLoader width={140} height={14} borderRadius={4} />
              <SkeletonLoader width={180} height={11} borderRadius={4} />
            </View>
            <SkeletonLoader width={50} height={28} borderRadius={14} />
          </View>
        </View>
        <View className="bg-surface rounded-2xl p-4 mb-4 gap-3">
          <SkeletonLoader width={100} height={14} borderRadius={4} />
          {[1, 2].map((i) => (
            <View key={i} className="flex-row items-center gap-2.5">
              <SkeletonLoader width={30} height={30} borderRadius={8} />
              <View className="flex-1 gap-1">
                <SkeletonLoader width={100} height={13} borderRadius={4} />
                <SkeletonLoader width={70} height={11} borderRadius={4} />
              </View>
              <SkeletonLoader width={60} height={13} borderRadius={4} />
            </View>
          ))}
        </View>
        <SkeletonLoader width="100%" height={44} borderRadius={12} />
      </View>
    </View>
  );
}

export default function MaestroProfileScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { colorScheme, setColorScheme } = useThemeStore();

  // Usamos el userId del maestro como ID del perfil (mock: userId == maestroProfileId por el mockAdapter)
  const maestroId = user?.id ?? "";
  const { data: profile, isLoading } = useMaestro(maestroId);

  const availabilityMutation = useSetMaestroAvailability(maestroId);

  const isDark = colorScheme === "dark";

  if (isLoading) {
    return <MaestroProfileSkeleton />;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-5 pt-14 pb-8">
        {/* Foto, nombre, rating */}
        <View className="items-center mb-6">
          <Avatar
            uri={profile?.photoUrl ?? user?.photoUrl ?? null}
            name={profile?.name ?? user?.name ?? "M"}
            size="xl"
          />
          <Text className="text-2xl font-inter-bold text-text mt-4">
            {profile?.name ?? user?.name}
          </Text>
          {profile ? (
            <View className="flex-row items-center gap-2 mt-2">
              <RatingStars rating={profile.averageRating} size={18} showValue />
              <Text className="text-sm font-inter text-text-secondary">
                ({profile.totalJobs} trabajos)
              </Text>
            </View>
          ) : null}
        </View>

        {/* Toggle disponibilidad */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-inter-semibold text-text">
                Disponible para trabajar
              </Text>
              <Text className="text-xs font-inter text-text-secondary mt-0.5">
                {profile?.isAvailable
                  ? "Los clientes pueden contactarte"
                  : "No apareces en las búsquedas"}
              </Text>
            </View>
            <Switch
              value={profile?.isAvailable ?? false}
              onValueChange={(val) => availabilityMutation.mutate(val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Toggle disponibilidad"
            />
          </View>
        </Card>

        {/* Mis servicios */}
        {profile && profile.services.length > 0 ? (
          <Card className="mb-4">
            <Text className="text-sm font-inter-semibold text-text mb-4">
              Mis servicios
            </Text>
            <MaestroServiceList services={profile.services} />
          </Card>
        ) : null}

        {/* Editar perfil */}
        <Button
          label="Editar perfil y servicios"
          onPress={() => router.push("/(maestro)/profile/edit")}
          variant="secondary"
          fullWidth
          accessibilityLabel="Editar perfil y servicios"
        />

        {/* Separador */}
        <View className="h-px bg-border my-6" />

        {/* Toggle modo oscuro */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-inter-semibold text-text">
              Modo oscuro
            </Text>
            <Switch
              value={isDark}
              onValueChange={(val) => setColorScheme(val ? "dark" : "light")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Toggle modo oscuro"
            />
          </View>
        </Card>

        {/* Cerrar sesión */}
        <Button
          label="Cerrar sesión"
          onPress={() => void signOut()}
          variant="ghost"
          fullWidth
          accessibilityLabel="Cerrar sesión"
        />
      </View>
    </ScrollView>
  );
}
