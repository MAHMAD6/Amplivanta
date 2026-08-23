export interface WSCampaign {
  id: string;
  name: string;
  goal: string;
  audience: string;
  budget: number;
  timeline: string;
  projectedROI: string;
  status: "Planning" | "In Progress" | "Live" | "Complete";
  progress: number;
}

export const WS_CAMPAIGNS: WSCampaign[] = [
  { id: "wsc1", name: "Spring Product Launch", goal: "1,000 qualified leads", audience: "SaaS founders, marketing directors", budget: 42000, timeline: "May 1 – Aug 31", projectedROI: "3.2×", status: "Live", progress: 84 },
  { id: "wsc2", name: "Q3 Winback", goal: "Re-engage 100 accounts", audience: "Dormant 60+ days", budget: 8400, timeline: "Aug 15 – Sep 30", projectedROI: "2.1×", status: "In Progress", progress: 46 },
  { id: "wsc3", name: "Enterprise ABM Batch 3", goal: "18 SQLs, $342K pipeline", audience: "Top 50 enterprise", budget: 62000, timeline: "Jul 15 – Sep 15", projectedROI: "4.8×", status: "Live", progress: 100 },
];

export const WS_KPI_TARGETS = [
  { label: "Leads", target: 1000, current: 842, unit: "" },
  { label: "MQL rate", target: 40, current: 34, unit: "%" },
  { label: "SQL rate", target: 20, current: 18, unit: "%" },
  { label: "CAC", target: 240, current: 262, unit: "$" },
];

export const WS_STRATEGY = {
  strategy: "Multi-touch inbound + ABM. Anchor with growth-audit CTA on paid; nurture with weekly playbooks; sales-assist Top 50 with warm intros.",
  funnel: [
    { stage: "Awareness", channel: "Paid social + SEO", tactic: "Trend + playbook content" },
    { stage: "Interest", channel: "Landing pages + forms", tactic: "Free Growth Audit CTA" },
    { stage: "Consideration", channel: "Email + retargeting", tactic: "Trial + case studies" },
    { stage: "Decision", channel: "Sales-assist + demos", tactic: "PQL scoring → live demo" },
  ],
  topPriorities: [
    "Ship AI Advisor v2 by Aug 22",
    "Land 3 enterprise logos this quarter",
    "Reduce CAC 15% by Q4",
  ],
};

export type WSContentType = "Blog" | "Social" | "Email" | "Ad Copy" | "Video Script" | "Image";

export const WS_CONTENT: { id: string; title: string; type: WSContentType; channel: string; status: "Draft" | "In Review" | "Approved" | "Published"; owner: string; performance?: string; thumb: string }[] = [
  { id: "co1", title: "How AI Advisor spots channel opportunities", type: "Blog", channel: "Amplivanta Blog", status: "Published", owner: "Priya Ramesh", performance: "4.2K views", thumb: "from-violet/25 to-orange-brand/25" },
  { id: "co2", title: "LinkedIn Ad — AI Advisor teaser", type: "Ad Copy", channel: "LinkedIn Ads", status: "Approved", owner: "Emily Davis", performance: "12.4K impr", thumb: "from-blue-500/25 to-violet/20" },
  { id: "co3", title: "Instagram carousel — Spring Launch", type: "Social", channel: "Instagram", status: "Published", owner: "Sarah Johnson", performance: "1.2K likes", thumb: "from-pink-brand/25 to-fuchsia-300/25" },
  { id: "co4", title: "Nurture Email 3 — case study", type: "Email", channel: "Email", status: "In Review", owner: "Emily Davis", thumb: "from-emerald-500/20 to-teal-500/20" },
  { id: "co5", title: "60s explainer video script", type: "Video Script", channel: "YouTube / LinkedIn", status: "Draft", owner: "Marcus Lee", thumb: "from-amber-400/25 to-orange-brand/25" },
  { id: "co6", title: "AI-generated hero image", type: "Image", channel: "Landing page", status: "Approved", owner: "Marcus Lee", thumb: "from-indigo-500/25 to-violet/25" },
];

