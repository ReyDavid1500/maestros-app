# Fase 10 — Flujo del Maestro (Pantallas)

## Objetivo

Implementar todas las pantallas del flujo del maestro: home con solicitudes entrantes y trabajos en curso, detalle de solicitud entrante, detalle de trabajo aceptado, perfil y edición de perfil/servicios, y el onboarding para maestros nuevos. Al finalizar, el flujo del maestro es completamente navegable con datos mock.

---

## Paso 1 — Layout de (maestro)

Crear `app/(maestro)/_layout.tsx` con el Tab Navigator del maestro:

**Tabs:**
1. `index` → ícono `"briefcase-outline"`, label "Trabajos" + badge con conteo de solicitudes nuevas
2. `chat/index` → ícono `"chatbubbles-outline"`, label "Mensajes" + badge de no leídos
3. `profile/index` → ícono `"person-outline"`, label "Perfil"

**Protección de ruta:** Si el usuario autenticado tiene `role === 'CLIENT'`, redirigir a `/(client)`. Implementar este guard en el `_layout.tsx` del maestro.

---

## Paso 2 — Componentes del dominio Maestro

### JobCard (`src/components/request/JobCard.tsx`)

Componente para mostrar un trabajo (solicitud aceptada o en curso) en el home del maestro.

**Props:** `request: ServiceRequest`, `onPress: () => void`

**Layout:**
- Badge de estado prominente
- Nombre del cliente con avatar pequeño
- Dirección del trabajo
- Fecha y hora del servicio
- Categoría con ícono

### IncomingRequestCard (`src/components/request/IncomingRequestCard.tsx`)

Para las solicitudes entrantes en estado PENDING. Más información y botones de acción directos.

**Props:** `request: ServiceRequest`, `onAccept: () => void`, `onReject: () => void`, `onViewDetail: () => void`

**Layout:**
- Nombre del cliente con foto
- Descripción del trabajo (2 líneas)
- Dirección (general, sin número exacto hasta aceptar)
- Fecha/hora sugerida
- Botones: "Aceptar" (verde) | "Ver detalle" (gris) | "Rechazar" (rojo outline)
- Los botones Aceptar y Rechazar usan `useThrottledAction` (3000ms)

---

## Paso 3 — Home del Maestro `(maestro)/index.tsx`

**Secciones:**

**Header:**
- "¡Hola, {maestro.name}!"
- Subtítulo: "Tienes {pendingCount} solicitudes nuevas" o "No tienes solicitudes nuevas"

**Sección "Solicitudes nuevas" (estado PENDING):**
- Lista de `IncomingRequestCard`
- Si está vacía: `EmptyState` con `"No tienes solicitudes pendientes"`
- Los botones "Aceptar" y "Rechazar" usan `useUpdateRequestStatus` directamente
- Al aceptar: actualizar el estado localmente en el cache (optimistic update) y luego invalidar

**Sección "Trabajos en curso" (estado ACCEPTED o IN_PROGRESS):**
- Lista de `JobCard`
- Al tap: navegar a `/(maestro)/job/[id]`
- Si está vacía: no mostrar la sección (o mostrar mensaje sutil)

**Datos:** `useMyServiceRequests()` filtrando los estados en el cliente:
- Pendientes: `requests.filter(r => r.status === 'PENDING')`
- En curso: `requests.filter(r => ['ACCEPTED', 'IN_PROGRESS'].includes(r.status))`

**Pull-to-refresh:** `refetch()`

**WebSocket:** Suscribirse a `/topic/notifications/{userId}`. Cuando llega notificación de tipo `CREATED`: invalidar el query de solicitudes para que aparezca la nueva solicitud (o agregarla al cache directamente con `queryClient.setQueryData`).

---

## Paso 4 — Detalle de Solicitud Entrante `(maestro)/request/[id].tsx`

Esta pantalla muestra todos los detalles que el maestro necesita para decidir si acepta.

**Datos:** `useServiceRequest(id)`

**Layout:**
1. Foto y nombre del cliente
2. Categoría del servicio solicitado
3. Descripción completa del trabajo
4. Dirección completa (se muestra completa solo aquí)
5. Instrucciones adicionales
6. Fecha y hora sugerida
7. Precio del servicio (del MaestroProfile del maestro para esa categoría)

**Botones (fijos en la parte inferior):**
- Botón primario grande verde: "Aceptar trabajo"
  - Al tocar: `useUpdateRequestStatus` con action `accept`
  - En `onSuccess`: navegar a `/(maestro)/job/[id]` (el trabajo aceptado)
  - Mostrar spinner durante la mutation
  - Usar `useThrottledAction` (3000ms)
- Botón secundario: "Chatear con el cliente" → `/(maestro)/chat/[roomId]`
- Botón de rechazo (rojo, al fondo): "Rechazar solicitud"
  - Al tocar: mostrar Alert de confirmación: "¿Seguro que quieres rechazar este trabajo? No podrás deshacerlo."
  - Si confirma: `useUpdateRequestStatus` con action `reject`
  - En `onSuccess`: navegar de vuelta al home con `router.back()`

---

## Paso 5 — Detalle de Trabajo Aceptado `(maestro)/job/[id].tsx`

**Datos:** `useServiceRequest(id)` — la solicitud ya está en estado ACCEPTED o IN_PROGRESS

