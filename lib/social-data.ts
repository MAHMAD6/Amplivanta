export type Platform = "facebook" | "instagram" | "linkedin" | "x" | "tiktok" | "youtube" | "pinterest" | "threads";

export const PLATFORM_META: Record<Platform, { label: string; color: string; short: string; emoji: string }> = {
  facebook: { label: "Facebook", color: "#1877F2", short: "FB", emoji: "📘" },
  instagram: { label: "Instagram", color: "#E1306C", short: "IG", emoji: "📷" },
  linkedin: { label: "LinkedIn", color: "#0A66C2", short: "IN", emoji: "💼" },
  x: { label: "X (Twitter)", color: "#000000", short: "X", emoji: "𝕏" },
  tiktok: { label: "TikTok", color: "#000000", short: "TT", emoji: "🎵" },
  youtube: { label: "YouTube", color: "#FF0000", short: "YT", emoji: "▶️" },
  pinterest: { label: "Pinterest", color: "#E60023", short: "PN", emoji: "📌" },
  threads: { label: "Threads", color: "#000000", short: "TH", emoji: "🧵" },
};

export type PostStatus = "Published" | "Scheduled" | "Draft" | "Pending Approval" | "Failed";

export const STATUS_TONE: Record<PostStatus, "green" | "blue" | "gray" | "amber" | "red"> = {
  Published: "green",
  Scheduled: "blue",
  Draft: "gray",
  "Pending Approval": "amber",
  Failed: "red",
};

export interface SocialPost {
  id: string;
  content: string;
  platform: Platform;
  status: PostStatus;
  scheduledFor?: string;
  publishedAt?: string;
  author: string;
  mediaType?: "image" | "video" | "carousel" | "text";
  engagement?: { likes: number; comments: number; shares: number; reach: number };
  campaign?: string;
}

export const POSTS: SocialPost[] = [
  { id: "p1", content: "New product launch this week! Stay tuned! 🚀", platform: "instagram", status: "Published", publishedAt: "2h ago", author: "Sarah Johnson", mediaType: "image", engagement: { likes: 1240, comments: 84, shares: 42, reach: 24800 }, campaign: "Spring Launch" },
  { id: "p2", content: "Marketing trends to watch in 2026", platform: "facebook", status: "Published", publishedAt: "4h ago", author: "Emily Davis", mediaType: "carousel", engagement: { likes: 892, comments: 46, shares: 128, reach: 18400 } },
  { id: "p3", content: "Case study: How we increased ROI by 200%", platform: "linkedin", status: "Published", publishedAt: "6h ago", author: "Martin Anderson", mediaType: "image", engagement: { likes: 476, comments: 32, shares: 92, reach: 12800 } },
  { id: "p4", content: "Quick tip: Focus on value, not selling.", platform: "x", status: "Scheduled", scheduledFor: "Tomorrow, 8h ago", author: "Sarah Johnson", mediaType: "text" },
  { id: "p5", content: "3 ways to grow your brand on social media", platform: "tiktok", status: "Pending Approval", scheduledFor: "Aug 15, 2:30 PM", author: "Emily Davis", mediaType: "video" },
  { id: "p6", content: "Monday Motivation 💪", platform: "instagram", status: "Scheduled", scheduledFor: "Mon, 2:00 AM", author: "Sarah Johnson", mediaType: "image", campaign: "Always-On" },
  { id: "p7", content: "Quick marketing tip 💡", platform: "x", status: "Scheduled", scheduledFor: "Tue, 2:15 AM", author: "Emily Davis", mediaType: "text" },
  { id: "p8", content: "Case study: Real results", platform: "linkedin", status: "Scheduled", scheduledFor: "Tue, 2:30 AM", author: "Martin Anderson", mediaType: "image" },
  { id: "p9", content: "Client success story ⭐", platform: "instagram", status: "Scheduled", scheduledFor: "Wed, 6:00 AM", author: "Sarah Johnson", mediaType: "carousel" },
  { id: "p10", content: "Industry news update", platform: "tiktok", status: "Scheduled", scheduledFor: "Wed, 6:30 AM", author: "Emily Davis", mediaType: "video" },
  { id: "p11", content: "New video: Growth Hacking", platform: "youtube", status: "Scheduled", scheduledFor: "Wed, 6:00 AM", author: "Martin Anderson", mediaType: "video" },
  { id: "p12", content: "Behind the scenes at Amplivanta", platform: "instagram", status: "Draft", author: "Sarah Johnson", mediaType: "image" },
  { id: "p13", content: "How-to guide: setting up your first workflow", platform: "linkedin", status: "Draft", author: "Emily Davis", mediaType: "carousel" },
  { id: "p14", content: "Failed to publish — API rate limit", platform: "x", status: "Failed", scheduledFor: "1h ago", author: "Sarah Johnson", mediaType: "text" },
];