export const WS_ASSETS: { id: string; name: string; kind: "Image" | "Video" | "Document" | "Design" | "Audio"; size: string; owner: string; folder: string; thumb: string; updatedAt: string }[] = [
  { id: "wa1", name: "hero-spring-launch.png", kind: "Image", size: "2.4 MB", owner: "Sarah Johnson", folder: "Spring Launch", thumb: "from-violet/25 to-orange-brand/25", updatedAt: "2h ago" },
  { id: "wa2", name: "product-tour-crm.mp4", kind: "Video", size: "48 MB", owner: "Marcus Lee", folder: "Videos", thumb: "from-blue-500/25 to-violet/20", updatedAt: "5h ago" },
  { id: "wa3", name: "case-study-brighttech.pdf", kind: "Document", size: "2.8 MB", owner: "Emily Davis", folder: "Case Studies", thumb: "from-emerald-500/20 to-teal-500/20", updatedAt: "1d ago" },
  { id: "wa4", name: "linkedin-ad-batch-3.fig", kind: "Design", size: "1.2 MB", owner: "Marcus Lee", folder: "Ads", thumb: "from-orange-brand/25 to-pink-brand/25", updatedAt: "1d ago" },
  { id: "wa5", name: "podcast-intro.wav", kind: "Audio", size: "12 MB", owner: "Priya Ramesh", folder: "Audio", thumb: "from-teal-500/20 to-emerald-500/20", updatedAt: "3d ago" },
  { id: "wa6", name: "brand-guidelines-v2.pdf", kind: "Document", size: "3.4 MB", owner: "Sarah Chen", folder: "Brand", thumb: "from-indigo-500/25 to-violet/25", updatedAt: "1w ago" },
];

export const WS_AUTOMATIONS: { id: string; name: string; trigger: string; channels: string[]; status: "Active" | "Paused"; contacts: number; conversions: number; revenue: number; health: "OK" | "Warn" }[] = [
  { id: "wsa1", name: "Spring Launch — Welcome Series", trigger: "New signup from LP", channels: ["Email"], status: "Active", contacts: 842, conversions: 342, revenue: 62800, health: "OK" },
  { id: "wsa2", name: "Trial → Paid Nurture", trigger: "Trial started", channels: ["Email", "In-app"], status: "Active", contacts: 320, conversions: 128, revenue: 42800, health: "OK" },
  { id: "wsa3", name: "Enterprise ABM — outreach", trigger: "Target account visits pricing", channels: ["Slack", "Email"], status: "Active", contacts: 42, conversions: 18, revenue: 342000, health: "OK" },
  { id: "wsa4", name: "Abandoned Growth Audit", trigger: "Started audit not finished > 24h", channels: ["Email"], status: "Active", contacts: 128, conversions: 32, revenue: 12400, health: "Warn" },
];

export const WS_TASKS: { id: string; title: string; assignee: string; category: string; priority: "High" | "Medium" | "Low"; dueDate: string; status: "Todo" | "In Progress" | "Done"; progress: number }[] = [
  { id: "wst1", title: "Finalize AI Advisor landing hero copy", assignee: "Emily Davis", category: "Copy", priority: "High", dueDate: "Aug 15", status: "In Progress", progress: 60 },
  { id: "wst2", title: "Ship 60s explainer video", assignee: "Marcus Lee", category: "Video", priority: "High", dueDate: "Aug 18", status: "Todo", progress: 0 },
  { id: "wst3", title: "Approve enterprise ABM email batch 3", assignee: "Sarah Chen", category: "Approval", priority: "High", dueDate: "Aug 14", status: "In Progress", progress: 40 },
  { id: "wst4", title: "Write case study — BrightTech", assignee: "Priya Ramesh", category: "Content", priority: "Medium", dueDate: "Aug 22", status: "In Progress", progress: 75 },
  { id: "wst5", title: "QA landing page conversion tracking", assignee: "Alex Johnson", category: "Analytics", priority: "Medium", dueDate: "Aug 16", status: "Todo", progress: 0 },
  { id: "wst6", title: "Schedule webinar promo posts", assignee: "Sarah Johnson", category: "Social", priority: "Low", dueDate: "Aug 25", status: "Todo", progress: 0 },
  { id: "wst7", title: "Update MSA template with GDPR clause", assignee: "Sarah Chen", category: "Legal", priority: "Medium", dueDate: "Aug 20", status: "Done", progress: 100 },
];

