import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Maestros",
  slug: "maestros-app",
  version: "1.0.0",
  scheme: "maestros", // Para deep linking (OAuth callback y push notifications)
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic", // Soporta light y dark mode
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#F97316", // Naranja primario del branding
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.maestros.app",
  },
  android: {
    package: "com.maestros.app",
    adaptiveIcon: {
      backgroundColor: "#F97316",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-font",
    "expo-web-browser",
    [
      "expo-notifications",
      {
        color: "#F97316",
      },
    ],
  ],
  experiments: {
    typedRoutes: true, // Autocompletado de rutas en Expo Router
  },
  extra: {
    // Estas variables son visibles en el bundle del cliente. NO poner secrets aquí.
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    wsUrl: process.env.EXPO_PUBLIC_WS_URL,
    useMock: process.env.EXPO_PUBLIC_USE_MOCK === "true",
    googleClientIdIos: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    googleClientIdAndroid: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
    googleClientIdWeb: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  },
});
