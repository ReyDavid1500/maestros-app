# Fase 01 — Setup del Proyecto

## Objetivo

Crear el proyecto Expo con todas las dependencias instaladas, NativeWind v4 configurado, Expo Router funcionando, TypeScript en modo strict, y la estructura de carpetas lista. Al finalizar, se puede navegar entre pantallas placeholder.

---

## Paso 1 — Crear el proyecto Expo

Ejecutar el comando de creación con la plantilla de Expo Router:

```
npx create-expo-app@latest maestros-app --template
```

Seleccionar la plantilla **"Blank (TypeScript)"** o la plantilla de Expo Router si está disponible.

Alternativamente, si el proyecto ya existe, agregar Expo Router manualmente.

Entrar al directorio: `cd maestros-app`

---

## Paso 2 — Instalar todas las dependencias

Instalar en grupos para facilitar la revisión:

**Navegación y routing:**
```
npx expo install expo-router
```

**Estilos:**
```
npx expo install nativewind
npm install --save-dev tailwindcss@^3.4.0
```

**Formularios:**
```
npm install react-hook-form @hookform/resolvers yup
```

**Estado global:**
```
npm install zustand
```

**Fetching de datos:**
```
npm install @tanstack/react-query axios axios-mock-adapter
```

**WebSocket:**
```
npm install @stomp/stompjs sockjs-client
npm install --save-dev @types/sockjs-client
```

**Autenticación y notificaciones:**
```
npx expo install expo-auth-session expo-crypto expo-web-browser
npx expo install expo-notifications
```

**Almacenamiento:**
```
npx expo install expo-secure-store @react-native-async-storage/async-storage
```

**UI / Utilidades:**
```
npx expo install expo-image expo-font @expo-google-fonts/inter
npx expo install @expo/vector-icons
npx expo install expo-location
```

**Desarrollo:**
```
npm install --save-dev @types/react @types/react-native
```

---

## Paso 3 — Configurar TypeScript en modo strict

En `tsconfig.json`, asegurarse de que las siguientes opciones estén activas:

- `"strict": true` — habilita todas las verificaciones estrictas
- `"noImplicitAny": true`
- `"strictNullChecks": true`
- `"noUncheckedIndexedAccess": true`
- `"exactOptionalPropertyTypes": true`
- `"paths"` — configurar alias para imports limpios:
  - `"@components/*"` → `"./src/components/*"`
  - `"@hooks/*"` → `"./src/hooks/*"`
  - `"@stores/*"` → `"./src/stores/*"`
  - `"@queries/*"` → `"./src/queries/*"`
  - `"@services/*"` → `"./src/services/*"`
  - `"@types"` → `"./src/types/index.ts"`
  - `"@utils/*"` → `"./src/utils/*"`
  - `"@constants/*"` → `"./src/constants/*"`
  - `"@mocks/*"` → `"./src/mocks/*"`

---

## Paso 4 — Configurar NativeWind v4

**babel.config.js:** Agregar `"nativewind/babel"` a los plugins de Babel.

**tailwind.config.js:** Crear en la raíz con:
- `content`: apuntar a `"./app/**/*.{js,jsx,ts,tsx}"` y `"./src/**/*.{js,jsx,ts,tsx}"`
- `presets`: incluir `require("nativewind/preset")`
- `theme.extend.colors`: Definir la paleta de colores del proyecto (ver Fase 02 para los valores exactos)
- `theme.extend.fontFamily`: Registrar `inter` con sus variantes de peso

**global.css:** Crear `src/global.css` con las directivas de Tailwind:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**metro.config.js:** Configurar para que Metro procese NativeWind correctamente. Usar `withNativeWind` de la librería:
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './src/global.css' });
```

---

## Paso 5 — Configurar Expo Router

**app.config.ts:** Configurar el plugin de Expo Router:

```typescript
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Maestros',
  slug: 'maestros-app',
  scheme: 'maestros', // Para deep linking
  plugins: [
    'expo-router',
    // otros plugins
  ],
  experiments: {
    typedRoutes: true, // Para autocompletado de rutas
  },
  // ...resto de config
};

export default config;
```

**app/_layout.tsx:** Crear el root layout con los providers necesarios (TanStack Query, NativeWind, fuentes). En esta fase solo el layout básico con `<Stack />`.

**app/index.tsx:** Pantalla de entrada que redirige según el estado de auth:
- Si hay token → navegar a `/(client)` o `/(maestro)` según el role
- Si no hay token → navegar a `/(auth)/welcome`

---

## Paso 6 — Configurar variables de entorno

**Crear `.env`** (en `.gitignore`):
```
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_WS_URL=http://localhost:8080/ws
EXPO_PUBLIC_USE_MOCK=true
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

