export type StoredTokens = {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: number; // epoch ms
};

const TOKENS_KEY = "creatoros.auth.tokens";
const USER_KEY = "creatoros.auth.user";

export function loadTokens(): StoredTokens | null {
  const raw = localStorage.getItem(TOKENS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredTokens;
    if (!parsed?.accessToken || typeof parsed.accessTokenExpiresAt !== "number")
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: StoredTokens): void {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_KEY);
}

export function loadUser<TUser>(key: string = USER_KEY): TUser | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TUser;
  } catch {
    return null;
  }
}

export function saveUser<TUser>(user: TUser, key: string = USER_KEY): void {
  localStorage.setItem(key, JSON.stringify(user));
}

export function clearUser(key: string = USER_KEY): void {
  localStorage.removeItem(key);
}
