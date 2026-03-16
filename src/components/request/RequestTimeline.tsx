import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";
import { formatDate } from "@utils/formatDate";
import type { ServiceRequest } from "@types";

interface TimelineStep {
  key: keyof ServiceRequest;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: "createdAt",   label: "Solicitud enviada",        icon: "paper-plane-outline"    },
  { key: "acceptedAt",  label: "Aceptada por el maestro",  icon: "checkmark-circle-outline" },
  { key: "startedAt",   label: "Trabajo iniciado",         icon: "construct-outline"      },
  { key: "completedAt", label: "Trabajo completado",       icon: "trophy-outline"         },
  { key: "cancelledAt", label: "Cancelada",                icon: "close-circle-outline"   },
];

interface Props {
  request: ServiceRequest;
}

export function RequestTimeline({ request }: Props) {
  const { colors } = useTheme();
  const steps = TIMELINE_STEPS.filter((s) => request[s.key] !== null);

  return (
    <View className="py-2">
      {steps.map((step, i) => {
        const timestamp = request[step.key] as string;
        const isLast = i === steps.length - 1;

        return (
          <View key={step.key} className="flex-row">
            {/* Ícono + línea vertical */}
            <View className="items-center mr-3" style={{ width: 28 }}>
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <Ionicons name={step.icon} size={14} color={colors.primary} />
              </View>
              {!isLast && (
                <View
                  className="w-0.5 flex-1 min-h-5"
                  style={{ backgroundColor: colors.border }}
                />
              )}
            </View>

            {/* Contenido */}
            <View className="flex-1 pb-5">
              <Text className="text-sm font-inter-medium text-text">
                {step.label}
              </Text>
              <Text className="text-xs font-inter text-text-secondary mt-0.5">
                {formatDate(timestamp)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
