import type { ContentItem, ConnectedAccount, Notification, PublishJob, AnalyticsSummary } from "@/types";

export const mockContent: ContentItem[] = [
  { id: "1", user_id: "1", title: "How to Grow on YouTube in 2026", summary: "Tips and strategies for YouTube growth", content_type: "video", status: "published", scheduled_at: null, published_at: "2026-02-01T10:00:00Z", created_at: "2026-01-28T08:00:00Z", thumbnail_url: "" },
  { id: "2", user_id: "1", title: "Instagram Reels Strategy", summary: "Maximizing engagement with Reels", content_type: "video", status: "scheduled", scheduled_at: "2026-02-15T14:00:00Z", published_at: null, created_at: "2026-02-05T09:00:00Z", thumbnail_url: "" },
  { id: "3", user_id: "1", title: "Behind the Scenes Vlog", summary: "A day in my creator life", content_type: "video", status: "draft", scheduled_at: null, published_at: null, created_at: "2026-02-10T12:00:00Z", thumbnail_url: "" },
  { id: "4", user_id: "1", title: "Product Review: Camera Gear", summary: "Best cameras for content creators", content_type: "video", status: "published", scheduled_at: null, published_at: "2026-02-08T16:00:00Z", created_at: "2026-02-06T11:00:00Z", thumbnail_url: "" },
];

export const mockAccounts: ConnectedAccount[] = [
  { id: "1", user_id: "1", platform: "YouTube", account_name: "CreatorChannel", is_active: true },
  { id: "2", user_id: "1", platform: "Instagram", account_name: "@creator_os", is_active: true },
];

export const mockNotifications: Notification[] = [
  { id: "1", user_id: "1", notification_type: "publish_success", title: "Video Published!", message: "Your video 'How to Grow on YouTube' was published successfully.", channel: "in_app", status: "delivered", is_read: false, created_at: "2026-02-11T08:30:00Z" },
  { id: "2", user_id: "1", notification_type: "schedule_reminder", title: "Scheduled Post", message: "Your Reels strategy post is scheduled for Feb 15.", channel: "in_app", status: "delivered", is_read: false, created_at: "2026-02-10T18:00:00Z" },
  { id: "3", user_id: "1", notification_type: "analytics", title: "Milestone Reached", message: "Your channel hit 10K views this week!", channel: "in_app", status: "delivered", is_read: true, created_at: "2026-02-09T12:00:00Z" },
  { id: "4", user_id: "1", notification_type: "publish_failure", title: "Publish Failed", message: "Failed to publish to Instagram. Please reconnect.", channel: "in_app", status: "delivered", is_read: true, created_at: "2026-02-08T09:00:00Z" },
];

export const mockPublishJobs: PublishJob[] = [
  { id: "1", user_id: "1", content_item_id: "1", platform: "YouTube", post_type: "video", status: "published", scheduled_at: null },
  { id: "2", user_id: "1", content_item_id: "2", platform: "Instagram", post_type: "reel", status: "pending", scheduled_at: "2026-02-15T14:00:00Z" },
];

export const mockAnalyticsSummary: AnalyticsSummary[] = [
  { platform: "YouTube", total_views: 45200, total_likes: 3800, total_comments: 420, total_shares: 180, total_posts: 12 },
  { platform: "Instagram", total_views: 28900, total_likes: 5200, total_comments: 310, total_shares: 450, total_posts: 24 },
];

export const mockViewsOverTime = [
  { date: "Mon", youtube: 1200, instagram: 800 },
  { date: "Tue", youtube: 1800, instagram: 1200 },
  { date: "Wed", youtube: 2400, instagram: 1500 },
  { date: "Thu", youtube: 1900, instagram: 2100 },
  { date: "Fri", youtube: 3200, instagram: 1800 },
  { date: "Sat", youtube: 4100, instagram: 2800 },
  { date: "Sun", youtube: 3600, instagram: 2200 },
];

export const mockEngagementByType = [
  { name: "Likes", value: 9000, fill: "hsl(263, 70%, 58%)" },
  { name: "Comments", value: 730, fill: "hsl(195, 75%, 55%)" },
  { name: "Shares", value: 630, fill: "hsl(142, 71%, 45%)" },
  { name: "Saves", value: 420, fill: "hsl(38, 92%, 50%)" },
];
