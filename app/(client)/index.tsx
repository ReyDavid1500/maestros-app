import { useState, useCallback, useRef } from "react";
import {
  View, Text, TextInput, FlatList, Pressable, ScrollView,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useCategories } from "@queries/useMaestros";
import { useTheme } from "@hooks/useTheme";
import { SkeletonLoader } from "@components/common/SkeletonLoader";

/**
 * Home del cliente — buscador + grid de categorías.
 * NO requiere login: cualquier usuario puede explorar maestros.
 */
export default function ClientHomeScreen() {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { colors } = useTheme();
  const { data: categories, isLoading } = useCategories();

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (text.trim().length > 0) {
        router.push(`/(client)/results?q=${encodeURIComponent(text.trim())}`);
      }
    }, 500);
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/(client)/results?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleCategoryPress = useCallback(
    (id: string, name: string) => {
      router.push(
        `/(client)/results?categoryId=${id}&categoryName=${encodeURIComponent(name)}`
      );
    },
    []
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />

      {/* ── Header ──────────────────────────────────────────── */}
      <View className="px-5 pt-14 pb-4">
        <Text className="text-2xl font-inter-bold text-text">
          ¿Qué necesitas hoy?
        </Text>
        <Text className="text-sm font-inter text-text-secondary mt-0.5">
          Encuentra el maestro perfecto para tu hogar
        </Text>
      </View>

      {/* ── Barra de búsqueda ────────────────────────────────── */}
      <View className="px-5 mb-6">
        <View
          className="flex-row items-center bg-surface rounded-2xl px-4 py-3 gap-3"
          style={{ borderWidth: 1, borderColor: colors.border }}
        >
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            className="flex-1 text-base font-inter text-text"
            placeholder="Buscar maestro o servicio..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Título grid ─────────────────────────────────────── */}
      <Text className="text-lg font-inter-semibold text-text px-5 mb-4">
        Categorías
      </Text>

      {/* ── Grid de categorías ───────────────────────────────── */}
      <View className="px-5">
        {isLoading ? (
          // Skeleton de 10 celdas en 2 columnas
          <View className="flex-row flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <View key={i} style={{ width: "47%" }}>
                <SkeletonLoader width="100%" height={48} borderRadius={12} />
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {(categories ?? []).map((cat) => (
              <Pressable
                key={cat.id}
                className="bg-surface rounded-xl px-3 py-2.5 flex-row items-center gap-2.5 active:opacity-75"
                style={{ width: "47%", borderWidth: 1, borderColor: colors.border }}
                onPress={() => handleCategoryPress(cat.id, cat.name)}
              >
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center"
                  style={{ backgroundColor: colors.primary + "18" }}
                >
                  <Ionicons
                    name={cat.iconName as React.ComponentProps<typeof Ionicons>["name"]}
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <Text
                  className="flex-1 text-xs font-inter-medium text-text"
                  numberOfLines={2}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ── Footer: link para maestros ───────────────────────── */}
      <Pressable
        className="mx-5 mt-8 p-4 rounded-2xl items-center active:opacity-75"
        style={{ borderWidth: 1, borderColor: colors.border, borderStyle: "dashed" }}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text className="text-sm font-inter text-text-secondary">
          ¿Eres maestro?{" "}
          <Text className="text-primary font-inter-semibold">Únete y ofrece tus servicios</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
}
