import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Zap, CheckCircle } from "lucide-react";
import { useState } from "react";

const VerifyEmail = () => {
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Zap className="w-4 h-4" /> CreatorOS
        </div>

        <div className="glass rounded-xl p-8 space-y-6">
          {verified ? (
            <>
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">Email Verified!</h1>
              <p className="text-muted-foreground">Your email has been verified. Let's set up your profile.</p>
              <Link to="/complete-profile"><Button className="w-full gradient-primary border-0">Complete Profile</Button></Link>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Verify your email</h1>
              <p className="text-muted-foreground">
                We've sent a verification link to <span className="text-foreground font-medium">{user?.email || "your email"}</span>
              </p>
              <Button variant="outline" onClick={() => setVerified(true)} className="w-full">
                Simulate Verification
              </Button>
              <p className="text-xs text-muted-foreground">Didn't receive the email? <button className="text-primary hover:underline">Resend</button></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