**Layout:**
1. Estado actual con badge grande
2. Datos del cliente con botón de chat
3. Dirección completa del trabajo
4. Enlace a Google Maps: construir la URL con la dirección y abrirla con `Linking.openURL('https://maps.google.com/?q={direccion}')`
5. Descripción del trabajo
6. Instrucciones adicionales

**Botones según estado:**

Si `status === 'ACCEPTED'`:
- Botón naranja: "Marcar como iniciado" → `useUpdateRequestStatus` action `start`
- En `onSuccess`: actualizar el estado del job en la UI

Si `status === 'IN_PROGRESS'`:
- Botón verde: "Marcar como completado" → `useUpdateRequestStatus` action `complete`
- Al tocar: mostrar Alert de confirmación: "¿Confirmas que el trabajo fue completado?"
- En `onSuccess`: navegar al home

---

## Paso 6 — Perfil del Maestro `(maestro)/profile/index.tsx`

**Secciones:**
1. Foto grande, nombre, rating con estrellas, total de trabajos
2. Sección "Mis servicios": `MaestroServiceList` con los servicios y precios
3. Badge de disponibilidad con toggle (Disponible / No disponible) → llama a `updateMyProfile({ isAvailable: !current })`
4. Botón "Editar perfil y servicios" → `/(maestro)/profile/edit`
5. Toggle "Modo oscuro"
6. Botón "Cerrar sesión"

**Datos:** `useMaestro(maestroProfileId)` donde `maestroProfileId = authStore.user?.id` (aquí el `id` del usuario se usa para buscar el MaestroProfile). Necesitar ajustar el endpoint o guardar el `maestroProfileId` en el `authStore` cuando se crea el perfil.

**Nota:** Al hacer login, si el usuario es MAESTRO y `hasMaestroProfile = true`, cargar el `MaestroProfile` y guardarlo en el `authStore` para tener el `maestroProfileId` disponible.

---

## Paso 7 — Editar Perfil del Maestro `(maestro)/profile/edit.tsx`

Esta pantalla sirve tanto para editar el perfil existente como para el onboarding de un maestro nuevo.

**Formulario con React Hook Form + Yup:**

**Sección "Información personal":**
- Foto de perfil (tocar para cambiar → abrir selector de imagen → `POST /files/upload`)
- Nombre (pre-llenado desde `authStore.user.name`, no editable aquí, se edita en el perfil de usuario)
- Teléfono (input, validación)
- Descripción (textarea, max 1000 chars)

**Sección "Mis servicios":**
- Lista de categorías disponibles con checkbox para seleccionar/deseleccionar
- Para cada categoría seleccionada: mostrar inputs de precio (CLP) y tiempo estimado
- Validar precio > 0 y ≤ 10.000.000

**Botón "Guardar cambios":**
- Si es onboarding (perfil nuevo): `POST /maestros/me/profile`
- Si es edición: `PUT /maestros/me/profile` + `PUT /maestros/me/services`
- En `onSuccess`: navegar de vuelta al perfil con `router.back()`

---

## Paso 8 — Onboarding del Maestro

El onboarding ocurre cuando:
1. Un usuario se registra como MAESTRO (actualmente el `role` es asignado por el backend como CLIENT)
2. Un CLIENT accede al área de maestro tocando "Soy Maestro"

**Flujo desde el Home del cliente:**

El botón "Soy Maestro →" en el home del cliente navega a `/(auth)/welcome` con un parámetro `?mode=maestro`.

En la pantalla de bienvenida con `mode=maestro`:
- Mostrar: "Únete como Maestro"
- Botón: "Registrarme como Maestro" → ejecuta Google OAuth
- Al autenticarse: el backend asigna el role correcto (pendiente definir cómo el usuario indica que quiere ser maestro — una opción es enviar un parámetro extra en el registro)

**Decisión de diseño a confirmar con el backend:** El backend actualmente asigna siempre `role: CLIENT` por defecto. Se necesita un mecanismo para que un usuario pueda registrarse como MAESTRO. Opciones:
- Opción A: Endpoint separado `POST /auth/google/maestro` que asigna role MAESTRO
- Opción B: El usuario edita su role en `PUT /users/me`
- Opción C: Agregar `role` al request de `POST /auth/google`

Documentar esta decisión en el checklist de integración.

Después del registro como MAESTRO: navegar directamente a `/(maestro)/profile/edit` para completar el perfil.

---

## Paso 9 — Verificación final de la fase

**Flujo completo del maestro:**
1. Login como maestro → home del maestro
2. Ver solicitud entrante → tocar para ver detalle
3. Aceptar la solicitud → navegar al job
4. Marcar como iniciado → estado IN_PROGRESS
5. Marcar como completado → volver al home

**Otros flujos:**
- [ ] El badge de solicitudes nuevas en la tab del home se actualiza correctamente
- [ ] Al rechazar una solicitud, la confirmación aparece antes de ejecutar
- [ ] El toggle de disponibilidad funciona y persiste
- [ ] El formulario de edición de perfil valida correctamente los precios
- [ ] El enlace a Google Maps abre la app de mapas con la dirección correcta
- [ ] El maestro nuevo que no tiene perfil va al formulario de onboarding

---

## Archivos creados en esta fase

- `src/components/request/JobCard.tsx`
- `src/components/request/IncomingRequestCard.tsx`
- `app/(maestro)/_layout.tsx`
- `app/(maestro)/index.tsx`
- `app/(maestro)/request/[id].tsx`
- `app/(maestro)/job/[id].tsx`
- `app/(maestro)/profile/index.tsx`
- `app/(maestro)/profile/edit.tsx`
