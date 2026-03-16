module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // unstable_transformImportMeta: reemplaza import.meta con
      // globalThis.__ExpoImportMetaRegistry para compatibilidad con Hermes.
      // Necesario porque @stomp/stompjs (y otras deps ESM) usan import.meta.
      ["babel-preset-expo", { unstable_transformImportMeta: true }],
      // NativeWind v4: transforma className → style en tiempo de compilación
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@components": "./src/components",
            "@hooks": "./src/hooks",
            "@stores": "./src/stores",
            "@queries": "./src/queries",
            "@services": "./src/services",
            "@types": "./src/types/index.ts",
            "@utils": "./src/utils",
            "@constants": "./src/constants",
            "@mocks": "./src/mocks",
          },
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        },
      ],
    ],
  };
};
