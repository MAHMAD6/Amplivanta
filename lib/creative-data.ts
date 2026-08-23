export type ProjectStatus = "Draft" | "In Review" | "Approved" | "Published" | "Archived";
export const PROJECT_STATUS_TONE = { Draft: "gray", "In Review": "amber", Approved: "green", Published: "blue", Archived: "red" } as const;

export interface CreativeProject {
  id: string;
  name: string;
  type: "Image" | "Video" | "Graphic" | "Document" | "Presentation" | "Ad" | "Carousel";
  status: ProjectStatus;
  owner: string;
  collaborators: string[];
  updatedAt: string;
  thumb: string;
  tags: string[];
  starred?: boolean;
  folder?: string;
}

const grads = [
  "from-violet/30 via-fuchsia-200/60 to-orange-brand/30",
  "from-blue-500/30 via-violet/20 to-pink-brand/25",
  "from-emerald-500/25 via-teal-500/20 to-blue-500/25",
  "from-orange-brand/30 via-amber-400/25 to-pink-brand/30",
  "from-pink-brand/30 via-fuchsia-300/30 to-violet/30",
  "from-teal-500/25 via-emerald-400/25 to-lime-400/25",
  "from-indigo-500/25 via-violet/25 to-fuchsia-300/25",
  "from-amber-400/30 via-orange-brand/25 to-red-400/25",
];

export const PROJECTS: CreativeProject[] = [
  { id: "pr1", name: "Spring Product Launch — Hero Image", type: "Image", status: "Published", owner: "Sarah Johnson", collaborators: ["Emily Davis"], updatedAt: "2h ago", thumb: grads[0], tags: ["spring", "hero"], starred: true, folder: "Spring Launch" },
  { id: "pr2", name: "Q3 Webinar — Countdown Video", type: "Video", status: "In Review", owner: "Marcus Lee", collaborators: ["Sarah Chen", "Alex Johnson"], updatedAt: "5h ago", thumb: grads[1], tags: ["webinar"], folder: "Events" },
  { id: "pr3", name: "Case Study Carousel — BrightTech", type: "Carousel", status: "Approved", owner: "Emily Davis", collaborators: [], updatedAt: "1d ago", thumb: grads[2], tags: ["case-study", "carousel"], starred: true },
  { id: "pr4", name: "Growth Audit — Landing Hero", type: "Graphic", status: "Draft", owner: "Marcus Lee", collaborators: ["Emily Davis"], updatedAt: "1d ago", thumb: grads[3], tags: ["landing"] },
  { id: "pr5", name: "Q3 Board Deck", type: "Presentation", status: "In Review", owner: "Alex Johnson", collaborators: ["Priya Ramesh"], updatedAt: "2d ago", thumb: grads[4], tags: ["deck"] },
  { id: "pr6", name: "LinkedIn Ad — Enterprise ABM", type: "Ad", status: "Published", owner: "Priya Ramesh", collaborators: [], updatedAt: "3d ago", thumb: grads[5], tags: ["ad", "linkedin"], starred: true },
  { id: "pr7", name: "Onboarding Guide — v3", type: "Document", status: "Approved", owner: "Sarah Chen", collaborators: ["Emily Davis"], updatedAt: "4d ago", thumb: grads[6], tags: ["onboarding"] },
  { id: "pr8", name: "Winback Email Header", type: "Image", status: "Draft", owner: "Sarah Johnson", collaborators: [], updatedAt: "1w ago", thumb: grads[7], tags: ["email"] },
];

export interface AssetImage {
  id: string;
  title: string;
  category: "My Images" | "AI Generated" | "Stock" | "Favorites";
  thumb: string;
  size: string;
  dimensions: string;
  createdAt: string;
  prompt?: string;
  starred?: boolean;
}

