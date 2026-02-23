import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { assetApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Shield, Upload } from "lucide-react";

const Settings = () => {
  const { user, profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    location: "",
    cover_photo_url: "",
  });
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCoverPreview = (nextUrl: string) => {
    setCoverPhotoPreview((currentUrl) => {
      if (currentUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentUrl);
      }
      return nextUrl;
    });
  };

  const updateProfilePhotoPreview = (nextUrl: string) => {
    setProfilePhotoPreview((currentUrl) => {
      if (currentUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentUrl);
      }
      return nextUrl;
    });
  };

  useEffect(() => {
    setForm({
      display_name: profile?.display_name || "",
      username: profile?.username || "",
      location: profile?.location || "",
      cover_photo_url: profile?.cover_photo_url || "",
    });

    let isMounted = true;

    const loadCoverPreview = async () => {
      const coverPhotoUrl = profile?.cover_photo_url || "";
      if (!coverPhotoUrl.trim()) {
        updateCoverPreview("");
        return;
      }

      try {
        const objectUrl = await assetApi.getAuthorizedAssetObjectUrl(coverPhotoUrl);
        if (isMounted) {
          updateCoverPreview(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch {
        if (isMounted) {
          updateCoverPreview("");
        }
      }
    };

    const loadProfilePhotoPreview = async () => {
      const nextProfilePhotoUrl = profile?.profile_photo_url || "";
      if (!nextProfilePhotoUrl.trim()) {
        updateProfilePhotoPreview("");
        return;
      }

      try {
        const objectUrl = await assetApi.getAuthorizedAssetObjectUrl(nextProfilePhotoUrl);
        if (isMounted) {
          updateProfilePhotoPreview(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } catch {
        if (isMounted) {
          updateProfilePhotoPreview("");
        }
      }
    };

    void loadCoverPreview();
    void loadProfilePhotoPreview();

    return () => {
      isMounted = false;
    };
  }, [profile]);

  useEffect(() => {
    return () => {
      if (coverPhotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(coverPhotoPreview);
      }
    };
  }, [coverPhotoPreview]);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePhotoPreview);
      }
    };
  }, [profilePhotoPreview]);

  const ensureAssetFolder = async (folderName: string): Promise<string> => {
    const folders = await assetApi.getRootFolders();
    const existing = folders.find((folder) => folder.name.toLowerCase() === folderName.toLowerCase());
    if (existing) return existing.id;

    const created = await assetApi.createFolder({
      name: folderName,
      description: `${folderName} uploads`,
    });

    return created.id;
  };

  const handleCoverPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file for cover photo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Cover photo size must be less than 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCoverPhoto(file);
    updateCoverPreview(previewUrl);
    setError(null);
  };

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file for profile photo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo size must be less than 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePhoto(file);
    updateProfilePhotoPreview(previewUrl);
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    let coverPhotoUrl = form.cover_photo_url;
    let profilePhotoUrl = profile?.profile_photo_url || "";

    try {
      if (coverPhoto) {
        const coverPhotoFolderId = await ensureAssetFolder("coverphoto");
        const uploadedAsset = await assetApi.uploadFile({
          file: coverPhoto,
          folderId: coverPhotoFolderId,
        });

        coverPhotoUrl = uploadedAsset.publicUrl?.trim()
          ? uploadedAsset.publicUrl
          : assetApi.getFileViewUrl(uploadedAsset.id);
      }

      if (profilePhoto) {
        const profilePhotoFolderId = await ensureAssetFolder("profilephoto");
        const uploadedAsset = await assetApi.uploadFile({
          file: profilePhoto,
          folderId: profilePhotoFolderId,
        });

        profilePhotoUrl = uploadedAsset.publicUrl?.trim()
          ? uploadedAsset.publicUrl
          : assetApi.getFileViewUrl(uploadedAsset.id);
      }

      const result = await updateProfile({
        username: form.username,
        display_name: form.display_name,
        bio: profile?.bio || "",
        niche: profile?.niche || "",
        profile_photo_url: profilePhotoUrl,
        cover_photo_url: coverPhotoUrl,
        location: form.location,
        language: profile?.language || "",
        is_public: profile?.is_public ?? true,
      });

      if (!result.success) {
        setError(result.error || "Failed to save changes.");
      } else {
        setCoverPhoto(null);
        setProfilePhoto(null);
        setForm((prev) => ({ ...prev, cover_photo_url: coverPhotoUrl }));

        try {
          const objectUrl = await assetApi.getAuthorizedAssetObjectUrl(coverPhotoUrl);
          updateCoverPreview(objectUrl);
        } catch {
          updateCoverPreview("");
        }

        try {
          const objectUrl = await assetApi.getAuthorizedAssetObjectUrl(profilePhotoUrl);
          updateProfilePhotoPreview(objectUrl);
        } catch {
          updateProfilePhotoPreview("");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
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
        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="profile-photo-upload"
              className="w-20 h-20 rounded-full border border-border bg-muted/30 overflow-hidden cursor-pointer flex items-center justify-center"
            >
              {profilePhotoPreview ? (
                <img src={profilePhotoPreview} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-4 h-4 text-muted-foreground" />
              )}
            </label>
            <div className="text-xs text-muted-foreground">
              PNG, JPG, WEBP up to 5MB
            </div>
          </div>
          <input
            id="profile-photo-upload"
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoChange}
            className="hidden"
          />
        </div>
        <div className="space-y-2">
          <Label>Cover Photo</Label>
          <label
            htmlFor="cover-photo-upload"
            className="block w-full cursor-pointer rounded-lg border border-border bg-muted/30 overflow-hidden"
          >
            {coverPhotoPreview ? (
              <img src={coverPhotoPreview} alt="Cover preview" className="h-36 w-full object-cover" />
            ) : (
              <div className="h-36 w-full flex items-center justify-center text-muted-foreground text-sm gap-2">
                <Upload className="w-4 h-4" />
                Upload cover photo
              </div>
            )}
          </label>
          <input
            id="cover-photo-upload"
            type="file"
            accept="image/*"
            onChange={handleCoverPhotoChange}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
        </div>
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
