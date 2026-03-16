/**
 * Utilidades de formato de fechas para locale chileno.
 */

/** Fecha y hora completa: "15/03/2024 10:00" */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Fecha corta con hora: "15 mar 10:00" */
export const formatDateShort = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Solo fecha: "15/03/2024" */
export const formatDateOnly = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/** Tiempo relativo aproximado: "Hace 2 horas", "Ayer", etc. */
export const formatRelative = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return formatDateOnly(isoString);
};
