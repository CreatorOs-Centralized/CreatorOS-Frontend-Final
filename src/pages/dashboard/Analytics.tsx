import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  analyticsApi,
  type DashboardPostItem,
  type DashboardSummaryResponse,
  type DashboardTrendItem,
  type PlatformComparisonItem,
} from "@/lib/api";

const PLATFORMS = ["youtube", "instagram", "linkedin"] as const;

const Analytics = () => {
  const { user } = useAuth();

  const [availablePosts, setAvailablePosts] = useState<DashboardPostItem[]>([]);
  const [summary, setSummary] = useState<DashboardSummaryResponse>({
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
  });
  const [trendData, setTrendData] = useState<DashboardTrendItem[]>([]);
  const [platformComparison, setPlatformComparison] = useState<PlatformComparisonItem[]>([]);

  const [selectedPlatform, setSelectedPlatform] =
    useState<(typeof PLATFORMS)[number]>("youtube");
  const [selectedPost, setSelectedPost] = useState<string>("all");

  /* ---------------- LOAD POSTS ---------------- */
  useEffect(() => {
    if (!user?.id) return;
    const loadPosts = async () => {
      try {
        const posts = await analyticsApi.getDashboardPosts({
          userId: user.id,
          platform: selectedPlatform,
        });
        setAvailablePosts(posts);
      } catch (err) {
        console.error("Failed to load posts", err);
      }
    };
    loadPosts();
  }, [user?.id, selectedPlatform]);

  useEffect(() => {
    setSelectedPost("all");
  }, [selectedPlatform]);

  /* ---------------- LOAD ANALYTICS ---------------- */
  useEffect(() => {
    if (!user?.id) return;
    const loadAnalytics = async () => {
      try {
        const [summaryRes, trendRes, comparisonRes] = await Promise.all([
          analyticsApi.getDashboardSummary({
            userId: user.id,
            platform: selectedPlatform,
            postId: selectedPost !== "all" ? selectedPost : undefined,
          }),
          analyticsApi.getDashboardTrend({
            userId: user.id,
            platform: selectedPlatform,
            postId: selectedPost !== "all" ? selectedPost : undefined,
          }),
          analyticsApi.getPlatformComparison({
            userId: user.id,
          }),
        ]);

        setSummary(summaryRes);
        setTrendData(trendRes);
        setPlatformComparison(comparisonRes);
      } catch (err) {
        console.error("Failed to load analytics", err);
      }
    };
    loadAnalytics();
  }, [user?.id, selectedPlatform, selectedPost]);

  const tooltipStyle = {
    backgroundColor: "hsl(240, 6%, 6%)",
    border: "1px solid hsl(240, 4%, 16%)",
    borderRadius: "8px",
    color: "hsl(0, 0%, 95%)",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Track your content performance
        </p>
      </div>

      {/* FILTERS */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />

          <Select
            value={selectedPlatform}
            onValueChange={(v) => setSelectedPlatform(v as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPost} onValueChange={setSelectedPost}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Post" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              {availablePosts.map((p) => (
                <SelectItem key={p.postId} value={p.postId}>
                  {p.title.length > 35 ? p.title.slice(0, 35) + "..." : p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Views", value: summary.views, icon: Eye },
          { label: "Likes", value: summary.likes, icon: Heart },
          { label: "Comments", value: summary.comments, icon: MessageSquare },
          { label: "Shares", value: summary.shares, icon: Share2 },
        ].map((s) => (
          <Card key={s.label} className="p-4 bg-card border-border">
            <s.icon className="w-4 h-4 mb-1" />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* VIEWS TREND */}
      <Card className="p-6 bg-card border-border">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Views Trend
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                dataKey="views"
                stroke="hsl(263,70%,58%)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* PLATFORM COMPARISON */}
      <Card className="p-6 bg-card border-border">
        <h2 className="font-semibold mb-4">Platform Comparison</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformComparison}>
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="views" fill="hsl(263,70%,58%)" />
              <Bar dataKey="likes" fill="hsl(340,75%,55%)" />
              <Bar dataKey="comments" fill="hsl(195,75%,55%)" />
              <Bar dataKey="shares" fill="hsl(142,71%,45%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;