import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Zap, AlertCircle } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const AUTO_REGISTER_STARTED_KEY = "creatoros.auth.autoRegister.started";

  useEffect(() => {
    if (isAuthenticated) {
      const registerFlowStarted = sessionStorage.getItem(AUTO_REGISTER_STARTED_KEY) === "1";
      sessionStorage.removeItem(AUTO_REGISTER_STARTED_KEY);

      if (!registerFlowStarted) {
        sessionStorage.removeItem("creatoros.auth.postLoginRedirect");
      }

      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setError("");
    setLoading(true);

    try {
      sessionStorage.setItem("creatoros.auth.postLoginRedirect", "/complete-profile");
      sessionStorage.setItem(AUTO_REGISTER_STARTED_KEY, "1");
      
      // Register with email hint for Keycloak
      await register(email, password);
      // Note: register will redirect to Keycloak registration UI
    } catch (err) {
      sessionStorage.removeItem(AUTO_REGISTER_STARTED_KEY);
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setError("");
    setLoading(true);

    try {
      sessionStorage.setItem("creatoros.auth.postLoginRedirect", "/complete-profile");
      sessionStorage.setItem(AUTO_REGISTER_STARTED_KEY, "1");
      await register(email, password);
    } catch (err) {
      sessionStorage.removeItem(AUTO_REGISTER_STARTED_KEY);
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground">Start managing your content like a pro</p>
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
                onChange={e => setEmail(e.target.value)} 
                disabled={loading}
                required 
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
                  onChange={e => setPassword(e.target.value)} 
                  disabled={loading}
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input 
                id="confirm" 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                disabled={loading}
                required 
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive mt-1">Passwords don't match</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full gradient-primary border-0" 
              disabled={loading || password !== confirmPassword || password.length < 8}
            >
              {loading ? "Redirecting to Keycloak..." : "Create Account"}
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
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>You'll be redirected to Keycloak to complete registration</p>
        </div>
      </div>
    </div>
  );
};

export default Register;