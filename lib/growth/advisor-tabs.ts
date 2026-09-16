export const ADVISOR_TABS: [label: string, href: string][] = [
  ["Overview", "/app/ai-advisor"],
  ["Ask AI Advisor", "/app/ai-advisor/ask"],
  ["Recommendation History", "/app/ai-advisor/history"],
  ["Saved Insights", "/app/ai-advisor/saved"],
  ["Action Plans", "/app/ai-advisor/action-plans"],
];

export const REC_STATUS_LABELS: Record<string, string> = {
  new: "New",
  pending: "Pending",
  saved: "Saved",
  ready: "Ready",
  in_progress: "In progress",
  implemented: "Implemented",
  dismissed: "Dismissed",
  archived: "Archived",
};
