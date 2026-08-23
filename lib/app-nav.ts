export interface AppNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: { label: string; href: string }[];
}

export interface AppNavSection {
  label: string;
  items: AppNavItem[];
}

export const APP_NAV: AppNavSection[] = [
  {
    label: "AI Suite",
    items: [
      {
        label: "AI Advisor",
        href: "/app/ai-advisor",
        icon: "sparkles",
        badge: "New",
        children: [
          { label: "Overview", href: "/app/ai-advisor" },
          { label: "Ask AI Advisor", href: "/app/ai-advisor/ask" },
          { label: "Recommendation History", href: "/app/ai-advisor/history" },
          { label: "Saved Insights", href: "/app/ai-advisor/saved" },
          { label: "Action Plans", href: "/app/ai-advisor/action-plans" },
        ],
      },
      { label: "Growth Audit", href: "/app/growth-audit", icon: "search" },
      { label: "Marketing Strategy", href: "/app/strategy", icon: "target" },
      { label: "AI Workspace", href: "/app/workspace", icon: "layers" },
      { label: "Content Intelligence", href: "/app/content-intelligence", icon: "brain" },
    ],
  },
  {
    label: "Execute",
    items: [
      { label: "Creative Studio", href: "/app/creative-studio", icon: "wand" },
      { label: "Social Publishing", href: "/app/social", icon: "share" },
      { label: "Marketing Automation", href: "/app/marketing", icon: "workflow" },
      { label: "CRM", href: "/app/crm", icon: "users" },
    ],
  },
  {
    label: "Measure & Connect",
    items: [
      { label: "Analytics & Reports", href: "/app/analytics", icon: "bar-chart" },
      { label: "Integrations", href: "/app/integrations", icon: "plug" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "My Projects", href: "/app/creative-studio/projects", icon: "folder" },
      { label: "My Assets", href: "/app/workspace/assets", icon: "image" },
      { label: "Campaign Center", href: "/app/marketing/campaigns", icon: "megaphone" },
      { label: "Onboarding", href: "/app/onboarding", icon: "sparkles" },
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
  {
    label: "Administration",
    items: [
      { label: "Users & Roles", href: "/app/settings/users", icon: "user-cog" },
      { label: "Brand Settings", href: "/app/settings/brand", icon: "palette" },
      { label: "Billing & Plans", href: "/app/settings/billing", icon: "credit-card" },
      { label: "Notifications", href: "/app/notifications", icon: "bell" },
      { label: "Audit & Activity Logs", href: "/app/settings/audit", icon: "scroll" },
      { label: "Settings", href: "/app/settings", icon: "settings" },
      { label: "Help & Support", href: "/app/help", icon: "help" },
    ],
  },
];
