# Fase 09 — Flujo del Cliente (Pantallas)

## Objetivo

Implementar todas las pantallas del flujo del cliente: home con buscador, listado de maestros, detalle del maestro, formulario de solicitud, confirmación con auth, detalle de solicitud, historial, y perfil. Al finalizar, el flujo central del cliente es completamente navegable con datos mock.

---

## Paso 1 — Componentes específicos del dominio Maestros

Antes de las pantallas, crear los componentes que se reutilizarán en múltiples pantallas:

### MaestroCard (`src/components/maestro/MaestroCard.tsx`)

**Props:** `maestro: MaestroListItem`, `onPress: () => void`

**Layout:**
- Fondo de `Card` con `rounded-2xl`
- Fila superior: Avatar (48px) + nombre + badges de categorías
- Fila de info: precio mínimo (calculado como `Math.min(...maestro.services.map(s => s.priceClp))`), tiempo estimado del servicio más económico
- Fila inferior: RatingStars + `"★ {rating} · {totalJobs} trabajos"` + badge "Disponible"/"Ocupado"
- El badge "Ocupado" (estado `!isAvailable`) debe ser visualmente prominente en rojo
- El precio se formatea con `formatCLP(minPrice)`

### MaestroServiceList (`src/components/maestro/MaestroServiceList.tsx`)

**Props:** `services: MaestroService[]`

Lista de servicios con: nombre de categoría, precio, tiempo estimado. Formato de fila: `[ícono] Electricidad — $35.000 — 2-3 horas`.

### RequestCard (`src/components/request/RequestCard.tsx`)

**Props:** `request: ServiceRequest`, `onPress: () => void`

**Layout:**
- Badge de estado (`RequestStatusBadge`)
- Nombre del maestro con avatar pequeño
- Categoría del servicio con ícono
- Fecha del servicio formateada con `formatDate`

### RequestStatusBadge (`src/components/request/RequestStatusBadge.tsx`)

**Props:** `status: RequestStatus`

Retorna un `Badge` con el color y label apropiado:
- `PENDING` → warning, "Pendiente"
- `ACCEPTED` → info, "Aceptado"
- `IN_PROGRESS` → primary, "En curso"
- `COMPLETED` → success, "Completado"
- `CANCELLED` → error, "Cancelado"

### RequestTimeline (`src/components/request/RequestTimeline.tsx`)

**Props:** `request: ServiceRequest`

Muestra el timeline de estados: una línea vertical con puntos para cada estado que ya ocurrió. Cada punto tiene la fecha/hora del cambio de estado.

---

## Paso 2 — Funciones utilitarias

Crear en `src/utils/`:

### `formatCLP.ts`
```typescript
export const formatCLP = (amount: number): string => {
  return `$${amount.toLocaleString('es-CL')}`;
  // $35.000 → "$35.000"
};
```

### `formatDate.ts`
```typescript
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  // → "15/03/2024 10:00"
};
```

---

## Paso 3 — Layout de (client)

Crear `app/(client)/_layout.tsx` con el Tab Navigator:

**Tabs:**
1. `index` → ícono `"home-outline"`, label "Inicio"
2. `requests/index` → ícono `"list-outline"`, label "Mis servicios"
3. `chat/index` → ícono `"chatbubbles-outline"`, label "Mensajes" + badge de no leídos
4. `profile/index` → ícono `"person-outline"`, label "Perfil"

**Estilo de la tab bar:** Fondo de superficie, naranja para el tab activo. En dark mode adaptar colores.

---

## Paso 4 — Home del cliente `(client)/index.tsx`

**Secciones:**

1. **Barra de búsqueda:**
   - Input con placeholder "¿Qué necesitas?"
   - Al escribir: navegar a `results.tsx?q={texto}` con debounce de 500ms (para no navegar en cada keystroke)
   - Al tocar el ícono de búsqueda: navegar inmediatamente

2. **Grid de categorías:**
   - `useCategories()` para cargar las categorías
   - Grid de 2 columnas con los 10 tags
   - Cada celda: Card con ícono grande (Ionicons, 32px) y nombre de la categoría
   - Al tap: navegar a `results.tsx?categoryId={id}&categoryName={name}`

3. **Botón "Soy Maestro":**
   - En la esquina inferior derecha o como enlace sutil en el pie de la pantalla
   - Al tocar: si no está logueado → `/(auth)/welcome` con indicación de que es para maestros; si está logueado como CLIENT → mostrar info de cómo ser maestro

**Loading state:** Skeleton grid de 10 celdas mientras cargan las categorías.

---

## Paso 5 — Resultados `(client)/results.tsx`

**Parámetros de ruta:** `q` (búsqueda de texto), `categoryId`, `categoryName`

**Header:** Mostrar el término buscado o el nombre de la categoría.

