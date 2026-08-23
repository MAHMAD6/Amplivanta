export const WORKSPACE_PROFILE = {
  name: "Amplivanta Workspace",
  slug: "amplivanta-workspace",
  industry: "SaaS",
  size: "50-200",
  timezone: "America/Los_Angeles (PST · UTC-8)",
  currency: "USD ($)",
  language: "English (US)",
  dateFormat: "MMM D, YYYY",
  logo: "AV",
};

export const USERS = [
  { id: "u1", name: "Alex Johnson", email: "alex@amplivanta.com", role: "Owner", teams: ["Growth", "Leadership"], status: "Active", lastActive: "Now", mfa: true },
  { id: "u2", name: "Sarah Chen", email: "sarah.chen@amplivanta.com", role: "Admin", teams: ["Growth", "Design"], status: "Active", lastActive: "12 min ago", mfa: true },
  { id: "u3", name: "Emily Davis", email: "emily@amplivanta.com", role: "Editor", teams: ["Content"], status: "Active", lastActive: "1 h ago", mfa: true },
  { id: "u4", name: "Marcus Lee", email: "marcus@amplivanta.com", role: "Editor", teams: ["Design"], status: "Active", lastActive: "3 h ago", mfa: false },
  { id: "u5", name: "Priya Ramesh", email: "priya@amplivanta.com", role: "Reviewer", teams: ["Growth"], status: "Active", lastActive: "1 d ago", mfa: true },
  { id: "u6", name: "Sarah Johnson", email: "sarah.j@amplivanta.com", role: "Editor", teams: ["Social"], status: "Active", lastActive: "2 d ago", mfa: false },
  { id: "u7", name: "Jordan Kim", email: "jordan@amplivanta.com", role: "Viewer", teams: ["Analytics"], status: "Invited", lastActive: "—", mfa: false },
];

export const USER_STATUS_TONE = { Active: "green", Invited: "amber", Suspended: "red" } as const;
export const ROLE_TONE = { Owner: "violet", Admin: "pink", Editor: "blue", Reviewer: "amber", Viewer: "gray" } as const;

export const ROLES = [
  { name: "Owner", members: 1, perms: "Full access · billing · delete workspace", locked: true },
  { name: "Admin", members: 2, perms: "Full access except billing + workspace delete", locked: true },
  { name: "Editor", members: 8, perms: "Create + edit + publish", locked: false },
  { name: "Reviewer", members: 3, perms: "Approve + comment on content", locked: false },
  { name: "Viewer", members: 4, perms: "Read-only across enabled modules", locked: false },
  { name: "External Contractor", members: 2, perms: "Custom scoped access · 90-day expiry", locked: false },
];

export const PERMISSION_MATRIX = [
  { section: "Content", perms: [
    { label: "Create content", grants: { Owner: true, Admin: true, Editor: true, Reviewer: false, Viewer: false } },
    { label: "Publish content", grants: { Owner: true, Admin: true, Editor: true, Reviewer: false, Viewer: false } },
    { label: "Approve content", grants: { Owner: true, Admin: true, Editor: false, Reviewer: true, Viewer: false } },
  ]},
  { section: "CRM", perms: [
    { label: "View contacts", grants: { Owner: true, Admin: true, Editor: true, Reviewer: true, Viewer: true } },
    { label: "Edit contacts", grants: { Owner: true, Admin: true, Editor: true, Reviewer: false, Viewer: false } },
    { label: "Delete deals", grants: { Owner: true, Admin: true, Editor: false, Reviewer: false, Viewer: false } },
  ]},
  { section: "Governance", perms: [
    { label: "Manage team", grants: { Owner: true, Admin: true, Editor: false, Reviewer: false, Viewer: false } },
    { label: "Manage billing", grants: { Owner: true, Admin: false, Editor: false, Reviewer: false, Viewer: false } },
    { label: "Access audit log", grants: { Owner: true, Admin: true, Editor: false, Reviewer: true, Viewer: false } },
  ]},
];

