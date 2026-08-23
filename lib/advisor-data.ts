export const ADVISOR_TABS = [
  { label: "Overview", href: "/app/ai-advisor" },
  { label: "Ask AI Advisor", href: "/app/ai-advisor/ask" },
  { label: "Recommendation History", href: "/app/ai-advisor/history" },
  { label: "Saved Insights", href: "/app/ai-advisor/saved" },
  { label: "Action Plans", href: "/app/ai-advisor/action-plans" },
];

/* ------------------------------------------------------- recommendation history */

export const HISTORY_STATS = [
  { label: "Total Recommendations", sub: "All time", value: "24", icon: "list", tone: "bg-violet/10 text-violet" },
  { label: "Implemented", sub: "33% of total", value: "8", icon: "check", tone: "bg-emerald-500/10 text-emerald-600" },
  { label: "Saved for Later", sub: "50% of total", value: "12", icon: "bookmark", tone: "bg-royal-blue/10 text-royal-blue" },
  { label: "Dismissed", sub: "17% of total", value: "4", icon: "x", tone: "bg-rose-500/10 text-rose-500" },
];

export const HISTORY_ROWS = [
  { title: "Improve Lead Response Time", desc: "Your analysis shows that responding to leads within 15 minutes can increase conversion by 32%.", type: "Sales", typeTone: "bg-royal-blue/10 text-royal-blue", date: "May 30, 2026", time: "10:24 AM", status: "Implemented", statusTone: "text-emerald-600", icon: "users" },
  { title: "Optimize Email Campaign Timing", desc: "Send your next campaign on Tuesday at 10 AM for 18% higher open rates based on recent performance.", type: "Marketing", typeTone: "bg-orange-brand/10 text-orange-brand", date: "May 29, 2026", time: "02:15 PM", status: "Saved for Later", statusTone: "text-amber-600", icon: "mail" },
  { title: "Increase Ad Budget for Best Performing Campaign", desc: "Your 'Spring Promotion' campaign is delivering 2.4x ROAS. Consider increasing budget by 20%.", type: "Advertising", typeTone: "bg-violet/10 text-violet", date: "May 28, 2026", time: "11:47 AM", status: "Implemented", statusTone: "text-emerald-600", icon: "chart" },
  { title: "Leverage UGC in Social Content", desc: "Posts featuring user-generated content are getting 3.6x more engagement. Create 2 similar posts.", type: "Social", typeTone: "bg-emerald-500/10 text-emerald-700", date: "May 27, 2026", time: "09:35 AM", status: "Saved for Later", statusTone: "text-amber-600", icon: "bulb" },
  { title: "Refine Audience Targeting", desc: "Narrow your audience to 'Small Business Owners' for 27% lower CPA.", type: "Advertising", typeTone: "bg-violet/10 text-violet", date: "May 26, 2026", time: "04:20 PM", status: "Dismissed", statusTone: "text-ink-muted", icon: "target" },
];

export const HISTORY_ACTIVITY = { total: 24, implemented: 8, saved: 12, dismissed: 4 };

export const HISTORY_IMPACT = [
  { label: "Lead Conversion Rate", value: "+32%", sub: "vs last 30 days", icon: "trend" },
  { label: "Email Open Rate", value: "+18%", sub: "vs last 30 days", icon: "trend" },
  { label: "ROAS Improvement", value: "+2.4x", sub: "vs last 30 days", icon: "dollar" },
];

/* -------------------------------------------------------------- saved insights */

export const SAVED_STATS = [
  { label: "Total Saved Insights", sub: "+18% vs last 30 days", value: "32", icon: "bookmark", tone: "bg-violet/10 text-violet" },
  { label: "High Priority", sub: "+25% vs last 30 days", value: "12", icon: "flame", tone: "bg-rose-500/10 text-rose-500" },
  { label: "Ready for Action", sub: "+12% vs last 30 days", value: "18", icon: "check", tone: "bg-emerald-500/10 text-emerald-600" },
  { label: "Archived", sub: "+8% vs last 30 days", value: "6", icon: "archive", tone: "bg-ink-muted/10 text-ink-muted" },
];

