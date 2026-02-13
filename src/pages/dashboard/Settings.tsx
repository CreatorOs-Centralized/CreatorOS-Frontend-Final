import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Bell,
  Shield,
  Mail,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const {
    user,
    profile,
    updateProfile,
    sendPasswordReset,
    deleteAccount,
    logout,
  } = useAuth();
  const navigate = useNavigate();

  // Profile edit state
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password reset state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  // Delete account state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        display_name: displayName,
        username,
        location,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      setResetError("No email address found for this account");
      return;
    }

    setIsSendingReset(true);
    setResetError("");

    try {
      await sendPasswordReset(user.email);
      setResetSent(true);
    } catch (error) {
      console.error("Failed to send password reset:", error);
      setResetError("Failed to send reset email. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== "DELETE") {
      setDeleteError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteAccount();
      logout();
    } catch (error) {
      console.error("Failed to delete account:", error);
      setDeleteError("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account preferences
        </p>
      </div>

      <Card className="p-6 bg-card border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveProfile}
            className="gradient-primary border-0"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          {saveSuccess && (
            <span className="text-sm text-green-500 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Saved successfully!
            </span>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-card border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: "Email notifications", desc: "Receive email alerts" },
            { label: "Push notifications", desc: "Browser push notifications" },
            {
              label: "Publish success alerts",
              desc: "When content is published",
            },
            { label: "Publish failure alerts", desc: "When publishing fails" },
            { label: "Schedule reminders", desc: "Upcoming scheduled posts" },
          ].map((n) => (
            <div
              key={n.label}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-card border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Security</h2>
        </div>

        <div className="space-y-3">
          {/* Password Reset */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                {user?.email
                  ? `Reset instructions will be sent to ${user.email}`
                  : "Change your password"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(true)}
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Reset Link
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
            <div>
              <p className="text-sm font-medium text-destructive">
                Delete Account
              </p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              {resetSent
                ? "Check your email for the password reset link"
                : `We'll send a password reset link to ${user?.email || "your email address"}`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {resetSent ? (
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 text-green-500 mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm">
                  Password reset email sent! Check your inbox and follow the
                  instructions.
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn't receive it? Check your spam folder or try again.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">What happens next?</p>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">1.</span>
                      Click the button below to receive a reset link
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">2.</span>
                      Check your email for the reset link (valid for 1 hour)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">3.</span>
                      Click the link to create a new password
                    </li>
                  </ul>
                </div>
                {resetError && (
                  <p className="text-sm text-destructive mt-3">{resetError}</p>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            {resetSent ? (
              <Button onClick={() => setResetDialogOpen(false)}>Close</Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setResetDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendPasswordReset}
                  disabled={isSendingReset}
                  className="gradient-primary border-0"
                >
                  {isSendingReset ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warning
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• All your content will be permanently deleted</li>
                <li>• Your profile and settings will be removed</li>
                <li>• You will lose access to all CreatorOS features</li>
                <li>• This action cannot be reversed</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="confirm-delete"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder="DELETE"
                className="border-destructive/50 focus:border-destructive"
              />
              {deleteError && (
                <p className="text-xs text-destructive mt-1">{deleteError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmDelete("");
                setDeleteError("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmDelete !== "DELETE"}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Permanently Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
