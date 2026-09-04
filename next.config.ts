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
   * The approved User Dashboard navigation target uses route names that differ
   * from the ones this codebase implements. Rather than renaming ~100 live
   * routes, the approved names are served as permanent redirects so links from
   * the handoff, prototypes and documentation all resolve.
   */
  async redirects() {
    return [
      { source: "/app/marketing-automation", destination: "/app/marketing", permanent: false },
      { source: "/app/marketing-automation/workflows", destination: "/app/marketing/workflows", permanent: false },
      { source: "/app/marketing-automation/email-campaigns", destination: "/app/marketing/emails", permanent: false },
      { source: "/app/marketing-automation/landing-page-builder", destination: "/app/marketing/page-builder", permanent: false },
      { source: "/app/marketing-automation/:path*", destination: "/app/marketing/:path*", permanent: false },
      { source: "/app/social-publishing", destination: "/app/social", permanent: false },
      { source: "/app/social-publishing/:path*", destination: "/app/social/:path*", permanent: false },
      { source: "/app/growth-intelligence/strategy-dashboard", destination: "/app/strategy", permanent: false },
      { source: "/app/growth-intelligence/ai-advisor", destination: "/app/ai-advisor", permanent: false },
      { source: "/app/growth-intelligence/:path*", destination: "/app/strategy/:path*", permanent: false },
      { source: "/app/growth/saved-insights", destination: "/app/ai-advisor/saved", permanent: false },
      { source: "/app/growth/action-plans", destination: "/app/ai-advisor/action-plans", permanent: false },
      { source: "/app/ai-workspace", destination: "/app/workspace", permanent: false },
      { source: "/app/ai-workspace/:path*", destination: "/app/workspace/:path*", permanent: false },
      { source: "/app/crm/pipeline", destination: "/app/crm", permanent: false },
      { source: "/app/analytics/conversion-attribution", destination: "/app/analytics/attribution", permanent: false },
      { source: "/app/analytics/reports", destination: "/app/analytics/report-builder", permanent: false },
      { source: "/app/settings/roles-and-permissions", destination: "/app/settings/users", permanent: false },
      { source: "/app/settings/api-and-domains", destination: "/app/settings/api-domains", permanent: false },
      // Super Admin marketplace routes from the handoff use /admin/*.
      { source: "/admin/marketplace", destination: "/super/marketplace-management/marketplace-overview", permanent: false },
      { source: "/admin/marketplace/sellers", destination: "/super/marketplace-management/seller-management", permanent: false },
      { source: "/admin/marketplace/seller-applications", destination: "/super/marketplace-management/seller-applications", permanent: false },
      { source: "/admin/marketplace/product-moderation", destination: "/super/marketplace-management/product-review-and-moderation", permanent: false },
      { source: "/admin/marketplace/products", destination: "/super/marketplace-management/categories-and-products", permanent: false },
      { source: "/admin/marketplace/orders", destination: "/super/marketplace-management/orders-refunds-and-disputes", permanent: false },
      { source: "/admin/marketplace/payouts", destination: "/super/marketplace-management/commissions-and-payouts", permanent: false },
      { source: "/admin/marketplace/settings", destination: "/super/marketplace-management/marketplace-settings", permanent: false },
      { source: "/admin/system/module-controls", destination: "/super/system-management/module-controls", permanent: false },
      { source: "/admin/system/feature-flags", destination: "/super/system-management/feature-flags", permanent: false },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
