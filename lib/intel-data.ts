export type IdeaChannel = "Blog" | "Social" | "Email" | "Video" | "Ad";
export type IdeaGoal = "Awareness" | "Lead Gen" | "Retention" | "Thought Leadership";

export interface ContentIdea {
  id: string;
  title: string;
  hook: string;
  channel: IdeaChannel;
  goal: IdeaGoal;
  theme: string;
  score: number;
  saved?: boolean;
}

export const IDEAS: ContentIdea[] = [
  { id: "id1", title: "The 12 signals worth scoring in PLG", hook: "Steal the exact model we use to score product-qualified leads.", channel: "Blog", goal: "Thought Leadership", theme: "PLG scoring", score: 92, saved: true },
  { id: "id2", title: "Why funnels leak and loops compound", hook: "Redraw your growth as a loop, not a funnel. 5-min read.", channel: "Blog", goal: "Awareness", theme: "Growth frameworks", score: 88 },
  { id: "id3", title: "60s explainer — AI Advisor in action", hook: "Watch one prompt turn into a scored playbook and a live campaign.", channel: "Video", goal: "Lead Gen", theme: "Product demo", score: 86, saved: true },
  { id: "id4", title: "Carousel — 5 CAC-cutting playbooks", hook: "5 slides, 5 plays that shaved 15–40% off CAC.", channel: "Social", goal: "Awareness", theme: "CAC reduction", score: 84 },
  { id: "id5", title: "Winback subject line teardown", hook: "3 subjects that lifted open rate 40% on dormant accounts.", channel: "Email", goal: "Retention", theme: "Email creative", score: 78 },
  { id: "id6", title: "LinkedIn ad — 'Amplivanta replaced 6 tools'", hook: "Social-proof driven ad copy, ready to launch.", channel: "Ad", goal: "Lead Gen", theme: "Consolidation", score: 76 },
  { id: "id7", title: "How our audit spotted a hidden channel", hook: "Story-driven case study from BrightTech.", channel: "Blog", goal: "Thought Leadership", theme: "Case study", score: 82, saved: true },
  { id: "id8", title: "Attribution that survives the boardroom", hook: "Model finance signs off on, without pretending single-touch works.", channel: "Blog", goal: "Thought Leadership", theme: "Attribution", score: 80 },
];

export const IDEA_TOP_THEMES = [
  { theme: "PLG scoring", views: 42800, delta: 24 },
  { theme: "Attribution", views: 24800, delta: 18 },
  { theme: "AI in lifecycle", views: 18400, delta: 32 },
  { theme: "CAC reduction", views: 12400, delta: 12 },
];

export const IDEA_UPCOMING = [
  { date: "Aug 20", label: "Amplivanta webinar — AI Playbook" },
  { date: "Aug 25", label: "Q4 planning kickoff" },
  { date: "Sep 4", label: "Labor Day (US)" },
  { date: "Sep 12", label: "SaaS Growth Summit" },
];

export interface Trend {
  id: string;
  topic: string;
  source: "X" | "Reddit" | "LinkedIn" | "News" | "TikTok";
  industry: string;
  country: string;
  mentions: number;
  engagement: number;
  velocity: number;
  hashtags: string[];
  channels: string[];
  updatedAt: string;
}

export const TRENDS: Trend[] = [
  { id: "tr1", topic: "AI-native marketing stacks", source: "LinkedIn", industry: "SaaS", country: "US", mentions: 12840, engagement: 8.4, velocity: 42, hashtags: ["#AI", "#Martech", "#GrowthStack"], channels: ["LinkedIn", "Blog"], updatedAt: "2 min ago" },
  { id: "tr2", topic: "Product-led growth scorecards", source: "X", industry: "SaaS", country: "US", mentions: 8420, engagement: 6.2, velocity: 28, hashtags: ["#PLG", "#SaaS"], channels: ["X", "Blog"], updatedAt: "12 min ago" },
  { id: "tr3", topic: "Attribution in a cookieless world", source: "News", industry: "Marketing", country: "Global", mentions: 6240, engagement: 4.8, velocity: 18, hashtags: ["#Attribution", "#Privacy"], channels: ["Blog", "Email"], updatedAt: "1 h ago" },
  { id: "tr4", topic: "TikTok Shop for B2B services", source: "TikTok", industry: "E-commerce", country: "US", mentions: 4280, engagement: 12.4, velocity: 84, hashtags: ["#TikTokShop"], channels: ["TikTok"], updatedAt: "2 h ago" },
  { id: "tr5", topic: "Community-led growth playbooks", source: "Reddit", industry: "SaaS", country: "Global", mentions: 3120, engagement: 5.4, velocity: 22, hashtags: ["#Community", "#GTM"], channels: ["Blog", "Community"], updatedAt: "4 h ago" },
  { id: "tr6", topic: "AI SDR automation ethics", source: "LinkedIn", industry: "Sales", country: "EU", mentions: 2480, engagement: 7.8, velocity: 12, hashtags: ["#AIsales", "#Ethics"], channels: ["LinkedIn"], updatedAt: "6 h ago" },
];

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  topic: string;
  relevance: number;
  published: string;
  summary: string;
  impact: "High" | "Medium" | "Low";
}

