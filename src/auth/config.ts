export type KeycloakConfig = {
  baseUrl: string;
  tokenBaseUrl: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
};

export type AuthServiceConfig = {
  baseUrl: string;
};

function requireEnvString(value: unknown, key: string): string {
  if (typeof value === "string" && value.trim().length > 0) return value;
  throw new Error(`Missing required env var: ${key}`);
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

// In dev, we prefer Vite's proxy endpoints to avoid CORS.
const DEV_KEYCLOAK_PROXY_BASE = "/__keycloak";
const DEV_AUTH_PROXY_BASE = "/__auth";

export function getKeycloakConfig(): KeycloakConfig {
  const env = import.meta.env;

  // Browser redirects (login/registration UI) should go directly to Keycloak's origin
  // to preserve enterprise features (SSO/MFA/social) and avoid mixing origins.
  // Token calls can still use the dev proxy to avoid CORS during local development.
  const keycloakPublicBaseUrl = normalizeBaseUrl(
    (env.VITE_KEYCLOAK_BASE_URL as string) ?? "http://localhost:8081",
  );
  const keycloakTokenBaseUrl = normalizeBaseUrl(
    (env.DEV ? DEV_KEYCLOAK_PROXY_BASE : keycloakPublicBaseUrl) as string,
  );

  return {
    baseUrl: keycloakPublicBaseUrl,
    tokenBaseUrl: keycloakTokenBaseUrl,
    realm: (env.VITE_KEYCLOAK_REALM as string) ?? "creatorOs",
    clientId: (env.VITE_KEYCLOAK_CLIENT_ID as string) ?? "auth-service",
    clientSecret: (env.VITE_KEYCLOAK_CLIENT_SECRET as string) || undefined,
  };
}

export function getAuthServiceConfig(): AuthServiceConfig {
  const env = import.meta.env;

  const baseUrl = normalizeBaseUrl(
    (env.DEV ? DEV_AUTH_PROXY_BASE : env.VITE_AUTH_SERVICE_BASE_URL) ??
      "http://localhost:8082",
  );

  return { baseUrl };
}

export function getRedirectUri(): string {
  // Used only when we need to send the user to Keycloak UI flows.
  // Keep it stable and simple.
  if (typeof window === "undefined") {
    throw new Error("getRedirectUri() must run in a browser");
  }

  return `${window.location.origin}/login`;
}

export function getKeycloakTokenUrl(cfg: KeycloakConfig): string {
  const base = cfg.tokenBaseUrl || cfg.baseUrl;
  return `${base}/realms/${encodeURIComponent(cfg.realm)}/protocol/openid-connect/token`;
}

export function getKeycloakLoginUrl(
  cfg: KeycloakConfig,
  params: Record<string, string | undefined> = {},
): string {
  const base = `${cfg.baseUrl}/realms/${encodeURIComponent(cfg.realm)}/protocol/openid-connect/auth`;
  const url = new URL(base, window.location.origin);

  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");

  // By default, force the login screen even if the user already has a Keycloak SSO session.
  // This lets users choose a different account each time (useful in dev and shared browsers).
  if (!Object.prototype.hasOwnProperty.call(params, "prompt")) {
    url.searchParams.set("prompt", "login");
  }

  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  return url.toString();
}

export function getKeycloakRegisterUrl(
  cfg: KeycloakConfig,
  emailHint?: string,
): string {
  // Preferred: request registration via `prompt=create` on the normal auth endpoint.
  // However, some setups still show the login form; the (deprecated but widely working)
  // alternative is to use the /registrations endpoint, which directly opens the registration UI.
  const base = `${cfg.baseUrl}/realms/${encodeURIComponent(cfg.realm)}/protocol/openid-connect/registrations`;
  const url = new URL(base, window.location.origin);

  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");

  if (emailHint) url.searchParams.set("login_hint", emailHint);

  return url.toString();
}

export function getKeycloakResetPasswordUrl(
  cfg: KeycloakConfig,
  emailHint?: string,
): string {
  // Directly opens Keycloak's "Forgot password" / reset-credentials flow.
  // Keycloak supports this by using the /forgot-credentials endpoint.
  const base = `${cfg.baseUrl}/realms/${encodeURIComponent(cfg.realm)}/protocol/openid-connect/forgot-credentials`;
  const url = new URL(base, window.location.origin);

  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");

  if (emailHint) url.searchParams.set("login_hint", emailHint);

  return url.toString();
}

export function getRequiredAuthServiceBaseUrl(): string {
  const env = import.meta.env;
  return normalizeBaseUrl(
    requireEnvString(
      env.VITE_AUTH_SERVICE_BASE_URL,
      "VITE_AUTH_SERVICE_BASE_URL",
    ),
  );
}
