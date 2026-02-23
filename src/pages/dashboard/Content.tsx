import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Video, Search, Filter, X } from "lucide-react";
import { contentApi, assetApi, type ContentResponseDto, type ContentType } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type ContentListItem = ContentResponseDto & {
  localVideoUrl?: string;
  localVideoName?: string;
  localVideoSize?: number;
  mediaId?: string;
};

const Content = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentListItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newType, setNewType] = useState<ContentType>("VIDEO");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [defaultFolderId, setDefaultFolderId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadContents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await contentApi.getMyContents();
        if (isMounted) setContent(items);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load content.";
        setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadContents();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load or create default folder for uploads
  useEffect(() => {
    const ensureDefaultFolder = async () => {
      if (!user?.id) return;
      try {
        const folders = await assetApi.getRootFolders();
        let folder = folders.find(f => f.name === "Content Uploads");
        if (!folder) {
          folder = await assetApi.createFolder({
            name: "Content Uploads",
            description: "Default folder for content uploads",
          });
        }
        setDefaultFolderId(folder.id);
      } catch (err) {
        console.error("Failed to ensure default folder:", err);
      }
    };
    ensureDefaultFolder();
  }, [user?.id]);

  const filtered = useMemo(() => {
    return content.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
      const status = c.workflowState.toLowerCase();
      const matchStatus = filterStatus === "all" || status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [content, search, filterStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Validate file size (50MB limit)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 50MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Please upload a smaller file or contact support to increase the limit.`);
      return;
    }

    setError(null);
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

  const handleUpload = async () => {
    if (!newTitle.trim()) {
      setError("Please add a title before creating content.");
      return;
    }

    if (!user?.id) {
      setError("User not authenticated.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress("");

    try {
      let uploadedMediaId: string | undefined;

      // Upload video file to asset service if present
      if (videoFile && defaultFolderId) {
        setUploadProgress("Uploading video...");
        const uploadedFile = await assetApi.uploadFile({
          file: videoFile,
          folderId: defaultFolderId,
        });
        uploadedMediaId = uploadedFile.id;
      }

      setUploadProgress("Creating content...");
      const created = await contentApi.createContent({
        title: newTitle,
        contentType: newType,
      });

      // Store mediaId in localStorage for later use in publishing
      if (uploadedMediaId) {
        localStorage.setItem(`content:${created.id}:mediaId`, uploadedMediaId);
      }

      const item: ContentListItem = {
        ...created,
        localVideoUrl: videoPreview || undefined,
        localVideoName: videoFile?.name,
        localVideoSize: videoFile?.size,
        mediaId: uploadedMediaId,
      };

      setContent((prev) => [item, ...prev]);
      setNewTitle("");
      setNewSummary("");
      setNewType("VIDEO");
      removeVideo();
      setDialogOpen(false);
      setUploadProgress("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create content.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
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
                <Select value={newType} onValueChange={(value) => setNewType(value as ContentType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="SHORT_FORM">Short</SelectItem>
                      <SelectItem value="BLOG_POST">Blog Post</SelectItem>
                      <SelectItem value="PODCAST">Podcast</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleUpload} 
                className="w-full gradient-primary border-0" 
                  disabled={!newTitle || isUploading}
              >
                  {isUploading ? (uploadProgress || "Creating...") : "Create Content"}
              </Button>
              
              {uploadProgress && (
                <p className="text-xs text-center text-muted-foreground">{uploadProgress}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

        {error && (
          <Card className="p-3 bg-destructive/10 border-destructive/20 text-destructive text-sm">
            {error}
          </Card>
        )}

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
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <Card className="p-4 bg-card border-border text-sm text-muted-foreground">
            Loading content...
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-4 bg-card border-border text-sm text-muted-foreground">
            No content yet. Create your first entry above.
          </Card>
        ) : (
          filtered.map((c) => (
            <Card key={c.id} className="p-4 bg-card border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center relative group">
                  {c.localVideoUrl ? (
                    <video
                      src={c.localVideoUrl}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Video className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{c.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{c.contentType}</span>
                    {c.localVideoName && (
                      <>
                        <span>•</span>
                        <span>{c.localVideoName}</span>
                      </>
                    )}
                    {c.createdAt && (
                      <>
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${
                  c.workflowState === "PUBLISHED"
                    ? "bg-green-500/10 text-green-400"
                    : c.workflowState === "SCHEDULED"
                      ? "bg-blue-500/10 text-blue-400"
                      : c.workflowState === "REVIEW"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-secondary text-muted-foreground"
                }`}
              >
                {c.workflowState.toLowerCase()}
              </span>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Content;