export const SAVED_ROWS = [
  { title: "Landing Page Drop-off Insight", desc: "72% of drop-offs occur at the pricing section. Simplifying copy can improve conversions by 14%.", category: "Analytics", categoryTone: "bg-violet/10 text-violet", owner: "Growth Team (CRO)", date: "May 30, 2026", time: "10:24 AM", priority: "High", icon: "trend" },
  { title: "High-Intent Leads Need Faster Follow-up", desc: "Leads contacted within 5 minutes convert 3.6x more than those contacted after 30 minutes.", category: "CRM", categoryTone: "bg-orange-brand/10 text-orange-brand", owner: "Sales Team", date: "May 29, 2026", time: "02:15 PM", priority: "High", icon: "mail" },
  { title: "Top Performing Creative Pattern", desc: "Video ads with problem-solution framing have 2.4x higher CTR than other formats.", category: "Advertising", categoryTone: "bg-royal-blue/10 text-royal-blue", owner: "Marketing Team (Performance)", date: "May 28, 2026", time: "11:47 AM", priority: "Medium", icon: "share" },
  { title: "Segment With Rising Churn Risk", desc: "Users who drop below 2 logins/week have 47% higher churn risk in the next 30 days.", category: "Analytics", categoryTone: "bg-violet/10 text-violet", owner: "Customer Success Team", date: "May 27, 2026", time: "09:35 AM", priority: "High", icon: "users" },
  { title: "Email Subject Line Opportunity", desc: "Adding urgency phrases increased open rates by 18% in recent campaigns.", category: "Email Marketing", categoryTone: "bg-emerald-500/10 text-emerald-700", owner: "Growth Team (Email)", date: "May 26, 2026", time: "04:20 PM", priority: "Low", icon: "mail" },
  { title: "ROAS Improvement Pattern", desc: "Campaigns with broader interests but optimized placements show 32% higher ROAS.", category: "Advertising", categoryTone: "bg-royal-blue/10 text-royal-blue", owner: "Paid Media Team", date: "May 25, 2026", time: "01:08 PM", priority: "Medium", icon: "dollar" },
];

export const SAVED_SUMMARY = { total: 32, high: 12, ready: 18, archived: 6, low: 4 };

export const SAVED_OPPORTUNITY_AREAS = [
  { label: "Conversion Optimization", count: 9, pct: 28 },
  { label: "Lead Generation", count: 7, pct: 22 },
  { label: "Email Marketing", count: 6, pct: 19 },
  { label: "Paid Advertising", count: 5, pct: 16 },
  { label: "Customer Retention", count: 3, pct: 9 },
];

export const SAVED_NEXT_STEPS = [
  { title: "Create action plans for 5 high-priority insights", desc: "Focus on quick-win opportunities", icon: "target" },
  { title: "Share 3 insights with your team", desc: "Promote collaboration and alignment", icon: "users" },
  { title: "Review archived insights", desc: "Uncover missed opportunities", icon: "archive" },
];

/* ---------------------------------------------------------------- action plans */

export const ACTION_PLANS = [
  {
    id: "ap1",
    title: "Q3 Conversion Sprint",
    goal: "Lift landing-page conversion by 14%",
    owner: "Growth Team",
    due: "Jul 15, 2026",
    progress: 62,
    status: "On Track",
    statusTone: "bg-emerald-500/10 text-emerald-700",
    tasks: [
      { label: "Rewrite pricing section copy", done: true },
      { label: "A/B test hero CTA", done: true },
      { label: "Add social-proof strip", done: false },
      { label: "Ship mobile layout fix", done: false },
    ],
  },
  {
    id: "ap2",
    title: "Speed-to-Lead Program",
    goal: "Respond to high-intent leads under 5 min",
    owner: "Sales Team",
    due: "Jun 30, 2026",
    progress: 40,
    status: "At Risk",
    statusTone: "bg-amber-500/10 text-amber-700",
    tasks: [
      { label: "Enable instant lead routing", done: true },
      { label: "Add SMS alert for reps", done: false },
      { label: "Set SLA dashboard", done: false },
    ],
  },
  {
    id: "ap3",
    title: "Retention Guardrails",
    goal: "Cut churn in at-risk segment by 20%",
    owner: "Customer Success",
    due: "Aug 20, 2026",
    progress: 18,
    status: "Planning",
    statusTone: "bg-royal-blue/10 text-royal-blue",
    tasks: [
      { label: "Define churn-risk trigger", done: true },
      { label: "Build win-back automation", done: false },
      { label: "Draft re-engagement email", done: false },
    ],
  },
];

export const ACTION_PLAN_STATS = [
  { label: "Active Plans", value: "6", icon: "target", tone: "bg-violet/10 text-violet" },
  { label: "On Track", value: "3", icon: "check", tone: "bg-emerald-500/10 text-emerald-600" },
  { label: "At Risk", value: "2", icon: "flame", tone: "bg-amber-500/10 text-amber-600" },
  { label: "Completed", value: "11", icon: "trophy", tone: "bg-royal-blue/10 text-royal-blue" },
];

/* ------------------------------------------------------------------------- ask */

export const ASK_SUGGESTED = [
  "Why did conversions drop last week?",
  "Which campaigns have the highest ROI?",
  "How can I improve my lead quality?",
  "What content performs best right now?",
  "Where am I losing the most revenue?",
  "Which segment is most at risk of churn?",
];

export const ASK_HISTORY = [
  { q: "Why did conversions drop last week?", when: "2 hours ago" },
  { q: "Which channel has the best ROAS?", when: "Yesterday" },
  { q: "Summarize my top 3 growth opportunities", when: "3 days ago" },
];
