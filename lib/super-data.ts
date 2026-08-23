export const SUPER_KPIS = [
  { label: "MRR", value: "$482K", delta: "12%" },
  { label: "ARR", value: "$5.78M", delta: "18%" },
  { label: "Organizations", value: "1,284", delta: "24 this week" },
  { label: "Active Users", value: "8,420", delta: "8%" },
  { label: "Active Trials", value: "128", delta: "6 new today" },
  { label: "Churn (30d)", value: "1.4%", delta: "0.3 pts" },
  { label: "AI Usage", value: "2.4M credits", delta: "22%" },
  { label: "Platform Health", value: "99.98%", delta: "SLA green" },
];

export const SUPER_ORGS = [
  { name: "BrightTech Inc.", plan: "Scale", mrr: 2490, users: 42, health: "OK", region: "US", createdAt: "Jan 12, 2025" },
  { name: "NextGen Solutions", plan: "Growth", mrr: 990, users: 18, health: "OK", region: "US", createdAt: "Feb 3, 2025" },
  { name: "InnovateX", plan: "Enterprise", mrr: 8400, users: 84, health: "OK", region: "EU", createdAt: "Mar 22, 2025" },
  { name: "GreenLeaf Co.", plan: "Starter", mrr: 290, users: 4, health: "Warn", region: "US", createdAt: "Apr 15, 2025" },
  { name: "Alpha Systems", plan: "Growth", mrr: 990, users: 12, health: "OK", region: "APAC", createdAt: "May 4, 2025" },
  { name: "Visionary Labs", plan: "Growth", mrr: 990, users: 8, health: "OK", region: "US", createdAt: "Jun 12, 2025" },
  { name: "DataPro Analytics", plan: "Scale", mrr: 2490, users: 24, health: "OK", region: "EU", createdAt: "Jul 4, 2025" },
  { name: "CloudServe", plan: "Growth", mrr: 990, users: 14, health: "Warn", region: "US", createdAt: "Jul 22, 2025" },
];

export const REGIONS = [
  { region: "US", users: 4820, orgs: 620, mrr: 268000 },
  { region: "EU", users: 2140, orgs: 340, mrr: 128000 },
  { region: "APAC", users: 940, orgs: 180, mrr: 62000 },
  { region: "LATAM", users: 320, orgs: 84, mrr: 18000 },
  { region: "MEA", users: 200, orgs: 60, mrr: 6000 },
];

export const SUPER_NAV_GROUPS = [
  { label: "Operations", items: ["Dashboard", "Command Center", "Reports & Analytics"] },
  { label: "Tenants", items: ["Organizations", "User Management", "Subscriptions & Billing"] },
  { label: "Product", items: ["Content Management", "Creative Studio", "Social Publishing", "Marketing Automation", "Plans & Pricing", "Integrations", "AI Management"] },
  { label: "Platform", items: ["Domains & Email", "System Management", "Security & Compliance", "Support & Tickets", "Audit Logs", "Announcements", "Settings"] },
];

export type CmdSeverity = "critical" | "high" | "medium" | "low";
export const CMD_SEV_TONE = { critical: "red", high: "pink", medium: "amber", low: "gray" } as const;

export interface CmdAlert {
  id: string;
  category: "Billing" | "Trials" | "Churn" | "Quota" | "Deliverability" | "Integrations" | "Approvals" | "Security" | "Support";
  title: string;
  detail: string;
  org: string;
  severity: CmdSeverity;
  age: string;
  assignee?: string;
  status: "Open" | "Acknowledged" | "Snoozed" | "Resolved";
}

