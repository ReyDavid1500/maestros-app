/**
 * Tipos de valores de formularios — usados con React Hook Form.
 * Cada interface corresponde a un formulario de la app.
 */

// ─── Nueva solicitud de servicio ──────────────────────────────────────────────

export interface CreateRequestFormValues {
  description: string;
  addressStreet: string;
  addressNumber: string;
  addressCity: string;
  addressInstructions?: string;
  scheduledAt: Date;
}

// ─── Perfil de usuario ────────────────────────────────────────────────────────

export interface UpdateProfileFormValues {
  name: string;
  phone?: string;
}

// ─── Registro / perfil de maestro ────────────────────────────────────────────

export interface CreateMaestroProfileFormValues {
  description: string;
  phone: string;
  services: {
    categoryId: string;
    priceClp: number;
    estimatedTime: string;
  }[];
}

// ─── Valoración ───────────────────────────────────────────────────────────────

export interface RatingFormValues {
  score: number; // 1-5
  comment?: string;
}

// ─── Autenticación ────────────────────────────────────────────────────────────

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