**Crear `.env.example`** (commitear este):
```
EXPO_PUBLIC_API_URL=https://api.maestros.cl/api/v1
EXPO_PUBLIC_WS_URL=https://api.maestros.cl/ws
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID
```

**En `app.config.ts`**, exponer las variables a la app:
```typescript
extra: {
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  wsUrl: process.env.EXPO_PUBLIC_WS_URL,
  useMock: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
  googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
},
```

**Nota de seguridad:** Todo lo que empiece con `EXPO_PUBLIC_` es visible en el bundle del cliente. Nunca poner API keys privadas, secrets ni contraseñas aquí.

---

## Paso 7 — Configurar las fuentes

En `app/_layout.tsx`, cargar las fuentes Inter antes de renderizar la app:

```typescript
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
```

- Mantener el splash screen visible mientras las fuentes cargan
- Ocultar el splash screen solo cuando `fontsLoaded` sea `true`
- Agregar `Inter_400Regular` a la configuración de Tailwind como `font-inter`

---

## Paso 8 — Crear la estructura de carpetas

Crear los siguientes directorios vacíos (con archivos `.gitkeep` si es necesario):

```
src/
├── components/
│   ├── ui/
│   ├── maestro/
│   ├── request/
│   ├── chat/
│   └── common/
├── hooks/
├── queries/
├── stores/
├── services/
│   ├── api/
│   ├── auth/
│   └── websocket/
├── mocks/
├── types/
├── utils/
└── constants/

app/
├── (auth)/
├── (client)/
│   ├── maestro/
│   ├── request/
│   ├── requests/
│   ├── chat/
│   └── profile/
├── (maestro)/
│   ├── request/
│   ├── job/
│   ├── chat/
│   └── profile/
└── modal/
```

---

## Paso 9 — Crear pantallas placeholder

Para poder probar la navegación antes de tener las pantallas reales:

Crear `app/(auth)/welcome.tsx` con un texto "Bienvenido" simple.

Crear `app/(client)/_layout.tsx` con un `<Tabs>` básico con 4 tabs: Home, Solicitudes, Chat, Perfil.

Crear `app/(client)/index.tsx` con un texto "Home cliente".

Crear `app/(maestro)/_layout.tsx` con un `<Tabs>` básico con 3 tabs: Trabajos, Chat, Perfil.

Crear `app/(maestro)/index.tsx` con un texto "Home maestro".

---

## Paso 10 — Configurar el alias de imports en Babel

En `babel.config.js`, agregar el plugin de módulo resolver para que los alias de TypeScript funcionen también en Babel/Metro:

```javascript
plugins: [
  [
    'module-resolver',
    {
      alias: {
        '@components': './src/components',
        '@hooks': './src/hooks',
        // ... resto de alias
      },
    },
  ],
  'nativewind/babel',
],
```

Instalar el plugin si es necesario: `npm install --save-dev babel-plugin-module-resolver`

---

## Paso 11 — Verificación final de la fase

Ejecutar `npx expo start` y verificar:

- [ ] El bundler de Metro inicia sin errores
- [ ] La app se puede abrir en Expo Go o simulador
- [ ] NativeWind funciona: crear un componente temporal con `className="bg-blue-500 p-4"` y verificar que se aplican los estilos
- [ ] La navegación entre rutas funciona (navegar desde `index.tsx` hacia `(client)` o `(auth)/welcome`)
- [ ] TypeScript reporta errores de tipo correctamente (verificar con `npx tsc --noEmit`)
- [ ] Las fuentes Inter se cargan correctamente

---

## Archivos creados en esta fase

- `package.json` (con todas las dependencias)
- `tsconfig.json` (strict mode + paths)
- `babel.config.js` (NativeWind + module-resolver)
- `metro.config.js` (NativeWind)
- `tailwind.config.js`
- `src/global.css`
- `app.config.ts`
- `.env` (no commitear)
- `.env.example` (commitear)
- `.gitignore` (incluir `.env`, `node_modules/`, `.expo/`)
- `app/_layout.tsx`
- `app/index.tsx`
- `app/(auth)/_layout.tsx`
- `app/(auth)/welcome.tsx`
- `app/(client)/_layout.tsx`
- `app/(client)/index.tsx`
- `app/(maestro)/_layout.tsx`
- `app/(maestro)/index.tsx`
