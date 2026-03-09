# Fase 02 — Sistema de Diseño

## Objetivo

Definir el sistema de diseño completo: paleta de colores para light/dark mode, tipografía, y todos los componentes base reutilizables. Al finalizar, cualquier pantalla puede construirse sin inventar estilos desde cero.

---

## Paso 1 — Definir los colores en tailwind.config.js

En `tailwind.config.js`, extender la paleta de colores con los tokens semánticos del diseño:

```javascript
theme: {
  extend: {
    colors: {
      // Acento principal
      primary: {
        DEFAULT: '#F97316',  // naranja-500
        dark: '#FB923C',     // naranja-400 (más claro en dark mode)
        foreground: '#FFFFFF',
      },
      // Fondos
      background: {
        DEFAULT: '#FFFFFF',
        dark: '#0F0F0F',
      },
      // Superficies (cards, inputs)
      surface: {
        DEFAULT: '#F8F8F8',
        dark: '#1A1A1A',
      },
      // Texto
      text: {
        DEFAULT: '#111111',
        dark: '#F5F5F5',
        secondary: '#6B7280',
        'secondary-dark': '#9CA3AF',
      },
      // Bordes
      border: {
        DEFAULT: '#E5E7EB',
        dark: '#2D2D2D',
      },
      // Estados
      success: { DEFAULT: '#22C55E', dark: '#4ADE80' },
      error: { DEFAULT: '#EF4444', dark: '#F87171' },
      warning: { DEFAULT: '#F59E0B', dark: '#FBBF24' },
      info: { DEFAULT: '#3B82F6', dark: '#60A5FA' },
    },
    fontFamily: {
      inter: ['Inter_400Regular', 'sans-serif'],
      'inter-medium': ['Inter_500Medium', 'sans-serif'],
      'inter-semibold': ['Inter_600SemiBold', 'sans-serif'],
      'inter-bold': ['Inter_700Bold', 'sans-serif'],
    },
  },
},
```

---

## Paso 2 — Crear constantes de colores en TypeScript

Crear `src/constants/colors.ts` con los mismos colores en formato accesible para StyleSheet y lógica JS:

```typescript
export const Colors = {
  light: {
    primary: '#F97316',
    background: '#FFFFFF',
    surface: '#F8F8F8',
    text: '#111111',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  dark: {
    primary: '#FB923C',
    background: '#0F0F0F',
    surface: '#1A1A1A',
    text: '#F5F5F5',
    textSecondary: '#9CA3AF',
    border: '#2D2D2D',
    success: '#4ADE80',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
  },
} as const;
```

---

## Paso 3 — Hook useTheme

Crear `src/hooks/useTheme.ts`:

- Leer el `colorScheme` resuelto del `themeStore` (se implementa en Fase 05)
- Retornar el objeto `Colors.light` o `Colors.dark` según el scheme activo
- También retornar el `colorScheme` string para condicionales

Mientras el `themeStore` no está listo, implementar con `useColorScheme()` de React Native como placeholder.

---

## Paso 4 — Componente Button

Crear `src/components/ui/Button.tsx`.

**Props:**
- `label` — String, texto del botón
- `onPress` — función
- `variant` — `"primary"` | `"secondary"` | `"danger"` | `"ghost"` (default: `"primary"`)
- `size` — `"sm"` | `"md"` | `"lg"` (default: `"md"`)
- `loading` — boolean (default: false)
- `disabled` — boolean (default: false)
- `fullWidth` — boolean (default: false)
- `accessibilityLabel` — String (para accesibilidad)

**Estilos por variante:**
- `primary`: fondo naranja, texto blanco, `rounded-xl`
- `secondary`: borde naranja, fondo transparente, texto naranja
- `danger`: fondo rojo, texto blanco
- `ghost`: sin borde ni fondo, texto gris

**Estado loading:** Mostrar `ActivityIndicator` en lugar del texto, deshabilitar el botón.

**Estado disabled:** Opacidad reducida (0.5), no responde a taps.

**Aplicar `useThrottledAction`** (Fase 06) internamente: bloquear re-taps durante 300ms después del primer tap.

---

## Paso 5 — Componente Card

Crear `src/components/ui/Card.tsx`.

**Props:**
- `children` — React.ReactNode
- `onPress` — función opcional (si se pasa, la card es tappable)
- `style` — ViewStyle opcional para overrides

**Estilos:** `bg-surface rounded-2xl p-4 shadow-sm` en light mode. En dark mode: `bg-surface-dark` sin sombra (casi invisible sobre fondo oscuro).

---

## Paso 6 — Componente Input

Crear `src/components/ui/Input.tsx`.

**Props:**
- `label` — String opcional
- `placeholder` — String
- `value` — String
- `onChangeText` — función
- `error` — String opcional (mensaje de error de validación)
- `secureTextEntry` — boolean
- `multiline` — boolean
- `maxLength` — number
- `keyboardType` — tipo de teclado
- `accessibilityLabel` — String

**Estilos:** Border redondeado, color de borde naranja al focus, borde rojo y mensaje de error en rojo si hay error. En dark mode, fondo de superficie oscura.

---

