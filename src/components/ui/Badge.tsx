import { View, Text } from "react-native";
import type { RequestStatus } from "@types";

export type BadgeVariant =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "neutral";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const containerVariant: Record<BadgeVariant, string> = {
  primary: "bg-primary/15",
  success: "bg-success/15",
  error: "bg-error/15",
  warning: "bg-warning/15",
  neutral: "bg-border",
};

const textVariant: Record<BadgeVariant, string> = {
  primary: "text-primary",
  success: "text-success",
  error: "text-error",
  warning: "text-warning",
  neutral: "text-text-secondary",
};

const containerSize: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 rounded-md",
  md: "px-3 py-1 rounded-lg",
};

const textSize: Record<BadgeSize, string> = {
  sm: "text-xs",
  md: "text-sm",
};

export function Badge({
  label,
  variant = "neutral",
  size = "md",
}: BadgeProps) {
  return (
    <View
      className={["self-start", containerVariant[variant], containerSize[size]].join(" ")}
    >
      <Text
        className={["font-inter-semibold", textVariant[variant], textSize[size]].join(" ")}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Helper de estado de solicitud ────────────────────────────────────────────

const statusLabels: Record<RequestStatus, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  REJECTED: "Rechazada",
};

const statusVariants: Record<RequestStatus, BadgeVariant> = {
  PENDING: "warning",
  ACCEPTED: "primary",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  CANCELLED: "neutral",
  REJECTED: "error",
};

export function getStatusBadgeVariant(status: RequestStatus): BadgeVariant {
  return statusVariants[status];
}

export function getStatusLabel(status: RequestStatus): string {
  return statusLabels[status];
}
