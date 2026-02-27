import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  contentApi,
  publishingApi,
  type ContentResponseDto,
  type ConnectedAccountDto,
  type PublishedPostDto,
} from "@/lib/api";

const PLATFORMS = ["YOUTUBE", "LINKEDIN", "INSTAGRAM"] as const;

const platformIcons: Record<string, any> = {
  YOUTUBE: Youtube,
  LINKEDIN: Linkedin,
  INSTAGRAM: Instagram,
};

const platformLabels: Record<string, string> = {
  YOUTUBE: "YouTube",
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
};

const Publish = () => {
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  // 🔹 platform-wise descriptions
  const [descriptions, setDescriptions] = useState<Record<string, string>>(
    {}
  );

  const [contents, setContents] = useState<ContentResponseDto[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccountDto[]>([]);
  const [posts, setPosts] = useState<PublishedPostDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedContentItem = useMemo(
    () => contents.find((c) => c.id === selectedContent),
    [contents, selectedContent]
  );

  /* ---------------- LOAD DATA ---------------- */
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------------- ACCOUNTS FILTER ---------------- */
  const accountOptions = useMemo(() => {
    if (selectedPlatforms.length === 0) return [];
    return accounts.filter((a) =>
      selectedPlatforms.includes(a.platform)
    );
  }, [accounts, selectedPlatforms]);

  /* ---------------- PLATFORM TOGGLE ---------------- */
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        const updated = prev.filter((p) => p !== platform);
        const copy = { ...descriptions };
        delete copy[platform];
        setDescriptions(copy);
        return updated;
      } else {
        setDescriptions((d) => ({ ...d, [platform]: "" }));
        return [...prev, platform];
      }
    });
  };

  /* ---------------- PUBLISH ---------------- */
  const handlePublish = async () => {
    if (
      !selectedContent ||
      !selectedContentItem ||
      selectedPlatforms.length === 0 ||
      !selectedAccount
    )
      return;

    setIsPublishing(true);
    setError(null);

    try {
      for (const platform of selectedPlatforms) {
        const text =
          descriptions[platform] || selectedContentItem.title;

        if (platform === "YOUTUBE") {
          const mediaId =
            localStorage.getItem(`content:${selectedContent}:mediaId`) ||
            undefined;

          const res = await publishingApi.publishYouTubeVideo({
            accountId: selectedAccount,
            title: selectedContentItem.title,
            description: text,
            privacyStatus: "public",
            mediaId,
          });

          if (!res.success) throw new Error(res.error);
        }

        if (platform === "LINKEDIN") {
          await publishingApi.publishLinkedInPost(selectedAccount, {
            text,
          });
        }

        if (platform === "INSTAGRAM") {
          await publishingApi.publishInstagramPost(selectedAccount, {
            caption: text,
          });
        }
      }

      setSelectedContent("");
      setSelectedPlatforms([]);
      setSelectedAccount("");
      setDescriptions({});
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publishing failed");
    } finally {
      setIsPublishing(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "COMPLETED")
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "PENDING" || status === "PROCESSING")
      return <Clock className="w-4 h-4 text-blue-400" />;
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publish</h1>
        <p className="text-muted-foreground text-sm">
          Publish to multiple platforms
        </p>
      </div>

      {error && (
        <Card className="p-3 text-sm text-destructive bg-destructive/10">
          {error}
        </Card>
      )}

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">New Publish</h2>

        {/* CONTENT */}
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

        {/* PLATFORMS */}
        <div className="space-y-2">
          <Label>Platforms</Label>
          <div className="flex gap-4">
            {PLATFORMS.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                />
                {platformLabels[p]}
              </label>
            ))}
          </div>
        </div>

        {/* DYNAMIC DESCRIPTIONS */}
        {selectedPlatforms.map((platform) => (
          <div key={platform} className="space-y-2">
            <Label>{platformLabels[platform]} Description</Label>
            <textarea
              className="w-full rounded-md border bg-background p-2 text-sm"
              rows={3}
              value={descriptions[platform] || ""}
              onChange={(e) =>
                setDescriptions((d) => ({
                  ...d,
                  [platform]: e.target.value,
                }))
              }
              placeholder={`Write ${platformLabels[platform]} description...`}
            />
          </div>
        ))}

        {/* ACCOUNT */}
        <div className="space-y-2">
          <Label>Connected Account</Label>
          <Select
            value={selectedAccount}
            onValueChange={setSelectedAccount}
            disabled={accountOptions.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose account" />
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.accountName} ({platformLabels[a.platform]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handlePublish}
          disabled={
            isPublishing ||
            !selectedContent ||
            !selectedAccount ||
            selectedPlatforms.length === 0
          }
        >
          <Send className="w-4 h-4 mr-2" />
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
      </Card>

      {/* HISTORY */}
      <div>
        <h2 className="font-semibold mb-3">Publish History</h2>
        <div className="space-y-3">
          {posts.map((p) => {
            const Icon = platformIcons[p.platform] || Send;
            return (
              <Card
                key={p.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {p.platformPostId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {platformLabels[p.platform]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(p.logLevel || "COMPLETED")}
                  <span className="text-xs text-muted-foreground">
                    {(p.logLevel || "COMPLETED").toLowerCase()}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Publish;