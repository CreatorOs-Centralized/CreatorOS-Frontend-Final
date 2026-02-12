import { useState } from "react";
import { mockContent } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Video, Search, Filter, X } from "lucide-react";
import type { ContentItem } from "@/types";

const Content = () => {
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newType, setNewType] = useState("video");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const filtered = content.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleFile(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
  };

  const handleUpload = () => {
    if (!videoFile) {
      alert("Please select a video file");
      return;
    }

    const item: ContentItem = {
      id: Date.now().toString(), 
      user_id: "1", 
      title: newTitle, 
      summary: newSummary,
      content_type: newType, 
      status: "draft", 
      scheduled_at: null, 
      published_at: null,
      created_at: new Date().toISOString(),
      video_url: videoPreview, // Store video preview URL
      video_name: videoFile.name,
      video_size: videoFile.size,
    };
    
    setContent([item, ...content]);
    setNewTitle(""); 
    setNewSummary(""); 
    setNewType("video");
    removeVideo();
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-muted-foreground text-sm">Manage and upload your videos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0"><Plus className="w-4 h-4 mr-2" /> Upload Content</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {/* File Upload Area */}
              {!videoFile ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center space-y-3 transition-colors cursor-pointer ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('video-upload')?.click()}
                >
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium">
                      {isDragging ? 'Drop your video here' : 'Drag & drop your video or click to browse'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, AVI up to 2GB
                    </p>
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-border rounded-xl p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Video className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{videoFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={removeVideo}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {videoPreview && (
                    <div className="mt-3">
                      <video 
                        src={videoPreview} 
                        className="w-full max-h-32 rounded-lg object-cover"
                        controls
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="Video title" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe your content" 
                  value={newSummary} 
                  onChange={e => setNewSummary(e.target.value)} 
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="reel">Reel</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleUpload} 
                className="w-full gradient-primary border-0" 
                disabled={!newTitle || !videoFile}
              >
                {videoFile ? 'Upload Content' : 'Select a video first'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search content..." 
            className="pl-9" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filtered.map(c => (
          <Card key={c.id} className="p-4 bg-card border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center relative group">
                {c.video_url ? (
                  <video 
                    src={c.video_url} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Video className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">{c.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{c.content_type}</span>
                  {c.video_name && (
                    <>
                      <span>•</span>
                      <span>{c.video_name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              c.status === 'published' 
                ? 'bg-green-500/10 text-green-400' 
                : c.status === 'scheduled' 
                  ? 'bg-blue-500/10 text-blue-400' 
                  : 'bg-secondary text-muted-foreground'
            }`}>
              {c.status}
            </span>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No content found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;