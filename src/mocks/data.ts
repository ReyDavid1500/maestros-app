/**
 * Datos de prueba para el mock de Axios.
 * Simula el estado inicial de la base de datos en desarrollo.
 * Datos diseñados para ejercitar todos los estados posibles de la UI.
 */

import type {
  User,
  ServiceCategory,
  MaestroListItem,
  MaestroProfile,
  ServiceRequest,
  Rating,
  ChatRoom,
  ChatMessage,
  Address,
} from "@types";

// ─── Helpers de fecha ────────────────────────────────────────────────────────

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const fromNow = (ms: number) => new Date(Date.now() + ms).toISOString();

// ─── Tokens ───────────────────────────────────────────────────────────────────

export const mockTokens = {
  accessToken: "mock-access-token-12345",
  refreshToken: "mock-refresh-token-67890",
};

// ─── Categorías (10) ──────────────────────────────────────────────────────────

export const mockCategories: ServiceCategory[] = [
  { id: "cat-001", name: "Limpieza del hogar",     iconName: "sparkles-outline" },
  { id: "cat-002", name: "Aires acondicionados",   iconName: "thermometer-outline" },
  { id: "cat-003", name: "Reparaciones generales", iconName: "hammer-outline" },
  { id: "cat-004", name: "Electricidad",           iconName: "flash-outline" },
  { id: "cat-005", name: "Gasfitería / Plomería",  iconName: "water-outline" },
  { id: "cat-006", name: "Pintura",                iconName: "color-palette-outline" },
  { id: "cat-007", name: "Mudanzas",               iconName: "car-outline" },
  { id: "cat-008", name: "Jardinería",             iconName: "leaf-outline" },
  { id: "cat-009", name: "Cerrajería",             iconName: "key-outline" },
  { id: "cat-010", name: "Instalaciones",          iconName: "tv-outline" },
];

const CAT = (id: string): ServiceCategory =>
  mockCategories.find((c) => c.id === id)!;

// ─── Usuarios ─────────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  {
    id: "user-client-001",
    name: "María González",
    email: "maria.g@gmail.com",
    photoUrl: null,
    phone: "+56912345678",
    role: "CLIENT",
    createdAt: ago(30 * DAY),
    hasMaestroProfile: false,
  },
  {
    id: "user-maestro-001",
    name: "Pedro Soto",
    email: "pedro.soto@gmail.com",
    photoUrl: "https://i.pravatar.cc/150?img=11",
    phone: "+56987654321",
    role: "MAESTRO",
    createdAt: ago(180 * DAY),
    hasMaestroProfile: true,
  },
  {
    id: "user-maestro-002",
    name: "Carmen Rojas",
    email: "carmen.rojas@gmail.com",
    photoUrl: "https://i.pravatar.cc/150?img=47",
    phone: "+56922334455",
    role: "MAESTRO",
    createdAt: ago(150 * DAY),
    hasMaestroProfile: true,
  },
  {
    id: "user-maestro-003",
    name: "Roberto Fuentes",
    email: "roberto.f@gmail.com",
    photoUrl: "https://i.pravatar.cc/150?img=12",
    phone: "+56933445566",
    role: "MAESTRO",
    createdAt: ago(90 * DAY),
    hasMaestroProfile: true,
  },
  {
    id: "user-maestro-004",
    name: "Valentina Torres",
    email: "vale.torres@gmail.com",
    photoUrl: "https://i.pravatar.cc/150?img=49",
    phone: "+56944556677",
    role: "MAESTRO",
    createdAt: ago(60 * DAY),
    hasMaestroProfile: true,
  },
  {
    id: "user-maestro-005",
    name: "Miguel Herrera",
    email: "miguel.h@gmail.com",
    photoUrl: null,
    phone: "+56955667788",
    role: "MAESTRO",
    createdAt: ago(45 * DAY),
    hasMaestroProfile: true,
  },
  {
    id: "user-maestro-006",
    name: "Sofía Morales",
    email: "sofia.m@gmail.com",
    photoUrl: "https://i.pravatar.cc/150?img=44",
    phone: "+56966778899",
    role: "MAESTRO",
    createdAt: ago(120 * DAY),
    hasMaestroProfile: true,
  },
  {
    id: "user-maestro-007",
    name: "Diego Castillo",
    email: "diego.c@gmail.com",
    photoUrl: "https://i.pravatar.cc/150?img=15",
    phone: "+56977889900",
    role: "MAESTRO",
    createdAt: ago(75 * DAY),
    hasMaestroProfile: true,
  },
  {
    id: "user-maestro-008",
    name: "Andrea Vega",
    email: "andrea.v@gmail.com",
    photoUrl: "https://i.pravatar.cc/150?img=48",
    phone: "+56988990011",
    role: "MAESTRO",
    createdAt: ago(200 * DAY),
    hasMaestroProfile: true,
  },
  {
    id: "user-maestro-009",
    name: "Luis Paredes",
    email: "luis.p@gmail.com",
    photoUrl: "https://i.pravatar.cc/150?img=14",
    phone: "+56999001122",
    role: "MAESTRO",
    createdAt: ago(55 * DAY),
    hasMaestroProfile: true,
  },
  {
    id: "user-maestro-010",
    name: "Carolina Silva",
    email: "caro.silva@gmail.com",
    photoUrl: "https://i.pravatar.cc/150?img=46",
    phone: "+56900112233",
    role: "MAESTRO",
    createdAt: ago(100 * DAY),
    hasMaestroProfile: true,
  },
];

