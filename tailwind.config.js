/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // 'class' es necesario para NativeWind v4: activa el selector .dark
  // cuando nwColorScheme.set("dark") es llamado, cambiando los CSS vars.
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /*
         * Todos los colores semánticos usan CSS variables definidas en global.css.
         * Esto hace que bg-background, text-text, bg-surface, etc. cambien
         * automáticamente en dark mode SIN necesitar clases dark:* en cada elemento.
         * El formato "R G B" soporta modificadores de opacidad: bg-background/80
         */
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "#FFFFFF",
        },
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface:    "rgb(var(--color-surface)    / <alpha-value>)",
        text: {
          DEFAULT:   "rgb(var(--color-text)           / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
        },
        border:  "rgb(var(--color-border)  / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        error:   "rgb(var(--color-error)   / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        info:    "rgb(var(--color-info)    / <alpha-value>)",
      },
      fontFamily: {
        inter:           ["Inter_400Regular",  "sans-serif"],
        "inter-medium":  ["Inter_500Medium",   "sans-serif"],
        "inter-semibold":["Inter_600SemiBold", "sans-serif"],
        "inter-bold":    ["Inter_700Bold",     "sans-serif"],
      },
    },
  },
  plugins: [],
};