export interface SocialAccount {
  id: string;
  platform: Platform;
  handle: string;
  followers: number;
  followersDelta: number;
  engagement: number;
  engagementDelta: number;
  impressions: number;
  impressionsDelta: number;
  status: "Healthy" | "Warning" | "Expired";
  addedDate: string;
  type: "Page" | "Profile" | "Business";
}

export const ACCOUNTS: SocialAccount[] = [
  { id: "a1", platform: "facebook", handle: "@amplivanta", followers: 12452, followersDelta: 12, engagement: 3.2, engagementDelta: 18, impressions: 45200, impressionsDelta: 20, status: "Healthy", addedDate: "Jan 12, 2025", type: "Page" },
  { id: "a2", platform: "instagram", handle: "@amplivanta", followers: 24891, followersDelta: 15, engagement: 4.6, engagementDelta: 22, impressions: 68700, impressionsDelta: 25, status: "Healthy", addedDate: "Jan 12, 2025", type: "Business" },
  { id: "a3", platform: "linkedin", handle: "Amplivanta Inc.", followers: 8302, followersDelta: 10, engagement: 2.9, engagementDelta: 14, impressions: 16300, impressionsDelta: 18, status: "Healthy", addedDate: "Feb 3, 2025", type: "Page" },
  { id: "a4", platform: "x", handle: "@amplivanta", followers: 6245, followersDelta: 8, engagement: 1.8, engagementDelta: 12, impressions: 9800, impressionsDelta: 10, status: "Warning", addedDate: "Feb 3, 2025", type: "Profile" },
  { id: "a5", platform: "tiktok", handle: "@amplivanta", followers: 18763, followersDelta: 20, engagement: 6.2, engagementDelta: 30, impressions: 24100, impressionsDelta: 28, status: "Healthy", addedDate: "Mar 22, 2025", type: "Business" },
  { id: "a6", platform: "youtube", handle: "Amplivanta", followers: 3951, followersDelta: 9, engagement: 3.1, engagementDelta: 16, impressions: 7900, impressionsDelta: 15, status: "Expired", addedDate: "Apr 5, 2025", type: "Business" },
];

export interface Approval {
  id: string;
  postId: string;
  content: string;
  platform: Platform;
  submitter: string;
  reviewer: string;
  submittedAt: string;
  dueBy: string;
  status: "Pending" | "Approved" | "Changes Requested" | "Rejected";
  priority: "High" | "Medium" | "Low";
}

export const APPROVALS: Approval[] = [
  { id: "ap1", postId: "p5", content: "3 ways to grow your brand on social media", platform: "tiktok", submitter: "Emily Davis", reviewer: "Sarah Chen", submittedAt: "2h ago", dueBy: "Today, 4pm", status: "Pending", priority: "High" },
  { id: "ap2", postId: "p12", content: "Behind the scenes at Amplivanta", platform: "instagram", submitter: "Sarah Johnson", reviewer: "Alex Johnson", submittedAt: "4h ago", dueBy: "Tomorrow", status: "Pending", priority: "Medium" },
  { id: "ap3", postId: "p13", content: "How-to guide: setting up your first workflow", platform: "linkedin", submitter: "Emily Davis", reviewer: "Alex Johnson", submittedAt: "6h ago", dueBy: "Aug 15", status: "Pending", priority: "Low" },
  { id: "ap4", postId: "p2", content: "Marketing trends to watch in 2026", platform: "facebook", submitter: "Emily Davis", reviewer: "Sarah Chen", submittedAt: "1d ago", dueBy: "—", status: "Approved", priority: "Medium" },
  { id: "ap5", postId: "p3", content: "Case study: How we increased ROI by 200%", platform: "linkedin", submitter: "Martin Anderson", reviewer: "Alex Johnson", submittedAt: "1d ago", dueBy: "—", status: "Approved", priority: "Medium" },
  { id: "ap6", postId: "px1", content: "Meme post — team joke", platform: "x", submitter: "Sarah Johnson", reviewer: "Alex Johnson", submittedAt: "2d ago", dueBy: "—", status: "Changes Requested", priority: "Low" },
  { id: "ap7", postId: "px2", content: "Competitor comparison chart", platform: "linkedin", submitter: "Emily Davis", reviewer: "Sarah Chen", submittedAt: "3d ago", dueBy: "—", status: "Rejected", priority: "High" },
];