export const mockCurrentUser = mockUsers[0]!;

// ─── Maestros (10) ────────────────────────────────────────────────────────────

export const mockMaestros: MaestroProfile[] = [
  {
    id: "maestro-001",
    userId: "user-maestro-001",
    name: "Pedro Soto",
    photoUrl: "https://i.pravatar.cc/150?img=11",
    description:
      "Electricista certificado con 12 años de experiencia en instalaciones residenciales y comerciales. Presupuesto sin costo.",
    services: [
      { serviceCategory: CAT("cat-004"), priceClp: 35000, estimatedTime: "2-3 horas" },
      { serviceCategory: CAT("cat-010"), priceClp: 25000, estimatedTime: "1-2 horas" },
    ],
    averageRating: 4.8,
    totalJobs: 47,
    isAvailable: true,
    isVerified: true,
    recentRatings: [],
  },
  {
    id: "maestro-002",
    userId: "user-maestro-002",
    name: "Carmen Rojas",
    photoUrl: "https://i.pravatar.cc/150?img=47",
    description:
      "Especialista en limpieza profunda y mantenimiento de jardines. Traigo mis propios implementos. Más de 120 clientes satisfechos.",
    services: [
      { serviceCategory: CAT("cat-001"), priceClp: 40000, estimatedTime: "3-4 horas" },
      { serviceCategory: CAT("cat-008"), priceClp: 30000, estimatedTime: "2-3 horas" },
    ],
    averageRating: 4.9,
    totalJobs: 123,
    isAvailable: true,
    isVerified: true,
    recentRatings: [],
  },
  {
    id: "maestro-003",
    userId: "user-maestro-003",
    name: "Roberto Fuentes",
    photoUrl: "https://i.pravatar.cc/150?img=12",
    description:
      "Gasfiter certificado. Reparación de cañerías, instalación de calefones, solución de filtraciones. Atención de urgencias.",
    services: [
      { serviceCategory: CAT("cat-005"), priceClp: 45000, estimatedTime: "1-3 horas" },
    ],
    averageRating: 4.6,
    totalJobs: 31,
    isAvailable: false,
    isVerified: true,
    recentRatings: [],
  },
  {
    id: "maestro-004",
    userId: "user-maestro-004",
    name: "Valentina Torres",
    photoUrl: "https://i.pravatar.cc/150?img=49",
    description:
      "Pintora profesional, interiores y exteriores. Trabajo prolijo con materiales de primera calidad. Presupuesto gratis.",
    services: [
      { serviceCategory: CAT("cat-006"), priceClp: 50000, estimatedTime: "4-6 horas" },
      { serviceCategory: CAT("cat-003"), priceClp: 30000, estimatedTime: "2-3 horas" },
    ],
    averageRating: 4.7,
    totalJobs: 68,
    isAvailable: true,
    isVerified: true,
    recentRatings: [],
  },
  {
    id: "maestro-005",
    userId: "user-maestro-005",
    name: "Miguel Herrera",
    photoUrl: null,
    description:
      "Empresa de mudanzas familiar, 8 años en el mercado. Camión propio, personal capacitado. Seguro de carga incluido.",
    services: [
      { serviceCategory: CAT("cat-007"), priceClp: 80000, estimatedTime: "4-8 horas" },
    ],
    averageRating: 4.3,
    totalJobs: 95,
    isAvailable: true,
    isVerified: false,
    recentRatings: [],
  },
  {
    id: "maestro-006",
    userId: "user-maestro-006",
    name: "Sofía Morales",
    photoUrl: "https://i.pravatar.cc/150?img=44",
    description:
      "Técnica en refrigeración y climatización. Mantenimiento preventivo y correctivo de aires acondicionados split.",
    services: [
      { serviceCategory: CAT("cat-002"), priceClp: 55000, estimatedTime: "2-3 horas" },
    ],
    averageRating: 4.5,
    totalJobs: 42,
    isAvailable: true,
    isVerified: true,
    recentRatings: [],
  },
  {
    id: "maestro-007",
    userId: "user-maestro-007",
    name: "Diego Castillo",
    photoUrl: "https://i.pravatar.cc/150?img=15",
    description:
      "Cerrajero con equipos de última generación. Apertura sin daño, cambio de chapa, duplicado de llaves, cajas de seguridad.",
    services: [
      { serviceCategory: CAT("cat-009"), priceClp: 20000, estimatedTime: "30-60 min" },
    ],
    averageRating: 3.9,
    totalJobs: 200,
    isAvailable: true,
    isVerified: false,
    recentRatings: [],
  },
  {
    id: "maestro-008",
    userId: "user-maestro-008",
    name: "Andrea Vega",
    photoUrl: "https://i.pravatar.cc/150?img=48",
    description:
      "Reparaciones generales del hogar: puertas, ventanas, muebles, cielos, pisos. 15 años de experiencia.",
    services: [
      { serviceCategory: CAT("cat-003"), priceClp: 35000, estimatedTime: "2-4 horas" },
      { serviceCategory: CAT("cat-010"), priceClp: 28000, estimatedTime: "1-2 horas" },
    ],
    averageRating: 5.0,
    totalJobs: 5,
    isAvailable: true,
    isVerified: false,
    recentRatings: [],
  },
  {
    id: "maestro-009",
    userId: "user-maestro-009",
    name: "Luis Paredes",
    photoUrl: "https://i.pravatar.cc/150?img=14",
    description:
      "Gasfiter y reparaciones generales. Disponible fines de semana. Precios justos y trabajo garantizado.",
    services: [
      { serviceCategory: CAT("cat-005"), priceClp: 30000, estimatedTime: "1-2 horas" },
      { serviceCategory: CAT("cat-003"), priceClp: 25000, estimatedTime: "1-3 horas" },
    ],
    averageRating: 3.5,
    totalJobs: 12,
    isAvailable: true,
    isVerified: false,
    recentRatings: [],
  },
  {
    id: "maestro-010",
    userId: "user-maestro-010",
    name: "Carolina Silva",
    photoUrl: "https://i.pravatar.cc/150?img=46",
    description:
      "Limpieza profesional con productos ecológicos. Especialidad en post-obra y limpieza de alfombras.",
    services: [
      { serviceCategory: CAT("cat-001"), priceClp: 45000, estimatedTime: "3-5 horas" },
    ],
    averageRating: 4.1,
    totalJobs: 29,
    isAvailable: false,
    isVerified: true,
    recentRatings: [],
  },
];

