import { Badge, getStatusBadgeVariant, getStatusLabel } from "@components/ui/Badge";
import type { RequestStatus } from "@types";

interface Props {
  status: RequestStatus;
  size?: "sm" | "md";
}

/** Badge de estado de solicitud — wrapper fino sobre Badge con color/label automático. */
export function RequestStatusBadge({ status, size = "md" }: Props) {
  return (
    <Badge
      label={getStatusLabel(status)}
      variant={getStatusBadgeVariant(status)}
      size={size}
    />
  );
}
