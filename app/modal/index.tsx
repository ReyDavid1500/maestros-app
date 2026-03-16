import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { goBack } from "@utils/navigation";

/**
 * Modal genérico de la app.
 * Se usa para confirmaciones, alertas, etc.
 * TODO: customizar según necesidad con parámetros de ruta.
 */
export default function ModalScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background/80 items-center justify-end">
      <View className="bg-background w-full rounded-t-3xl p-6 pb-10">
        <View className="w-10 h-1 bg-border rounded-full self-center mb-6" />
        <Text className="text-lg font-inter-bold text-text mb-4">Modal</Text>
        <Pressable
          className="w-full bg-surface border border-border rounded-2xl py-4 items-center"
          onPress={() => goBack("/(client)")}
        >
          <Text className="text-text font-inter-semibold">Cerrar</Text>
        </Pressable>
      </View>
    </View>
  );
}
