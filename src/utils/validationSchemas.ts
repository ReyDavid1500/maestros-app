/**
 * Esquemas de validación Yup.
 * Los límites coinciden exactamente con las validaciones del backend
 * para evitar requests innecesarios (primera línea de defensa).
 * Mensajes de error en español.
 */

import * as Yup from "yup";

const REQUIRED = "Este campo es obligatorio";

// ─── Solicitud de servicio ────────────────────────────────────────────────────

export const createRequestSchema = Yup.object({
  description: Yup.string()
    .required(REQUIRED)
    .max(1000, "La descripción no puede superar los 1000 caracteres"),
  addressStreet: Yup.string()
    .required(REQUIRED)
    .max(200, "La dirección no puede superar los 200 caracteres"),
  addressNumber: Yup.string()
    .required(REQUIRED)
    .max(20, "El número no puede superar los 20 caracteres"),
  addressCity: Yup.string()
    .required(REQUIRED)
    .max(100, "La ciudad no puede superar los 100 caracteres"),
  addressInstructions: Yup.string()
    .max(500, "Las instrucciones no pueden superar los 500 caracteres")
    .optional(),
  scheduledAt: Yup.date()
    .required(REQUIRED)
    .min(
      new Date(Date.now() + 2 * 60 * 60 * 1000),
      "El horario debe ser al menos 2 horas desde ahora"
    ),
});

// ─── Perfil de usuario ────────────────────────────────────────────────────────

export const updateProfileSchema = Yup.object({
  name: Yup.string()
    .required(REQUIRED)
    .max(100, "El nombre no puede superar los 100 caracteres"),
  phone: Yup.string()
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .optional(),
});

// ─── Perfil de maestro ────────────────────────────────────────────────────────

export const createMaestroProfileSchema = Yup.object({
  description: Yup.string()
    .required(REQUIRED)
    .max(1000, "La descripción no puede superar los 1000 caracteres"),
  phone: Yup.string()
    .required(REQUIRED)
    .max(20, "El teléfono no puede superar los 20 caracteres"),
});

// ─── Valoración ───────────────────────────────────────────────────────────────

export const ratingSchema = Yup.object({
  score: Yup.number()
    .required(REQUIRED)
    .min(1, "Selecciona al menos una estrella")
    .max(5, "Puntuación máxima: 5 estrellas"),
  comment: Yup.string()
    .max(500, "El comentario no puede superar los 500 caracteres")
    .optional(),
});

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const messageSchema = Yup.object({
  content: Yup.string()
    .required(REQUIRED)
    .max(4000, "El mensaje es demasiado largo"),
});
