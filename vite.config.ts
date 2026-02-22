import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gatewayTarget = env.VITE_API_GATEWAY_URL || "http://localhost:8089";

  return {
    server: {
      host: "::",
      port: 5173,
      allowedHosts: [
        "unanimated-myah-authoritatively.ngrok-free.dev",
        "creatoros.adharbattulwar.com",
      ],
      proxy: {
        // Dev-only proxy to avoid CORS when calling backend services.
        // Example: /__auth/auth/register -> http://localhost:8081/auth/register
        "/__auth": {
          target: "http://localhost:8081",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/__auth/, ""),
        },
        // Dev-only proxy to avoid CORS when calling the API Gateway.
        // Example: /__gw/profiles/me -> http://localhost:8080/profiles/me
        "/__gw": {
          target: gatewayTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/__gw/, ""),
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
    },
  };
});
