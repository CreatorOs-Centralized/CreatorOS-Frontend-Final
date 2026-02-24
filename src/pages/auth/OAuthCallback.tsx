import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";

import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/auth-store";

type CallbackState = {
  title: string;
  message: string;
  status: "loading" | "success" | "error";
};

const PROVIDERS = ["youtube", "linkedin", "google"] as const;
type Provider = (typeof PROVIDERS)[number];

const isProvider = (value: string | null): value is Provider => {
  return Boolean(value && PROVIDERS.includes(value as Provider));
};

const decodeJwtUserId = (token: string): string | null => {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as {
      sub?: unknown;
      userId?: unknown;
      user_id?: unknown;
      uid?: unknown;
    };

    if (typeof payload.userId === "string" && payload.userId.trim()) return payload.userId;
    if (typeof payload.user_id === "string" && payload.user_id.trim()) return payload.user_id;
    if (typeof payload.uid === "string" && payload.uid.trim()) return payload.uid;
    if (typeof payload.sub === "string" && payload.sub.trim()) return payload.sub;
    return null;
  } catch {
    return null;
  }
};

const resolveUserIdForLinkedInCallback = async (token: string): Promise<string | null> => {
  const cachedUserId = useAuthStore.getState().user?.id;
  if (cachedUserId) return cachedUserId;

  const tokenUserId = decodeJwtUserId(token);
  if (tokenUserId) return tokenUserId;

  try {
    const response = await fetch(`${env.VITE_API_GATEWAY_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { id?: unknown };
    return typeof data.id === "string" && data.id.trim() ? data.id : null;
  } catch {
    return null;
  }
};

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { provider: providerParam } = useParams();

  const provider = useMemo<Provider | null>(() => {
    if (!isProvider(providerParam)) return null;
    return providerParam;
  }, [providerParam]);

  const [state, setState] = useState<CallbackState>({
    title: "Connecting account",
    message: "Please wait while we complete OAuth.",
    status: "loading",
  });

  useEffect(() => {
    const notify = (payload: { type: string; provider: string; message?: string }) => {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, window.location.origin);
      }
    };

    const run = async () => {
      try {
        if (!provider) {
          throw new Error("Invalid provider in callback URL.");
        }

        const code = searchParams.get("code");
        const stateParam = searchParams.get("state");
        const oauthError = searchParams.get("error");

        if (oauthError) throw new Error(oauthError);
        if (!code) throw new Error("Missing authorization code.");

        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Missing access token in local storage.");

        const callbackUrl =
          provider === "youtube"
            ? `${env.VITE_API_GATEWAY_URL}/oauth/youtube/callback?code=${encodeURIComponent(code)}${stateParam ? `&state=${encodeURIComponent(stateParam)}` : ""}`
            : `${env.VITE_API_GATEWAY_URL}/oauth/linkedin/callback?code=${encodeURIComponent(code)}`;

        const headers: HeadersInit = {
          Authorization: `Bearer ${token}`,
        };

        if (provider === "linkedin") {
          const userId = await resolveUserIdForLinkedInCallback(token);
          if (!userId) {
            throw new Error("Missing user context for LinkedIn callback.");
          }

          headers["X-User-Id"] = userId;
        }

        const response = await fetch(callbackUrl, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "OAuth callback failed.");
        }

        setState({
          title: `${provider === "youtube" ? "YouTube" : "LinkedIn"} connected`,
          message: "Account connected successfully. Closing window...",
          status: "success",
        });

        notify({ type: "creatoros-oauth-success", provider });
        setTimeout(() => window.close(), 1200);
      } catch (error) {
        const message = error instanceof Error ? error.message : "OAuth connection failed.";
        setState({
          title: "Connection failed",
          message,
          status: "error",
        });

        notify({
          type: "creatoros-oauth-failed",
          provider: provider ?? "unknown",
          message,
        });
      }
    };

    run();
  }, [provider, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center space-y-3">
        <h1 className="text-xl font-semibold">{state.title}</h1>
        <p className={`text-sm ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {state.message}
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
