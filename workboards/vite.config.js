import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  // Determine base path for GitHub Pages
  const isProduction = mode === "production";
  const base = isProduction ? "/Kanban_WorkBoard/" : "/";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        // Proxy API requests to your backend
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"), // Keep the /api prefix
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: isProduction ? false : true,
      minify: isProduction ? "esbuild" : false,
    },
    css: {
      modules: {
        localsConvention: "camelCaseOnly",
      },
    },
    define: {
      "process.env": {},
      __APP_ENV__: JSON.stringify(env.APP_ENV || mode),
    },
    base: base,
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
      exclude: ["js-big-decimal"],
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