**Lista de maestros:**
- Usar `useMaestros(filters)` con `useInfiniteQuery`
- Si hay `categoryId`: pasar el filtro
- Si hay `q`: usar `useInfiniteQuery` con `searchMaestros(q, categoryId, page, size)`
- FlatList con `MaestroCard` para cada resultado
- `onEndReached`: cargar más maestros (`fetchNextPage`)
- `onRefresh` (pull-to-refresh): `refetch()`
- Si `isFetchingNextPage`: mostrar spinner al final de la lista

**States:**
- Loading inicial: mostrar 5 `MaestroCardSkeleton`
- Error: `ErrorState` con botón "Reintentar"
- Sin resultados: `EmptyState` con `"No encontramos maestros para esta búsqueda"`

---

## Paso 6 — Detalle del Maestro `(client)/maestro/[id].tsx`

**Parámetro:** `id` = UUID del MaestroProfile

**Datos:** `useMaestro(id)`

**Layout (ScrollView):**
1. Foto grande de perfil (Avatar 120px con el nombre debajo)
2. Rating: `"★ {averageRating} · {totalJobs} trabajos"` + badge de verificado si aplica
3. Descripción completa del maestro
4. Sección "Servicios y precios": `MaestroServiceList`
5. Sección "Reseñas recientes" (últimas 3 del `recentRatings`): para cada una mostrar avatar, nombre, estrellas, comentario y fecha
6. Link "Ver todas las reseñas" → navegar a pantalla de ratings (o abrir inline)

**Botones (fijos en la parte inferior):**
- Botón primario grande: "Contratar" → navegar a `/(client)/request/create?maestroId={id}&categoryId={...}` (si el maestro solo tiene una categoría, preseleccionarla)
- Botón secundario: "Chatear" → si no hay solicitud existente, mostrar tooltip "Primero debes crear una solicitud"; si hay solicitud existente, navegar al chat

**Sin gate de autenticación:** No pedir login aquí. El login solo ocurre en la pantalla de confirmación.

---

## Paso 7 — Formulario de Solicitud `(client)/request/create.tsx`

**Parámetros de ruta:** `maestroId`, `maestroProfileId` (para mostrar el nombre del maestro)

**Formulario con React Hook Form + Yup:**
- Usar `useForm` con `resolver: yupResolver(createRequestSchema)` (Fase 06)
- Al montar: pre-cargar los datos del `pendingRequestStore` si existen (el usuario puede estar volviendo a este formulario)

**Campos:**
1. Descripción del trabajo (textarea): max 1000 chars, mostrar contador
2. Calle + Número de la dirección (en fila)
3. Ciudad (selector o input)
4. Instrucciones adicionales (opcional, max 500 chars)
5. DateTimePicker para fecha y horario sugerido
   - Mínimo: 2 horas desde ahora
   - Mostrar la fecha seleccionada en formato chileno
6. Método de pago: mostrar "Efectivo" como texto no editable (con ícono de dinero)

**Al cambiar cualquier campo:** Guardar en `pendingRequestStore.set({...})`

**Al tocar "Continuar":**
1. Validar el formulario con Yup
2. Si es válido: guardar en `pendingRequestStore` y navegar a `/(client)/request/confirm`
3. Si hay errores: mostrar los errores inline bajo cada campo

---

## Paso 8 — Confirmación y Auth `(client)/request/confirm.tsx`

Esta es la pantalla más importante del flujo. Es el único punto donde se pide autenticación.

**Layout:**

**Sección de resumen (no editable):**
- Nombre del maestro con foto pequeña
- Categoría del servicio
- Descripción (truncada a 2 líneas con "Ver más")
- Dirección formateada
- Fecha y hora
- Método de pago: "Efectivo"

**Sección de términos:**
- Checkbox: "Acepto los Términos y Condiciones" (link abre `modal/terms.tsx`)

**Sección de autenticación:**

Si el usuario NO está autenticado:
- Botón prominente naranja: "Continuar con Google" con ícono de Google
- Texto pequeño gris: "Necesitamos verificar tu identidad para que el maestro sepa quién lo contrata"

Si el usuario YA está autenticado:
- Avatar y nombre del usuario (confirmación de identidad)
- Botón naranja: "Confirmar solicitud"

**Flujo del botón "Continuar con Google":**
1. Verificar que los términos están aceptados (si no, mostrar error)
2. Ejecutar `promptAsync()` del hook de Google OAuth
3. En el `useEffect([response])`:
   - Cuando `response.type === 'success'`: extraer `id_token` y llamar a `authStore.signInWithGoogle(idToken)`
   - Cuando el usuario se autentica: el `useEffect([user])` detecta que `user` ya no es null y ejecuta `createServiceRequest.mutate(...)`
4. Mostrar estado de carga durante todo el proceso

**Manejo de errores:**
- Toast o mensaje inline si falla el Google OAuth
- Toast si falla la creación de la solicitud