export interface QueueItem {
  id: string;
  postId: string;
  content: string;
  platform: Platform;
  scheduledFor: string;
  status: "Queued" | "Publishing" | "Retrying" | "Failed" | "Paused";
  attempts: number;
  campaign?: string;
}

export const QUEUE: QueueItem[] = [
  { id: "q1", postId: "p6", content: "Monday Motivation 💪", platform: "instagram", scheduledFor: "Mon 2:00 AM", status: "Queued", attempts: 0, campaign: "Always-On" },
  { id: "q2", postId: "p7", content: "Quick marketing tip 💡", platform: "x", scheduledFor: "Tue 2:15 AM", status: "Queued", attempts: 0 },
  { id: "q3", postId: "p8", content: "Case study: Real results", platform: "linkedin", scheduledFor: "Tue 2:30 AM", status: "Queued", attempts: 0 },
  { id: "q4", postId: "p9", content: "Client success story ⭐", platform: "instagram", scheduledFor: "Wed 6:00 AM", status: "Queued", attempts: 0 },
  { id: "q5", postId: "p14", content: "Failed to publish — API rate limit", platform: "x", scheduledFor: "1h ago", status: "Failed", attempts: 3 },
  { id: "q6", postId: "p11", content: "New video: Growth Hacking", platform: "youtube", scheduledFor: "Wed 6:00 AM", status: "Queued", attempts: 0 },
  { id: "q7", postId: "pQ7", content: "Product tip #24", platform: "instagram", scheduledFor: "Publishing now…", status: "Publishing", attempts: 1 },
];

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Reviewer" | "Viewer";
  accounts: number;
  lastActive: string;
  status: "Active" | "Invited";
}

export const TEAM: TeamMember[] = [
  { id: "u1", name: "Alex Johnson", email: "alex@amplivanta.com", role: "Owner", accounts: 6, lastActive: "Now", status: "Active" },
  { id: "u2", name: "Sarah Chen", email: "sarah.chen@amplivanta.com", role: "Admin", accounts: 6, lastActive: "12 min ago", status: "Active" },
  { id: "u3", name: "Sarah Johnson", email: "sarah.j@amplivanta.com", role: "Editor", accounts: 4, lastActive: "1 h ago", status: "Active" },
  { id: "u4", name: "Emily Davis", email: "emily@amplivanta.com", role: "Editor", accounts: 4, lastActive: "3 h ago", status: "Active" },
  { id: "u5", name: "Martin Anderson", email: "martin@amplivanta.com", role: "Reviewer", accounts: 6, lastActive: "Yesterday", status: "Active" },
  { id: "u6", name: "Priya Ramesh", email: "priya@amplivanta.com", role: "Viewer", accounts: 6, lastActive: "3d ago", status: "Active" },
  { id: "u7", name: "Marcus Lee", email: "marcus@amplivanta.com", role: "Editor", accounts: 0, lastActive: "—", status: "Invited" },
];

export const TEAMMEMBER = TEAM;

export interface HashtagSet {
  id: string;
  name: string;
  hashtags: string[];
  platforms: Platform[];
  usageCount: number;
  updatedAt: string;
}

export const HASHTAG_SETS: HashtagSet[] = [
  { id: "h1", name: "SaaS Growth", hashtags: ["#SaaS", "#GrowthMarketing", "#MarketingAutomation", "#AITools", "#B2B", "#RevOps"], platforms: ["linkedin", "x"], usageCount: 128, updatedAt: "3 days ago" },
  { id: "h2", name: "Product Launch", hashtags: ["#ProductLaunch", "#NewProduct", "#Innovation", "#TechLaunch", "#StartupLife"], platforms: ["instagram", "linkedin", "facebook"], usageCount: 84, updatedAt: "1 week ago" },
  { id: "h3", name: "Weekly Tips", hashtags: ["#MarketingTips", "#GrowthHacks", "#TipTuesday", "#DigitalMarketing"], platforms: ["instagram", "x", "linkedin"], usageCount: 42, updatedAt: "2 weeks ago" },
  { id: "h4", name: "Client Wins", hashtags: ["#ClientSuccess", "#CaseStudy", "#Testimonial", "#Results"], platforms: ["linkedin", "instagram"], usageCount: 36, updatedAt: "1 month ago" },
  { id: "h5", name: "Behind the Scenes", hashtags: ["#BehindTheScenes", "#TeamCulture", "#StartupLife", "#TeamAmplivanta"], platforms: ["instagram", "tiktok"], usageCount: 22, updatedAt: "1 month ago" },
];

