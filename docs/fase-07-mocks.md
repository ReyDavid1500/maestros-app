# Fase 07 — Datos Mock

## Objetivo

Crear datos mock realistas que permitan desarrollar y probar toda la UI sin tener el backend disponible. Los datos deben ser lo suficientemente ricos para ejercitar todos los estados de la UI.

---

## Paso 1 — Datos de categorías

Crear `src/mocks/data.ts` con el array `mockCategories`:

Las 10 categorías de servicio con UUIDs fijos (para que los filtros funcionen de forma predecible):

```
- Limpieza del hogar (id: 'cat-001', iconName: 'sparkles-outline')
- Aires acondicionados (id: 'cat-002', iconName: 'thermometer-outline')
- Reparaciones generales (id: 'cat-003', iconName: 'hammer-outline')
- Electricidad (id: 'cat-004', iconName: 'flash-outline')
- Gasfitería / Plomería (id: 'cat-005', iconName: 'water-outline')
- Pintura (id: 'cat-006', iconName: 'color-palette-outline')
- Mudanzas (id: 'cat-007', iconName: 'car-outline')
- Jardinería (id: 'cat-008', iconName: 'leaf-outline')
- Cerrajería (id: 'cat-009', iconName: 'key-outline')
- Instalaciones (id: 'cat-010', iconName: 'tv-outline')
```

---

## Paso 2 — Datos de usuarios mock

Crear `mockUsers` con al menos 3 usuarios:

**Usuario cliente:**
- `id: 'user-client-001'`
- `name: 'María González'`
- `email: 'maria.g@gmail.com'`
- `role: 'CLIENT'`
- `photoUrl`: null (para probar el avatar con iniciales)

**Usuarios maestros:**
- `id: 'user-maestro-001'` → Pedro Soto, electricista
- `id: 'user-maestro-002'` → Carmen Rojas, limpieza y jardinería
- `id: 'user-maestro-003'` → Roberto Fuentes, gasfitería

---

## Paso 3 — Datos de maestros mock (10 maestros)

Crear `mockMaestros` con 10 maestros con perfiles variados. Para cada uno incluir:

**Maestro 1 — Pedro Soto (Electricidad)**
- Rating: 4.8, 47 trabajos
- Descripción: "Electricista certificado con 12 años de experiencia en instalaciones residenciales y comerciales. Presupuesto sin costo."
- Servicios: Electricidad ($35.000, 2-3 horas), Instalaciones ($25.000, 1-2 horas)
- Disponible: true

**Maestro 2 — Carmen Rojas (Limpieza + Jardinería)**
- Rating: 4.9, 123 trabajos
- Descripción: "Especialista en limpieza profunda y mantenimiento de jardines. Traigo mis propios implementos."
- Servicios: Limpieza del hogar ($40.000, 3-4 horas), Jardinería ($30.000, 2-3 horas)
- Disponible: true

**Maestro 3 — Roberto Fuentes (Gasfitería)**
- Rating: 4.6, 31 trabajos
- Descripción: "Gasfiter certificado. Reparación de cañerías, instalación de calefones, solución de filtraciones."
- Servicios: Gasfitería / Plomería ($45.000, 1-3 horas)
- Disponible: false (para testear el estado no disponible)

**Maestros 4-10:** Crear con combinaciones de las otras categorías (Reparaciones, Pintura, Mudanzas, Cerrajería, Aires). Variar ratings entre 3.5 y 5.0, trabajos entre 5 y 200, precios entre $20.000 y $80.000 CLP.

---

## Paso 4 — Datos de solicitudes mock (5 solicitudes)

Crear `mockServiceRequests` en los 5 estados posibles:

**Solicitud 1 — PENDING**
- Cliente: María González
- Maestro: Pedro Soto
- Categoría: Electricidad
- Descripción: "Hay un corto en el baño, los enchufes no funcionan"
- Dirección: Av. Providencia 1234, Providencia
- Instrucciones: "Piso 5, depto 502"
- Horario: mañana a las 10:00
- Creado: hace 1 hora

**Solicitud 2 — ACCEPTED**
- Cliente: María González
- Maestro: Carmen Rojas
- Categoría: Limpieza del hogar
- Descripción: "Limpieza profunda del departamento antes de mudanza"
- Horario: en 3 días
- acceptedAt: hace 30 minutos

**Solicitud 3 — IN_PROGRESS**
- Cliente: María González
- Maestro: Roberto Fuentes
- Categoría: Gasfitería
- Descripción: "Filtración en la cocina, daña el gabinete"
- startedAt: hace 2 horas

**Solicitud 4 — COMPLETED**
- Misma cliente con Maestro 4
- completedAt: hace 3 días

**Solicitud 5 — CANCELLED**
- Misma cliente con Maestro 5
- cancelledAt: hace 1 semana

---

## Paso 5 — Datos de calificaciones mock

Crear `mockRatings` con al menos 8 calificaciones para Pedro Soto:

