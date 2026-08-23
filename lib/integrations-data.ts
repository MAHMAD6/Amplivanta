export type IntgStatus = "Connected" | "Available" | "Warning" | "Error";
export const INTG_TONE = { Connected: "green", Available: "gray", Warning: "amber", Error: "red" } as const;

export interface Integration {
  id: string;
  name: string;
  category: "CRM" | "Ads" | "Social" | "Email" | "Analytics" | "Storage" | "Communication" | "Payments" | "Data";
  logo: string;
  status: IntgStatus;
  scopes: number;
  lastSync: string;
  connectedBy?: string;
  popular?: boolean;
}

export const INTEGRATIONS: Integration[] = [
  { id: "i1", name: "HubSpot", category: "CRM", logo: "🧡", status: "Connected", scopes: 6, lastSync: "2 min ago", connectedBy: "Alex Johnson", popular: true },
  { id: "i2", name: "Salesforce", category: "CRM", logo: "☁️", status: "Available", scopes: 0, lastSync: "—" },
  { id: "i3", name: "Google Ads", category: "Ads", logo: "🟨", status: "Connected", scopes: 4, lastSync: "5 min ago", connectedBy: "Priya Ramesh", popular: true },
  { id: "i4", name: "Meta Business Suite", category: "Ads", logo: "📘", status: "Connected", scopes: 5, lastSync: "12 min ago" },
  { id: "i5", name: "LinkedIn Campaign Manager", category: "Ads", logo: "💼", status: "Connected", scopes: 4, lastSync: "8 min ago", popular: true },
  { id: "i6", name: "X Ads", category: "Ads", logo: "𝕏", status: "Warning", scopes: 3, lastSync: "3 h ago" },
  { id: "i7", name: "Instagram", category: "Social", logo: "📷", status: "Connected", scopes: 5, lastSync: "10 min ago" },
  { id: "i8", name: "TikTok", category: "Social", logo: "🎵", status: "Connected", scopes: 4, lastSync: "15 min ago" },
  { id: "i9", name: "YouTube", category: "Social", logo: "▶️", status: "Error", scopes: 5, lastSync: "3 d ago" },
  { id: "i10", name: "Mailchimp", category: "Email", logo: "🐵", status: "Available", scopes: 0, lastSync: "—" },
  { id: "i11", name: "SendGrid", category: "Email", logo: "✉️", status: "Connected", scopes: 3, lastSync: "1 h ago" },
  { id: "i12", name: "Google Analytics 4", category: "Analytics", logo: "📊", status: "Connected", scopes: 3, lastSync: "20 min ago", popular: true },
  { id: "i13", name: "Mixpanel", category: "Analytics", logo: "🧪", status: "Available", scopes: 0, lastSync: "—" },
  { id: "i14", name: "Segment", category: "Data", logo: "🔀", status: "Connected", scopes: 4, lastSync: "8 min ago" },
  { id: "i15", name: "Snowflake", category: "Data", logo: "❄️", status: "Available", scopes: 0, lastSync: "—" },
  { id: "i16", name: "Google Drive", category: "Storage", logo: "💾", status: "Connected", scopes: 2, lastSync: "1 h ago" },
  { id: "i17", name: "Dropbox", category: "Storage", logo: "📦", status: "Available", scopes: 0, lastSync: "—" },
  { id: "i18", name: "Slack", category: "Communication", logo: "💬", status: "Connected", scopes: 2, lastSync: "5 min ago", popular: true },
  { id: "i19", name: "Microsoft Teams", category: "Communication", logo: "🟦", status: "Available", scopes: 0, lastSync: "—" },
  { id: "i20", name: "Stripe", category: "Payments", logo: "💳", status: "Connected", scopes: 3, lastSync: "30 min ago" },
];

export const INTG_CATEGORIES = ["All", "CRM", "Ads", "Social", "Email", "Analytics", "Data", "Storage", "Communication", "Payments"];

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: "Active" | "Paused" | "Failing";
  lastDelivery: string;
  successRate: number;
  createdBy: string;
}