export const ASSETIMAGES: AssetImage[] = [
  { id: "im1", title: "Spring launch hero", category: "AI Generated", thumb: grads[0], size: "2.4 MB", dimensions: "1920 × 1080", createdAt: "2h ago", prompt: "vibrant gradient spring launch hero, modern SaaS style", starred: true },
  { id: "im2", title: "Product screenshot 1", category: "My Images", thumb: grads[1], size: "820 KB", dimensions: "1440 × 900", createdAt: "5h ago" },
  { id: "im3", title: "Stock — Team collaboration", category: "Stock", thumb: grads[2], size: "1.2 MB", dimensions: "2000 × 1333", createdAt: "1d ago" },
  { id: "im4", title: "AI — Abstract wave", category: "AI Generated", thumb: grads[3], size: "1.8 MB", dimensions: "2048 × 2048", createdAt: "1d ago", prompt: "abstract violet-pink-orange gradient wave, minimal", starred: true },
  { id: "im5", title: "Founder headshot", category: "My Images", thumb: grads[4], size: "620 KB", dimensions: "1024 × 1024", createdAt: "2d ago" },
  { id: "im6", title: "Growth chart illustration", category: "AI Generated", thumb: grads[5], size: "1.4 MB", dimensions: "1600 × 900", createdAt: "3d ago", prompt: "growth chart illustration, on-brand palette" },
  { id: "im7", title: "Stock — Coffee shop", category: "Stock", thumb: grads[6], size: "980 KB", dimensions: "2400 × 1600", createdAt: "4d ago" },
  { id: "im8", title: "Product hero — dark", category: "AI Generated", thumb: grads[7], size: "2.1 MB", dimensions: "1920 × 1080", createdAt: "1w ago", prompt: "dark product hero, spotlight left, gradient right" },
];

export const IMAGES = ASSETIMAGES;

export interface Graphic {
  id: string;
  name: string;
  type: "Social Post" | "Story" | "Ad" | "Banner" | "Presentation" | "Custom";
  size: string;
  thumb: string;
  updatedAt: string;
  status: ProjectStatus;
}

export const GRAPHICS: Graphic[] = [
  { id: "g1", name: "Instagram Post — Spring", type: "Social Post", size: "1080×1080", thumb: grads[0], updatedAt: "2h ago", status: "Published" },
  { id: "g2", name: "LinkedIn Ad — Enterprise", type: "Ad", size: "1200×628", thumb: grads[1], updatedAt: "5h ago", status: "Approved" },
  { id: "g3", name: "Story — Countdown", type: "Story", size: "1080×1920", thumb: grads[2], updatedAt: "1d ago", status: "Draft" },
  { id: "g4", name: "Website Banner — Growth Audit", type: "Banner", size: "1920×400", thumb: grads[3], updatedAt: "1d ago", status: "Published" },
  { id: "g5", name: "Q3 Deck — Cover", type: "Presentation", size: "1920×1080", thumb: grads[4], updatedAt: "2d ago", status: "In Review" },
  { id: "g6", name: "Twitter Header — Refresh", type: "Custom", size: "1500×500", thumb: grads[5], updatedAt: "1w ago", status: "Published" },
];

export interface Video {
  id: string;
  name: string;
  duration: string;
  platform: string;
  status: "Ready" | "Rendering" | "Published" | "Failed";
  thumb: string;
  views?: number;
  engagement?: number;
  createdAt: string;
}

export const VIDEOS: Video[] = [
  { id: "v1", name: "Growth Hacking — Ep 12", duration: "6:24", platform: "YouTube", status: "Published", thumb: grads[0], views: 12480, engagement: 6.2, createdAt: "2d ago" },
  { id: "v2", name: "AI Advisor — 60s explainer", duration: "1:00", platform: "LinkedIn · X", status: "Published", thumb: grads[1], views: 8420, engagement: 4.8, createdAt: "4d ago" },
  { id: "v3", name: "Case study — BrightTech", duration: "2:12", platform: "YouTube · LinkedIn", status: "Ready", thumb: grads[2], createdAt: "1d ago" },
  { id: "v4", name: "Product tour — CRM", duration: "3:48", platform: "YouTube", status: "Rendering", thumb: grads[3], createdAt: "12 min ago" },
  { id: "v5", name: "Behind the scenes — team", duration: "0:45", platform: "TikTok · Reels", status: "Ready", thumb: grads[4], createdAt: "6h ago" },
  { id: "v6", name: "Winback promo — failed render", duration: "0:30", platform: "TikTok", status: "Failed", thumb: grads[5], createdAt: "1d ago" },
];

export interface Document {
  id: string;
  name: string;
  type: "Blog" | "Case Study" | "Guide" | "Proposal" | "Doc";
  size: string;
  updatedAt: string;
  owner: string;
  status: ProjectStatus;
}