export const mockMaestroListItems: MaestroListItem[] = mockMaestros.map(
  ({ recentRatings: _r, ...item }) => item
);

// ─── Solicitudes de servicio (5 estados) ─────────────────────────────────────

const mockAddress: Address = {
  street: "Av. Providencia",
  number: "1234",
  city: "Providencia",
  additionalInstructions: "Piso 5, depto 502",
};

const mkClient = () => ({
  id: mockCurrentUser.id,
  name: mockCurrentUser.name,
  photoUrl: mockCurrentUser.photoUrl,
});

const mkMaestro = (m: MaestroProfile) => ({
  id: m.id,
  userId: m.userId,
  name: m.name,
  photoUrl: m.photoUrl,
  averageRating: m.averageRating,
});

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: "sr-001",
    client: mkClient(),
    maestro: mkMaestro(mockMaestros[0]!),
    serviceCategory: CAT("cat-004"),
    description: "Hay un corto en el baño, los enchufes no funcionan desde ayer.",
    address: mockAddress,
    scheduledAt: fromNow(1 * DAY),
    paymentMethod: "CASH",
    status: "PENDING",
    acceptedAt: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: ago(1 * HOUR),
  },
  {
    id: "sr-002",
    client: mkClient(),
    maestro: mkMaestro(mockMaestros[1]!),
    serviceCategory: CAT("cat-001"),
    description: "Limpieza profunda del departamento antes de la mudanza. Incluye cocina, baños y dormitorios.",
    address: { ...mockAddress, additionalInstructions: "Dejar en conserjería si no estoy" },
    scheduledAt: fromNow(3 * DAY),
    paymentMethod: "CASH",
    status: "ACCEPTED",
    acceptedAt: ago(30 * MIN),
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: ago(2 * HOUR),
  },
  {
    id: "sr-003",
    client: mkClient(),
    maestro: mkMaestro(mockMaestros[2]!),
    serviceCategory: CAT("cat-005"),
    description: "Filtración en la cocina bajo el lavaplatos, está dañando el gabinete.",
    address: mockAddress,
    scheduledAt: ago(3 * HOUR),
    paymentMethod: "CASH",
    status: "IN_PROGRESS",
    acceptedAt: ago(5 * HOUR),
    startedAt: ago(2 * HOUR),
    completedAt: null,
    cancelledAt: null,
    createdAt: ago(1 * DAY),
  },
  {
    id: "sr-004",
    client: mkClient(),
    maestro: mkMaestro(mockMaestros[3]!),
    serviceCategory: CAT("cat-006"),
    description: "Pintura sala comedor, dos paredes. Color blanco hueso.",
    address: mockAddress,
    scheduledAt: ago(4 * DAY),
    paymentMethod: "CASH",
    status: "COMPLETED",
    acceptedAt: ago(5 * DAY),
    startedAt: ago(4 * DAY),
    completedAt: ago(3 * DAY),
    cancelledAt: null,
    createdAt: ago(6 * DAY),
  },
  {
    id: "sr-005",
    client: mkClient(),
    maestro: mkMaestro(mockMaestros[4]!),
    serviceCategory: CAT("cat-007"),
    description: "Mudanza de departamento de 2 dormitorios a 8km de distancia.",
    address: mockAddress,
    scheduledAt: ago(8 * DAY),
    paymentMethod: "CASH",
    status: "CANCELLED",
    acceptedAt: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: ago(7 * DAY),
    createdAt: ago(9 * DAY),
  },
];