export const BILLING = {
  plan: "Growth",
  billingCycle: "Annual",
  seatsUsed: 8,
  seatsIncluded: 10,
  amountDue: 79 * 12,
  nextRenewal: "Aug 12, 2027",
  paymentMethod: "Visa · **** 6411 · Expires 08/2028",
  billingContact: "billing@amplivanta.com",
  usage: [
    { label: "Contacts", used: 8420, limit: 10000, unit: "" },
    { label: "Email sends / mo", used: 62400, limit: 100000, unit: "" },
    { label: "AI credits / mo", used: 2450, limit: 5000, unit: "" },
    { label: "Storage", used: 42, limit: 100, unit: "GB" },
    { label: "Social accounts", used: 6, limit: 20, unit: "" },
  ],
};

export const INVOICES = [
  { id: "INV-2098", date: "Aug 12, 2026", amount: 948, status: "Paid", download: true },
  { id: "INV-1984", date: "Aug 12, 2025", amount: 588, status: "Paid", download: true },
  { id: "INV-1842", date: "Jul 12, 2025", amount: 49, status: "Paid", download: true },
  { id: "INV-1720", date: "Jun 12, 2025", amount: 49, status: "Paid", download: true },
];

export const INVOICE_TONE = { Paid: "green", Failed: "red", Pending: "amber" } as const;

export const SESSIONS = [
  { device: "MacBook Pro · macOS 15", location: "San Francisco, US", ip: "192.168.1.42", lastActive: "Now", current: true },
  { device: "iPhone 15 Pro · iOS 18", location: "San Francisco, US", ip: "192.168.1.51", lastActive: "12 min ago", current: false },
  { device: "Chrome · Windows 11", location: "Chicago, US", ip: "203.0.113.42", lastActive: "3 d ago", current: false },
];

export const NOTIFICATION_CATEGORIES = [
  { key: "campaign", label: "Campaign updates", desc: "Launches, milestones, budget alerts", inApp: true, email: true, sms: false },
  { key: "approval", label: "Approvals", desc: "New reviews assigned, decisions", inApp: true, email: true, sms: false },
  { key: "billing", label: "Billing", desc: "Invoices, failed payments, renewals", inApp: true, email: true, sms: true },
  { key: "security", label: "Security & login", desc: "New sign-ins, MFA changes", inApp: true, email: true, sms: true },
  { key: "integrations", label: "Integrations", desc: "Sync failures, reauth needed", inApp: true, email: false, sms: false },
  { key: "publishing", label: "Publishing", desc: "Publish success + failures", inApp: true, email: false, sms: false },
  { key: "system", label: "System & maintenance", desc: "Scheduled maintenance, incidents", inApp: true, email: true, sms: false },
  { key: "ai", label: "AI recommendations", desc: "New insights & anomalies", inApp: true, email: false, sms: false },
];

export const DATA_JOBS = [
  { id: "j1", type: "Export", name: "Full contacts export — CSV", status: "Completed", size: "12.4 MB", createdAt: "2 h ago", createdBy: "Alex Johnson" },
  { id: "j2", type: "Import", name: "Enterprise Q3 leads — 480 rows", status: "Completed", size: "180 KB", createdAt: "1 d ago", createdBy: "Sarah Chen" },
  { id: "j3", type: "Export", name: "Deals + activities — JSON", status: "Running", size: "—", createdAt: "5 min ago", createdBy: "Alex Johnson" },
  { id: "j4", type: "Import", name: "Webinar signups — Aug 20", status: "Failed", size: "24 KB", createdAt: "3 d ago", createdBy: "Emily Davis" },
];

export const DATA_JOB_TONE = { Completed: "green", Running: "violet", Failed: "red", Queued: "gray" } as const;

export const DOMAINS = [
  { domain: "amplivanta.com", purpose: "Marketing site + email root", verified: true, ssl: "Valid · renews Jun 2027" },
  { domain: "go.amplivanta.com", purpose: "Landing pages", verified: true, ssl: "Valid · renews Aug 2027" },
  { domain: "email.amplivanta.com", purpose: "Email sender · SPF · DKIM · DMARC", verified: true, ssl: "N/A" },
  { domain: "try.amplivanta.com", purpose: "Landing pages", verified: false, ssl: "Pending DNS" },
];

