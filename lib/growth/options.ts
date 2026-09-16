/** Growth Intelligence option lists shared by pages, forms and server actions. */

export type Opt = [value: string, label: string];

export const INDUSTRIES: Opt[] = [
  ["saas", "SaaS & Software"],
  ["ecommerce", "E-commerce & Retail"],
  ["agency", "Agency & Services"],
  ["finance", "Finance & Insurance"],
  ["health", "Health & Wellness"],
  ["education", "Education"],
  ["real_estate", "Real Estate"],
  ["hospitality", "Hospitality & Travel"],
  ["manufacturing", "Manufacturing"],
  ["nonprofit", "Nonprofit"],
  ["other", "Other"],
];

export const GROWTH_GOALS: Opt[] = [
  ["leads", "Generate more leads"],
  ["conversion", "Improve conversion rate"],
  ["traffic", "Grow qualified traffic"],
  ["retention", "Improve retention"],
  ["revenue", "Increase revenue"],
  ["awareness", "Build brand awareness"],
];

export const PERIODS: Opt[] = [
  ["30", "Last 30 days"],
  ["90", "Last 90 days"],
  ["180", "Last 6 months"],
  ["365", "Last 12 months"],
];

export const IDEA_CHANNELS: Opt[] = [
  ["blog", "Blog"],
  ["social", "Social"],
  ["email", "Email"],
  ["video", "Video"],
  ["landing_page", "Landing Page"],
  ["ads", "Paid Ads"],
];

export const IDEA_TYPES: Opt[] = [
  ["blog_post", "Blog Post"],
  ["social", "Social Post"],
  ["email", "Email"],
  ["video", "Video"],
  ["infographic", "Infographic"],
  ["other", "Other"],
];

export const EVENT_TYPES: Opt[] = [
  ["holiday", "Holiday"],
  ["awareness", "Awareness"],
  ["industry", "Industry"],
  ["company", "Company"],
  ["seasonal", "Seasonal"],
  ["custom", "Custom"],
];

export const GOAL_STATUSES: Opt[] = [
  ["in_progress", "In Progress"],
  ["on_track", "On Track"],
  ["at_risk", "At Risk"],
  ["completed", "Completed"],
];

export const PERSONA_STATUSES: Opt[] = [
  ["draft", "Draft"],
  ["active", "Active"],
  ["archived", "Archived"],
];

export const PLAN_CHANNELS: Opt[] = [
  ["seo", "SEO"],
  ["paid_search", "Paid Search"],
  ["paid_social", "Paid Social"],
  ["organic_social", "Organic Social"],
  ["email", "Email"],
  ["content", "Content"],
  ["events", "Events"],
  ["partnerships", "Partnerships"],
  ["other", "Other"],
];

export const SCENARIOS: Opt[] = [
  ["draft", "Draft"],
  ["base", "Base"],
  ["stretch", "Stretch"],
];

export const APPROVAL_STATUSES: Opt[] = [
  ["not_submitted", "Not submitted"],
  ["pending", "Pending approval"],
  ["approved", "Approved"],
  ["changes_requested", "Changes requested"],
];

export const STRATEGY_REPORT_TYPES: Opt[] = [
  ["strategy_executive", "Executive Summary"],
  ["strategy_goals", "Goal Progress"],
  ["strategy_channels", "Channel Plan"],
  ["strategy_audience", "Audience Insights"],
];

export const REPORT_SECTIONS: Opt[] = [
  ["goals", "Goal Progress"],
  ["audience", "Audience Insights"],
  ["channels", "Channel Performance"],
  ["budget", "Budget Variance"],
  ["recommendations", "AI Recommendations"],
];

export const label = (list: Opt[], v: string | null | undefined) => (v ? list.find(([k]) => k === v)?.[1] ?? v : "—");
export const inList = (list: Opt[], v: string) => list.some(([k]) => k === v);

/** Split a textarea into trimmed, non-empty lines (max 20, 200 chars each). */
export const lines = (v: string) =>
  v
    .split(/\r?\n/)
    .map((l) => l.trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, 20);
