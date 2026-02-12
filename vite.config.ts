import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  
  const authTarget = env.VITE_AUTH_SERVICE_BASE_URL || "http://localhost:8082";
  const keycloakTarget = env.VITE_KEYCLOAK_BASE_URL || "http://localhost:8081";

  return {
    server: {
      host: "::",
      port: 5173,
      proxy: {
        "/__auth": {
          target: authTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/__auth/, ""),
        },
        "/__keycloak": {
          target: keycloakTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/__keycloak/, ""),
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime"],
    },
    optimizeDeps: {
      include: ["@tanstack/react-query"],
      exclude: ["lucide-react"],
    },
  };
});