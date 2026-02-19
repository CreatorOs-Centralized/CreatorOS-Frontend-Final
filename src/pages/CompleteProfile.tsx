import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  User,
  Palette,
  Globe,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  Instagram,
  Youtube,
  AtSign,
  FileText,
  Upload,
  AlertCircle
} from "lucide-react";
import { uploadImage } from "@/services/asset";

const steps = ["Basic Info", "About You", "Preferences", "Social"];

const CompleteProfile = () => {
  const { updateProfile, user, isAuthenticated, getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    username: "",
    display_name: "",
    fullName: "",
    bio: "",
    niche: "",
    profile_photo_url: "",
    location: "",
    language: "",
    dateOfBirth: "",
    instagramToken: "",
    youtubeToken: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user?.isProfileComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user?.isProfileComplete, navigate]);

  // Pre-fill form with existing user data if available
  useEffect(() => {
    if (user?.profileData) {
      setForm(prev => ({
        ...prev,
        ...user.profileData,
      }));
      if (user.profileData.profile_photo_url) {
        setAvatarPreview(user.profileData.profile_photo_url);
      }
    }
  }, [user]);

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
    { value: "hi", label: "Hindi" },
    { value: "ar", label: "Arabic" },
    { value: "pt", label: "Portuguese" },
    { value: "ru", label: "Russian" },
    { value: "it", label: "Italian" },
  ];

  const niches = [
    "Tech", "Gaming", "Lifestyle", "Education", "Entertainment",
    "Fitness", "Music", "Art", "Food", "Travel"
  ];

  const update = (key: string, value: string) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }

      setAvatar(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      update("profile_photo_url", previewUrl);
      setError("");
    }
  };

  const isFormValid = () => {
    return (
      form.fullName?.trim() !== "" &&
      form.username?.trim() !== "" &&
      form.display_name?.trim() !== "" &&
      form.bio?.trim() !== "" &&
      form.niche?.trim() !== "" &&
      (avatar !== null || form.profile_photo_url?.trim() !== "") &&
      form.dateOfBirth?.trim() !== "" &&
      form.location?.trim() !== "" &&
      form.language?.trim() !== "" &&
      form.instagramToken?.trim() !== "" &&
      form.youtubeToken?.trim() !== ""
    );
  };

  const completion = (() => {
    const fields = [
      form.username,
      form.display_name,
      form.fullName,
      form.bio,
      form.niche,
      form.profile_photo_url,
      form.location,
      form.language,
      form.dateOfBirth,
      form.instagramToken,
      form.youtubeToken,
    ];
    const hasAvatar = avatar !== null || form.profile_photo_url?.trim() !== "";
    const filled = fields.filter(f => f?.trim() !== '').length + (hasAvatar ? 1 : 0);
    return Math.round((filled / 11) * 100);
  })();

  const nextStep = () => {
    setError("");

    // Validate current step before proceeding
    if (step === 0) {
      if (!form.fullName || !form.display_name || !form.username || (!avatar && !form.profile_photo_url)) {
        setError("Please fill in all required fields in this section");
        return;
      }
    } else if (step === 1) {
      if (!form.bio || !form.niche || !form.dateOfBirth) {
        setError("Please fill in all required fields in this section");
        return;
      }
    } else if (step === 2) {
      if (!form.location || !form.language) {
        setError("Please fill in all required fields in this section");
        return;
      }
    } else if (step === 3) {
      if (!form.instagramToken || !form.youtubeToken) {
        setError("Please fill in all required fields in this section");
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    } else if (completion >= 100) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let avatarUrl = form.profile_photo_url;

      // In a real implementation, you would upload the file to your storage service
      // and get back a URL. For now, we'll use the preview URL.
      if (avatar) {
        try {
          if (!user?.id) throw new Error("User ID not found");
          const token = await getAccessToken();
          const folderId = "profile-photos";

          // Upload to Asset Service
          const uploadedUrl = await uploadImage(avatar, user.id, folderId, token);
          avatarUrl = uploadedUrl;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          // Fallback or show error? For now, we'll try to proceed but warn
          setError("Failed to upload profile image. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      const profileData = {
        ...form,
        avatar: avatarUrl,
      };

      await updateProfile(profileData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to complete profile later
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" /> CreatorOS
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="text-muted-foreground">All fields are required to unlock your dashboard</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Profile completion</span>
            <span className="font-medium text-primary">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>

        <div className="flex gap-2 mb-4">
          {steps.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              disabled={i > step && completion < (i * 25)}
              className={`flex-1 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 justify-center transition-colors ${i === step
                ? 'bg-primary text-primary-foreground'
                : i < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed opacity-50'
                }`}
            >
              {i < step ? <Check className="w-3 h-3" /> :
                i === 0 ? <User className="w-3 h-3" /> :
                  i === 1 ? <FileText className="w-3 h-3" /> :
                    i === 2 ? <Globe className="w-3 h-3" /> :
                      <Instagram className="w-3 h-3" />}
              {s}
            </button>
          ))}
        </div>

        <div className="glass rounded-xl p-6 space-y-4">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {step === 0 && (
            <>
              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label>Profile Photo *</Label>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative group">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                        {avatarPreview || form.profile_photo_url ? (
                          <img
                            src={avatarPreview || form.profile_photo_url}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <User className="w-8 h-8 text-primary mb-1" />
                            <span className="text-xs text-muted-foreground">
                              Click to upload
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg">
                        <Upload className="w-4 h-4" />
                      </div>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Click to upload your profile picture (max 5MB)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="John Doe"
                    value={form.fullName || ''}
                    onChange={e => update("fullName", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input
                  placeholder="Your Name"
                  value={form.display_name}
                  onChange={e => update("display_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Username *</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="@yourhandle"
                    value={form.username}
                    onChange={e => update("username", e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This will be your unique identifier on CreatorOS
                </p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Bio *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    className="pl-9"
                    placeholder="Tell us about yourself and your content..."
                    value={form.bio}
                    onChange={e => update("bio", e.target.value)}
                    rows={4}
                    maxLength={500}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {form.bio?.length || 0}/500 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label>Niche *</Label>
                <Select value={form.niche} onValueChange={v => update("niche", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {niches.map(n => (
                      <SelectItem key={n} value={n.toLowerCase()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="date"
                    value={form.dateOfBirth || ''}
                    onChange={e => update("dateOfBirth", e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="City, Country"
                    value={form.location}
                    onChange={e => update("location", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preferred Language *</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Select value={form.language} onValueChange={v => update("language", v)}>
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select your preferred language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(l => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>Instagram Access Token *</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="password"
                    placeholder="Enter your Instagram access token"
                    value={form.instagramToken || ''}
                    onChange={e => update("instagramToken", e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Required for Instagram integration
                </p>
              </div>
              <div className="space-y-2">
                <Label>YouTube API Token *</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="password"
                    placeholder="Enter your YouTube API token"
                    value={form.youtubeToken || ''}
                    onChange={e => update("youtubeToken", e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Required for YouTube integration
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Important Information</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>All fields are required to complete your profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Your social tokens are securely encrypted and never shared</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>You can update this information anytime from your profile settings</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button
              onClick={nextStep}
              className="flex-1 gradient-primary border-0"
              disabled={isLoading || (step === 3 && completion < 100)}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : step < 3 ? (
                <>Next <ArrowRight className="w-4 h-4 ml-1" /></>
              ) : (
                "Complete Profile"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-none"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;