export const AUDIT_EVENTS = [
  { actor: "Alex Johnson", action: "updated", target: "billing plan Starter → Growth", ip: "192.168.1.42", when: "12 min ago", severity: "info" },
  { actor: "Sarah Chen", action: "invited user", target: "jordan@amplivanta.com (Viewer)", ip: "192.168.1.51", when: "42 min ago", severity: "info" },
  { actor: "Alex Johnson", action: "revoked API key", target: "amp_live_old…", ip: "192.168.1.42", when: "1 h ago", severity: "warn" },
  { actor: "System", action: "auto-renewed SSL", target: "go.amplivanta.com", ip: "—", when: "3 h ago", severity: "info" },
  { actor: "Sarah Chen", action: "changed role", target: "Emily Davis: Reviewer → Editor", ip: "192.168.1.51", when: "5 h ago", severity: "warn" },
  { actor: "Alex Johnson", action: "enabled MFA requirement", target: "workspace policy", ip: "192.168.1.42", when: "Yesterday", severity: "info" },
  { actor: "External", action: "failed login attempt", target: "jordan@amplivanta.com", ip: "203.0.113.99", when: "Yesterday", severity: "critical" },
  { actor: "Alex Johnson", action: "exported audit log", target: "Aug 1 – 12", ip: "192.168.1.42", when: "2 d ago", severity: "warn" },
];

export const SEVERITY_TONE = { info: "blue", warn: "amber", critical: "red" } as const;

export const NOTIFICATIONS = [
  { id: "n1", title: "AI Advisor found a new opportunity", body: "Reallocate $2,400 from Facebook to LinkedIn — projected 18% CPL drop.", category: "ai", severity: "info", when: "2 min ago", unread: true },
  { id: "n2", title: "Spring Promotion approved", body: "Sarah Chen approved 4 posts. Scheduled 10:00 AM tomorrow.", category: "approval", severity: "info", when: "18 min ago", unread: true },
  { id: "n3", title: "Facebook connection needs reauth", body: "Token expires in 48 h. Reconnect to avoid publish failures.", category: "integrations", severity: "warn", when: "1 h ago", unread: true },
  { id: "n4", title: "Invoice INV-2098 paid", body: "$948.00 · Growth plan · Aug 12, 2026", category: "billing", severity: "info", when: "3 h ago", unread: false },
  { id: "n5", title: "3 posts scheduled", body: "Instagram, LinkedIn, X — Aug 15 batch.", category: "publishing", severity: "info", when: "5 h ago", unread: false },
  { id: "n6", title: "MFA enabled for 4 team members", body: "Security policy updated by Alex Johnson.", category: "security", severity: "info", when: "Yesterday", unread: false },
  { id: "n7", title: "Winback workflow completed", body: "Re-engaged 42 dormant contacts. 8 converted.", category: "campaign", severity: "info", when: "Yesterday", unread: false },
  { id: "n8", title: "Failed login blocked", body: "Suspicious login attempt on jordan@amplivanta.com from 203.0.113.99.", category: "security", severity: "critical", when: "Yesterday", unread: false },
  { id: "n9", title: "Scheduled maintenance Sep 1", body: "30-min window · 2:00–2:30 AM PST. Publishing paused.", category: "system", severity: "warn", when: "2 d ago", unread: false },
  { id: "n10", title: "Trial expiring in 3 days", body: "PulseIO trial expires Aug 17. Reach out to convert.", category: "campaign", severity: "warn", when: "2 d ago", unread: false },
];

export const NOTIF_CATEGORY_LABEL: Record<string, string> = {
  ai: "AI", approval: "Approvals", integrations: "Integrations", billing: "Billing",
  publishing: "Publishing", security: "Security", campaign: "Campaigns", system: "System",
};

export const NOTIF_SEVERITY_TONE = { info: "blue", warn: "amber", critical: "red" } as const;
