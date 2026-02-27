const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const GOOGLE_CODE_VERIFIER_KEY = "creatoros.oauth.google.code_verifier";

const base64UrlEncode = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const sha256 = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
};

const createCodeVerifier = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
};

const createCodeChallenge = async (verifier: string) => {
  const digestBytes = await sha256(verifier);
  return base64UrlEncode(digestBytes);
};

export const buildGoogleRedirectUri = () => {
  return `${window.location.origin}/auth/google/callback`;
};

export const startGoogleOAuth = async (clientId: string) => {
  if (!clientId || !clientId.trim()) {
    throw new Error("Google client id is not configured");
  }

  const redirectUri = buildGoogleRedirectUri();
  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);

  sessionStorage.setItem(GOOGLE_CODE_VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  window.location.assign(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};
