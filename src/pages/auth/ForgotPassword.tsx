import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Zap, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
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
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground">We'll send you a reset link</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {sent ? (
          <div className="glass rounded-xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to <span className="text-foreground">{email}</span>
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/login")} 
              className="w-full mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 glass rounded-xl p-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full gradient-primary border-0" 
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;