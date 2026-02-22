import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield } from "lucide-react";

const Settings = () => {
  const { user, profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    location: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      display_name: profile?.display_name || "",
      username: profile?.username || "",
      location: profile?.location || "",
    });
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const result = await updateProfile({
      username: form.username,
      display_name: form.display_name,
      bio: profile?.bio || "",
      niche: profile?.niche || "",
      profile_photo_url: profile?.profile_photo_url || "",
      location: form.location,
      language: profile?.language || "",
      is_public: profile?.is_public ?? true,
    });

    if (!result.success) {
      setError(result.error || "Failed to save changes.");
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account preferences</p>
      </div>

      <Card className="p-6 bg-card border-border space-y-4">
        <div className="flex items-center gap-2 mb-2"><User className="w-4 h-4 text-primary" /><h2 className="font-semibold">Profile</h2></div>
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={form.display_name}
              onChange={(event) => setForm((prev) => ({ ...prev, display_name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
            />
          </div>
        </div>
        <Button className="gradient-primary border-0" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </Card>

      <Card className="p-6 bg-card border-border space-y-4">
        <div className="flex items-center gap-2 mb-2"><Bell className="w-4 h-4 text-primary" /><h2 className="font-semibold">Notifications</h2></div>
        <div className="space-y-3">
          {[
            { label: "Email notifications", desc: "Receive email alerts" },
            { label: "Push notifications", desc: "Browser push notifications" },
            { label: "Publish success alerts", desc: "When content is published" },
            { label: "Publish failure alerts", desc: "When publishing fails" },
            { label: "Schedule reminders", desc: "Upcoming scheduled posts" },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between py-2">
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
        <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-primary" /><h2 className="font-semibold">Security</h2></div>
        <Button variant="outline">Change Password</Button>
        <Button variant="destructive" className="ml-3">Delete Account</Button>
      </Card>
    </div>
  );
};

export default Settings;
