export type CampaignStatus = "Active" | "Paused" | "Draft" | "Scheduled" | "Ended";
export type CampaignType = "Email" | "Multi-channel" | "Nurture" | "Webinar" | "Product Launch" | "Winback" | "ABM";

export const CAMPAIGN_STATUS_TONE: Record<CampaignStatus, "green" | "amber" | "gray" | "blue" | "red"> = {
  Active: "green", Paused: "amber", Draft: "gray", Scheduled: "blue", Ended: "red",
};

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  channel: string[];
  reach: number;
  ctr: number;
  conversions: number;
  revenue: number;
  goal: string;
  progress: number;
  owner: string;
  updatedAt: string;
}

export const CAMPAIGNS: Campaign[] = [
  { id: "cp1", name: "Spring Product Launch", type: "Multi-channel", status: "Active", channel: ["Email", "Social", "Ads"], reach: 128400, ctr: 4.8, conversions: 842, revenue: 128450, goal: "Generate 1,000 leads", progress: 84, owner: "Alex Johnson", updatedAt: "2h ago" },
  { id: "cp2", name: "Trial Nurture — SaaS Founders", type: "Nurture", status: "Active", channel: ["Email"], reach: 8420, ctr: 12.4, conversions: 342, revenue: 62800, goal: "42% trial → paid", progress: 78, owner: "Sarah Chen", updatedAt: "5h ago" },
  { id: "cp3", name: "Winback Q3 Dormant Accounts", type: "Winback", status: "Active", channel: ["Email", "SMS"], reach: 4280, ctr: 6.2, conversions: 86, revenue: 24800, goal: "Re-engage 100 accounts", progress: 86, owner: "Emily Davis", updatedAt: "1d ago" },
  { id: "cp4", name: "Enterprise ABM — Top 50", type: "ABM", status: "Active", channel: ["Ads", "Email", "Direct"], reach: 1240, ctr: 8.4, conversions: 18, revenue: 342000, goal: "18 SQLs", progress: 100, owner: "Priya Ramesh", updatedAt: "1d ago" },
  { id: "cp5", name: "Growth Audit Promo", type: "Multi-channel", status: "Scheduled", channel: ["Email", "Social"], reach: 0, ctr: 0, conversions: 0, revenue: 0, goal: "500 audits", progress: 0, owner: "Alex Johnson", updatedAt: "Scheduled Aug 20" },
  { id: "cp6", name: "Webinar — AI Playbook", type: "Webinar", status: "Draft", channel: ["Email", "Social", "Landing Page"], reach: 0, ctr: 0, conversions: 0, revenue: 0, goal: "800 registrations", progress: 0, owner: "Marcus Lee", updatedAt: "3d ago" },
  { id: "cp7", name: "Winter Campaign 2025", type: "Multi-channel", status: "Ended", channel: ["Email", "Social"], reach: 92400, ctr: 3.8, conversions: 620, revenue: 84600, goal: "600 leads", progress: 100, owner: "Sarah Chen", updatedAt: "Ended Feb 28" },
];

export type WorkflowStatus = "Active" | "Draft" | "Paused";

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  status: WorkflowStatus;
  enrolled: number;
  completed: number;
  conversionRate: number;
  revenue: number;
  channels: string[];
  updatedAt: string;
}

export const WORKFLOWS: Workflow[] = [
  { id: "wf1", name: "Welcome Series — 5 emails", trigger: "New signup", status: "Active", enrolled: 2450, completed: 1820, conversionRate: 42.4, revenue: 84200, channels: ["Email"], updatedAt: "2h ago" },
  { id: "wf2", name: "Abandoned Cart Recovery", trigger: "Cart abandoned > 1h", status: "Active", enrolled: 842, completed: 486, conversionRate: 22.6, revenue: 42800, channels: ["Email", "SMS"], updatedAt: "5h ago" },
  { id: "wf3", name: "PQL → Sales Handoff", trigger: "Score > 80", status: "Active", enrolled: 128, completed: 96, conversionRate: 68.4, revenue: 128000, channels: ["Slack", "Email"], updatedAt: "1d ago" },
  { id: "wf4", name: "Trial Expiring in 3 days", trigger: "Trial ending soon", status: "Active", enrolled: 320, completed: 240, conversionRate: 34.2, revenue: 62400, channels: ["Email", "In-app"], updatedAt: "1d ago" },
  { id: "wf5", name: "Winback — Dormant 60 days", trigger: "No activity 60d", status: "Paused", enrolled: 480, completed: 210, conversionRate: 12.4, revenue: 14800, channels: ["Email"], updatedAt: "2d ago" },
  { id: "wf6", name: "Post-Purchase Onboarding", trigger: "Order placed", status: "Draft", enrolled: 0, completed: 0, conversionRate: 0, revenue: 0, channels: ["Email"], updatedAt: "3d ago" },
];