// ─── Valoraciones (8 para Pedro Soto) ────────────────────────────────────────

export const mockRatings: Rating[] = [
  {
    id: "rating-001",
    rater: { id: "user-client-010", name: "Javiera Muñoz",    photoUrl: null },
    score: 5,
    comment: "Excelente trabajo, muy rápido y ordenado. Lo recomiendo.",
    createdAt: ago(1 * DAY),
  },
  {
    id: "rating-002",
    rater: { id: "user-client-011", name: "Rodrigo Espinoza", photoUrl: "https://i.pravatar.cc/150?img=8" },
    score: 5,
    comment: "Perfecto, solucionó el problema en menos de 1 hora. Super profesional.",
    createdAt: ago(3 * DAY),
  },
  {
    id: "rating-003",
    rater: { id: "user-client-012", name: "Paula Ibáñez",     photoUrl: null },
    score: 4,
    comment: "Buen trabajo, llegó 30 minutos tarde pero resolvió todo.",
    createdAt: ago(5 * DAY),
  },
  {
    id: "rating-004",
    rater: { id: "user-client-013", name: "Tomás Araya",      photoUrl: "https://i.pravatar.cc/150?img=9" },
    score: 5,
    comment: "Muy profesional, explicó bien qué había que hacer y el costo fue razonable.",
    createdAt: ago(7 * DAY),
  },
  {
    id: "rating-005",
    rater: { id: "user-client-014", name: "Francisca Ortiz",  photoUrl: null },
    score: 3,
    comment: null,
    createdAt: ago(10 * DAY),
  },
  {
    id: "rating-006",
    rater: { id: "user-client-015", name: "Gonzalo Reyes",    photoUrl: "https://i.pravatar.cc/150?img=16" },
    score: 5,
    comment: "Lo contrataría de nuevo sin dudas. Trabajo impecable.",
    createdAt: ago(14 * DAY),
  },
  {
    id: "rating-007",
    rater: { id: "user-client-016", name: "Catalina Pinto",   photoUrl: null },
    score: 4,
    comment: "Buen servicio, cumplió con lo acordado.",
    createdAt: ago(20 * DAY),
  },
  {
    id: "rating-008",
    rater: { id: mockCurrentUser.id, name: mockCurrentUser.name, photoUrl: mockCurrentUser.photoUrl },
    score: 5,
    comment: "Muy buena atención desde el principio. Resolvió el corto del baño rapidísimo.",
    createdAt: ago(3 * DAY),
  },
];

// ─── Chat: 20 mensajes entre María y Pedro ───────────────────────────────────

const ROOM_ID = "room-sr-001";
const M = "user-maestro-001";
const C = mockCurrentUser.id;

