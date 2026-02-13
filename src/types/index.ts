export interface User {
  id: string;
  email: string | null;
  username?: string | null;
  roles?: string[];
  is_email_verified: boolean;
  is_active: boolean;
  created_at: string;

  // Frontend-only state
  isProfileComplete?: boolean;
  profileData?: CreatorProfile;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  fullName?: string;
  bio: string;
  niche: string;
  profile_photo_url: string;
  cover_photo_url?: string;
  location: string;
  language: string;
  dateOfBirth?: string;
  instagramToken?: string;
  youtubeToken?: string;

  is_public?: boolean;
  is_verified?: boolean;
}

export interface SocialLink {
  id: string;
  creator_profile_id: string;
  platform: string;
  handle: string;
  url: string;
  is_verified: boolean;
}

export interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  content_type: string;
  status: "draft" | "scheduled" | "published" | "archived";
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  thumbnail_url?: string;

  // Frontend-only fields used for local previews
  video_url?: string;
  video_name?: string;
  video_size?: number;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: string;
  account_name: string;
  is_active: boolean;
}

export interface PublishJob {
  id: string;
  user_id: string;
  content_item_id: string;
  platform: string;
  post_type: string;
  status: "pending" | "publishing" | "published" | "failed";
  scheduled_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  is_read: boolean;
  created_at: string;
}

export interface PostMetrics {
  id: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  reach: number;
}

export interface AnalyticsSummary {
  platform: string;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_posts: number;
}