## Paso 7 — Componente Avatar

Crear `src/components/ui/Avatar.tsx`.

**Props:**
- `uri` — String o null (URL de la foto)
- `name` — String (para generar las iniciales como fallback)
- `size` — `"sm"` (32px) | `"md"` (48px) | `"lg"` (80px) | `"xl"` (120px)
- `style` — ViewStyle opcional

**Comportamiento:**
- Si `uri` no es null: mostrar la imagen con `expo-image` y la propiedad `cachePolicy="memory-disk"`
- Si `uri` es null: mostrar un círculo con el color primario y las iniciales del nombre (primera letra del nombre y primer letra del apellido, si hay)
- Las iniciales se calculan: `name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()`

---

## Paso 8 — Componente Badge

Crear `src/components/ui/Badge.tsx`.

**Props:**
- `label` — String
- `variant` — `"primary"` | `"success"` | `"error"` | `"warning"` | `"neutral"`
- `size` — `"sm"` | `"md"`

**Uso principal:** Mostrar el estado de una solicitud (PENDING → warning, ACCEPTED → info, IN_PROGRESS → primary, COMPLETED → success, CANCELLED → error).

Crear una función helper `getStatusBadgeVariant(status: RequestStatus): BadgeVariant` en `src/utils/`.

---

## Paso 9 — Componente LoadingSpinner

Crear `src/components/ui/LoadingSpinner.tsx`.

**Props:**
- `size` — `"sm"` | `"md"` | `"lg"`
- `color` — String opcional (default: color primario)
- `overlay` — boolean (si true, muestra un overlay semitransparente sobre el contenido)

Usar `ActivityIndicator` de React Native internamente.

---

## Paso 10 — Componente EmptyState

Crear `src/components/common/EmptyState.tsx`.

**Props:**
- `icon` — String (nombre de ícono de Ionicons)
- `title` — String
- `message` — String
- `actionLabel` — String opcional
- `onAction` — función opcional

**Layout:** Centrado vertical y horizontalmente, ícono grande (60px, color gris), título en semibold, mensaje en gris, botón CTA si se provee.

---

## Paso 11 — Componente ErrorState

Crear `src/components/common/ErrorState.tsx`.

**Props:**
- `message` — String (por defecto: `"Ocurrió un error. Por favor intenta de nuevo."`)
- `onRetry` — función

**Layout:** Similar a EmptyState pero con ícono de advertencia en rojo y botón "Reintentar".

---

## Paso 12 — Componente SkeletonLoader

Crear `src/components/common/SkeletonLoader.tsx`.

**Props:**
- `width` — number o `"100%"`
- `height` — number
- `borderRadius` — number (default: 8)
- `style` — ViewStyle opcional

**Comportamiento:** Usar `Animated.Value` para una animación de pulso (opacity de 0.3 a 0.7 en loop). En dark mode, color base más oscuro.

Crear también `src/components/maestro/MaestroCardSkeleton.tsx` usando 3-4 `SkeletonLoader` para imitar el layout de `MaestroCard`.

---

## Paso 13 — RatingStars

Crear `src/components/maestro/RatingStars.tsx`.

**Props:**
- `rating` — number (0-5)
- `maxStars` — number (default: 5)
- `size` — number (tamaño de cada estrella, default: 16)
- `interactive` — boolean (si true, permite tap para seleccionar)
- `onRate` — función opcional (para modo interactivo)
- `showValue` — boolean (si true, muestra el número junto a las estrellas)

**En modo interactivo:** Resaltar estrellas según el tap, emitir el valor por `onRate`.

---

## Paso 14 — Header común

Crear `src/components/common/Header.tsx`.

**Props:**
- `title` — String
- `showBack` — boolean (default: false)
- `rightAction` — componente React opcional (ej. ícono de configuración)

**Comportamiento:** Si `showBack` es true, mostrar un botón de flecha izquierda que llame a `router.back()`.

---

## Paso 15 — Verificación final de la fase

Crear una pantalla de storybook informal en `app/(auth)/welcome.tsx` (placeholder temporal) que muestre todos los componentes:

- [ ] Button en sus 4 variantes y 3 tamaños
- [ ] Card con contenido
- [ ] Input con y sin error
- [ ] Avatar con imagen y con iniciales
- [ ] Badge en sus variantes
- [ ] LoadingSpinner
- [ ] EmptyState
- [ ] ErrorState
- [ ] SkeletonLoader
- [ ] RatingStars en modo display e interactivo
- [ ] Los estilos se aplican correctamente en light y dark mode (usar Simulador con toggle de tema del sistema)

---

## Archivos creados en esta fase

- `src/constants/colors.ts`
- `src/hooks/useTheme.ts` (placeholder hasta Fase 05)
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Avatar.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/LoadingSpinner.tsx`
- `src/components/common/EmptyState.tsx`
- `src/components/common/ErrorState.tsx`
- `src/components/common/SkeletonLoader.tsx`
- `src/components/common/Header.tsx`
- `src/components/maestro/RatingStars.tsx`
- `src/components/maestro/MaestroCardSkeleton.tsx`
- `tailwind.config.js` (actualizado con colores y fuentes)
