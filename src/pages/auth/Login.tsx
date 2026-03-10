import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Zap, AlertCircle } from "lucide-react";
import { loginCredentialsSchema } from "@/lib/validations/auth";
import { env } from "@/lib/env";
import { startGoogleOAuth } from "@/lib/auth/google-oauth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { email?: unknown } | null;
    const stateEmail = state?.email;
    if (typeof stateEmail === "string" && stateEmail.trim() && !email)
      setEmail(stateEmail);
  }, [location.state, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = loginCredentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      const firstMessage = parsed.error.issues[0]?.message;
      setError(firstMessage || "Please enter a valid email and password.");
      return;
    }

    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate(result.nextRoute || "/dashboard", { replace: true });
    } else {
      setError(result.error || "Login failed");
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    try {
      const clientId = env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setError("Google login is not configured.");
        return;
      }
      await startGoogleOAuth(clientId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google login failed";
      setError(message);
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
            Sign in to your creator dashboard
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 glass rounded-xl p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
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
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {env.VITE_GOOGLE_CLIENT_ID && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={handleGoogle}
            >
              Continue with Google
            </Button>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
