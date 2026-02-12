import { fetchJson, HttpError } from "./http";
import {
  getKeycloakConfig,
  getKeycloakTokenUrl,
  KeycloakConfig,
} from "./config";

export type KeycloakTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type: string;
  scope?: string;
};

function formUrlEncode(body: Record<string, string>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    params.set(k, v);
  }
  return params.toString();
}

export async function passwordGrantLogin(
  username: string,
  password: string,
  cfg?: KeycloakConfig,
): Promise<KeycloakTokenResponse> {
  const keycloak = cfg ?? getKeycloakConfig();
  const url = getKeycloakTokenUrl(keycloak);

  const baseBody: Record<string, string> = {
    grant_type: "password",
    client_id: keycloak.clientId,
    username,
    password,
  };

  if (keycloak.clientSecret) {
    baseBody.client_secret = keycloak.clientSecret;
  }

  try {
    return await fetchJson<KeycloakTokenResponse>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formUrlEncode(baseBody),
    });
  } catch (err) {
    // Normalize common Keycloak error responses.
    if (err instanceof HttpError && typeof err.body === "object" && err.body) {
      const maybe = err.body as { error?: string; error_description?: string };
      const msg = maybe.error_description || maybe.error || err.message;
      throw new Error(msg);
    }
    throw err;
  }
}

export async function refreshAccessToken(
  refreshToken: string,
  cfg?: KeycloakConfig,
): Promise<KeycloakTokenResponse> {
  const keycloak = cfg ?? getKeycloakConfig();
  const url = getKeycloakTokenUrl(keycloak);

  const baseBody: Record<string, string> = {
    grant_type: "refresh_token",
    client_id: keycloak.clientId,
    refresh_token: refreshToken,
  };

  if (keycloak.clientSecret) {
    baseBody.client_secret = keycloak.clientSecret;
  }

  return await fetchJson<KeycloakTokenResponse>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formUrlEncode(baseBody),
  });
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
  cfg?: KeycloakConfig,
): Promise<KeycloakTokenResponse> {
  const keycloak = cfg ?? getKeycloakConfig();
  const url = getKeycloakTokenUrl(keycloak);

  const baseBody: Record<string, string> = {
    grant_type: "authorization_code",
    client_id: keycloak.clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  };

  if (keycloak.clientSecret) {
    baseBody.client_secret = keycloak.clientSecret;
  }

  return await fetchJson<KeycloakTokenResponse>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formUrlEncode(baseBody),
  });
}
