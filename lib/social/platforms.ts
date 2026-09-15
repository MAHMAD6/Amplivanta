/** Social platforms Amplivanta composes for, and the OAuth provider that can connect each. */
export const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", color: "#1877F2", connectDescription: "Connect your Facebook Page.", provider: "meta" },
  { id: "instagram", label: "Instagram", color: "#E1306C", connectDescription: "Connect your Instagram Business Account.", provider: "meta" },
  { id: "linkedin", label: "LinkedIn", color: "#0A66C2", connectDescription: "Connect your LinkedIn Company Page.", provider: "linkedin" },
  { id: "x", label: "X (Twitter)", color: "#000000", connectDescription: "Connect your X (Twitter) Account.", provider: null },
  { id: "youtube", label: "YouTube", color: "#FF0000", connectDescription: "Connect your YouTube Channel.", provider: "youtube" },
  { id: "tiktok", label: "TikTok", color: "#000000", connectDescription: "Connect your TikTok Business Account.", provider: "tiktok" },
  { id: "threads", label: "Threads", color: "#000000", connectDescription: "Connect your Threads profile.", provider: null },
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number]["id"];
export const SOCIAL_PLATFORM_IDS = SOCIAL_PLATFORMS.map((p) => p.id) as string[];
export const platformLabel = (id: string) => SOCIAL_PLATFORMS.find((p) => p.id === id)?.label ?? id;

/** Post lifecycle. "published" is only ever set by a real channel integration. */
export const POST_STATUSES: [value: string, label: string][] = [
  ["draft", "Draft"],
  ["pending_approval", "Pending approval"],
  ["changes_requested", "Changes requested"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["scheduled", "Scheduled"],
  ["published", "Published"],
  ["failed", "Failed"],
  ["archived", "Archived"],
];
export const statusLabel = (s: string) => POST_STATUSES.find(([v]) => v === s)?.[1] ?? s;
export const statusTone = (s: string): "gray" | "green" | "blue" | "amber" | "red" | "violet" =>
  s === "published" || s === "approved"
    ? "green"
    : s === "scheduled"
      ? "blue"
      : s === "pending_approval" || s === "changes_requested"
        ? "amber"
        : s === "rejected" || s === "failed"
          ? "red"
          : "gray";

/** Allowed review transitions: only posts awaiting review can be decided. */
export function nextStatusForReview(current: string, decision: "approve" | "changes" | "reject", scheduled: boolean): string | null {
  if (current !== "pending_approval") return null;
  if (decision === "approve") return scheduled ? "scheduled" : "approved";
  return decision === "changes" ? "changes_requested" : "rejected";
}
