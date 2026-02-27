import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import {
  Eye,
  Heart,
  MessageSquare,
  Video,
  TrendingUp,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { contentApi, type ContentResponseDto } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLATFORMS = ["youtube", "instagram", "linkedin"] as const;

const Dashboard = () => {
  const { profile, user } = useAuth();

  const [recentContent, setRecentContent] = useState<ContentResponseDto[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<ContentResponseDto[]>([]);
  const [contentError, setContentError] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const [selectedPlatform, setSelectedPlatform] =
    useState<(typeof PLATFORMS)[number]>("youtube");
  const [selectedPost, setSelectedPost] = useState<string>("");

  /* ------------------ DATA LOADING ------------------ */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoadingContent(true);
      try {
        const items = await contentApi.getMyContents();
        if (!mounted) return;

        const published = items.filter(
          (p) => p.workflowState === "PUBLISHED"
        );

        setRecentContent(items.slice(0, 4));
        setPublishedPosts(published);
      } catch (e) {
        if (!mounted) return;
        setContentError(
          e instanceof Error ? e.message : "Failed to load content"
        );
      } finally {
        mounted && setIsLoadingContent(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------ FILTERED POSTS ------------------ */
  const platformPosts = useMemo(() => {
    return publishedPosts.filter(
      (p) => p.platform?.toLowerCase() === selectedPlatform
    );
  }, [publishedPosts, selectedPlatform]);

  useEffect(() => {
    setSelectedPost("");
  }, [selectedPlatform]);

  /* ------------------ STATS (REAL DATA ONLY) ------------------ */
  const stats = {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalPosts: platformPosts.length,
  };

  /* ------------------ GRAPH DATA (NO MOCKS) ------------------ */
  const chartData: any[] = [];

  const statCards = [
    {
      label: "Total Views",
      value: stats.totalViews.toString(),
      icon: Eye,
      color: "text-primary",
    },
    {
      label: "Total Likes",
      value: stats.totalLikes.toString(),
      icon: Heart,
      color: "text-pink-500",
    },
    {
      label: "Comments",
      value: stats.totalComments.toString(),
      icon: MessageSquare,
      color: "text-blue-400",
    },
    {
      label: "Total Posts",
      value: stats.totalPosts.toString(),
      icon: Video,
      color: "text-green-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back,{" "}
          {profile?.display_name ||
            user?.email?.split("@")[0] ||
            "Creator"}{" "}
          👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your content performance overview
        </p>
      </div>

      {/* FILTERS */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>

          {/* PLATFORM */}
          <Select
            value={selectedPlatform}
            onValueChange={(v) =>
              setSelectedPlatform(v as any)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* POSTS */}
          <Select value={selectedPost} onValueChange={setSelectedPost}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select post" />
            </SelectTrigger>
            <SelectContent>
              {platformPosts.map((post) => (
                <SelectItem key={post.id} value={post.id}>
                  {post.title.length > 30
                    ? post.title.slice(0, 30) + "..."
                    : post.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {s.label}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {s.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${s.color}`}
              >
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* GRAPH */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">
            Views & Likes Over Time
          </h2>
        </div>

        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
          Analytics data not available yet
        </div>
      </Card>

      {/* RECENT CONTENT */}
      <Card className="p-6 bg-card border-border">
        <h2 className="font-semibold mb-4">Recent Content</h2>
        <div className="space-y-3">
          {contentError ? (
            <div className="text-sm text-destructive">
              {contentError}
            </div>
          ) : isLoadingContent ? (
            <div className="text-sm text-muted-foreground">
              Loading content...
            </div>
          ) : recentContent.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No content yet.
            </div>
          ) : (
            recentContent.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Video className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.contentType}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;