export interface SocialTemplate {
  id: string;
  name: string;
  category: string;
  platforms: Platform[];
  preview: string;
  uses: number;
}

export const TEMPLATES: SocialTemplate[] = [
  { id: "st1", name: "Product Launch — Countdown", category: "Product", platforms: ["instagram", "facebook", "x"], preview: "🚀 X days until launch!\n\n{feature_1}\n{feature_2}\n\nSign up: {url}", uses: 42 },
  { id: "st2", name: "Case Study — Results Reveal", category: "Case Study", platforms: ["linkedin"], preview: "How {client} grew {metric} by {value} in {timeframe}.\n\nHere's what worked:", uses: 28 },
  { id: "st3", name: "Weekly Tip", category: "Tips", platforms: ["x", "linkedin"], preview: "💡 {tip_title}\n\n{explanation}\n\n#TipTuesday", uses: 84 },
  { id: "st4", name: "Behind the Scenes", category: "Culture", platforms: ["instagram", "tiktok"], preview: "Meet {team_member} — {role} at Amplivanta.\n\n{fun_fact}", uses: 18 },
  { id: "st5", name: "User-Generated Post", category: "UGC", platforms: ["instagram", "facebook"], preview: "Loved this shoutout from {customer}! 💜\n\n{their_quote}", uses: 12 },
  { id: "st6", name: "Poll — Community Q", category: "Engagement", platforms: ["x", "linkedin"], preview: "Quick poll for {audience}:\n\n{question}\n\nA) {option_1}\nB) {option_2}", uses: 24 },
];

export const ACTIVITY_LOG: {
  id: string;
  actor: string;
  action: string;
  object: string;
  when: string;
  category: "post" | "account" | "approval" | "settings";
}[] = [
  { id: "log1", actor: "Sarah Johnson", action: "published", object: "Monday Motivation on Instagram", when: "2 min ago", category: "post" },
  { id: "log2", actor: "Sarah Chen", action: "approved", object: "Case study post on LinkedIn", when: "18 min ago", category: "approval" },
  { id: "log3", actor: "Emily Davis", action: "scheduled", object: "3 posts for tomorrow", when: "42 min ago", category: "post" },
  { id: "log4", actor: "Alex Johnson", action: "connected", object: "Threads account @amplivanta", when: "1 h ago", category: "account" },
  { id: "log5", actor: "Sarah Chen", action: "updated", object: "publishing default timezone to PST", when: "3 h ago", category: "settings" },
  { id: "log6", actor: "Sarah Johnson", action: "requested changes on", object: "Meme post for X", when: "5 h ago", category: "approval" },
  { id: "log7", actor: "Martin Anderson", action: "created", object: "Case Study template", when: "Yesterday", category: "post" },
  { id: "log8", actor: "Alex Johnson", action: "reconnected", object: "Facebook account (token refreshed)", when: "Yesterday", category: "account" },
];

export const INTEGRATIONS = [
  { name: "Facebook", category: "Social", status: "Connected", scopes: 4, lastSync: "2 min ago", logo: "📘" },
  { name: "Instagram", category: "Social", status: "Connected", scopes: 5, lastSync: "5 min ago", logo: "📷" },
  { name: "LinkedIn", category: "Social", status: "Connected", scopes: 4, lastSync: "8 min ago", logo: "💼" },
  { name: "X (Twitter)", category: "Social", status: "Warning", scopes: 3, lastSync: "3 h ago", logo: "𝕏" },
  { name: "TikTok", category: "Social", status: "Connected", scopes: 4, lastSync: "12 min ago", logo: "🎵" },
  { name: "YouTube", category: "Social", status: "Expired", scopes: 5, lastSync: "3 days ago", logo: "▶️" },
  { name: "Google Drive", category: "Storage", status: "Connected", scopes: 2, lastSync: "1 h ago", logo: "💾" },
  { name: "Dropbox", category: "Storage", status: "Available", scopes: 0, lastSync: "—", logo: "📦" },
  { name: "Canva", category: "Design", status: "Connected", scopes: 3, lastSync: "2 h ago", logo: "🎨" },
  { name: "Figma", category: "Design", status: "Available", scopes: 0, lastSync: "—", logo: "🖼️" },
  { name: "Slack", category: "Notifications", status: "Connected", scopes: 2, lastSync: "5 min ago", logo: "💬" },
  { name: "Microsoft Teams", category: "Notifications", status: "Available", scopes: 0, lastSync: "—", logo: "🟦" },
];
