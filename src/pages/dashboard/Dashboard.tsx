import { useEffect, useState } from "react";
import { mockAnalyticsSummary, mockViewsOverTime } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { BarChart3, Eye, Heart, MessageSquare, Video, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { contentApi, type ContentResponseDto } from "@/lib/api";

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [recentContent, setRecentContent] = useState<ContentResponseDto[]>([]);
  const [contentError, setContentError] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const totalViews = mockAnalyticsSummary.reduce((a, b) => a + b.total_views, 0);
  const totalLikes = mockAnalyticsSummary.reduce((a, b) => a + b.total_likes, 0);
  const totalComments = mockAnalyticsSummary.reduce((a, b) => a + b.total_comments, 0);
  const totalPosts = mockAnalyticsSummary.reduce((a, b) => a + b.total_posts, 0);

  useEffect(() => {
    let isMounted = true;
    const loadRecent = async () => {
      setIsLoadingContent(true);
      setContentError(null);
      try {
        const items = await contentApi.getMyContents();
        if (isMounted) setRecentContent(items.slice(0, 4));
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load recent content.";
        setContentError(message);
      } finally {
        if (isMounted) setIsLoadingContent(false);
      }
    };

    loadRecent();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-primary" },
    { label: "Total Likes", value: totalLikes.toLocaleString(), icon: Heart, color: "text-pink-500" },
    { label: "Comments", value: totalComments.toLocaleString(), icon: MessageSquare, color: "text-blue-400" },
    { label: "Total Posts", value: totalPosts.toString(), icon: Video, color: "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {profile?.display_name || user?.email?.split("@")[0] || "Creator"} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your content performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Views Over Time</h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockViewsOverTime}>
              <defs>
                <linearGradient id="yt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(340, 75%, 55%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(340, 75%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="hsl(240, 5%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(240, 5%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(240, 6%, 6%)", border: "1px solid hsl(240, 4%, 16%)", borderRadius: "8px", color: "hsl(0, 0%, 95%)" }} />
              <Area type="monotone" dataKey="youtube" stroke="hsl(263, 70%, 58%)" fill="url(#yt)" strokeWidth={2} />
              <Area type="monotone" dataKey="instagram" stroke="hsl(340, 75%, 55%)" fill="url(#ig)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-primary" /> YouTube</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-pink-500" /> Instagram</span>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <h2 className="font-semibold mb-4">Recent Content</h2>
        <div className="space-y-3">
          {contentError ? (
            <div className="text-sm text-destructive">{contentError}</div>
          ) : isLoadingContent ? (
            <div className="text-sm text-muted-foreground">Loading content...</div>
          ) : recentContent.length === 0 ? (
            <div className="text-sm text-muted-foreground">No content yet.</div>
          ) : recentContent.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Video className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.contentType}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${c.workflowState === 'PUBLISHED' ? 'bg-green-500/10 text-green-400' : c.workflowState === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-400' : c.workflowState === 'REVIEW' ? 'bg-amber-500/10 text-amber-400' : 'bg-secondary text-muted-foreground'}`}>
                {c.workflowState.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
