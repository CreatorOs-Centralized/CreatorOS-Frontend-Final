import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // AuthContext will handle the OAuth callback processing
    // Once authenticated, redirect based on profile completion
    if (isLoading) return;

    if (isAuthenticated) {
      if (user?.isProfileComplete) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/complete-profile", { replace: true });
      }
      return;
    }

    // If callback completed but we are not authenticated, don't spin forever.
    navigate("/login", { replace: true });
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <h2 className="text-lg font-semibold">Completing authentication...</h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we redirect you
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
