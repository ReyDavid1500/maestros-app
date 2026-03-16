import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { goBack } from "@utils/navigation";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useMaestro } from "@queries/useMaestros";
import { Avatar } from "@components/ui/Avatar";
import { SkeletonLoader } from "@components/common/SkeletonLoader";
import { RatingStars } from "@components/maestro/RatingStars";
import { MaestroServiceList } from "@components/maestro/MaestroServiceList";
import { formatRelative } from "@utils/formatDate";
import { useTheme } from "@hooks/useTheme";

function MaestroDetailSkeleton() {
  return (
    <View className="flex-1 bg-background">
      <View className="bg-primary pt-14 pb-8 items-center px-6">
        <SkeletonLoader width={80} height={80} borderRadius={40} style={{ opacity: 0.35 }} />
        <View className="mt-4">
          <SkeletonLoader width={160} height={24} borderRadius={6} style={{ opacity: 0.35 }} />
        </View>
        <View className="flex-row gap-2 mt-2">
          <SkeletonLoader width={90} height={24} borderRadius={12} style={{ opacity: 0.35 }} />
          <SkeletonLoader width={80} height={24} borderRadius={12} style={{ opacity: 0.35 }} />
        </View>
      </View>
      <View className="px-5 pt-6 gap-5">
        <SkeletonLoader width={180} height={20} borderRadius={6} />
        <View className="gap-2">
          <SkeletonLoader width={80} height={16} borderRadius={4} />
          <SkeletonLoader width="100%" height={12} borderRadius={4} />
          <SkeletonLoader width="85%" height={12} borderRadius={4} />
        </View>
        <View className="gap-3">
          <SkeletonLoader width={130} height={16} borderRadius={4} />
          {[1, 2].map((i) => (
            <View key={i} className="bg-surface rounded-xl p-3 flex-row items-center gap-3">
              <SkeletonLoader width={36} height={36} borderRadius={8} />
              <View className="flex-1 gap-1.5">
                <SkeletonLoader width={100} height={13} borderRadius={4} />
                <SkeletonLoader width={70} height={11} borderRadius={4} />
              </View>
              <SkeletonLoader width={70} height={13} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function MaestroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: maestro, isLoading, isError, refetch } = useMaestro(id ?? "");
  const { colors } = useTheme();

  if (isLoading) return <MaestroDetailSkeleton />;
  if (isError || !maestro) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-text-secondary font-inter text-center">
          No se pudo cargar el perfil del maestro.
        </Text>
        <Pressable className="mt-4" onPress={() => void refetch()}>
          <Text className="text-primary font-inter-semibold">Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const handleContratar = () => {
    router.push(
      `/(client)/request/create?maestroId=${maestro.id}&maestroName=${encodeURIComponent(maestro.name)}&categoryId=${maestro.services[0]?.serviceCategory.id ?? ""}`
    );
  };

  const handleChatear = () => {
    Alert.alert(
      "Chat no disponible",
      "Primero debes crear una solicitud de servicio con este maestro.",
      [{ text: "OK" }]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Contenido scrolleable */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header naranja con foto */}
        <View className="bg-primary pt-14 pb-8 items-center px-6">
          <Pressable
            className="absolute top-14 left-4 w-10 h-10 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            onPress={() => goBack("/(client)")}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>

          <Avatar uri={maestro.photoUrl} name={maestro.name} size="xl" />

          <Text className="text-2xl font-inter-bold text-white mt-4">
            {maestro.name}
          </Text>

          {/* Badges: verificado + disponibilidad */}
          <View className="flex-row gap-2 mt-2">
            {maestro.isVerified && (
              <View className="flex-row items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                <Ionicons name="shield-checkmark" size={12} color="white" />
                <Text className="text-xs font-inter-medium text-white">Verificado</Text>
              </View>
            )}
            <View
              className={`rounded-full px-3 py-1 ${
                maestro.isAvailable ? "bg-success/30" : "bg-white/20"
              }`}
            >
              <Text className="text-xs font-inter-medium text-white">
                {maestro.isAvailable ? "Disponible" : "Ocupado"}
              </Text>
            </View>
          </View>
        </View>

        {/* Cuerpo */}
        <View className="px-5 py-6 gap-6">
          {/* Rating */}
          <View className="flex-row items-center gap-3">
            <RatingStars rating={maestro.averageRating} size={20} showValue />
            <Text className="text-text-secondary font-inter text-sm">
              · {maestro.totalJobs} trabajos realizados
            </Text>
          </View>

          {/* Descripción */}
          {maestro.description ? (
            <View>
              <Text className="text-base font-inter-semibold text-text mb-2">
                Sobre mí
              </Text>
              <Text className="text-sm font-inter text-text-secondary leading-relaxed">
                {maestro.description}
              </Text>
            </View>
          ) : null}

          {/* Servicios y precios */}
          <View>
            <Text className="text-base font-inter-semibold text-text mb-3">
              Servicios y precios
            </Text>
            <MaestroServiceList services={maestro.services} />
          </View>

          {/* Valoraciones recientes */}
          {maestro.recentRatings && maestro.recentRatings.length > 0 ? (
            <View>
              <Text className="text-base font-inter-semibold text-text mb-3">
                Reseñas recientes
              </Text>
              <View className="gap-4">
                {maestro.recentRatings.slice(0, 3).map((rating) => (
                  <View
                    key={rating.id}
                    className="bg-surface rounded-2xl p-4"
                  >
                    <View className="flex-row items-center gap-2 mb-2">
                      <Avatar
                        uri={rating.rater.photoUrl}
                        name={rating.rater.name}
                        size="sm"
                      />
                      <View className="flex-1">
                        <Text className="text-sm font-inter-semibold text-text">
                          {rating.rater.name}
                        </Text>
                        <Text className="text-xs font-inter text-text-secondary">
                          {formatRelative(rating.createdAt)}
                        </Text>
                      </View>
                      <RatingStars rating={rating.score} size={12} />
                    </View>
                    {rating.comment ? (
                      <Text className="text-sm font-inter text-text-secondary">
                        {rating.comment}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Espacio para los botones fijos */}
          <View style={{ height: 96 }} />
        </View>
      </ScrollView>

      {/* Botones fijos en la parte inferior */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row gap-3 px-5 pb-8 pt-4 bg-background/95"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      >
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-2 bg-surface rounded-2xl py-4 active:opacity-75"
          style={{ borderWidth: 1, borderColor: colors.border }}
          onPress={handleChatear}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
          <Text className="text-sm font-inter-semibold text-text">
            Chatear
          </Text>
        </Pressable>

        <Pressable
          className="flex-[2] flex-row items-center justify-center gap-2 bg-primary rounded-2xl py-4 active:opacity-80"
          onPress={handleContratar}
          disabled={!maestro.isAvailable}
          style={!maestro.isAvailable ? { opacity: 0.5 } : undefined}
        >
          <Ionicons name="construct-outline" size={18} color="white" />
          <Text className="text-sm font-inter-semibold text-white">
            {maestro.isAvailable ? "Contratar" : "No disponible"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
