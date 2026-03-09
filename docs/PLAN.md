# Plan de Implementación — Frontend Maestros App

## Descripción del Proyecto

**Maestros** es una aplicación móvil chilena que conecta clientes con trabajadores independientes (maestros) para servicios del hogar. Este documento es el plan maestro del frontend. Cubre la arquitectura, el orden de implementación por dominio funcional, y las dependencias entre fases.

El frontend se desarrolla **con datos mock** y se integra con el backend en una fase posterior.

---

## Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Framework | React Native con Expo SDK 51+ |
| Lenguaje | TypeScript (strict mode) |
| Routing / Navegación | Expo Router v3 (file-based routing) |
| Estilos | NativeWind v4 (TailwindCSS para React Native) |
| Formularios | React Hook Form + Yup |
| Estado global | Zustand |
| Fetching / Cache | TanStack Query v5 (React Query) + Axios |
| Chat en tiempo real | @stomp/stompjs + sockjs-client |
| Auth Google | expo-auth-session con PKCE |
| Push Notifications | expo-notifications |
| Almacenamiento seguro | expo-secure-store (tokens JWT) |
| Almacenamiento general | @react-native-async-storage/async-storage |
| Íconos | @expo/vector-icons (Ionicons) |
| Imágenes | expo-image (con caché) |
| Fuentes | @expo-google-fonts/inter |
| Mock HTTP | axios-mock-adapter |

---

## Fases de Implementación

El proyecto se divide en **12 fases** organizadas por dominio funcional. El orden permite tener pantallas navegables desde el primer día, agregando funcionalidad capa por capa.

| # | Fase | Descripción | Archivo |
|---|---|---|---|
| 01 | Setup del Proyecto | Expo, dependencias, NativeWind, Expo Router, TypeScript strict, variables de entorno | [fase-01-setup.md](./fase-01-setup.md) |
| 02 | Sistema de Diseño | Paleta de colores, tipografía, componentes base reutilizables | [fase-02-diseno.md](./fase-02-diseno.md) |
| 03 | Tipos TypeScript | Todas las interfaces del dominio de negocio | [fase-03-tipos.md](./fase-03-tipos.md) |
| 04 | Capa de Datos | Axios, TanStack Query, interceptores, modo mock, query hooks | [fase-04-datos.md](./fase-04-datos.md) |
| 05 | Zustand Stores | authStore, themeStore, pendingRequestStore, chatStore | [fase-05-stores.md](./fase-05-stores.md) |
| 06 | Seguridad del Cliente | Secure store, logger, throttling, esquemas Yup, manejo de 429 | [fase-06-seguridad.md](./fase-06-seguridad.md) |
| 07 | Datos Mock | Maestros, solicitudes, mensajes, calificaciones, categorías | [fase-07-mocks.md](./fase-07-mocks.md) |
| 08 | Autenticación Google | expo-auth-session + PKCE, flujo completo, pantalla de bienvenida | [fase-08-auth.md](./fase-08-auth.md) |
| 09 | Flujo Cliente | Todas las pantallas del cliente (home, búsqueda, solicitudes, perfil) | [fase-09-flujo-cliente.md](./fase-09-flujo-cliente.md) |
| 10 | Flujo Maestro | Todas las pantallas del maestro (home, trabajos, perfil, onboarding) | [fase-10-flujo-maestro.md](./fase-10-flujo-maestro.md) |
| 11 | Chat en Tiempo Real | STOMP, chatStore, pantallas de chat, throttling | [fase-11-chat.md](./fase-11-chat.md) |
| 12 | Push Notifications | expo-notifications, registro, deep linking, foreground/background | [fase-12-notificaciones.md](./fase-12-notificaciones.md) |

**Documento adicional:**
- [checklist-integracion.md](./checklist-integracion.md) — Qué cambiar cuando el backend esté listo

---

## Arquitectura General

```
app/ (Expo Router)
├── (auth)/          → Pantallas públicas pre-login
├── (client)/        → Tab navigator del cliente (autenticado)
├── (maestro)/       → Tab navigator del maestro (autenticado)
└── modal/           → Modales globales (rating, términos)

src/
├── components/      → UI reutilizable
├── hooks/           → Custom hooks
├── queries/         → TanStack Query hooks por dominio
├── stores/          → Zustand stores
├── services/        → Axios, Google OAuth, WebSocket
├── mocks/           → Datos mock + adapter
├── types/           → TypeScript interfaces
├── utils/           → Helpers (formatCLP, formatDate)
└── constants/       → Colors, spacing, queryKeys, categories
```

### Flujo de datos

```
Pantalla
  ↓ usa
Custom Hook (queries/)
  ↓ usa
TanStack Query
  ↓ llama
Axios (services/api/)
  ↓ intercepta [dev: mock adapter] [prod: backend real]
Backend API / Mock data
```

### Flujo de estado global

```
Pantalla
  ↓ lee/escribe
Zustand Store
  ↓ persiste en
expo-secure-store (tokens) / AsyncStorage (preferencias, pendingRequest)
```

---

## Estructura de Carpetas Final

