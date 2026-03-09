import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Youtube,
  Linkedin,
  Instagram,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  assetApi,
  contentApi,
  publishingApi,
  type ContentResponseDto,
  type ConnectedAccountDto,
  type PublishedPostDto,
} from "@/lib/api";

type PlatformKey = "YOUTUBE" | "LINKEDIN" | "INSTAGRAM";

const platformConfig: Array<{ key: PlatformKey; label: string; icon: any }> = [
  { key: "YOUTUBE", label: "YouTube", icon: Youtube },
  { key: "LINKEDIN", label: "LinkedIn", icon: Linkedin },
  { key: "INSTAGRAM", label: "Instagram", icon: Instagram },
];

const platformIcons: Record<string, any> = {
  YouTube: Youtube,
  LinkedIn: Linkedin,
  Instagram,
};

const Publish = () => {
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformKey[]>([]);
  const [accountsByPlatform, setAccountsByPlatform] = useState<
    Record<PlatformKey, string>
  >({
    YOUTUBE: "",
    LINKEDIN: "",
    INSTAGRAM: "",
  });
  const [captionsByPlatform, setCaptionsByPlatform] = useState<
    Record<PlatformKey, string>
  >({
    YOUTUBE: "",
    LINKEDIN: "",
    INSTAGRAM: "",
  });

  const [contents, setContents] = useState<ContentResponseDto[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccountDto[]>([]);
  const [posts, setPosts] = useState<PublishedPostDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedContentItem = useMemo(
    () => contents.find((item) => item.id === selectedContent),
    [contents, selectedContent],
  );

  const availableAccountsByPlatform = useMemo(() => {
    return {
      YOUTUBE: accounts.filter((a) => a.platform === "YOUTUBE"),
      LINKEDIN: accounts.filter((a) => a.platform === "LINKEDIN"),
      INSTAGRAM: accounts.filter((a) => a.platform === "INSTAGRAM"),
    } satisfies Record<PlatformKey, ConnectedAccountDto[]>;
  }, [accounts]);

  const hasMissingAccounts = useMemo(() => {
    if (selectedPlatforms.length === 0) return true;
    return selectedPlatforms.some((platform) => !accountsByPlatform[platform]);
  }, [accountsByPlatform, selectedPlatforms]);

  const togglePlatform = (platform: PlatformKey) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        setAccountsByPlatform((current) => ({ ...current, [platform]: "" }));
        setCaptionsByPlatform((current) => ({ ...current, [platform]: "" }));
        return prev.filter((entry) => entry !== platform);
      }

      return [...prev, platform];
    });
  };

  const updatePlatformAccount = (platform: PlatformKey, accountId: string) => {
    setAccountsByPlatform((prev) => ({
      ...prev,
      [platform]: accountId,
    }));
  };

  const updatePlatformCaption = (platform: PlatformKey, caption: string) => {
    setCaptionsByPlatform((prev) => ({
      ...prev,
      [platform]: caption,
    }));
  };

  const resetPublishForm = () => {
    setSelectedContent("");
    setSelectedPlatforms([]);
    setAccountsByPlatform({
      YOUTUBE: "",
      LINKEDIN: "",
      INSTAGRAM: "",
    });
    setCaptionsByPlatform({
      YOUTUBE: "",
      LINKEDIN: "",
      INSTAGRAM: "",
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [contentList, accountList, published] = await Promise.all([
        contentApi.getMyContents(),
        publishingApi.getConnectedAccounts(),
        publishingApi.getPublishedPosts(),
      ]);

      setContents(contentList);
      setAccounts(accountList);
      setPosts(published);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load publishing data.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async () => {
    if (
      !selectedContent ||
      selectedPlatforms.length === 0 ||
      hasMissingAccounts ||
      !selectedContentItem
    ) {
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const mediaId =
        localStorage.getItem(`content:${selectedContent}:mediaId`) || undefined;
      const publishErrors: string[] = [];
      let successCount = 0;

      for (const platform of selectedPlatforms) {
        const accountId = accountsByPlatform[platform];
        const captionOverride = captionsByPlatform[platform].trim();

        try {
          if (platform === "YOUTUBE") {
            const result = await publishingApi.publishYouTubeVideo({
              accountId,
              title: selectedContentItem.title,
              description: captionOverride || "Published from CreatorOS",
              privacyStatus: "public",
              mediaId,
            });

            if (!result.success) {
              throw new Error(result.error || "YouTube publish failed");
            }
          } else if (platform === "LINKEDIN") {
            await publishingApi.publishLinkedInPost(accountId, {
              text: captionOverride || `New content published: ${selectedContentItem.title}`,
            });
          } else {
            if (!mediaId) {
              throw new Error("missing uploaded media; upload media in Content first");
            }

            const isImageContent = selectedContentItem.contentType === "IMAGE";
            const assetUrl = assetApi.getFileViewUrl(mediaId);

            await publishingApi.publishInstagram({
              accountId,
              caption: captionOverride || `New content published: ${selectedContentItem.title}`,
              mediaType: isImageContent ? undefined : "REELS",
              ...(isImageContent
                ? { imageUrl: assetUrl }
                : { videoUrl: assetUrl, thumbOffset: "1000" }),
            });
          }

          successCount += 1;
        } catch (platformError) {
          const message =
            platformError instanceof Error ? platformError.message : "publish failed";
          publishErrors.push(`${platform}: ${message}`);
        }
      }

      if (publishErrors.length > 0) {
        throw new Error(
          `Published to ${successCount}/${selectedPlatforms.length} platforms. ${publishErrors.join(" | ")}`,
        );
      }

      resetPublishForm();
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publishing failed.";
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const statusIcon = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized === "COMPLETED") {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    if (normalized === "PENDING" || normalized === "PROCESSING") {
      return <Clock className="w-4 h-4 text-blue-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publish</h1>
        <p className="text-muted-foreground text-sm">
          Share your content to YouTube, LinkedIn, and Instagram
        </p>
      </div>

      {error && (
        <Card className="p-3 bg-destructive/10 border-destructive/20 text-sm text-destructive">
          {error}
        </Card>
      )}

      <Card className="p-6 bg-card border-border space-y-4">
        <h2 className="font-semibold">New Publish</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Content</Label>
            <Select value={selectedContent} onValueChange={setSelectedContent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose content" />
              </SelectTrigger>
              <SelectContent>
                {contents.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Platforms</Label>
            <div className="grid sm:grid-cols-3 gap-3">
              {platformConfig.map((platform) => {
                const Icon = platform.icon;
                const checked = selectedPlatforms.includes(platform.key);

                return (
                  <label
                    key={platform.key}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary/50"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => togglePlatform(platform.key)}
                    />
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{platform.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {selectedPlatforms.map((platform) => {
            const config = platformConfig.find((entry) => entry.key === platform);
            if (!config) return null;

            return (
              <div key={platform} className="sm:col-span-2 rounded-lg border border-border p-4 space-y-3">
                <p className="text-sm font-medium">{config.label} settings</p>

                <div className="space-y-2">
                  <Label>{config.label} Account</Label>
                  <Select
                    value={accountsByPlatform[platform]}
                    onValueChange={(accountId) => updatePlatformAccount(platform, accountId)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Choose ${config.label} account`} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAccountsByPlatform[platform].map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{config.label} Caption (optional)</Label>
                  <Textarea
                    value={captionsByPlatform[platform]}
                    onChange={(event) => updatePlatformCaption(platform, event.target.value)}
                    placeholder={`Override default text for ${config.label}`}
                    rows={3}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handlePublish}
          className="gradient-primary border-0"
          disabled={
            !selectedContent ||
            selectedPlatforms.length === 0 ||
            hasMissingAccounts ||
            isPublishing ||
            isLoading
          }
        >
          <Send className="w-4 h-4 mr-2" />
          {isPublishing ? "Publishing..." : "Publish Now"}
        </Button>
      </Card>

      <div>
        <h2 className="font-semibold mb-4">Publish History</h2>
        {isLoading ? (
          <Card className="p-4 bg-card border-border text-sm text-muted-foreground">
            Loading publish history...
          </Card>
        ) : posts.length === 0 ? (
          <Card className="p-12 bg-card border-border">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No publish history</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Your published content will appear here. Start by publishing your
                  first video.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => document.querySelector("button")?.focus()}
              >
                Publish Your First Content
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const platformLabel =
                post.platform === "YOUTUBE"
                  ? "YouTube"
                  : post.platform === "LINKEDIN"
                    ? "LinkedIn"
                    : "Instagram";
              const Icon = platformIcons[platformLabel] || Send;

              return (
                <Card
                  key={post.id}
                  className="p-4 bg-card border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{post.platformPostId}</p>
                      <p className="text-xs text-muted-foreground">
                        {platformLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(post.logLevel || "COMPLETED")}
                    <span className="text-xs text-muted-foreground capitalize">
                      {(post.logLevel || "COMPLETED").toLowerCase()}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Publish;