Variedad de scores (5, 5, 4, 5, 3, 5, 4, 5) con comentarios realistas en español:
- "Excelente trabajo, muy rápido y ordenado. Lo recomiendo."
- "Buen trabajo pero llegó 30 minutos tarde"
- "Perfecto, solucionó el problema en menos de 1 hora"
- "Muy profesional, explicó bien qué había que hacer"
- null (sin comentario)
- "Lo contrataría de nuevo sin dudas"
- etc.

---

## Paso 6 — Datos de mensajes de chat mock

Crear `mockChatMessages` con 20 mensajes para simular una conversación real entre María y Pedro:

La conversación debe representar un flujo natural:
1. Cliente: "Hola Pedro, ¿puedes revisar los enchufes del baño mañana a las 10am?"
2. Maestro: "Hola María! Sí, puedo estar ahí a las 10. Necesito saber si hay algo más que revisar."
3. Cliente: "Solo los enchufes del baño y la cocina. El del baño no funciona desde ayer."
4. Maestro: "Entendido, llevaré el tester y los materiales básicos. Nos vemos mañana."
5. Cliente: "Perfecto, cualquier duda al llegar toca el timbre del 502."
... hasta 20 mensajes

Los timestamps deben ser coherentes (mensajes separados por minutos/horas).

---

## Paso 7 — Registrar los handlers en el mock adapter

En `src/mocks/mockAdapter.ts`, registrar todos los endpoints:

```typescript
// Categorías
mock.onGet('/categories').reply(200, { success: true, data: mockCategories, message: null });

// Maestros — listado (con paginación)
mock.onGet('/maestros').reply(200, { success: true, data: { content: mockMaestros.slice(0, 10), page: 0, size: 10, totalElements: mockMaestros.length, totalPages: 1, last: true } });

// Maestros — búsqueda
mock.onGet('/maestros/search').reply((config) => {
  const q = config.params?.q?.toLowerCase();
  const filtered = q ? mockMaestros.filter(m => m.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q)) : mockMaestros;
  return [200, { success: true, data: { content: filtered, ... } }];
});

// Maestro detalle
mock.onGet(/\/maestros\/[^/]+/).reply((config) => {
  const id = config.url?.split('/').pop();
  const maestro = mockMaestros.find(m => m.id === id) ?? mockMaestros[0];
  return [200, { success: true, data: maestro }];
});

// Auth — Google
mock.onPost('/auth/google').reply(200, {
  success: true,
  data: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    isNewUser: false,
    user: mockUsers[0],
  },
});

// Usuarios — perfil propio
mock.onGet('/users/me').reply(200, { success: true, data: mockUsers[0] });

// Solicitudes
mock.onGet('/service-requests').reply(200, { success: true, data: { content: mockServiceRequests, ... } });
mock.onPost('/service-requests').reply(201, { success: true, data: mockServiceRequests[0], message: 'Solicitud creada exitosamente' });
mock.onGet(/\/service-requests\/[^/]+/).reply(200, { success: true, data: mockServiceRequests[0] });
mock.onPut(/\/service-requests\/[^/]+\/accept/).reply(200, { success: true, data: { ...mockServiceRequests[0], status: 'ACCEPTED' } });
// ... rest de los estados

// Chat
mock.onGet('/chat/rooms').reply(200, { success: true, data: [mockChatRoom] });
mock.onGet(/\/chat\/rooms\/[^/]+\/messages/).reply(200, { success: true, data: { content: mockChatMessages, page: 0, size: 30, totalElements: 20, totalPages: 1, last: true } });

// Calificaciones
mock.onGet(/\/ratings\/maestro\/[^/]+/).reply(200, { success: true, data: { ratings: mockRatings, averageScore: 4.7, totalRatings: 8, page: 0, size: 10, totalPages: 1 } });
mock.onPost('/ratings').reply(201, { success: true, data: mockRatings[0], message: 'Calificación enviada' });
```

---

## Paso 8 — Verificación final de la fase

Con `EXPO_PUBLIC_USE_MOCK=true`:

- [ ] `GET /categories` → 10 categorías después de 800ms
- [ ] `GET /maestros` → lista de maestros con datos realistas
- [ ] `GET /maestros/search?q=electricidad` → filtra maestros que mencionan electricidad
- [ ] `GET /maestros/maestro-001` → detalle de Pedro Soto
- [ ] `POST /auth/google` → simula login exitoso
- [ ] `GET /users/me` → retorna el usuario mock
- [ ] `GET /service-requests` → 5 solicitudes en diferentes estados
- [ ] `POST /service-requests` → "crea" solicitud y retorna respuesta
- [ ] `GET /chat/rooms` → lista de rooms con último mensaje
- [ ] `GET /ratings/maestro/user-maestro-001` → calificaciones de Pedro con promedio

---

## Archivos creados en esta fase

- `src/mocks/data.ts` (categorías, usuarios, maestros, solicitudes, mensajes, ratings)
- `src/mocks/mockAdapter.ts` (actualizado con todos los handlers)
