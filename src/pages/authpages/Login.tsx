import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, AlertCircle, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login with optional email hint for Keycloak
      await login(email, "");
      // Note: login will redirect to Keycloak, so we don't navigate immediately
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setError("");
    setLoading(true);

    try {
      await login(email, "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" /> CreatorOS
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Redirecting you to Keycloak..."
              : "You will sign in on Keycloak"}
          </p>
        </div>

        <div className="glass rounded-xl p-6">
          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required={false}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional: used as an email hint for Keycloak
              </p>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary border-0"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to
                  Keycloak...
                </span>
              ) : (
                "Continue to Keycloak"
              )}
            </Button>

            {error && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRetry}
                disabled={loading}
                className="w-full mt-2"
              >
                Try Again
              </Button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Create one now
              </Link>
            </p>
          </div>

          <div className="mt-4 text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>You'll be redirected to Keycloak to complete authentication</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