export const DOCUMENTS: Document[] = [
  { id: "dc1", name: "Growth Playbook — August", type: "Guide", size: "4.2 MB", updatedAt: "2h ago", owner: "Sarah Chen", status: "Published" },
  { id: "dc2", name: "BrightTech Case Study", type: "Case Study", size: "2.8 MB", updatedAt: "5h ago", owner: "Emily Davis", status: "Approved" },
  { id: "dc3", name: "Enterprise Proposal — Draft v3", type: "Proposal", size: "1.6 MB", updatedAt: "1d ago", owner: "Alex Johnson", status: "Draft" },
  { id: "dc4", name: "Blog — AI in Lifecycle Marketing", type: "Blog", size: "820 KB", updatedAt: "1d ago", owner: "Priya Ramesh", status: "In Review" },
  { id: "dc5", name: "Onboarding Guide v3", type: "Guide", size: "3.4 MB", updatedAt: "3d ago", owner: "Marcus Lee", status: "Approved" },
  { id: "dc6", name: "MSA Template", type: "Doc", size: "180 KB", updatedAt: "1w ago", owner: "Sarah Chen", status: "Published" },
];

export interface BrandKit {
  id: string;
  name: string;
  isDefault: boolean;
  colors: string[];
  fonts: { display: string; body: string };
  logos: number;
  guidelines: string;
  updatedAt: string;
}

export const BRANDKITS: BrandKit[] = [
  { id: "bk1", name: "Amplivanta Primary", isDefault: true, colors: ["#6D3BF5", "#E8398F", "#F5731A", "#0d0b18", "#f8f7fb", "#10b981"], fonts: { display: "Manrope", body: "Inter" }, logos: 4, guidelines: "Amplivanta primary — violet → pink → orange gradient. Use grad-brand-2 for hero, grad-cta for CTAs. Never use pure black; use ink #14121f.", updatedAt: "2 weeks ago" },
  { id: "bk2", name: "Amplivanta Dark", isDefault: false, colors: ["#0d0b18", "#26233a", "#6D3BF5", "#E8398F", "#F5731A", "#ffffff"], fonts: { display: "Manrope", body: "Inter" }, logos: 3, guidelines: "For dark-surface contexts. White logo mark on navy background.", updatedAt: "1 month ago" },
  { id: "bk3", name: "Enterprise Sub-brand", isDefault: false, colors: ["#0A66C2", "#0d0b18", "#f8f7fb", "#10b981"], fonts: { display: "Manrope", body: "Inter" }, logos: 2, guidelines: "Muted enterprise variant for regulated-industry sub-brand.", updatedAt: "3 months ago" },
];

export const BRAND_KITS = BRANDKITS;

export interface CreativeTemplate {
  id: string;
  name: string;
  category: string;
  platform: string;
  size: string;
  featured?: boolean;
  popular?: boolean;
  thumb: string;
  uses: number;
}

export const CREATIVETEMPLATES: CreativeTemplate[] = [
  { id: "ct1", name: "Social — Product Announcement", category: "Social Media", platform: "Instagram", size: "1080×1080", featured: true, popular: true, thumb: grads[0], uses: 842 },
  { id: "ct2", name: "Story — Countdown", category: "Social Media", platform: "Story", size: "1080×1920", featured: true, thumb: grads[1], uses: 620 },
  { id: "ct3", name: "LinkedIn — Case Study Carousel", category: "Social Media", platform: "LinkedIn", size: "1200×1200", popular: true, thumb: grads[2], uses: 428 },
  { id: "ct4", name: "Ad — Enterprise Lead", category: "Ads", platform: "LinkedIn", size: "1200×628", thumb: grads[3], uses: 342 },
  { id: "ct5", name: "Presentation — Sales Deck", category: "Presentations", platform: "Any", size: "1920×1080", featured: true, thumb: grads[4], uses: 240 },
  { id: "ct6", name: "Document — Case Study Layout", category: "Documents", platform: "PDF", size: "A4", thumb: grads[5], uses: 128 },
  { id: "ct7", name: "Video — Product Explainer", category: "Videos", platform: "YouTube · LinkedIn", size: "1920×1080", popular: true, thumb: grads[6], uses: 92 },
  { id: "ct8", name: "Print — Business Card", category: "Print", platform: "Print", size: "3.5×2 in", thumb: grads[7], uses: 64 },
];

export const CREATIVE_TEMPLATES = CREATIVETEMPLATES;
