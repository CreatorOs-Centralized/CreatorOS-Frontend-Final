import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
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
import { contentApi, type ContentResponseDto } from "@/lib/api";

const PLATFORMS = ["youtube", "instagram", "linkedin"] as const;

type AnalyticsItem = {
  postId: string;
  platform: (typeof PLATFORMS)[number];
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
};

const Analytics = () => {
  const [posts, setPosts] = useState<ContentResponseDto[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);

  const [selectedPlatform, setSelectedPlatform] =
    useState<(typeof PLATFORMS)[number]>("youtube");
  const [selectedPost, setSelectedPost] = useState<string>("");

  /* ---------------- LOAD POSTS ---------------- */
  useEffect(() => {
    const load = async () => {
      const data = await contentApi.getMyContents();
      setPosts(data.filter((p) => p.workflowState === "PUBLISHED"));
    };
    load();
  }, []);

  /* ---------------- FILTER POSTS BY PLATFORM ---------------- */
  const platformPosts = useMemo(() => {
    return posts.filter(
      (p) => p.platform?.toLowerCase() === selectedPlatform
    );
  }, [posts, selectedPlatform]);

  useEffect(() => {
    setSelectedPost("");
  }, [selectedPlatform]);

  /* ---------------- FILTER ANALYTICS ---------------- */
  const filteredAnalytics = useMemo(() => {
    let data = analytics.filter(
      (a) => a.platform === selectedPlatform
    );
    if (selectedPost) {
      data = data.filter((a) => a.postId === selectedPost);
    }
    return data;
  }, [analytics, selectedPlatform, selectedPost]);

  /* ---------------- TOTALS ---------------- */
  const totals = useMemo(() => {
    return {
      views: filteredAnalytics.reduce((s, i) => s + i.views, 0),
      likes: filteredAnalytics.reduce((s, i) => s + i.likes, 0),
      comments: filteredAnalytics.reduce((s, i) => s + i.comments, 0),
      shares: filteredAnalytics.reduce((s, i) => s + i.shares, 0),
    };
  }, [filteredAnalytics]);

  /* ---------------- VIEWS TREND ---------------- */
  const viewsTrendData = useMemo(() => {
    return filteredAnalytics.map((a) => ({
      date: a.date,
      views: a.views,
    }));
  }, [filteredAnalytics]);

  /* ---------------- PLATFORM COMPARISON ---------------- */
  const platformComparison = useMemo(() => {
    return PLATFORMS.map((platform) => {
      const data = analytics.filter((a) => a.platform === platform);
      return {
        name: platform,
        views: data.reduce((s, i) => s + i.views, 0),
        likes: data.reduce((s, i) => s + i.likes, 0),
        comments: data.reduce((s, i) => s + i.comments, 0),
        shares: data.reduce((s, i) => s + i.shares, 0),
      };
    });
  }, [analytics]);

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

          <Select value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as any)}>
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
              {platformPosts.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title.length > 35
                    ? p.title.slice(0, 35) + "..."
                    : p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Views", value: totals.views, icon: Eye },
          { label: "Likes", value: totals.likes, icon: Heart },
          { label: "Comments", value: totals.comments, icon: MessageSquare },
          { label: "Shares", value: totals.shares, icon: Share2 },
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
            <AreaChart data={viewsTrendData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="views" stroke="hsl(263,70%,58%)" fillOpacity={0.3} />
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
              <XAxis dataKey="name" />
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