// Mock data for the SocialEarn micro-task earning app (inspiration screens),
// styled to the Amplivanta design system.

export type Platform =
  | "youtube"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "whatsapp"
  | "telegram";

export type TaskStatus = "completed" | "pending" | "declined";
export type OrderStatus = "active" | "completed" | "cancelled" | "failed";

export interface Task {
  id: string;
  platform: Platform;
  title: string;
  action: string;
  earn: number;
  timeEstimate: string;
}

export interface MyTask {
  id: string;
  platform: Platform;
  title: string;
  reward: number;
  date: string;
  status: TaskStatus;
}

export interface Activity {
  id: string;
  platform: Platform;
  label: string;
  amount: number;
}

export interface Withdrawal {
  id: string;
  amount: number;
  date: string;
  time: string;
  method: string;
  ref: string;
  status: TaskStatus;
}

export interface Order {
  id: string;
  platform: Platform;
  service: string;
  qty: number;
  amount: number;
  date: string;
  progress: number;
  status: OrderStatus;
}

export interface AppNotification {
  id: string;
  kind: "task" | "withdraw" | "order" | "system";
  title: string;
  detail: string;
  time: string;
  group: "Recent" | "Yesterday";
}

export const WALLET = {
  balance: 156.54,
  pending: 35.56,
  withdrawn: 85.34,
  minWithdraw: 10,
  completedTasks: 152,
  pendingTasks: 6,
  lifetime: 430.67,
};

export const PLATFORM_META: Record<
  Platform,
  { label: string; color: string; glyph: string }
> = {
  youtube: { label: "YouTube", color: "#FF0000", glyph: "YT" },
  facebook: { label: "Facebook", color: "#1877F2", glyph: "f" },
  instagram: { label: "Instagram", color: "#E4405F", glyph: "IG" },
  tiktok: { label: "TikTok", color: "#000000", glyph: "TT" },
  linkedin: { label: "LinkedIn", color: "#0A66C2", glyph: "in" },
  whatsapp: { label: "WhatsApp", color: "#25D366", glyph: "WA" },
  telegram: { label: "Telegram", color: "#229ED9", glyph: "TG" },
};

export const AVAILABLE_TASKS: Task[] = [
  { id: "t1", platform: "youtube", title: "Subscribe channel", action: "Subscribe to the channel", earn: 0.72, timeEstimate: "1 min" },
  { id: "t2", platform: "facebook", title: "Follow this page", action: "Follow the page", earn: 0.38, timeEstimate: "1 min" },
  { id: "t3", platform: "tiktok", title: "Like and save video", action: "Like and save the video", earn: 0.19, timeEstimate: "1 min" },
  { id: "t4", platform: "instagram", title: "Comment on post", action: "Leave a genuine comment", earn: 0.25, timeEstimate: "2 min" },
  { id: "t5", platform: "linkedin", title: "Share this post", action: "Share the post", earn: 0.09, timeEstimate: "1 min" },
  { id: "t6", platform: "whatsapp", title: "Join this group", action: "Join the group", earn: 0.17, timeEstimate: "1 min" },
  { id: "t7", platform: "telegram", title: "Follow this channel", action: "Follow the channel", earn: 0.49, timeEstimate: "1 min" },
  { id: "t8", platform: "facebook", title: "Like this post", action: "Like the post", earn: 0.24, timeEstimate: "1 min" },
  { id: "t9", platform: "youtube", title: "Subscribe channel", action: "Subscribe to the channel", earn: 0.59, timeEstimate: "1 min" },
  { id: "t10", platform: "instagram", title: "Share this post", action: "Share the post", earn: 0.44, timeEstimate: "1 min" },
  { id: "t11", platform: "tiktok", title: "Follow this user", action: "Follow the user", earn: 0.37, timeEstimate: "1 min" },
];

export const MY_TASKS: MyTask[] = [
  { id: "m1", platform: "facebook", title: "Like this post on Facebook", reward: 0.75, date: "02 Sep", status: "completed" },
  { id: "m2", platform: "youtube", title: "Subscribe channel", reward: 0.38, date: "02 Sep", status: "pending" },
  { id: "m3", platform: "instagram", title: "Comment on this post", reward: 0.78, date: "02 Sep", status: "declined" },
  { id: "m4", platform: "tiktok", title: "Follow this user on TikTok", reward: 0.45, date: "02 Sep", status: "completed" },
];

export const RECENT_ACTIVITY: Activity[] = [
  { id: "a1", platform: "tiktok", label: "Like Post", amount: 0.45 },
  { id: "a2", platform: "facebook", label: "Like Post", amount: 0.67 },
  { id: "a3", platform: "instagram", label: "Comment", amount: 0.28 },
  { id: "a4", platform: "youtube", label: "Subscribe", amount: 1.29 },
  { id: "a5", platform: "facebook", label: "Comment", amount: 0.66 },
];

export const WITHDRAWALS: Withdrawal[] = [
  { id: "w1", amount: 50.75, date: "02 Sep 2025", time: "11:30", method: "PayPal", ref: "#TXN2345AB", status: "pending" },
  { id: "w2", amount: 50.75, date: "02 Sep 2025", time: "11:30", method: "Bank", ref: "****1234", status: "completed" },
  { id: "w3", amount: 50.75, date: "02 Sep 2025", time: "11:30", method: "Crypto", ref: "Invalid wallet", status: "declined" },
];

export const ORDERS: Order[] = [
  { id: "ORD20250907", platform: "instagram", service: "1000 Followers", qty: 1000, amount: 50, date: "07 Sep 2025", progress: 50, status: "active" },
  { id: "ORD20250908", platform: "youtube", service: "500 Subs", qty: 500, amount: 25, date: "04 Sep 2025", progress: 100, status: "completed" },
];

export const PAYMENT_METHODS = [
  { id: "bank", label: "Bank", last4: "2878", tint: "bg-[#e7e9fb]" },
  { id: "paypal", label: "PayPal", last4: "3720", tint: "bg-[#fbe7ea]" },
  { id: "crypto", label: "Crypto", last4: "3980", tint: "bg-[#efe7fb]" },
];

export const WITHDRAW_PRESETS = [5, 10, 15, 20, 50, 100, 500, 1000];

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", kind: "task", title: "Task Approved · FB Like", detail: "Reward $0.75", time: "2h ago", group: "Recent" },
  { id: "n2", kind: "withdraw", title: "Withdrawal Approved", detail: "$50 sent to PayPal", time: "1d ago", group: "Recent" },
  { id: "n3", kind: "order", title: "Order #ORD20250907", detail: "Completed successfully", time: "2d ago", group: "Yesterday" },
  { id: "n4", kind: "system", title: "System Update", detail: "New features launched!", time: "3d ago", group: "Yesterday" },
];

export const REQUEST_SERVICES = ["Likes", "Followers", "Comments", "Subs"] as const;
export const REQUEST_PLATFORMS: Platform[] = [
  "youtube", "facebook", "instagram", "tiktok", "linkedin", "telegram", "whatsapp",
];

export const USER = {
  name: "Lois Becket",
  email: "loisbecket@gmail.com",
  country: "US",
};
