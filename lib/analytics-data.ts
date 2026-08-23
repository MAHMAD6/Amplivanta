export const TRAFFIC_KPIS = [
  { label: "Sessions", value: "42.8K", delta: "12%" },
  { label: "Users", value: "28.4K", delta: "14%" },
  { label: "Pageviews", value: "128K", delta: "18%" },
  { label: "Avg. Session Duration", value: "3:24", delta: "8%" },
];

export const TRAFFIC_SOURCES = [
  { name: "Organic Search", sessions: 16280, share: 38, delta: 14 },
  { name: "Paid Ads", sessions: 11128, share: 26, delta: 18 },
  { name: "Direct", sessions: 6420, share: 15, delta: 6 },
  { name: "Email", sessions: 4280, share: 10, delta: 22 },
  { name: "Social", sessions: 3428, share: 8, delta: 24 },
  { name: "Referral", sessions: 1264, share: 3, delta: 10 },
];

export const TRAFFIC_DEVICES = [
  { name: "Desktop", share: 62, sessions: 26536 },
  { name: "Mobile", share: 34, sessions: 14552 },
  { name: "Tablet", share: 4, sessions: 1712 },
];

export const TRAFFIC_GEO = [
  { country: "United States", sessions: 25680, share: 60 },
  { country: "United Kingdom", sessions: 5136, share: 12 },
  { country: "Germany", sessions: 3424, share: 8 },
  { country: "India", sessions: 2996, share: 7 },
  { country: "Australia", sessions: 2140, share: 5 },
  { country: "Canada", sessions: 1712, share: 4 },
];

export const TRAFFIC_TOP_PAGES = [
  { path: "/", sessions: 12480, bounce: 32, avgTime: "2:12" },
  { path: "/pricing", sessions: 8420, bounce: 42, avgTime: "3:48" },
  { path: "/platform/ai-advisor", sessions: 4280, bounce: 28, avgTime: "4:12" },
  { path: "/blog/growth-loops-vs-funnels", sessions: 3480, bounce: 38, avgTime: "5:24" },
  { path: "/company/about", sessions: 2480, bounce: 46, avgTime: "1:48" },
];

export const CAMPAIGN_ANALYTICS = [
  { name: "Spring Product Launch", reach: 128400, ctr: 4.8, conversions: 842, revenue: 128450, roas: 4.2 },
  { name: "Trial Nurture — SaaS Founders", reach: 8420, ctr: 12.4, conversions: 342, revenue: 62800, roas: 6.4 },
  { name: "Winback Q3", reach: 4280, ctr: 6.2, conversions: 86, revenue: 24800, roas: 2.8 },
  { name: "Enterprise ABM — Top 50", reach: 1240, ctr: 8.4, conversions: 18, revenue: 342000, roas: 12.4 },
  { name: "Growth Audit Promo", reach: 24800, ctr: 3.2, conversions: 240, revenue: 42000, roas: 3.6 },
];

export const CONVERSION_FUNNEL = [
  { stage: "Visitors", value: 42800, pct: 100 },
  { stage: "Engaged Sessions", value: 24800, pct: 58 },
  { stage: "Form Views", value: 8420, pct: 20 },
  { stage: "Form Submits (Leads)", value: 2543, pct: 6 },
  { stage: "MQLs", value: 892, pct: 2.1 },
  { stage: "SQLs", value: 342, pct: 0.8 },
  { stage: "Customers", value: 128, pct: 0.3 },
];

export const ATTRIBUTION_MODELS = ["Last touch", "First touch", "Linear", "Time decay", "Position-based (U-shape)", "Data-driven (AI)"];

export const ATTRIBUTION_CHANNELS = [
  { channel: "Organic Search", revenue: 128400, spend: 7200, roas: 17.8, assisted: 4820 },
  { channel: "Paid Ads (LinkedIn)", revenue: 88400, spend: 22400, roas: 3.9, assisted: 2480 },
  { channel: "Email", revenue: 62400, spend: 5400, roas: 11.6, assisted: 1840 },
  { channel: "Paid Ads (Google)", revenue: 48200, spend: 19200, roas: 2.5, assisted: 1240 },
  { channel: "Social", revenue: 32400, spend: 4200, roas: 7.7, assisted: 890 },
  { channel: "Direct", revenue: 21200, spend: 0, roas: 0, assisted: 620 },
];

export const AI_ANALYTICS_INSIGHTS = [
  { tag: "Insight", tone: "green", title: "Organic + Email drive 55% of revenue", body: "Compounding channels — invest more in SEO content." },
  { tag: "Anomaly", tone: "amber", title: "Google Ads CPL up 22% WoW", body: "Creative fatigue — refresh 3 top ads." },
  { tag: "Opportunity", tone: "violet", title: "Direct traffic converts at 8.4%", body: "Brand demand strong — retarget with dedicated LP." },
  { tag: "Warning", tone: "red", title: "Enterprise deals CAC $18K vs $12K target", body: "Longer sales cycles — reprice or shift channel mix." },
];
