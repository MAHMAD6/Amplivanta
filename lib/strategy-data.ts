export interface Goal {
  id: string;
  name: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  baseline: number;
  owner: string;
  dueDate: string;
  status: "On Track" | "At Risk" | "Behind" | "Achieved";
  campaigns: number;
}

export const GOALS: Goal[] = [
  { id: "g1", name: "Q3 Qualified Pipeline", metric: "Pipeline", target: 500000, current: 342000, unit: "$", baseline: 128000, owner: "Alex Johnson", dueDate: "Sep 30, 2026", status: "On Track", campaigns: 4 },
  { id: "g2", name: "SaaS Founder Acquisition", metric: "Signups", target: 2000, current: 1240, unit: "", baseline: 620, owner: "Sarah Chen", dueDate: "Sep 30, 2026", status: "On Track", campaigns: 3 },
  { id: "g3", name: "CAC Reduction", metric: "CAC", target: 200, current: 262, unit: "$", baseline: 320, owner: "Priya Ramesh", dueDate: "Q4", status: "At Risk", campaigns: 5 },
  { id: "g4", name: "Enterprise Logos", metric: "Deals Won", target: 15, current: 6, unit: "", baseline: 2, owner: "Alex Johnson", dueDate: "Dec 31, 2026", status: "Behind", campaigns: 2 },
  { id: "g5", name: "Content Velocity", metric: "Pieces/mo", target: 40, current: 42, unit: "", baseline: 24, owner: "Emily Davis", dueDate: "Ongoing", status: "Achieved", campaigns: 6 },
];

export const GOAL_STATUS_TONE = { "On Track": "green", "At Risk": "amber", Behind: "red", Achieved: "violet" } as const;

export interface Persona {
  id: string;
  name: string;
  role: string;
  demographics: string;
  needs: string[];
  painPoints: string[];
  channels: string[];
  triggers: string[];
  size: number;
  logoLetter: string;
  tone: string;
}

export const PERSONAS: Persona[] = [
  { id: "p1", name: "Priya — SaaS Founder", role: "Founder / CEO, 5–50 employees", demographics: "US / EU, 32–48, technical background", needs: ["Fast growth signal", "One-tool stack", "Board-ready reporting"], painPoints: ["Tool sprawl", "Attribution unclear", "Content velocity low"], channels: ["LinkedIn", "Blog", "Email"], triggers: ["Raised seed / A", "Hired first marketer", "Board meeting prep"], size: 12400, logoLetter: "P", tone: "bg-violet/15 text-violet" },
  { id: "p2", name: "Marcus — Growth Marketer", role: "Growth / Demand Gen, mid-market", demographics: "Global, 28–40, marketing-ops savvy", needs: ["Automation depth", "Reliable attribution", "AI content assist"], painPoints: ["Manual workflows", "Legacy tool cost", "Compliance overhead"], channels: ["LinkedIn", "Community", "Podcasts"], triggers: ["Missed quarterly goal", "Budget planning", "Tool renewal"], size: 8420, logoLetter: "M", tone: "bg-pink-brand/15 text-pink-brand" },
  { id: "p3", name: "Sarah — RevOps Leader", role: "RevOps / Sales Ops, 50–500 employees", demographics: "US primarily, 30–50, data-driven", needs: ["CRM ↔ marketing sync", "Scoring depth", "Governance controls"], painPoints: ["Duct-taped stack", "Bad data hygiene", "Manual handoffs"], channels: ["LinkedIn", "Conferences", "Analyst reports"], triggers: ["Sales-marketing SLA break", "Data migration"], size: 3480, logoLetter: "S", tone: "bg-blue-500/15 text-blue-600" },
  { id: "p4", name: "David — Enterprise Buyer", role: "VP Marketing / CMO, 500+ employees", demographics: "Global, 40–55, regulated industry exposure", needs: ["SSO / SCIM", "Data residency", "Enterprise SLA"], painPoints: ["Procurement cycle", "Security review", "Multi-workspace"], channels: ["Analyst reports", "Peer network", "Direct sales"], triggers: ["Vendor consolidation initiative", "Compliance audit"], size: 620, logoLetter: "D", tone: "bg-emerald-500/15 text-emerald-600" },
];

export interface Channel {
  id: string;
  name: string;
  category: "Paid" | "Owned" | "Earned";
  plannedBudget: number;
  actualSpend: number;
  expectedLeads: number;
  actualLeads: number;
  roasTarget: number;
  roasActual: number;
  status: "On Track" | "Over" | "Under";
}

export const CHANNELS: Channel[] = [
  { id: "c1", name: "LinkedIn Ads", category: "Paid", plannedBudget: 24000, actualSpend: 22400, expectedLeads: 800, actualLeads: 892, roasTarget: 3, roasActual: 3.4, status: "On Track" },
  { id: "c2", name: "Google Ads", category: "Paid", plannedBudget: 18000, actualSpend: 19200, expectedLeads: 600, actualLeads: 542, roasTarget: 3, roasActual: 2.6, status: "Under" },
  { id: "c3", name: "Meta Ads", category: "Paid", plannedBudget: 12000, actualSpend: 14400, expectedLeads: 400, actualLeads: 340, roasTarget: 2.5, roasActual: 2.1, status: "Over" },
  { id: "c4", name: "SEO / Organic", category: "Owned", plannedBudget: 8000, actualSpend: 7200, expectedLeads: 1200, actualLeads: 1420, roasTarget: 4, roasActual: 5.2, status: "On Track" },
  { id: "c5", name: "Email", category: "Owned", plannedBudget: 6000, actualSpend: 5400, expectedLeads: 800, actualLeads: 924, roasTarget: 6, roasActual: 7.8, status: "On Track" },
  { id: "c6", name: "Podcast / PR", category: "Earned", plannedBudget: 12000, actualSpend: 11800, expectedLeads: 300, actualLeads: 268, roasTarget: 2, roasActual: 1.8, status: "Under" },
];

export const CHANNEL_TONE = { "On Track": "green", Over: "red", Under: "amber" } as const;

export const SWOT = {
  Strengths: ["AI-native product", "Fastest audit in category", "Multi-workspace ready", "Transparent pricing"],
  Weaknesses: ["Brand awareness vs incumbents", "Limited APAC coverage", "Small partner network"],
  Opportunities: ["Cookieless attribution demand", "Consolidation-fatigued buyers", "Vertical-specific playbooks"],
  Threats: ["Incumbent bundling", "Rising CAC across paid", "New AI-native entrants"],
};

export interface StrategyReport {
  id: string;
  name: string;
  period: string;
  status: "Ready" | "Draft" | "Scheduled";
  metrics: number;
  lastRun: string;
  audience: string;
}

export const STRATEGY_REPORTS: StrategyReport[] = [
  { id: "sr1", name: "Q3 Board Deck — Growth Strategy", period: "Q3 2026", status: "Ready", metrics: 24, lastRun: "2 h ago", audience: "Board of Directors" },
  { id: "sr2", name: "Monthly Marketing Review — August", period: "Aug 2026", status: "Draft", metrics: 18, lastRun: "5 h ago", audience: "Exec Team" },
  { id: "sr3", name: "Channel Performance — Weekly", period: "Aug 8 – 14", status: "Scheduled", metrics: 12, lastRun: "Every Fri 9am", audience: "Marketing Team" },
  { id: "sr4", name: "Persona Insights Recap", period: "Q3 2026", status: "Draft", metrics: 8, lastRun: "1 d ago", audience: "Product + Marketing" },
];

export const STRATEGY_REPORT_TONE = { Ready: "green", Draft: "gray", Scheduled: "blue" } as const;