export type EmailStatus = "Sent" | "Scheduled" | "Draft" | "Sending";
export const EMAIL_STATUS_TONE: Record<EmailStatus, "green" | "blue" | "gray" | "violet"> = {
  Sent: "green", Scheduled: "blue", Draft: "gray", Sending: "violet",
};

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  audience: string;
  audienceSize: number;
  sent?: string;
  scheduled?: string;
  status: EmailStatus;
  openRate: number;
  ctr: number;
  conversions: number;
}

export const EMAILS: EmailCampaign[] = [
  { id: "em1", name: "August Newsletter", subject: "Growth playbooks for August 🚀", audience: "All Subscribers", audienceSize: 24800, sent: "Aug 10, 2026", status: "Sent", openRate: 34.8, ctr: 5.2, conversions: 342 },
  { id: "em2", name: "Product Launch — Spring", subject: "It's here. Meet Amplivanta 2.0", audience: "Trial Users", audienceSize: 8420, sent: "Aug 5, 2026", status: "Sent", openRate: 48.2, ctr: 12.4, conversions: 892 },
  { id: "em3", name: "Webinar Reminder", subject: "Starting in 1 hour — save your seat", audience: "Webinar Registrants", audienceSize: 1240, scheduled: "Aug 15, 9:00 AM", status: "Scheduled", openRate: 0, ctr: 0, conversions: 0 },
  { id: "em4", name: "Winback — Dormant 90 days", subject: "We miss you 💜 Here's what's new", audience: "Dormant Accounts", audienceSize: 480, status: "Draft", openRate: 0, ctr: 0, conversions: 0 },
  { id: "em5", name: "Enterprise ABM Batch 3", subject: "Personalized for {{firstName}}", audience: "Top 50 Accounts", audienceSize: 50, scheduled: "Aug 18, 10:00 AM", status: "Scheduled", openRate: 0, ctr: 0, conversions: 0 },
  { id: "em6", name: "Trial Day 7 Check-in", subject: "How's your first week going?", audience: "Active Trials", audienceSize: 240, status: "Sending", openRate: 22, ctr: 3, conversions: 8 },
];

export type FormStatus = "Live" | "Draft" | "Archived";
export const FORM_STATUS_TONE = { Live: "green", Draft: "gray", Archived: "amber" } as const;

export interface LeadForm {
  id: string;
  name: string;
  status: FormStatus;
  submissions: number;
  conversionRate: number;
  fields: number;
  workflow?: string;
  page?: string;
  updatedAt: string;
}

export const FORMS: LeadForm[] = [
  { id: "f1", name: "Growth Audit — Request", status: "Live", submissions: 842, conversionRate: 12.4, fields: 6, workflow: "Welcome Series", page: "/growth-audit", updatedAt: "2h ago" },
  { id: "f2", name: "Demo Request", status: "Live", submissions: 428, conversionRate: 8.6, fields: 8, workflow: "Sales Handoff", page: "/demo", updatedAt: "1d ago" },
  { id: "f3", name: "Newsletter Signup", status: "Live", submissions: 2450, conversionRate: 22.4, fields: 2, workflow: "Welcome Series", page: "Footer widget", updatedAt: "1d ago" },
  { id: "f4", name: "Case Study Download", status: "Live", submissions: 892, conversionRate: 14.8, fields: 5, page: "/resources/case-studies", updatedAt: "3d ago" },
  { id: "f5", name: "Enterprise Contact", status: "Live", submissions: 128, conversionRate: 6.2, fields: 12, workflow: "Enterprise Nurture", page: "/contact", updatedAt: "1w ago" },
  { id: "f6", name: "Webinar Registration", status: "Draft", submissions: 0, conversionRate: 0, fields: 4, updatedAt: "3d ago" },
  { id: "f7", name: "Beta Waitlist — 2024", status: "Archived", submissions: 620, conversionRate: 18.4, fields: 3, updatedAt: "6m ago" },
];

export type PageStatus = "Published" | "Ready" | "Draft" | "Scheduled" | "Archived";
export const PAGE_STATUS_TONE = { Published: "green", Ready: "blue", Draft: "gray", Scheduled: "violet", Archived: "amber" } as const;

export interface LandingPage {
  id: string;
  name: string;
  slug: string;
  status: PageStatus;
  visitors: number;
  conversions: number;
  conversionRate: number;
  form?: string;
  workflow?: string;
  updatedAt: string;
}

