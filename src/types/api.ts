/**
 * Tipos de la capa de datos — respuestas estándar de la API REST.
 */

/** Envuelve todas las respuestas exitosas de la API */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

/** Respuesta paginada estilo Spring Page */
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** Respuesta de error de la API */
export interface ApiError {
  success: false;
  data: null;
  message: string;
}
