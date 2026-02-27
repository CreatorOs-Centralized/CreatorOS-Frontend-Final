/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly VITE_KEYCLOAK_BASE_URL?: string;
  readonly VITE_KEYCLOAK_REALM?: string;
  readonly VITE_KEYCLOAK_CLIENT_ID?: string;
  readonly VITE_KEYCLOAK_CLIENT_SECRET?: string;
  readonly VITE_API_GATEWAY_URL?: string;
  readonly VITE_PUBLISHING_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