```
maestros-app/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── welcome.tsx
│   ├── (client)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── results.tsx
│   │   ├── maestro/
│   │   │   └── [id].tsx
│   │   ├── request/
│   │   │   ├── create.tsx
│   │   │   ├── confirm.tsx
│   │   │   └── [id].tsx
│   │   ├── requests/
│   │   │   └── index.tsx
│   │   ├── chat/
│   │   │   ├── index.tsx
│   │   │   └── [roomId].tsx
│   │   └── profile/
│   │       └── index.tsx
│   ├── (maestro)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── request/
│   │   │   └── [id].tsx
│   │   ├── job/
│   │   │   └── [id].tsx
│   │   ├── chat/
│   │   │   ├── index.tsx
│   │   │   └── [roomId].tsx
│   │   └── profile/
│   │       ├── index.tsx
│   │       └── edit.tsx
│   └── modal/
│       ├── rating.tsx
│       └── terms.tsx
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── maestro/
│   │   │   ├── MaestroCard.tsx
│   │   │   ├── MaestroServiceList.tsx
│   │   │   └── RatingStars.tsx
│   │   ├── request/
│   │   │   ├── RequestCard.tsx
│   │   │   ├── RequestStatusBadge.tsx
│   │   │   └── RequestTimeline.tsx
│   │   ├── chat/
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ChatRoomItem.tsx
│   │   └── common/
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── Header.tsx
│   │       └── SkeletonLoader.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   └── useThrottledAction.ts
│   ├── queries/
│   │   ├── useMaestros.ts
│   │   ├── useServiceRequests.ts
│   │   ├── useChat.ts
│   │   └── useRatings.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   ├── pendingRequestStore.ts
│   │   └── chatStore.ts
│   ├── services/
│   │   ├── api/
│   │   │   ├── axiosInstance.ts
│   │   │   └── interceptors.ts
│   │   ├── auth/
│   │   │   └── googleAuthService.ts
│   │   └── websocket/
│   │       └── stompClient.ts
│   ├── mocks/
│   │   ├── data.ts
│   │   └── mockAdapter.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatCLP.ts
│   │   ├── formatDate.ts
│   │   └── logger.ts
│   └── constants/
│       ├── colors.ts
│       ├── queryKeys.ts
│       └── categories.ts
├── assets/
│   └── images/
├── docs/                   ← (este directorio)
├── tailwind.config.js
├── babel.config.js
├── app.config.ts
├── tsconfig.json
└── .env.example
```

---

## Sistema de Diseño (referencia rápida)

### Paleta de colores

| Token | Light | Dark | Uso |
|---|---|---|---|
| `primary` | Naranja #F97316 | Naranja #FB923C | CTAs, acento principal |
| `background` | #FFFFFF | #0F0F0F | Fondo de pantalla |
| `surface` | #F8F8F8 | #1A1A1A | Cards, inputs |
| `text` | #111111 | #F5F5F5 | Texto principal |
| `textSecondary` | #6B7280 | #9CA3AF | Texto secundario |
| `border` | #E5E7EB | #2D2D2D | Bordes, separadores |
| `success` | #22C55E | #4ADE80 | Estados completados |
| `error` | #EF4444 | #F87171 | Errores |
| `warning` | #F59E0B | #FBBF24 | Estados pendientes |

### Tipografía
- Fuente: **Inter** (via @expo-google-fonts/inter)
- Pesos: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Radios de borde
- Cards: `rounded-2xl` (16px)
- Botones: `rounded-xl` (12px)
- Inputs: `rounded-xl` (12px)
- Badges: `rounded-full`

---

## Reglas de UX Clave

1. **Sin fricción pre-login:** El usuario puede navegar, buscar y llenar el formulario de solicitud SIN crear cuenta. El login solo se pide en la pantalla de confirmación.
2. **Persistencia del formulario:** El `pendingRequestStore` se persiste en AsyncStorage para sobrevivir el flujo OAuth (que puede recargar la app en iOS/Android).
3. **Feedback inmediato:** Todos los botones de acción muestran estado `disabled` + spinner mientras la mutation está en curso.
4. **Throttling en botones críticos:** Bloquear doble-tap en acciones irreversibles (contratar, confirmar, aceptar, completar).
5. **Precios en CLP:** Siempre formatear con `formatCLP(price)` → `$XX.XXX`.
6. **Fechas en formato chileno:** `DD/MM/YYYY HH:mm` con `formatDate`.

---

## Convenciones de Código

- TypeScript **strict mode**, sin `any`
- `const` arrow functions para todos los componentes: `const MyComponent = () => {}`
- Archivos de componentes en **kebab-case**: `maestro-card.tsx`
- Hooks y utils en **camelCase**: `useThrottledAction.ts`
- Strings de UI en **español** (el usuario final es chileno)
- Accesibilidad: `accessibilityLabel` en botones e imágenes
- Soporte iOS y Android sin código platform-specific (salvo casos necesarios)

---

## Orden de Implementación Recomendado

```
Fase 01 (Setup)
    ↓
Fase 02 (Diseño) — componentes base para todas las pantallas
    ↓
Fase 03 (Tipos) — contratos TypeScript para todo el dominio
    ↓
Fase 04 (Datos) — Axios + Query + mock mode operativo
    ↓
Fase 05 (Stores) — estado global listo
    ↓
Fase 06 (Seguridad) — herramientas de seguridad disponibles
    ↓
Fase 07 (Mocks) — datos realistas para desarrollo
    ↓
Fase 08 (Auth) — flujo Google OAuth funcional
    ↓
Fases 09 y 10 (Flujos) — pantallas con navegación real (paralelas)
    ↓
Fase 11 (Chat) — WebSocket sobre navegación existente
    ↓
Fase 12 (Notificaciones) — push sobre app funcional
    ↓
Checklist de Integración — cuando el backend esté listo
```