export const LANDING_PAGES: LandingPage[] = [
  { id: "lp1", name: "AI Advisor Launch", slug: "/lp/ai-advisor", status: "Published", visitors: 12480, conversions: 848, conversionRate: 6.8, form: "Demo Request", workflow: "Sales Handoff", updatedAt: "2h ago" },
  { id: "lp2", name: "Free Growth Audit", slug: "/lp/growth-audit", status: "Published", visitors: 8420, conversions: 842, conversionRate: 10.0, form: "Growth Audit — Request", workflow: "Welcome Series", updatedAt: "1d ago" },
  { id: "lp3", name: "Enterprise Overview", slug: "/lp/enterprise", status: "Published", visitors: 2480, conversions: 128, conversionRate: 5.2, form: "Enterprise Contact", updatedAt: "3d ago" },
  { id: "lp4", name: "Webinar Registration", slug: "/lp/webinar-aug", status: "Ready", visitors: 0, conversions: 0, conversionRate: 0, form: "Webinar Registration", updatedAt: "6h ago" },
  { id: "lp5", name: "Q4 Product Teaser", slug: "/lp/q4-teaser", status: "Draft", visitors: 0, conversions: 0, conversionRate: 0, updatedAt: "1d ago" },
  { id: "lp6", name: "Black Friday 2025", slug: "/lp/bf-2025", status: "Archived", visitors: 42800, conversions: 3280, conversionRate: 7.6, updatedAt: "8m ago" },
];

export interface Segment {
  id: string;
  name: string;
  type: "Dynamic" | "Static";
  size: number;
  growth: number;
  automations: number;
  updatedAt: string;
  rules: string;
}

export const SEGMENTS: Segment[] = [
  { id: "sg1", name: "SaaS Founders (Trial)", type: "Dynamic", size: 842, growth: 18, automations: 3, updatedAt: "Auto-refreshed 5 min ago", rules: "industry = SaaS AND plan = Trial AND role in [Founder, Co-founder, CEO]" },
  { id: "sg2", name: "Enterprise Top 50 ABM", type: "Static", size: 50, growth: 0, automations: 2, updatedAt: "Uploaded May 4", rules: "Manual import" },
  { id: "sg3", name: "Dormant 60d", type: "Dynamic", size: 480, growth: -12, automations: 1, updatedAt: "Auto-refreshed 12 min ago", rules: "lastActivity > 60 days AND status = Active" },
  { id: "sg4", name: "Newsletter Subscribers", type: "Dynamic", size: 24800, growth: 24, automations: 2, updatedAt: "Auto-refreshed 1 h ago", rules: "consent.newsletter = true" },
  { id: "sg5", name: "PQL Ready", type: "Dynamic", size: 128, growth: 42, automations: 4, updatedAt: "Real-time", rules: "leadScore >= 80 AND stage != Won" },
  { id: "sg6", name: "Ecommerce Buyers (Q3)", type: "Dynamic", size: 3480, growth: 14, automations: 3, updatedAt: "Auto-refreshed 30 min ago", rules: "orders.count > 0 AND lastPurchase within 90 days" },
];

export interface ScoringRule {
  id: string;
  name: string;
  type: "Positive" | "Negative" | "Decay";
  trigger: string;
  points: number;
  status: "Active" | "Paused";
  triggeredCount: number;
}

export const SCORINGRULES: ScoringRule[] = [
  { id: "sr1", name: "Opened email", type: "Positive", trigger: "Email opened", points: 2, status: "Active", triggeredCount: 24800 },
  { id: "sr2", name: "Clicked link", type: "Positive", trigger: "Email link clicked", points: 4, status: "Active", triggeredCount: 8420 },
  { id: "sr3", name: "Visited pricing page", type: "Positive", trigger: "Visited /pricing", points: 10, status: "Active", triggeredCount: 2480 },
  { id: "sr4", name: "Submitted demo request", type: "Positive", trigger: "Form submitted: Demo Request", points: 25, status: "Active", triggeredCount: 428 },
  { id: "sr5", name: "Enterprise role match", type: "Positive", trigger: "role in [CEO, CMO, VP]", points: 15, status: "Active", triggeredCount: 892 },
  { id: "sr6", name: "Free email domain", type: "Negative", trigger: "email in [@gmail, @yahoo]", points: -8, status: "Active", triggeredCount: 1240 },
  { id: "sr7", name: "Unsubscribed", type: "Negative", trigger: "Email unsubscribe", points: -50, status: "Active", triggeredCount: 148 },
  { id: "sr8", name: "Inactive 30d decay", type: "Decay", trigger: "No activity 30 days", points: -5, status: "Active", triggeredCount: 4280 },
];

export const SCORING_RULES = SCORINGRULES;

