export interface AppNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  /** Visibility key resolved server-side; omit for always-visible items. */
  visibility?: "marketplace" | "browseProducts" | "myPurchases" | "sellOnAmplivanta" | "sellerDashboard";
  children?: { label: string; href: string }[];
}

export interface AppNavSection {
  label: string;
  items: AppNavItem[];
}

/**
 * User Dashboard navigation.
 *
 * Group order and labels follow the approved USER_DASHBOARD_NAVIGATION_TARGET
 * from the Marketplace integration handoff: GROWTH, CRM, MARKETING, CREATIVE,
 * SOCIAL, MARKETPLACE (new, sits after SOCIAL and before ANALYTICS), ANALYTICS,
 * WORKSPACE. Each item points at the route that implements it in this codebase.
 *
 * The old "Partner Marketplace — Coming Soon" entry is intentionally gone: the
 * Marketplace is a real module now, and Partner Program / Affiliate Program stay
 * separate concepts.
 */
export const APP_NAV: AppNavSection[] = [
  {
    label: "Growth",
    items: [
      {
        label: "Growth Intelligence",
        href: "/app/strategy",
        icon: "target",
        children: [
          { label: "Strategy Dashboard", href: "/app/strategy" },
          { label: "Marketing Goals", href: "/app/strategy/goals" },
          { label: "Audience & Buyer Personas", href: "/app/strategy/personas" },
          { label: "Channel Plan & Budget", href: "/app/strategy/channels" },
          { label: "Strategy Reports", href: "/app/strategy/reports" },
        ],
      },
      { label: "AI Workspace", href: "/app/workspace", icon: "layers" },
      {
        label: "AI Advisor",
        href: "/app/ai-advisor",
        icon: "sparkles",
        children: [
          { label: "Overview", href: "/app/ai-advisor" },
          { label: "Ask AI Advisor", href: "/app/ai-advisor/ask" },
          { label: "Recommendation History", href: "/app/ai-advisor/history" },
        ],
      },
      { label: "Saved Insights", href: "/app/ai-advisor/saved", icon: "book" },
      { label: "Action Plans", href: "/app/ai-advisor/action-plans", icon: "compass" },
      { label: "Growth Audit", href: "/app/growth-audit", icon: "search" },
      { label: "Content Intelligence", href: "/app/content-intelligence", icon: "brain" },
    ],
  },
  {
    label: "CRM",
    items: [
      { label: "Contacts", href: "/app/crm/contacts", icon: "users" },
      { label: "Companies", href: "/app/crm/companies", icon: "users" },
      { label: "Deals", href: "/app/crm/deals", icon: "target" },
      { label: "Pipeline", href: "/app/crm", icon: "workflow" },
      { label: "Activities & Tasks", href: "/app/crm/activities", icon: "scroll" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Marketing Automation", href: "/app/marketing", icon: "workflow" },
      { label: "Campaigns", href: "/app/marketing/campaigns", icon: "megaphone" },
      { label: "Workflow Builder", href: "/app/marketing/workflows", icon: "workflow" },
      { label: "Email Campaigns", href: "/app/marketing/emails", icon: "megaphone" },
      { label: "Email Composer", href: "/app/marketing/email-composer", icon: "wand" },
      { label: "Lead Capture Forms", href: "/app/marketing/forms", icon: "template" },
      { label: "Landing Pages", href: "/app/marketing/landing-pages", icon: "template" },
      { label: "Landing Page Builder", href: "/app/marketing/page-builder", icon: "wand" },
      { label: "Segments & Audiences", href: "/app/marketing/segments", icon: "users" },
    ],
  },
  {
    label: "Creative",
    items: [
      { label: "Creative Studio", href: "/app/creative-studio", icon: "wand" },
      { label: "Images", href: "/app/creative-studio/images", icon: "image" },
      { label: "Video", href: "/app/creative-studio/video", icon: "video" },
      { label: "Graphics", href: "/app/creative-studio/graphics", icon: "palette" },
      { label: "Documents", href: "/app/creative-studio/documents", icon: "book" },
      { label: "Brand Kit", href: "/app/creative-studio/brand-kit", icon: "palette" },
      { label: "My Projects", href: "/app/creative-studio/projects", icon: "folder" },
      { label: "Templates", href: "/app/creative-studio/templates", icon: "template" },
    ],
  },
  {
    label: "Social",
    items: [
      { label: "Social Publishing", href: "/app/social", icon: "share" },
      { label: "Calendar", href: "/app/social/calendar", icon: "compass" },
      { label: "Posts", href: "/app/social/posts", icon: "newspaper" },
      { label: "Social Analytics", href: "/app/social/analytics", icon: "bar-chart" },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { label: "Marketplace", href: "/app/marketplace", icon: "store", visibility: "marketplace" },
      { label: "Browse Products", href: "/app/marketplace/products", icon: "search", visibility: "browseProducts" },
      { label: "My Purchases", href: "/app/marketplace/purchases", icon: "bag", visibility: "myPurchases" },
      { label: "Sell on Amplivanta", href: "/app/marketplace/sell", icon: "tag", visibility: "sellOnAmplivanta" },
      { label: "Seller Dashboard", href: "/app/marketplace/seller", icon: "store", visibility: "sellerDashboard" },
      { label: "Affiliate Links", href: "/app/marketplace/affiliate", icon: "tag", visibility: "marketplace" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Performance Overview", href: "/app/analytics", icon: "bar-chart" },
      { label: "Campaign Analytics", href: "/app/analytics/campaigns", icon: "bar-chart" },
      { label: "Conversion & Attribution", href: "/app/analytics/attribution", icon: "target" },
      { label: "Reports", href: "/app/analytics/report-builder", icon: "scroll" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Integrations", href: "/app/integrations", icon: "plug" },
      { label: "Team", href: "/app/settings/users", icon: "user-cog" },
      { label: "Domains", href: "/app/settings/api-domains", icon: "plug" },
      { label: "Usage & Credits", href: "/app/usage-credits", icon: "credit-card" },
      { label: "Settings", href: "/app/settings", icon: "settings" },
      { label: "Help & Support", href: "/app/help", icon: "help" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Resources Hub", href: "/app/resources", icon: "book" },
      { label: "Blog", href: "/app/resources/blog", icon: "newspaper" },
      { label: "Knowledge Base", href: "/app/resources/knowledge-base", icon: "book" },
      { label: "Guides", href: "/app/resources/guides", icon: "compass" },
      { label: "Videos", href: "/app/resources/videos", icon: "video" },
      { label: "Webinars", href: "/app/resources/webinars", icon: "presentation" },
      { label: "Templates", href: "/app/resources/templates", icon: "template" },
      { label: "Help Center", href: "/app/resources/help-center", icon: "life-buoy" },
    ],
  },
];
