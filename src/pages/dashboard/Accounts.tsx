import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, Linkedin, CheckCircle, XCircle, Link2, RefreshCw } from "lucide-react";
import { env } from "@/lib/env";
import { publishingApi, type ConnectedAccountDto } from "@/lib/api";

const platformIcons: Record<string, any> = { YouTube: Youtube, LinkedIn: Linkedin };
const platformColors: Record<string, string> = { YouTube: "text-red-500", LinkedIn: "text-blue-600" };

const Accounts = () => {
  const [accounts, setAccounts] = useState<ConnectedAccountDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<"youtube" | "linkedin" | null>(null);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await publishingApi.getConnectedAccounts();
      setAccounts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load connected accounts.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data as { type?: string; message?: string };

      if (payload?.type === "creatoros-oauth-success") {
        setConnectingPlatform(null);
        loadAccounts();
      }

      if (payload?.type === "creatoros-oauth-failed") {
        setConnectingPlatform(null);
        setError(payload.message || "OAuth connection failed.");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [loadAccounts]);

  const handleConnect = async (platform: "youtube" | "linkedin") => {
    setConnectingPlatform(platform);
    setError(null);

    try {
      localStorage.setItem("creatoros_api_gateway_url", env.VITE_API_GATEWAY_URL);
      const url =
        platform === "youtube"
          ? await publishingApi.getYouTubeLoginUrl()
          : await publishingApi.getLinkedInLoginUrl();

      const fallbackCallback = `${window.location.origin}/auth/${platform}/callback?provider=${platform}`;
      const popupUrl = url || fallbackCallback;

      const popup = window.open(popupUrl, `creatoros-${platform}-oauth`, "width=560,height=720");
      if (!popup) {
        throw new Error("Popup blocked. Please allow popups and try again.");
      }

      const poll = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(poll);
          setConnectingPlatform(null);
        }
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start OAuth flow.";
      setError(message);
      setConnectingPlatform(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connected Accounts</h1>
          <p className="text-muted-foreground text-sm">Manage your social media connections</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleConnect("youtube")} disabled={!!connectingPlatform}>
            {connectingPlatform === "youtube" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Youtube className="w-4 h-4 mr-2" />} Connect YouTube
          </Button>
          <Button variant="outline" onClick={() => handleConnect("linkedin")} disabled={!!connectingPlatform}>
            {connectingPlatform === "linkedin" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Linkedin className="w-4 h-4 mr-2" />} Connect LinkedIn
          </Button>
        </div>
      </div>

      {error && <Card className="p-3 bg-destructive/10 border-destructive/20 text-sm text-destructive">{error}</Card>}

      {isLoading ? (
        <Card className="p-6 bg-card border-border text-sm text-muted-foreground">Loading connected accounts...</Card>
      ) : accounts.length === 0 ? (
        <Card className="p-12 bg-card border-border">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
              <Link2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No accounts connected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Connect your YouTube or LinkedIn accounts to start managing your social media presence
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleConnect("youtube")}>Connect YouTube</Button>
              <Button variant="outline" onClick={() => handleConnect("linkedin")}>Connect LinkedIn</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {accounts.map(a => {
            const platformLabel = a.platform === "YOUTUBE" ? "YouTube" : a.platform === "LINKEDIN" ? "LinkedIn" : a.platform;
            const Icon = platformIcons[platformLabel] || Link2;
            return (
              <Card key={a.id} className="p-5 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${platformColors[platformLabel] || ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{platformLabel}</p>
                      <p className="text-xs text-muted-foreground">{a.accountName}</p>
                    </div>
                  </div>
                  {a.isActive ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.accountType || "account"} • {a.isActive ? "active" : "inactive"}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Accounts;