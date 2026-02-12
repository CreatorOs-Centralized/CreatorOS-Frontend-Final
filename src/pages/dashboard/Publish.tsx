import { useState } from "react";
import { mockContent, mockAccounts, mockPublishJobs } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Youtube, Instagram, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { PublishJob } from "@/types";

const platformIcons: Record<string, any> = { YouTube: Youtube, Instagram: Instagram };

const Publish = () => {
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [jobs, setJobs] = useState<PublishJob[]>(mockPublishJobs);

  const handlePublish = () => {
    if (!selectedContent || !selectedPlatform) return;
    const job: PublishJob = {
      id: Date.now().toString(), user_id: "1", content_item_id: selectedContent,
      platform: selectedPlatform, post_type: "video", status: "pending", scheduled_at: null,
    };
    setJobs([job, ...jobs]);
    setSelectedContent(""); setSelectedPlatform("");
  };

  const statusIcon = (status: string) => {
    if (status === 'published') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-blue-400" />;
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publish</h1>
        <p className="text-muted-foreground text-sm">Share your content to YouTube & Instagram</p>
      </div>

      <Card className="p-6 bg-card border-border space-y-4">
        <h2 className="font-semibold">New Publish</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Select Content</Label>
            <Select value={selectedContent} onValueChange={setSelectedContent}>
              <SelectTrigger><SelectValue placeholder="Choose content" /></SelectTrigger>
              <SelectContent>
                {mockContent.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger><SelectValue placeholder="Choose platform" /></SelectTrigger>
              <SelectContent>
                {mockAccounts.filter(a => a.is_active).map(a => <SelectItem key={a.id} value={a.platform}>{a.platform}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handlePublish} className="gradient-primary border-0" disabled={!selectedContent || !selectedPlatform}>
          <Send className="w-4 h-4 mr-2" /> Publish Now
        </Button>
      </Card>

      <div>
        <h2 className="font-semibold mb-4">Publish History</h2>
        <div className="space-y-3">
          {jobs.map(j => {
            const content = mockContent.find(c => c.id === j.content_item_id);
            const Icon = platformIcons[j.platform] || Send;
            return (
              <Card key={j.id} className="p-4 bg-card border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{content?.title || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{j.platform} • {j.post_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(j.status)}
                  <span className="text-xs text-muted-foreground capitalize">{j.status}</span>
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
