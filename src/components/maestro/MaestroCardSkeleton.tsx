import { View } from "react-native";
import { SkeletonLoader } from "@components/common/SkeletonLoader";

/**
 * Skeleton de carga que imita el layout de una MaestroCard.
 * Se usa mientras `useMaestros()` está en estado loading.
 */
export function MaestroCardSkeleton() {
  return (
    <View className="bg-surface rounded-2xl p-4 flex-row items-start gap-3">
      {/* Avatar */}
      <SkeletonLoader width={56} height={56} borderRadius={28} />

      {/* Info */}
      <View className="flex-1 gap-2">
        {/* Nombre */}
        <SkeletonLoader width="60%" height={16} borderRadius={6} />
        {/* Categoría */}
        <SkeletonLoader width="40%" height={12} borderRadius={6} />
        {/* Estrellas */}
        <SkeletonLoader width={90} height={12} borderRadius={6} />
        {/* Precio */}
        <SkeletonLoader width="30%" height={14} borderRadius={6} />
      </View>
    </View>
  );
}