export const WEBHOOKS: Webhook[] = [
  { id: "w1", url: "https://api.brighttech.com/webhooks/amplivanta", events: ["lead.created", "deal.won", "form.submitted"], status: "Active", lastDelivery: "12 min ago · 200", successRate: 99.8, createdBy: "Alex Johnson" },
  { id: "w2", url: "https://hooks.zapier.com/hooks/catch/12345/abc/", events: ["contact.updated"], status: "Active", lastDelivery: "1 h ago · 200", successRate: 100, createdBy: "Sarah Chen" },
  { id: "w3", url: "https://internal.nextgen.io/webhooks/lead", events: ["lead.created", "lead.scored"], status: "Failing", lastDelivery: "3 h ago · 500", successRate: 84.2, createdBy: "Priya Ramesh" },
  { id: "w4", url: "https://hooks.slack.com/services/T00/B00/…", events: ["approval.pending"], status: "Paused", lastDelivery: "2 d ago", successRate: 98.4, createdBy: "Alex Johnson" },
];

export const WEBHOOK_TONE = { Active: "green", Paused: "gray", Failing: "red" } as const;

export const WEBHOOK_EVENTS = [
  "lead.created", "lead.updated", "lead.scored", "contact.created", "contact.updated",
  "deal.created", "deal.won", "deal.lost", "form.submitted", "email.sent",
  "email.bounced", "workflow.started", "workflow.completed", "approval.pending", "approval.decided",
];

export interface ApiKey {
  id: string;
  label: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string;
  usage7d: number;
  status: "Active" | "Revoked";
}

export const API_KEYS: ApiKey[] = [
  { id: "k1", label: "Production — main app", prefix: "amp_live_a4B…", scopes: ["contacts:read", "contacts:write", "deals:write", "campaigns:read"], createdAt: "Jan 12, 2025", lastUsed: "12 min ago", usage7d: 428000, status: "Active" },
  { id: "k2", label: "Zapier integration", prefix: "amp_live_z7X…", scopes: ["contacts:read", "forms:write"], createdAt: "Feb 3, 2025", lastUsed: "1 h ago", usage7d: 18400, status: "Active" },
  { id: "k3", label: "Internal reporting", prefix: "amp_live_r2P…", scopes: ["analytics:read", "campaigns:read"], createdAt: "Mar 22, 2025", lastUsed: "3 h ago", usage7d: 8420, status: "Active" },
  { id: "k4", label: "Legacy CRM sync (deprecated)", prefix: "amp_live_old…", scopes: ["contacts:read"], createdAt: "Nov 4, 2024", lastUsed: "6 m ago", usage7d: 0, status: "Revoked" },
];

export const API_KEY_TONE = { Active: "green", Revoked: "red" } as const;

export const HUBSPOT_SETUP_STEPS = [
  { title: "Connect via OAuth", body: "Sign in to your HubSpot account and grant read/write scopes for contacts, deals, companies.", done: true },
  { title: "Map objects & fields", body: "Contact ↔ Contact, Deal ↔ Deal, Company ↔ Company. Custom-field mapping supported.", done: true },
  { title: "Configure sync direction", body: "Bidirectional recommended. Master-of-record: HubSpot.", done: true },
  { title: "Set sync frequency", body: "Real-time on writes, hourly reconciliation. Backfill available.", done: true },
  { title: "Run test sync", body: "Dry-run against 10 records. Preview merges before commit.", done: false },
  { title: "Activate", body: "Once test passes, flip to Active. All writes propagate.", done: false },
];

export const HUBSPOT_FIELD_MAP = [
  { source: "email", target: "email", type: "String", direction: "↔" },
  { source: "firstName", target: "firstname", type: "String", direction: "↔" },
  { source: "lastName", target: "lastname", type: "String", direction: "↔" },
  { source: "company.name", target: "company", type: "String", direction: "↔" },
  { source: "leadScore", target: "hs_lead_score", type: "Number", direction: "→" },
  { source: "lifecycleStage", target: "lifecyclestage", type: "Enum", direction: "↔" },
  { source: "tags", target: "amp_tags", type: "Array", direction: "→" },
];
