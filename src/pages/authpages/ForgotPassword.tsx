import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Zap, AlertCircle } from "lucide-react";
import { getKeycloakConfig, getKeycloakResetPasswordUrl } from "../../auth/config";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redirectInitiated, setRedirectInitiated] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pre-fill email if user is already logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const redirectToKeycloak = (emailHint?: string) => {
    const cfg = getKeycloakConfig();
    const resetUrl = getKeycloakResetPasswordUrl(cfg, emailHint);
    window.location.href = resetUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setIsLoading(true);
    setRedirectInitiated(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Redirect to Keycloak password reset with email hint
      redirectToKeycloak(email);
    } catch (err) {
      setIsLoading(false);
      setRedirectInitiated(false);
      setError(err instanceof Error ? err.message : "Unable to start password reset. Please try again.");
    }
  };

  const handleRetry = () => {
    setError("");
    setIsLoading(true);
    setRedirectInitiated(true);
    
    try {
      redirectToKeycloak(email);
    } catch (err) {
      setIsLoading(false);
      setRedirectInitiated(false);
      setError("Unable to start password reset. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" /> CreatorOS
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground">
            {redirectInitiated 
              ? "Redirecting you to Keycloak..." 
              : "You'll be redirected to Keycloak to reset your password"}
          </p>
        </div>

        <div className="glass rounded-xl p-6">
          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {redirectInitiated ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Redirecting to Keycloak</h2>
              <p className="text-sm text-muted-foreground">
                You're being redirected to Keycloak's secure password reset page.
                <br />
                Please wait...
              </p>
              {error && (
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
                  className="w-full mt-4"
                >
                  Try Again
                </Button>
              )}
              <Link to="/login">
                <Button variant="ghost" className="w-full mt-2">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 bg-primary/5 border border-primary/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to Keycloak's secure password reset page. 
                  Enter your email there to receive reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={isLoading}
                    required 
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the email associated with your account
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gradient-primary border-0" 
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? "Redirecting..." : "Continue to Keycloak"}
                </Button>

                {error && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="w-full mt-2"
                  >
                    Try Again
                  </Button>
                )}
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to login
          </Link>
        </p>

        <div className="text-center text-xs text-muted-foreground">
          <p>Keycloak will send a password reset link to your email</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;