export interface AutomationTemplate {
  id: string;
  name: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  setupTime: string;
  triggers: number;
  actions: number;
  uses: number;
  performance: "High" | "Medium" | "New";
}

export const AUTO_TEMPLATES: AutomationTemplate[] = [
  { id: "at1", name: "Welcome Series (5 emails)", category: "Onboarding", difficulty: "Beginner", setupTime: "10 min", triggers: 1, actions: 8, uses: 842, performance: "High" },
  { id: "at2", name: "Abandoned Cart Recovery", category: "E-commerce", difficulty: "Intermediate", setupTime: "20 min", triggers: 1, actions: 6, uses: 620, performance: "High" },
  { id: "at3", name: "PQL → Sales Handoff", category: "PLG", difficulty: "Intermediate", setupTime: "25 min", triggers: 1, actions: 12, uses: 342, performance: "High" },
  { id: "at4", name: "Winback Dormant Users", category: "Retention", difficulty: "Advanced", setupTime: "30 min", triggers: 1, actions: 10, uses: 240, performance: "Medium" },
  { id: "at5", name: "Webinar Reminders", category: "Events", difficulty: "Beginner", setupTime: "10 min", triggers: 1, actions: 4, uses: 480, performance: "High" },
  { id: "at6", name: "Trial-to-Paid Nurture", category: "SaaS", difficulty: "Intermediate", setupTime: "20 min", triggers: 1, actions: 7, uses: 428, performance: "High" },
  { id: "at7", name: "NPS Feedback Loop", category: "Feedback", difficulty: "Advanced", setupTime: "35 min", triggers: 1, actions: 9, uses: 128, performance: "Medium" },
  { id: "at8", name: "Post-Purchase Upsell", category: "E-commerce", difficulty: "Advanced", setupTime: "40 min", triggers: 1, actions: 11, uses: 92, performance: "New" },
];

export type ExecutionStatus = "Running" | "Completed" | "Failed" | "Waiting";
export const EXEC_STATUS_TONE = { Running: "violet", Completed: "green", Failed: "red", Waiting: "amber" } as const;

export interface ExecutionRun {
  id: string;
  workflow: string;
  contact: string;
  status: ExecutionStatus;
  step: string;
  startedAt: string;
  duration: string;
  attempts?: number;
  errorHint?: string;
}

export const EXECUTIONS: ExecutionRun[] = [
  { id: "ex1", workflow: "Welcome Series", contact: "sophia@brighttech.com", status: "Running", step: "Wait 24h → Email 2", startedAt: "2 h ago", duration: "24h wait" },
  { id: "ex2", workflow: "Abandoned Cart", contact: "james@alphasys.com", status: "Completed", step: "Purchase confirmed", startedAt: "3 h ago", duration: "2h 14m" },
  { id: "ex3", workflow: "PQL → Sales", contact: "michael@innovatex.com", status: "Completed", step: "Slack notification sent", startedAt: "5 h ago", duration: "12s" },
  { id: "ex4", workflow: "Trial Expiring", contact: "sarah@visionarylabs.com", status: "Waiting", step: "Waiting for user action", startedAt: "1 d ago", duration: "36h" },
  { id: "ex5", workflow: "Welcome Series", contact: "invalid@bounce.com", status: "Failed", step: "Send email 1", startedAt: "1 d ago", duration: "8s", attempts: 3, errorHint: "SMTP bounce (550)" },
  { id: "ex6", workflow: "Winback", contact: "emily@greenleafi.com", status: "Running", step: "Send email 2", startedAt: "6 h ago", duration: "48h wait" },
];

export interface Domain {
  id: string;
  domain: string;
  status: "Verified" | "Pending DNS" | "SSL Error" | "Available";
  purpose: string[];
  ssl: string;
  addedAt: string;
}

export const DOMAINS: Domain[] = [
  { id: "d1", domain: "go.amplivanta.com", status: "Verified", purpose: ["Landing Pages", "Email tracking"], ssl: "Auto-renewed · Expires Aug 2027", addedAt: "Jan 12, 2025" },
  { id: "d2", domain: "learn.amplivanta.com", status: "Verified", purpose: ["Content"], ssl: "Auto-renewed · Expires Aug 2027", addedAt: "Feb 3, 2025" },
  { id: "d3", domain: "try.amplivanta.com", status: "Pending DNS", purpose: ["Landing Pages"], ssl: "Waiting for verification", addedAt: "Aug 10, 2026" },
  { id: "d4", domain: "beta.amplivanta.com", status: "SSL Error", purpose: ["Landing Pages"], ssl: "Certificate expired 3 days ago", addedAt: "May 22, 2026" },
];
