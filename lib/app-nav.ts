export interface AppNavItem {
  label: string;
  href: string;
  /** Visibility key resolved server-side; omit for always-visible items. */
  visibility?: "marketplace" | "browseProducts" | "myPurchases" | "sellOnAmplivanta" | "sellerDashboard";
  /** Sub-destinations, shown while the item is active. */
  children?: { label: string; href: string }[];
}

export interface AppNavSection {
  /** Group heading; the root Dashboard has none. */
  label: string | null;
  items: AppNavItem[];
}

/**
 * User Dashboard navigation, exactly as `primary_navigation` in the approved
 * route manifest (2026-09-13): ROOT, GROWTH, CRM, MARKETING, CREATIVE, SOCIAL,
 * MARKETPLACE (after SOCIAL, before ANALYTICS, seller entries conditional),
 * ANALYTICS, WORKSPACE. Top-level labels and order match the manifest; every
 * other approved screen is reachable as a sub-destination of the item it
 * belongs to, so nothing is orphaned.
 */
export const APP_NAV: AppNavSection[] = [
  {
    label: null,
    items: [
      {
        label: "Dashboard",
        href: "/app",
        children: [
          { label: "Platform Home", href: "/app" },
          { label: "Notification Center", href: "/app/notifications" },
        ],
      },
    ],
  },
  {
    label: "Growth",
    items: [
      {
        label: "Growth Intelligence",
        href: "/app/strategy",
        children: [
          { label: "Strategy Dashboard", href: "/app/strategy" },
          { label: "Growth Audit", href: "/app/growth-audit" },
          { label: "Content Ideas", href: "/app/content-intelligence" },
          { label: "Trending Topics", href: "/app/content-intelligence/trending" },
          { label: "Industry News", href: "/app/content-intelligence/news" },
          { label: "Events & Holidays", href: "/app/content-intelligence/events" },
          { label: "Competitor Watch", href: "/app/content-intelligence/competitors" },
          { label: "Marketing Goals", href: "/app/strategy/goals" },
          { label: "Audience & Buyer Personas", href: "/app/strategy/personas" },
          { label: "Channel Plan & Budget", href: "/app/strategy/channels" },
          { label: "Strategy Reports", href: "/app/strategy/reports" },
        ],
      },
      {
        label: "AI Workspace",
        href: "/app/workspace",
        children: [
          { label: "Workspace Home", href: "/app/workspace" },
          { label: "Campaign Plan", href: "/app/workspace/plan" },
          { label: "Content Hub", href: "/app/workspace/content" },
          { label: "Asset Library", href: "/app/workspace/assets" },
          { label: "Automations", href: "/app/workspace/automations" },
          { label: "Tasks", href: "/app/workspace/tasks" },
          { label: "Notes", href: "/app/workspace/notes" },
          { label: "Approvals", href: "/app/workspace/approvals" },
          { label: "Analytics", href: "/app/workspace/analytics" },
          { label: "Activity / History", href: "/app/workspace/activity" },
        ],
      },
      {
        label: "AI Advisor",
        href: "/app/ai-advisor",
        children: [
          { label: "Growth Plan & Recommendations", href: "/app/ai-advisor" },
          { label: "Ask AI Advisor", href: "/app/ai-advisor/ask" },
          { label: "Recommendation History", href: "/app/ai-advisor/history" },
        ],
      },
      { label: "Saved Insights", href: "/app/ai-advisor/saved" },
      { label: "Action Plans", href: "/app/ai-advisor/action-plans" },
    ],
  },
  {
    label: "CRM",
    items: [
      { label: "Contacts", href: "/app/crm/contacts" },
      { label: "Companies", href: "/app/crm/companies" },
      { label: "Deals", href: "/app/crm/deals", children: [{ label: "All Deals", href: "/app/crm/deals" }, { label: "Deal Detail", href: "/app/crm/deal-detail" }] },
      {
        label: "Pipeline",
        href: "/app/crm",
        children: [
          { label: "CRM Dashboard / Pipeline", href: "/app/crm" },
          { label: "Lists & Imports", href: "/app/crm/lists-imports" },
          { label: "CRM Reports", href: "/app/crm/crm-reports" },
        ],
      },
      {
        label: "Activities & Tasks",
        href: "/app/crm/activities",
        children: [
          { label: "Activities", href: "/app/crm/activities" },
          { label: "Task Management", href: "/app/crm/task-management" },
        ],
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Marketing Automation", href: "/app/marketing" },
      { label: "Campaigns", href: "/app/marketing/campaigns" },
      {
        label: "Workflow Builder",
        href: "/app/marketing/workflows",
        children: [
          { label: "Workflow Builder", href: "/app/marketing/workflows" },
          { label: "Automation Templates", href: "/app/marketing/templates" },
          { label: "Trigger / Event Manager", href: "/app/marketing/triggers" },
          { label: "Execution Logs", href: "/app/marketing/execution-logs" },
          { label: "Automation Analytics", href: "/app/marketing/analytics" },
        ],
      },
      {
        label: "Email Campaigns",
        href: "/app/marketing/emails",
        children: [
          { label: "Email Campaigns", href: "/app/marketing/emails" },
          { label: "Email Deliverability", href: "/app/marketing/deliverability" },
        ],
      },
      { label: "Email Composer", href: "/app/marketing/email-composer" },
      {
        label: "Lead Capture Forms",
        href: "/app/marketing/forms",
        children: [
          { label: "Lead Capture Forms", href: "/app/marketing/forms" },
          { label: "Form Submissions Analytics", href: "/app/marketing/form-analytics" },
          { label: "Conversion Settings", href: "/app/marketing/conversion-settings" },
        ],
      },
      {
        label: "Landing Pages",
        href: "/app/marketing/landing-pages",
        children: [
          { label: "Landing Pages", href: "/app/marketing/landing-pages" },
          { label: "Landing Page Templates", href: "/app/marketing/landing-page-templates" },
          { label: "Landing Page Analytics", href: "/app/marketing/landing-page-analytics" },
          { label: "Landing Page Publishing", href: "/app/marketing/publishing" },
          { label: "Publish & Domains", href: "/app/marketing/domains" },
          { label: "A/B Testing", href: "/app/marketing/ab-testing" },
        ],
      },
      { label: "Landing Page Builder", href: "/app/marketing/page-builder" },
      {
        label: "Segments & Audiences",
        href: "/app/marketing/segments",
        children: [
          { label: "Segments & Audiences", href: "/app/marketing/segments" },
          { label: "Lead Scoring", href: "/app/marketing/lead-scoring" },
        ],
      },
    ],
  },
  {
    label: "Creative",
    items: [
      { label: "Creative Studio", href: "/app/creative-studio" },
      { label: "Images", href: "/app/creative-studio/images" },
      { label: "Video", href: "/app/creative-studio/video" },
      { label: "Graphics", href: "/app/creative-studio/graphics" },
      { label: "Documents", href: "/app/creative-studio/documents" },
      { label: "Brand Kit", href: "/app/creative-studio/brand-kit" },
      { label: "My Projects", href: "/app/creative-studio/projects" },
      { label: "Templates", href: "/app/creative-studio/templates" },
    ],
  },
  {
    label: "Social",
    items: [
      {
        label: "Social Publishing",
        href: "/app/social",
        children: [
          { label: "Dashboard", href: "/app/social" },
          { label: "Create Post", href: "/app/social/compose" },
          { label: "Publishing Queue", href: "/app/social/queue" },
          { label: "Approvals", href: "/app/social/approvals" },
          { label: "Content Templates", href: "/app/social/templates" },
          { label: "Hashtags & Mentions", href: "/app/social/hashtags" },
          { label: "Social Accounts", href: "/app/social/accounts" },
          { label: "Integrations", href: "/app/social/integrations" },
          { label: "Team & Roles", href: "/app/social/team" },
          { label: "Activity Log", href: "/app/social/activity" },
          { label: "Platform Settings", href: "/app/social/platform-settings" },
          { label: "Publishing Settings", href: "/app/social/settings" },
        ],
      },
      { label: "Calendar", href: "/app/social/calendar" },
      { label: "Posts", href: "/app/social/posts" },
      { label: "Social Analytics", href: "/app/social/analytics" },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { label: "Marketplace", href: "/app/marketplace", visibility: "marketplace", children: [{ label: "Marketplace Home", href: "/app/marketplace" }, { label: "Favorites", href: "/app/marketplace/favorites" }, { label: "Cart", href: "/app/marketplace/cart" }, { label: "Affiliate Links", href: "/app/marketplace/affiliate" }] },
      { label: "Browse Products", href: "/app/marketplace/products", visibility: "browseProducts" },
      { label: "My Purchases", href: "/app/marketplace/purchases", visibility: "myPurchases" },
      { label: "Sell on Amplivanta", href: "/app/marketplace/sell", visibility: "sellOnAmplivanta" },
      {
        label: "Seller Dashboard",
        href: "/app/marketplace/seller",
        visibility: "sellerDashboard",
        children: [
          { label: "Overview", href: "/app/marketplace/seller" },
          { label: "My Products", href: "/app/marketplace/seller/products" },
          { label: "Add Product", href: "/app/marketplace/seller/products/new" },
          { label: "Orders & Sales", href: "/app/marketplace/seller/orders" },
          { label: "Bundles", href: "/app/marketplace/seller/bundles" },
          { label: "Coupons", href: "/app/marketplace/seller/coupons" },
          { label: "Earnings & Payouts", href: "/app/marketplace/seller/earnings" },
          { label: "Seller Profile & Settings", href: "/app/marketplace/seller/settings" },
        ],
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        label: "Performance Overview",
        href: "/app/analytics",
        children: [
          { label: "Analytics Dashboard", href: "/app/analytics" },
          { label: "Traffic Analytics", href: "/app/analytics/traffic" },
        ],
      },
      { label: "Campaign Analytics", href: "/app/analytics/campaigns" },
      {
        label: "Conversion & Attribution",
        href: "/app/analytics/funnel",
        children: [
          { label: "Conversion Funnel", href: "/app/analytics/funnel" },
          { label: "Revenue Attribution", href: "/app/analytics/attribution" },
        ],
      },
      { label: "Reports", href: "/app/analytics/report-builder" },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        label: "Integrations",
        href: "/app/integrations",
        children: [
          { label: "Integrations Home", href: "/app/integrations" },
          { label: "Connected Apps", href: "/app/integrations/connected" },
          { label: "HubSpot Setup", href: "/app/integrations/hubspot" },
          { label: "Webhooks", href: "/app/integrations/webhooks" },
          { label: "API Keys & Developer Access", href: "/app/integrations/api-keys" },
          { label: "API Documentation", href: "/app/integrations/api-docs" },
          { label: "Import / Export", href: "/app/integrations/import-export" },
        ],
      },
      { label: "Team", href: "/app/settings/users" },
      { label: "Domains", href: "/app/settings/api-domains" },
      { label: "Usage & Credits", href: "/app/usage-credits" },
      {
        label: "Settings",
        href: "/app/settings",
        children: [
          { label: "General Settings", href: "/app/settings" },
          { label: "Billing & Subscription", href: "/app/settings/billing" },
          { label: "Plans & Pricing", href: "/app/settings/billing/plans" },
          { label: "Security & 2FA", href: "/app/settings/security" },
          { label: "Notification Settings", href: "/app/settings/notifications" },
          { label: "Data Management", href: "/app/settings/data" },
          { label: "Audit Log", href: "/app/settings/audit" },
          { label: "Pricing Benchmark", href: "/app/pricing-benchmark" },
        ],
      },
      {
        label: "Help & Support",
        href: "/app/help",
        children: [
          { label: "Help & Support", href: "/app/help" },
          { label: "Resources Hub", href: "/app/resources" },
          { label: "Blog", href: "/app/resources/blog" },
          { label: "Knowledge Base", href: "/app/resources/knowledge-base" },
          { label: "Guides", href: "/app/resources/guides" },
          { label: "Videos", href: "/app/resources/videos" },
          { label: "Webinars", href: "/app/resources/webinars" },
          { label: "Templates", href: "/app/resources/templates" },
        ],
      },
    ],
  },
];

/** Every destination in the navigation, for search and active-state lookups. */
export const NAV_DESTINATIONS: { label: string; href: string; group: string }[] = APP_NAV.flatMap((s) =>
  s.items.flatMap((i) => [{ label: i.label, href: i.href, group: s.label ?? "Dashboard" }, ...(i.children ?? []).filter((c) => c.href !== i.href).map((c) => ({ label: c.label, href: c.href, group: `${s.label ?? "Dashboard"} · ${i.label}` }))]),
);