export const CMD_ALERTS: CmdAlert[] = [
  { id: "cmd1", category: "Billing", title: "Failed payment — InnovateX", detail: "3rd retry failed. Card expired 08/2026. Suspend in 48 h.", org: "InnovateX", severity: "critical", age: "12 min ago", status: "Open" },
  { id: "cmd2", category: "Security", title: "Suspicious login burst", detail: "42 failed logins in 5 min against admin@brighttech.com — geo mismatch.", org: "BrightTech Inc.", severity: "critical", age: "18 min ago", status: "Acknowledged", assignee: "Alex Johnson" },
  { id: "cmd3", category: "Trials", title: "Enterprise trial expiring in 24 h", detail: "PulseIO — 12-seat Enterprise trial, no conversion signal.", org: "PulseIO", severity: "high", age: "1 h ago", status: "Open" },
  { id: "cmd4", category: "Deliverability", title: "Domain reputation dip", detail: "email.nextgensol.com dropped from 92 → 71 · 3 bounces to Gmail.", org: "NextGen Solutions", severity: "high", age: "2 h ago", status: "Open" },
  { id: "cmd5", category: "Integrations", title: "HubSpot sync failing", detail: "OAuth revoked by tenant · 8 workflows stalled.", org: "Alpha Systems", severity: "high", age: "3 h ago", status: "Open" },
  { id: "cmd6", category: "Churn", title: "Churn risk — DataPro", detail: "Weekly active users down 62% MoM. Last CSM touch 42 days ago.", org: "DataPro Analytics", severity: "medium", age: "4 h ago", status: "Acknowledged", assignee: "Sarah Chen" },
  { id: "cmd7", category: "Quota", title: "AI credits 92% used", detail: "GreenLeaf will exhaust Growth-tier AI budget in ~4 days.", org: "GreenLeaf Co.", severity: "medium", age: "6 h ago", status: "Open" },
  { id: "cmd8", category: "Approvals", title: "Overdue approvals — 12 items", detail: "CloudServe approvals SLA breached · oldest 6 days.", org: "CloudServe", severity: "medium", age: "1 d ago", status: "Snoozed" },
  { id: "cmd9", category: "Support", title: "P0 ticket escalated", detail: "Landing page publish broken · custom domain SSL renewal loop.", org: "Visionary Labs", severity: "high", age: "1 d ago", status: "Open" },
  { id: "cmd10", category: "Deliverability", title: "SPF misconfigured", detail: "sender.newco.io missing SPF — email delivery falling.", org: "NewCo (trial)", severity: "low", age: "2 d ago", status: "Resolved" },
];

export const PLAN_MIX = [
  { plan: "Starter", orgs: 342, mrr: 99180, share: 27 },
  { plan: "Growth", orgs: 620, mrr: 246200, share: 48 },
  { plan: "Scale", orgs: 240, mrr: 118240, share: 19 },
  { plan: "Enterprise", orgs: 82, mrr: 68880, share: 6 },
];

export const MODULE_ADOPTION = [
  { module: "Social Publishing", pct: 92 },
  { module: "CRM", pct: 84 },
  { module: "Marketing Automation", pct: 68 },
  { module: "Creative Studio", pct: 62 },
  { module: "AI Advisor", pct: 58 },
  { module: "Growth Audit", pct: 42 },
  { module: "Content Intelligence", pct: 34 },
  { module: "Analytics & Reports", pct: 88 },
];

export const AI_COST = [
  { model: "GPT-class text", requests: "12.4M", cost: 4820, delta: 12 },
  { model: "Image generation", requests: "820K", cost: 3240, delta: 8 },
  { model: "Video render", requests: "42K", cost: 6820, delta: 24 },
  { model: "Embeddings", requests: "84M", cost: 1240, delta: 4 },
  { model: "Audio", requests: "18K", cost: 620, delta: -2 },
];

export const REVENUE_TREND = [42000, 58000, 62000, 71000, 84000, 92000, 108000, 128000, 142000, 168000, 218000, 268000];

export const PLATFORM_ANALYTICS_KPIS = [
  { label: "MRR", value: "$482K", delta: "12%" },
  { label: "ARR", value: "$5.78M", delta: "18%" },
  { label: "Net Revenue Retention", value: "112%", delta: "4 pts" },
  { label: "Gross Margin", value: "82%", delta: "1 pt" },
  { label: "AI COGS %", value: "6.4%", delta: "0.4 pts down" },
  { label: "LTV : CAC", value: "5.2×", delta: "Target 3×+" },
];
