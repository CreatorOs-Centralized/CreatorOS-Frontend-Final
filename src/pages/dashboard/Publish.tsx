import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Youtube, Linkedin, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { contentApi, publishingApi, type ContentResponseDto, type ConnectedAccountDto, type PublishedPostDto } from "@/lib/api";

const platformIcons: Record<string, any> = { YouTube: Youtube, LinkedIn: Linkedin };

const Publish = () => {
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
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

  const accountOptions = useMemo(() => {
    if (selectedPlatform === "YouTube") return accounts.filter((a) => a.platform === "YOUTUBE");
    if (selectedPlatform === "LinkedIn") return accounts.filter((a) => a.platform === "LINKEDIN");
    return [];
  }, [accounts, selectedPlatform]);

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
      const message = err instanceof Error ? err.message : "Failed to load publishing data.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async () => {
    if (!selectedContent || !selectedPlatform || !selectedAccount || !selectedContentItem) return;
    setIsPublishing(true);
    setError(null);

    try {
      if (selectedPlatform === "YouTube") {
        // Retrieve mediaId from localStorage if available
        const mediaId = localStorage.getItem(`content:${selectedContent}:mediaId`) || undefined;
        
        const result = await publishingApi.publishYouTubeVideo({
          accountId: selectedAccount,
          title: selectedContentItem.title,
          description: "Published from CreatorOS",
          privacyStatus: "public",
          mediaId,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to publish to YouTube.");
        }
      } else {
        await publishingApi.publishLinkedInPost(selectedAccount, {
          text: `New content published: ${selectedContentItem.title}`,
        });
      }

      setSelectedContent("");
      setSelectedPlatform("");
      setSelectedAccount("");
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publishing failed.";
      setError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status.toUpperCase() === 'COMPLETED') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status.toUpperCase() === 'PENDING' || status.toUpperCase() === 'PROCESSING') return <Clock className="w-4 h-4 text-blue-400" />;
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publish</h1>
        <p className="text-muted-foreground text-sm">Share your content to YouTube & LinkedIn</p>
      </div>

      {error && <Card className="p-3 bg-destructive/10 border-destructive/20 text-sm text-destructive">{error}</Card>}

      <Card className="p-6 bg-card border-border space-y-4">
        <h2 className="font-semibold">New Publish</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Content</Label>
            <Select value={selectedContent} onValueChange={setSelectedContent}>
              <SelectTrigger><SelectValue placeholder="Choose content" /></SelectTrigger>
              <SelectContent>
                {contents.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger><SelectValue placeholder="Choose platform" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Connected Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount} disabled={!selectedPlatform}>
              <SelectTrigger><SelectValue placeholder="Choose connected account" /></SelectTrigger>
              <SelectContent>
                {accountOptions.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.accountName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handlePublish} className="gradient-primary border-0" disabled={!selectedContent || !selectedPlatform || !selectedAccount || isPublishing || isLoading}>
          <Send className="w-4 h-4 mr-2" /> {isPublishing ? "Publishing..." : "Publish Now"}
        </Button>
      </Card>

      <div>
        <h2 className="font-semibold mb-4">Publish History</h2>
        {isLoading ? (
          <Card className="p-4 bg-card border-border text-sm text-muted-foreground">Loading publish history...</Card>
        ) : posts.length === 0 ? (
          <Card className="p-12 bg-card border-border">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No publish history</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Your published content will appear here. Start by publishing your first video.
                </p>
              </div>
              <Button variant="outline" onClick={() => document.querySelector("button")?.focus()}>
                Publish Your First Content
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map(j => {
              const platformLabel = j.platform === "YOUTUBE" ? "YouTube" : "LinkedIn";
              const Icon = platformIcons[platformLabel] || Send;
              return (
                <Card key={j.id} className="p-4 bg-card border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{j.platformPostId}</p>
                      <p className="text-xs text-muted-foreground">{platformLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(j.logLevel || "COMPLETED")}
                    <span className="text-xs text-muted-foreground capitalize">{(j.logLevel || "COMPLETED").toLowerCase()}</span>
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