export const NEWS: NewsItem[] = [
  { id: "n1", title: "Google removes third-party cookies from Chrome — final rollout Q3", source: "The Verge", topic: "Privacy", relevance: 96, published: "2 h ago", summary: "Ends multi-year deprecation; sunset for cookie-based attribution accelerates first-party investment.", impact: "High" },
  { id: "n2", title: "LinkedIn opens ads API for AI creative generation partners", source: "TechCrunch", topic: "AdTech", relevance: 88, published: "5 h ago", summary: "Direct integration of AI-generated ads with LinkedIn Campaign Manager, available to select partners.", impact: "High" },
  { id: "n3", title: "New CAN-SPAM update proposes stricter consent for B2B email", source: "Marketing Brew", topic: "Compliance", relevance: 84, published: "1 d ago", summary: "Public comment period open; will affect cold outbound and re-engagement flows.", impact: "Medium" },
  { id: "n4", title: "OpenAI announces multimodal advertising models", source: "Bloomberg", topic: "AI", relevance: 82, published: "1 d ago", summary: "New models can generate video ad variants from a single brief; developer preview next month.", impact: "Medium" },
  { id: "n5", title: "HubSpot acquires Clearbit for $150M", source: "Reuters", topic: "M&A", relevance: 78, published: "2 d ago", summary: "Tighter enrichment inside HubSpot CRM; expect pricing shifts for standalone Clearbit customers.", impact: "Medium" },
  { id: "n6", title: "State of SaaS 2026 — median CAC up 22%", source: "OpenView", topic: "Benchmarks", relevance: 72, published: "3 d ago", summary: "Annual report; teams tightening spend and doubling down on retention.", impact: "Low" },
];

export const NEWSITEMS = NEWS;

export interface EventItem {
  id: string;
  name: string;
  date: string;
  category: "Holiday" | "Awareness" | "Industry" | "Company";
  country: string;
  opportunityScore: number;
  suggestedContent: string;
}

export const EVENTS: EventItem[] = [
  { id: "ev1", name: "Labor Day (US)", date: "Sep 4, 2026", category: "Holiday", country: "US", opportunityScore: 62, suggestedContent: "Team appreciation post + long-weekend office closure notice." },
  { id: "ev2", name: "SaaS Growth Summit", date: "Sep 12, 2026", category: "Industry", country: "Global (virtual)", opportunityScore: 92, suggestedContent: "Live thread from talks + booth-visit CTA + recap blog." },
  { id: "ev3", name: "International Podcast Day", date: "Sep 30, 2026", category: "Awareness", country: "Global", opportunityScore: 54, suggestedContent: "Roundup of 5 growth podcasts your team should follow." },
  { id: "ev4", name: "Amplivanta Webinar — AI Playbook", date: "Aug 20, 2026", category: "Company", country: "Global (virtual)", opportunityScore: 100, suggestedContent: "Registration LP + email nurture + reminder SMS + LinkedIn event." },
  { id: "ev5", name: "Small Business Saturday (US)", date: "Nov 29, 2026", category: "Awareness", country: "US", opportunityScore: 68, suggestedContent: "Support-small-biz campaign spotlighting Amplivanta customers." },
  { id: "ev6", name: "Black Friday", date: "Nov 28, 2026", category: "Holiday", country: "Global", opportunityScore: 88, suggestedContent: "BF pricing landing page + email drip + retargeting ads." },
];

export interface Competitor {
  id: string;
  name: string;
  handle: string;
  followers: number;
  followersDelta: number;
  postsPerWeek: number;
  topThemes: string[];
  logoLetter: string;
  logoTone: string;
}

export const COMPETITORS: Competitor[] = [
  { id: "cp1", name: "GrowthLoop", handle: "@growthloop", followers: 42800, followersDelta: 12, postsPerWeek: 14, topThemes: ["PLG", "Attribution"], logoLetter: "G", logoTone: "bg-violet/15 text-violet" },
  { id: "cp2", name: "NextForm", handle: "@nextform", followers: 28400, followersDelta: 8, postsPerWeek: 10, topThemes: ["Forms", "CRO"], logoLetter: "N", logoTone: "bg-blue-500/15 text-blue-600" },
  { id: "cp3", name: "BuildRev", handle: "@buildrev", followers: 62400, followersDelta: 22, postsPerWeek: 22, topThemes: ["Revenue ops", "SaaS"], logoLetter: "B", logoTone: "bg-pink-brand/15 text-pink-brand" },
  { id: "cp4", name: "PulseIO", handle: "@pulseio", followers: 18400, followersDelta: -4, postsPerWeek: 6, topThemes: ["Analytics", "Retention"], logoLetter: "P", logoTone: "bg-emerald-500/15 text-emerald-600" },
];

export const COMPETITOR_POSTS = [
  { competitor: "GrowthLoop", platform: "LinkedIn", excerpt: "How we cut CAC 32% with a redesigned loop", engagement: 4820, theme: "CAC reduction" },
  { competitor: "BuildRev", platform: "X", excerpt: "Playbook: 5 revenue-ops motions that don't need a new tool", engagement: 3120, theme: "Revenue ops" },
  { competitor: "NextForm", platform: "Blog", excerpt: "Compliance-ready forms — a practical guide", engagement: 2480, theme: "Forms" },
  { competitor: "GrowthLoop", platform: "LinkedIn", excerpt: "Attribution that survives a cookieless world", engagement: 2240, theme: "Attribution" },
  { competitor: "BuildRev", platform: "YouTube", excerpt: "Deep dive: PQL scoring signals worth using", engagement: 1840, theme: "PLG" },
];

export const COMPETITOR_OPPORTUNITIES = [
  { title: "Gap: no one's ranking for 'AI growth score'", body: "GrowthLoop dominates 'growth loops'; keyword 'AI growth score' has no top-3 leader — you can own it." },
  { title: "Format gap: no short explainer videos", body: "Competitors post 6+ minute videos. Under-60s explainers are unclaimed on LinkedIn." },
  { title: "Comparison keyword opportunity", body: "'BuildRev vs' searches climbed 18% MoM — publish a Amplivanta vs BuildRev page." },
];