**Usar `useThrottledAction`** en el botón de confirmación.

---

## Paso 9 — Detalle de Solicitud `(client)/request/[id].tsx`

**Datos:** `useServiceRequest(id)`

**Layout:**
1. Estado visual prominente: `RequestStatusBadge` grande en la parte superior
2. `RequestTimeline` con todos los estados y sus timestamps
3. Info del maestro con avatar y botón "Chatear"
4. Dirección del trabajo y horario
5. Descripción del trabajo

**Botones condicionales según estado:**
- Si `PENDING`: botón "Cancelar solicitud" (rojo, pide confirmación con Alert)
- Si `COMPLETED`: botón "Calificar al maestro" → abrir modal `modal/rating.tsx` con `serviceRequestId`
- Si ya calificó: no mostrar el botón (verificar si hay rating para esta solicitud)

**WebSocket:** Suscribirse a `/topic/notifications/{userId}` para actualizar el estado en tiempo real sin pull. Cuando llega una notificación con `serviceRequestId === id`, invalidar el query de esta solicitud.

---

## Paso 10 — Mis Solicitudes `(client)/requests/index.tsx`

**Tabs dentro de la pantalla:** "En curso" | "Historial"

**"En curso":** Solicitudes con estado `PENDING`, `ACCEPTED`, o `IN_PROGRESS`
**"Historial":** Solicitudes con estado `COMPLETED` o `CANCELLED`

Usar `useMyServiceRequests()` y filtrar en el cliente según el tab activo.

Para cada solicitud: `RequestCard` con `onPress → navigate to /(client)/request/[id]`

**Pull-to-refresh:** Llamar a `refetch()`.

---

## Paso 11 — Perfil del Cliente `(client)/profile/index.tsx`

**Secciones:**
1. Foto, nombre, email del usuario (de `authStore.user`)
2. Toggle "Modo oscuro" → `themeStore.setColorScheme(...)`
3. Sección "Ajustes":
   - "Editar perfil" → pantalla de edición básica (nombre, teléfono, foto)
4. Botón "Cerrar sesión" (rojo, pide confirmación con Alert)

---

## Paso 12 — Modal de Calificación `modal/rating.tsx`

**Parámetros de ruta:** `serviceRequestId`, `maestroName`

**Layout:**
- Título: "¿Cómo fue la experiencia?"
- Subtítulo: nombre del maestro
- 5 estrellas interactivas con `RatingStars interactive`
- Campo opcional: comentario (max 500 chars, mostrar contador)
- Botón "Enviar calificación" (deshabilitado hasta que score > 0)
- Botón "Ahora no" (menor énfasis, cierra el modal con confirmación Alert)

**Al enviar:** `useCreateRating().mutate(...)`, en `onSuccess` cerrar el modal con `router.back()`.

---

## Paso 13 — Modal de Términos y Condiciones `modal/terms.tsx`

- ScrollView con el texto de términos (placeholder por ahora)
- Botón "Cerrar" al final

---

## Paso 14 — Verificación final de la fase

**Flujo completo sin login:**
1. Welcome → tocar "Comenzar" → Home del cliente
2. Tocar categoría "Electricidad" → Lista de maestros filtrados
3. Tocar un maestro → Detalle del maestro
4. Tocar "Contratar" → Formulario de solicitud
5. Llenar el formulario y tocar "Continuar"
6. En la pantalla de confirmación: ver el resumen + botón "Continuar con Google"
7. (Mock) Tocar "Continuar con Google" → mock login → solicitud creada → navegar al detalle

**Otros flujos:**
- [ ] Pull-to-refresh en la lista de maestros funciona
- [ ] El scroll infinito carga más maestros al llegar al fondo
- [ ] Los skeleton loaders se muestran durante la carga
- [ ] El estado vacío se muestra cuando no hay resultados
- [ ] El botón "Cancelar" en una solicitud PENDING funciona con confirmación
- [ ] El modal de calificación se abre y permite seleccionar estrellas
- [ ] El modo oscuro cambia todos los colores correctamente

---

## Archivos creados en esta fase

- `src/components/maestro/MaestroCard.tsx`
- `src/components/maestro/MaestroServiceList.tsx`
- `src/components/request/RequestCard.tsx`
- `src/components/request/RequestStatusBadge.tsx`
- `src/components/request/RequestTimeline.tsx`
- `src/utils/formatCLP.ts`
- `src/utils/formatDate.ts`
- `app/(client)/_layout.tsx`
- `app/(client)/index.tsx`
- `app/(client)/results.tsx`
- `app/(client)/maestro/[id].tsx`
- `app/(client)/request/create.tsx`
- `app/(client)/request/confirm.tsx`
- `app/(client)/request/[id].tsx`
- `app/(client)/requests/index.tsx`
- `app/(client)/profile/index.tsx`
- `app/modal/rating.tsx`
- `app/modal/terms.tsx`
