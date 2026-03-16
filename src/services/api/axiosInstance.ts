import axios from "axios";
import { applyInterceptors } from "./interceptors";

/**
 * Instancia base de Axios para toda la app.
 * Los interceptores de auth y manejo de errores se aplican aquí.
 */
const axiosInstance = axios.create({
  baseURL: process.env["EXPO_PUBLIC_API_URL"] ?? "http://localhost:8080",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Registrar interceptores de auth + errores
applyInterceptors(axiosInstance);

export default axiosInstance;
