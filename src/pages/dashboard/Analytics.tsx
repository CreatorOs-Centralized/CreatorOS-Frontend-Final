import { mockAnalyticsSummary, mockViewsOverTime, mockEngagementByType } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { TrendingUp, Eye, Heart, MessageSquare, Share2 } from "lucide-react";

const Analytics = () => {
  const platformData = mockAnalyticsSummary.map(p => ({
    name: p.platform,
    views: p.total_views,
    likes: p.total_likes,
    comments: p.total_comments,
    shares: p.total_shares,
  }));

  const tooltipStyle = { backgroundColor: "hsl(240, 6%, 6%)", border: "1px solid hsl(240, 4%, 16%)", borderRadius: "8px", color: "hsl(0, 0%, 95%)" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your content performance across platforms</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: "74.1K", icon: Eye, color: "text-primary" },
          { label: "Total Likes", value: "9K", icon: Heart, color: "text-pink-500" },
          { label: "Comments", value: "730", icon: MessageSquare, color: "text-blue-400" },
          { label: "Shares", value: "630", icon: Share2, color: "text-green-400" },
        ].map(s => (
          <Card key={s.label} className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Views Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockViewsOverTime}>
                <defs>
                  <linearGradient id="ayt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(340, 75%, 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(340, 75%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(240, 5%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(240, 5%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="youtube" stroke="hsl(263, 70%, 58%)" fill="url(#ayt)" strokeWidth={2} />
                <Area type="monotone" dataKey="instagram" stroke="hsl(340, 75%, 55%)" fill="url(#aig)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="font-semibold mb-4">Engagement Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mockEngagementByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} strokeWidth={0}>
                  {mockEngagementByType.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border lg:col-span-2">
          <h2 className="font-semibold mb-4">Platform Comparison</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData}>
                <XAxis dataKey="name" stroke="hsl(240, 5%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(240, 5%, 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="views" fill="hsl(263, 70%, 58%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="likes" fill="hsl(340, 75%, 55%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" fill="hsl(195, 75%, 55%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shares" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