export const mockChatMessages: ChatMessage[] = [
  { id: "msg-01", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "Hola Pedro, ¿puedes revisar los enchufes del baño mañana a las 10am?",                               createdAt: ago(23 * HOUR),             read: true  },
  { id: "msg-02", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "Hola María! Sí, puedo estar ahí a las 10. ¿Hay algo más que revisar?",                               createdAt: ago(22 * HOUR + 50 * MIN),  read: true  },
  { id: "msg-03", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "Solo los enchufes del baño y la cocina. El del baño no funciona desde ayer.",                        createdAt: ago(22 * HOUR + 40 * MIN),  read: true  },
  { id: "msg-04", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "Entendido, llevaré el tester y los materiales básicos. Nos vemos mañana.",                           createdAt: ago(22 * HOUR + 30 * MIN),  read: true  },
  { id: "msg-05", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "Perfecto, cualquier duda al llegar toca el timbre del 502.",                                         createdAt: ago(22 * HOUR + 20 * MIN),  read: true  },
  { id: "msg-06", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "Anotado 👍",                                                                                          createdAt: ago(22 * HOUR + 15 * MIN),  read: true  },
  { id: "msg-07", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "Ah, ¿cuánto cobrarías aproximadamente?",                                                             createdAt: ago(21 * HOUR),             read: true  },
  { id: "msg-08", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "El diagnóstico es gratis. Si hay que cambiar materiales, suele ser entre $15.000 y $25.000.",        createdAt: ago(20 * HOUR + 55 * MIN),  read: true  },
  { id: "msg-09", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "Perfecto, muchas gracias por la info.",                                                              createdAt: ago(20 * HOUR + 50 * MIN),  read: true  },
  { id: "msg-10", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "¡A sus órdenes! Hasta mañana.",                                                                       createdAt: ago(20 * HOUR + 45 * MIN),  read: true  },
  { id: "msg-11", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "Buenos días Pedro, estoy en el departamento cuando gustes.",                                         createdAt: ago(14 * HOUR),             read: true  },
  { id: "msg-12", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "Buenos días! Estoy llegando, en 5 minutos estoy ahí.",                                               createdAt: ago(13 * HOUR + 55 * MIN),  read: true  },
  { id: "msg-13", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "Ya llegué, toqué el timbre.",                                                                        createdAt: ago(13 * HOUR + 50 * MIN),  read: true  },
  { id: "msg-14", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "Perfecto, ya te abro.",                                                                              createdAt: ago(13 * HOUR + 48 * MIN),  read: true  },
  { id: "msg-15", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "Listo María, revisé todo. El problema era un cable suelto en el interruptor. Ya lo arreglé.",        createdAt: ago(12 * HOUR + 30 * MIN),  read: true  },
  { id: "msg-16", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "¡Excelente! ¿Y la cocina?",                                                                          createdAt: ago(12 * HOUR + 25 * MIN),  read: true  },
  { id: "msg-17", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "La cocina estaba bien, el enchufe andaba con la llave de luz apagada 😄",                            createdAt: ago(12 * HOUR + 20 * MIN),  read: true  },
  { id: "msg-18", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "jajaja qué vergüenza! ¿Cuánto te debo?",                                                             createdAt: ago(12 * HOUR + 18 * MIN),  read: true  },
  { id: "msg-19", roomId: ROOM_ID, senderId: M, senderRole: "MAESTRO", content: "Solo $15.000 por los materiales, el diagnóstico es gratis como le comenté.",                        createdAt: ago(12 * HOUR + 15 * MIN),  read: true  },
  { id: "msg-20", roomId: ROOM_ID, senderId: C, senderRole: "CLIENT",  content: "Muchas gracias Pedro, definitivamente te llamaré para la próxima! 🙌",                               createdAt: ago(12 * HOUR + 10 * MIN),  read: false },
];

// ─── Salas de chat ────────────────────────────────────────────────────────────

export const mockChatRooms: ChatRoom[] = [
  {
    roomId: ROOM_ID,
    serviceRequestId: "sr-001",
    otherParticipant: {
      id: mockMaestros[0]!.userId,
      name: mockMaestros[0]!.name,
      photoUrl: mockMaestros[0]!.photoUrl,
    },
    lastMessage: mockChatMessages[19]!,
    unreadCount: 1,
  },
  {
    roomId: "room-sr-002",
    serviceRequestId: "sr-002",
    otherParticipant: {
      id: mockMaestros[1]!.userId,
      name: mockMaestros[1]!.name,
      photoUrl: mockMaestros[1]!.photoUrl,
    },
    lastMessage: null,
    unreadCount: 0,
  },
];
