import { fetchJson, fetchNoContent } from "./http";
import { getAuthServiceConfig } from "./config";

export type AuthServiceUserDto = {
  id: string;
  username: string | null;
  email: string | null;
  roles: string[];
};

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function getMe(accessToken: string): Promise<AuthServiceUserDto> {
  const { baseUrl } = getAuthServiceConfig();
  return await fetchJson<AuthServiceUserDto>(`${baseUrl}/auth/me`, {
    headers: {
      ...authHeaders(accessToken),
    },
  });
}

export async function syncCurrentUser(
  accessToken: string,
): Promise<AuthServiceUserDto> {
  const { baseUrl } = getAuthServiceConfig();
  return await fetchJson<AuthServiceUserDto>(`${baseUrl}/auth/users/sync`, {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
    },
  });
}

export async function logoutFromAuthService(
  accessToken: string,
): Promise<void> {
  const { baseUrl } = getAuthServiceConfig();
  await fetchNoContent(`${baseUrl}/auth/logout`, {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
    },
  });
}
