// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/USER/CreatorOS-Frontend-Final/node_modules/.pnpm/vite@5.4.21_@types+node@22.19.11/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/USER/CreatorOS-Frontend-Final/node_modules/.pnpm/@vitejs+plugin-react-swc@3._2a6ba56299ff816b6619cac684a33c80/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/USER/CreatorOS-Frontend-Final/node_modules/.pnpm/lovable-tagger@1.1.13_vite@5.4.21_@types+node@22.19.11_/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\USER\\CreatorOS-Frontend-Final";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const authTarget = env.VITE_AUTH_SERVICE_BASE_URL || "http://localhost:8081";
  const keycloakTarget = env.VITE_KEYCLOAK_BASE_URL || "http://localhost:8088";
  return {
    server: {
      host: "::",
      port: 5173,
      proxy: {
        "/__auth": {
          target: authTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path2) => path2.replace(/^\/__auth/, "")
        },
        "/__keycloak": {
          target: keycloakTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path2) => path2.replace(/^\/__keycloak/, "")
        }
      }
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime"]
    },
    optimizeDeps: {
      include: ["@tanstack/react-query"],
      exclude: ["lucide-react"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVU0VSXFxcXENyZWF0b3JPUy1Gcm9udGVuZC1GaW5hbFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVVNFUlxcXFxDcmVhdG9yT1MtRnJvbnRlbmQtRmluYWxcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1VTRVIvQ3JlYXRvck9TLUZyb250ZW5kLUZpbmFsL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlZJVEVfXCIpO1xyXG5cclxuICBjb25zdCBhdXRoVGFyZ2V0ID0gZW52LlZJVEVfQVVUSF9TRVJWSUNFX0JBU0VfVVJMIHx8IFwiaHR0cDovL2xvY2FsaG9zdDo4MDgxXCI7XHJcbiAgY29uc3Qga2V5Y2xvYWtUYXJnZXQgPSBlbnYuVklURV9LRVlDTE9BS19CQVNFX1VSTCB8fCBcImh0dHA6Ly9sb2NhbGhvc3Q6ODA4OFwiO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIGhvc3Q6IFwiOjpcIixcclxuICAgICAgcG9ydDogNTE3MyxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICBcIi9fX2F1dGhcIjoge1xyXG4gICAgICAgICAgdGFyZ2V0OiBhdXRoVGFyZ2V0LFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9fX2F1dGgvLCBcIlwiKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiL19fa2V5Y2xvYWtcIjoge1xyXG4gICAgICAgICAgdGFyZ2V0OiBrZXljbG9ha1RhcmdldCxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvX19rZXljbG9hay8sIFwiXCIpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW3JlYWN0KCksIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKV0uZmlsdGVyKFxyXG4gICAgICBCb29sZWFuLFxyXG4gICAgKSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgfSxcclxuICAgICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInJlYWN0L2pzeC1ydW50aW1lXCJdLFxyXG4gICAgfSxcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICBpbmNsdWRlOiBbXCJAdGFuc3RhY2svcmVhY3QtcXVlcnlcIl0sXHJcbiAgICAgIGV4Y2x1ZGU6IFtcImx1Y2lkZS1yZWFjdFwiXSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFMsU0FBUyxjQUFjLGVBQWU7QUFDbFYsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLE9BQU87QUFFaEQsUUFBTSxhQUFhLElBQUksOEJBQThCO0FBQ3JELFFBQU0saUJBQWlCLElBQUksMEJBQTBCO0FBRXJELFNBQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFdBQVc7QUFBQSxVQUNULFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLGFBQWEsRUFBRTtBQUFBLFFBQ2pEO0FBQUEsUUFDQSxlQUFlO0FBQUEsVUFDYixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxpQkFBaUIsRUFBRTtBQUFBLFFBQ3JEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLENBQUMsRUFBRTtBQUFBLE1BQzlEO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3RDO0FBQUEsTUFDQSxRQUFRLENBQUMsU0FBUyxhQUFhLG1CQUFtQjtBQUFBLElBQ3BEO0FBQUEsSUFDQSxjQUFjO0FBQUEsTUFDWixTQUFTLENBQUMsdUJBQXVCO0FBQUEsTUFDakMsU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
