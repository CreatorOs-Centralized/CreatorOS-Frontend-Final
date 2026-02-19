import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Zap, CheckCircle, AlertCircle } from "lucide-react";

const VerifyEmail = () => {
  const { user, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const email = location.state?.email || user?.email || "your email";

  // Check for verification token in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      handleVerify(token);
    }
  }, [location]);

  const handleVerify = async (token: string) => {
    setVerifying(true);
    setError("");
    
    const result = await verifyEmail(token);
    
    if (result.success) {
      // Wait a moment to show success state
      setTimeout(() => {
        navigate("/complete-profile");
      }, 2000);
    } else {
      setError(result.error || "Verification failed");
    }
    
    setVerifying(false);
  };

  const handleResend = async () => {
    // Implement resend verification email
    setResendDisabled(true);
    setCountdown(60);
    
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // TODO: Call API to resend verification email
    // await authApi.resendVerification(email);
  };

  // If verification is successful, show success state
  if (verifying && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" /> CreatorOS
          </div>
          <div className="glass rounded-xl p-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">Verifying Email...</h1>
            <p className="text-muted-foreground">Please wait while we verify your email.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Zap className="w-4 h-4" /> CreatorOS
        </div>

        <div className="glass rounded-xl p-8 space-y-6">
          {error ? (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold">Verification Failed</h1>
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={() => navigate("/register")} className="w-full">
                Try Again
              </Button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Verify your email</h1>
              <p className="text-muted-foreground">
                We've sent a verification link to <span className="text-foreground font-medium">{email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to verify your account and complete your profile setup.
              </p>
              
              <div className="pt-4 space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleResend} 
                  disabled={resendDisabled}
                  className="w-full"
                >
                  {resendDisabled ? `Resend available in ${countdown}s` : "Resend verification email"}
                </Button>
                
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;