export const WS_NOTES: { id: string; title: string; snippet: string; type: "Meeting" | "Research" | "Idea" | "Strategy" | "AI Summary"; tags: string[]; author: string; updatedAt: string; pinned?: boolean }[] = [
  { id: "wn1", title: "Meeting — BrightTech Q3 review", snippet: "Discussed expansion into EMEA, Q4 roadmap, dedicated CSM ask. Next step: proposal by Aug 22.", type: "Meeting", tags: ["BrightTech", "Enterprise"], author: "Alex Johnson", updatedAt: "2h ago", pinned: true },
  { id: "wn2", title: "AI summary — Growth Audit interviews", snippet: "Top 3 pain points across 12 interviews: (1) attribution clarity, (2) content velocity, (3) approvals bottleneck.", type: "AI Summary", tags: ["research"], author: "AI Advisor", updatedAt: "5h ago", pinned: true },
  { id: "wn3", title: "Idea — PLG scoring signals", snippet: "Weight time-to-value events higher than raw activity. Test: score seat-invite as +15.", type: "Idea", tags: ["PLG", "scoring"], author: "Priya Ramesh", updatedAt: "1d ago" },
  { id: "wn4", title: "Strategy — Q4 CAC target", snippet: "Reduce CAC 15% by shifting 20% of paid spend to organic + affiliate.", type: "Strategy", tags: ["Q4", "CAC"], author: "Alex Johnson", updatedAt: "2d ago" },
  { id: "wn5", title: "Research — competitor pricing analysis", snippet: "3 top competitors bundle CRM + automation at $99/mo. Our Growth plan $99 is competitive; differentiate on AI.", type: "Research", tags: ["competitive", "pricing"], author: "Sarah Chen", updatedAt: "3d ago" },
];

export const WS_APPROVALS: { id: string; item: string; itemType: string; requester: string; submittedAt: string; priority: "High" | "Medium" | "Low"; status: "Pending" | "Approved" | "Changes Requested" | "Rejected" }[] = [
  { id: "wap1", item: "Enterprise ABM Email Batch 3", itemType: "Email", requester: "Emily Davis", submittedAt: "2h ago", priority: "High", status: "Pending" },
  { id: "wap2", item: "Spring Launch — hero image v3", itemType: "Image", requester: "Marcus Lee", submittedAt: "4h ago", priority: "Medium", status: "Pending" },
  { id: "wap3", item: "AI Advisor landing page copy", itemType: "Landing Page", requester: "Emily Davis", submittedAt: "6h ago", priority: "High", status: "Pending" },
  { id: "wap4", item: "Winback SMS blast — 480 contacts", itemType: "SMS", requester: "Sarah Johnson", submittedAt: "1d ago", priority: "Medium", status: "Approved" },
  { id: "wap5", item: "Nurture workflow — Trial → Paid v2", itemType: "Workflow", requester: "Alex Johnson", submittedAt: "1d ago", priority: "High", status: "Approved" },
  { id: "wap6", item: "Meme post for X (Twitter)", itemType: "Social Post", requester: "Sarah Johnson", submittedAt: "2d ago", priority: "Low", status: "Changes Requested" },
  { id: "wap7", item: "Competitor comparison chart", itemType: "Graphic", requester: "Marcus Lee", submittedAt: "3d ago", priority: "High", status: "Rejected" },
];

export const WS_ACTIVITY: { id: string; actor: string; verb: string; object: string; module: string; when: string; category: "Create" | "Edit" | "Approve" | "Publish" | "Budget" | "Integration" | "AI" }[] = [
  { id: "wsl1", actor: "AI Advisor", verb: "recommended", object: "reallocate $2,400 from Facebook to LinkedIn", module: "AI Advisor", when: "2 min ago", category: "AI" },
  { id: "wsl2", actor: "Sarah Chen", verb: "approved", object: "Winback SMS blast — 480 contacts", module: "Approvals", when: "18 min ago", category: "Approve" },
  { id: "wsl3", actor: "Alex Johnson", verb: "increased budget on", object: "Spring Launch — $42K → $52K", module: "Campaigns", when: "42 min ago", category: "Budget" },
  { id: "wsl4", actor: "Emily Davis", verb: "created", object: "Nurture Email 3 draft", module: "Content Hub", when: "1 h ago", category: "Create" },
  { id: "wsl5", actor: "Marcus Lee", verb: "published", object: "LinkedIn Ad — AI Advisor teaser", module: "Publishing", when: "2 h ago", category: "Publish" },
  { id: "wsl6", actor: "Sarah Johnson", verb: "edited", object: "Spring Launch hero image", module: "Assets", when: "3 h ago", category: "Edit" },
  { id: "wsl7", actor: "Alex Johnson", verb: "connected", object: "Slack workspace #growth-alerts", module: "Integrations", when: "5 h ago", category: "Integration" },
  { id: "wsl8", actor: "AI Advisor", verb: "flagged anomaly on", object: "Winback flow — 62% drop at step 3", module: "Automations", when: "6 h ago", category: "AI" },
  { id: "wsl9", actor: "Priya Ramesh", verb: "edited", object: "Case study — BrightTech (v2)", module: "Content Hub", when: "Yesterday", category: "Edit" },
  { id: "wsl10", actor: "System", verb: "auto-approved", object: "Standard email tag change on 42 contacts", module: "Approvals", when: "Yesterday", category: "Approve" },
];
