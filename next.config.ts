import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for Docker (.next/standalone).
  output: "standalone",
  // Keep server-only queue deps out of the bundle. bullmq lazily requires an
  // optional valkey-glide client that isn't installed; externalizing lets it
  // resolve ioredis at runtime instead of failing the build bundle.
  serverExternalPackages: ["bullmq", "ioredis"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/webp", "image/avif"],
  },
  /**
   * The approved handoff route manifests use route names that differ from the
   * ones this codebase implements. Rather than renaming ~100 live routes, every
   * approved production_route is served as a redirect to its implementing route,
   * so links from the manifests, prototypes and documentation all resolve.
   *
   * Generated from the User Dashboard and Marketplace route manifests; all 104
   * User Dashboard screens resolve (91 redirected, 12 already native, 1 —
   * Partner Marketplace "coming soon" — intentionally removed by the Marketplace
   * handoff, which replaces it with the real Marketplace module).
   */
  async redirects() {
    return [
      // The Super Admin console moved to /admin; keep old links working.
      { source: "/super", destination: "/admin", permanent: false },
      { source: "/super/:path*", destination: "/admin/:path*", permanent: false },
      { source: "/app/platform-experience-pricing/platform-home-executive-dashboard", destination: "/app", permanent: false },
      { source: "/app/platform-experience-pricing/notification-center", destination: "/app/notifications", permanent: false },
      { source: "/app/platform-experience-pricing/pricing-plans-overview", destination: "/app/settings/billing", permanent: false },
      { source: "/app/platform-experience-pricing/pricing-benchmark-and-positioning", destination: "/app/pricing-benchmark", permanent: false },
      { source: "/app/growth-intelligence/strategy-dashboard", destination: "/app/strategy", permanent: false },
      { source: "/app/growth-intelligence/marketing-goals", destination: "/app/strategy/goals", permanent: false },
      { source: "/app/growth-intelligence/audience-and-buyer-personas", destination: "/app/strategy/personas", permanent: false },
      { source: "/app/growth-intelligence/channel-plan-and-budget", destination: "/app/strategy/channels", permanent: false },
      { source: "/app/growth-intelligence/strategy-reports", destination: "/app/strategy/reports", permanent: false },
      { source: "/app/growth-intelligence/ai-advisor-growth-plan-and-recommendations", destination: "/app/ai-advisor", permanent: false },
      { source: "/app/growth-intelligence/growth-audit-setup-and-results", destination: "/app/growth-audit", permanent: false },
      { source: "/app/growth-intelligence/content-ideas", destination: "/app/content-intelligence", permanent: false },
      { source: "/app/growth-intelligence/trending-topics", destination: "/app/content-intelligence/trending", permanent: false },
      { source: "/app/growth-intelligence/industry-news", destination: "/app/content-intelligence/news", permanent: false },
      { source: "/app/growth-intelligence/events-holidays", destination: "/app/content-intelligence/events", permanent: false },
      { source: "/app/growth-intelligence/competitor-watch", destination: "/app/content-intelligence/competitors", permanent: false },
      { source: "/app/growth/saved-insights", destination: "/app/ai-advisor/saved", permanent: false },
      { source: "/app/growth/action-plans", destination: "/app/ai-advisor/action-plans", permanent: false },
      { source: "/app/ai-workspace/ai-workspace-home", destination: "/app/workspace", permanent: false },
      { source: "/app/ai-workspace/campaign-plan", destination: "/app/workspace/plan", permanent: false },
      { source: "/app/ai-workspace/content-hub", destination: "/app/workspace/content", permanent: false },
      { source: "/app/ai-workspace/asset-library", destination: "/app/workspace/assets", permanent: false },
      { source: "/app/ai-workspace/automations", destination: "/app/workspace/automations", permanent: false },
      { source: "/app/ai-workspace/analytics", destination: "/app/workspace/analytics", permanent: false },
      { source: "/app/ai-workspace/tasks", destination: "/app/workspace/tasks", permanent: false },
      { source: "/app/ai-workspace/notes", destination: "/app/workspace/notes", permanent: false },
      { source: "/app/ai-workspace/approvals", destination: "/app/workspace/approvals", permanent: false },
      { source: "/app/ai-workspace/activity-history", destination: "/app/workspace/activity", permanent: false },
      { source: "/app/crm/crm-dashboard-pipeline", destination: "/app/crm", permanent: false },
      { source: "/app/crm/deal-detail", destination: "/app/crm/deals", permanent: false },
      { source: "/app/crm/task-management", destination: "/app/crm/tasks", permanent: false },
      { source: "/app/crm/crm-reports", destination: "/app/crm/reports", permanent: false },
      { source: "/app/crm/lists-imports", destination: "/app/integrations/import-export", permanent: false },
      { source: "/app/marketing-automation/marketing-automation-dashboard", destination: "/app/marketing", permanent: false },
      { source: "/app/marketing-automation/campaigns", destination: "/app/marketing/campaigns", permanent: false },
      { source: "/app/marketing-automation/workflow-builder", destination: "/app/marketing/workflows", permanent: false },
      { source: "/app/marketing-automation/email-campaigns", destination: "/app/marketing/emails", permanent: false },
      { source: "/app/marketing-automation/email-composer", destination: "/app/marketing/email-composer", permanent: false },
      { source: "/app/marketing-automation/lead-capture-forms", destination: "/app/marketing/forms", permanent: false },
      { source: "/app/marketing-automation/landing-pages", destination: "/app/marketing/landing-pages", permanent: false },
      { source: "/app/marketing-automation/landing-page-builder", destination: "/app/marketing/page-builder", permanent: false },
      { source: "/app/marketing-automation/landing-page-templates", destination: "/app/marketing/templates", permanent: false },
      { source: "/app/marketing-automation/landing-page-analytics", destination: "/app/marketing/analytics", permanent: false },
      { source: "/app/marketing-automation/landing-page-publishing", destination: "/app/marketing/publishing", permanent: false },
      { source: "/app/marketing-automation/a-b-testing", destination: "/app/marketing/ab-testing", permanent: false },
      { source: "/app/marketing-automation/conversion-settings", destination: "/app/marketing/conversion-settings", permanent: false },
      { source: "/app/marketing-automation/segments-and-audiences", destination: "/app/marketing/segments", permanent: false },
      { source: "/app/marketing-automation/lead-scoring", destination: "/app/marketing/lead-scoring", permanent: false },
      { source: "/app/marketing-automation/automation-templates", destination: "/app/marketing/templates", permanent: false },
      { source: "/app/marketing-automation/automation-analytics", destination: "/app/marketing/analytics", permanent: false },
      { source: "/app/marketing-automation/form-submissions-analytics", destination: "/app/marketing/form-analytics", permanent: false },
      { source: "/app/marketing-automation/automation-execution-logs", destination: "/app/marketing/execution-logs", permanent: false },
      { source: "/app/marketing-automation/publish-and-domains", destination: "/app/marketing/domains", permanent: false },
      { source: "/app/marketing-automation/email-deliverability", destination: "/app/marketing/deliverability", permanent: false },
      { source: "/app/marketing-automation/trigger-event-manager", destination: "/app/marketing/triggers", permanent: false },
      { source: "/app/creative-studio/creative-studio-overview", destination: "/app/creative-studio", permanent: false },
      { source: "/app/creative-studio/my-projects", destination: "/app/creative-studio/projects", permanent: false },
      { source: "/app/social-publishing/social-publishing-dashboard", destination: "/app/social", permanent: false },
      { source: "/app/social-publishing/create-post-composer", destination: "/app/social/compose", permanent: false },
      { source: "/app/social-publishing/content-calendar", destination: "/app/social/calendar", permanent: false },
      { source: "/app/social-publishing/posts-content-library", destination: "/app/social/posts", permanent: false },
      { source: "/app/social-publishing/approvals", destination: "/app/social/approvals", permanent: false },
      { source: "/app/social-publishing/social-analytics", destination: "/app/social/analytics", permanent: false },
      { source: "/app/social-publishing/social-accounts", destination: "/app/social/accounts", permanent: false },
      { source: "/app/social-publishing/social-publishing-settings", destination: "/app/social/settings", permanent: false },
      { source: "/app/social-publishing/integrations", destination: "/app/social/integrations", permanent: false },
      { source: "/app/social-publishing/team-and-roles", destination: "/app/social/team", permanent: false },
      { source: "/app/social-publishing/hashtags-and-mentions-library", destination: "/app/social/hashtags", permanent: false },
      { source: "/app/social-publishing/content-templates", destination: "/app/social/templates", permanent: false },
      { source: "/app/social-publishing/publishing-queue", destination: "/app/social/queue", permanent: false },
      { source: "/app/social-publishing/activity-log", destination: "/app/social/activity", permanent: false },
      { source: "/app/social-publishing/platform-settings", destination: "/app/social/platform-settings", permanent: false },
      { source: "/app/analytics-reports/analytics-dashboard-performance-overview", destination: "/app/analytics", permanent: false },
      { source: "/app/analytics-reports/traffic-analytics", destination: "/app/analytics/traffic", permanent: false },
      { source: "/app/analytics-reports/campaign-analytics", destination: "/app/analytics/campaigns", permanent: false },
      { source: "/app/analytics-reports/conversion-funnel", destination: "/app/analytics/funnel", permanent: false },
      { source: "/app/analytics-reports/revenue-attribution", destination: "/app/analytics/attribution", permanent: false },
      { source: "/app/analytics-reports/report-builder", destination: "/app/analytics/report-builder", permanent: false },
      { source: "/app/integrations/integrations-home", destination: "/app/integrations", permanent: false },
      { source: "/app/integrations/connected-apps", destination: "/app/integrations/connected", permanent: false },
      { source: "/app/integrations/hubspot-integration-setup", destination: "/app/integrations/hubspot", permanent: false },
      { source: "/app/integrations/api-keys-and-developer-access", destination: "/app/integrations/api-keys", permanent: false },
      { source: "/app/settings/general-settings", destination: "/app/settings", permanent: false },
      { source: "/app/settings/billing-and-subscription", destination: "/app/settings/billing", permanent: false },
      { source: "/app/settings/security-and-2fa", destination: "/app/settings/security", permanent: false },
      { source: "/app/settings/notification-settings", destination: "/app/settings/notifications", permanent: false },
      { source: "/app/settings/roles-and-permissions", destination: "/app/settings/users", permanent: false },
      { source: "/app/settings/data-management", destination: "/app/settings/data", permanent: false },
      { source: "/app/settings/api-and-domains", destination: "/app/settings/api-domains", permanent: false },
      { source: "/app/settings/audit-log", destination: "/app/settings/audit", permanent: false },
      { source: "/app/usage-credits/usage-and-credits", destination: "/app/usage-credits", permanent: false },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
