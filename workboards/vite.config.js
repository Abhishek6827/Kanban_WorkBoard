import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const base = isProduction ? "/Kanban_WorkBoard/" : "/";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // REMOVE proxy completely for production
    server:
      mode === "development"
        ? {
            proxy: {
              "/api": {
                target: "https://abhishektiwari6827.pythonanywhere.com",
                changeOrigin: true,
                secure: false,
              },
            },
          }
        : undefined,
    build: {
      outDir: "dist",
    },
    base: base,
  };
});
