import { NavLink } from "@/types";

export const SITE_NAME = "Amplivanta";
export const SITE_SHORT = "Amplivanta";
export const SITE_TAGLINE = "We Engineer Growth";
export const SITE_DESCRIPTION =
  "Amplivanta combines AI intelligence, automation and powerful tools to help you attract, convert and retain more customers—faster.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://amplivanta.com";

export const CONTACT_INFO = {
  email: "hello@amplivanta.com",
  phone: "+1 (555) 000-0000",
  address: "123 Agency Street, New York, NY 10001",
  hours: "Mon-Fri 9am-6pm",
};

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com",
  linkedin: "https://linkedin.com",
  twitter: "https://twitter.com",
  facebook: "https://facebook.com",
  youtube: "https://youtube.com",
};

export const NAV_LINKS: NavLink[] = [
  {
    label: "Platform",
    href: "/platform",
    children: [
      { label: "Platform Overview", href: "/platform" },
      { label: "AI Advisor", href: "/platform/ai-advisor" },
      { label: "AI Workspace", href: "/platform/workspace" },
      { label: "Content Intelligence", href: "/platform/content-intelligence" },
      { label: "Creative Studio", href: "/platform/creative-studio" },
      { label: "Social Publishing", href: "/platform/social" },
      { label: "Marketing Automation", href: "/platform/marketing" },
      { label: "CRM", href: "/platform/crm" },
      { label: "Analytics & Attribution", href: "/platform/analytics" },
      { label: "Integrations Ecosystem", href: "/platform/integrations" },
      { label: "Growth Audit", href: "/platform/growth-audit" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      { label: "Solutions Overview", href: "/solutions" },
      { label: "Growth Marketing", href: "/solutions/growth-marketing" },
      { label: "Revenue Acceleration", href: "/solutions/revenue-acceleration" },
      { label: "AI Workflows", href: "/solutions/ai-workflows" },
      { label: "Brand Intelligence", href: "/solutions/brand-intelligence" },
    ],
  },
  { label: "Marketplace", href: "/marketplace" },
  {
    label: "Industries",
    href: "/industries",
    children: [
      { label: "Industries Overview", href: "/industries" },
      { label: "SaaS & Technology", href: "/industries/saas" },
      { label: "E-Commerce & Retail", href: "/industries/ecommerce" },
      { label: "Healthcare & Life Sciences", href: "/industries/healthcare" },
      { label: "Financial Services", href: "/industries/financial-services" },
      { label: "Real Estate & PropTech", href: "/industries/real-estate" },
      { label: "Professional Services", href: "/industries/professional-services" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Resources Hub", href: "/resources" },
      { label: "Blog & Articles", href: "/blog" },
      { label: "Knowledge Base", href: "/resources/knowledge-base" },
      { label: "Strategy Guides", href: "/resources/guides" },
      { label: "Video Tutorials", href: "/resources/videos" },
      { label: "Webinars & Workshops", href: "/resources/webinars" },
      { label: "Workflow Templates", href: "/resources/templates" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    label: "Company",
    href: "/company",
    children: [
      { label: "About Amplivanta", href: "/company" },
      { label: "Careers", href: "/careers" },
      { label: "Partner Program", href: "/partners" },
      { label: "Affiliate Program", href: "/affiliates" },
      { label: "Trust & Security", href: "/security" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export const FOOTER_PLATFORM = [
  { label: "AI Advisor", href: "/platform/ai-advisor" },
  { label: "Marketing Automation", href: "/platform/marketing" },
  { label: "Social Publishing", href: "/platform/social" },
  { label: "Creative Studio", href: "/platform/creative-studio" },
  { label: "CRM & Pipelines", href: "/platform/crm" },
  { label: "Analytics & Reports", href: "/platform/analytics" },
  { label: "Integrations", href: "/platform/integrations" },
  { label: "Growth Audit", href: "/platform/growth-audit" },
];

export const FOOTER_SERVICES = FOOTER_PLATFORM;

export const FOOTER_SOLUTIONS = [
  { label: "Growth Marketing", href: "/solutions/growth-marketing" },
  { label: "Revenue Acceleration", href: "/solutions/revenue-acceleration" },
  { label: "AI Workflows", href: "/solutions/ai-workflows" },
  { label: "Brand Intelligence", href: "/solutions/brand-intelligence" },
];

export const FOOTER_INDUSTRIES = [
  { label: "SaaS & Technology", href: "/industries/saas" },
  { label: "E-Commerce & Retail", href: "/industries/ecommerce" },
  { label: "Healthcare", href: "/industries/healthcare" },
  { label: "Financial Services", href: "/industries/financial-services" },
  { label: "Real Estate", href: "/industries/real-estate" },
  { label: "Professional Services", href: "/industries/professional-services" },
];

export const FOOTER_RESOURCES = [
  { label: "Resource Hub", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Knowledge Base", href: "/resources/knowledge-base" },
  { label: "Guides", href: "/resources/guides" },
  { label: "Templates", href: "/resources/templates" },
  { label: "Help Center", href: "/help" },
];

export const FOOTER_COMPANY = [
  { label: "About Us", href: "/company" },
  { label: "Careers", href: "/careers" },
  { label: "Partner Program", href: "/partners" },
  { label: "Affiliate Program", href: "/affiliates" },
  { label: "Security", href: "/security" },
  { label: "Contact Us", href: "/contact" },
];

export const FOOTER_LEGAL = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "DPA Agreement", href: "/legal/dpa" },
  { label: "Partner Terms", href: "/legal/partner-terms" },
  { label: "Affiliate Terms", href: "/legal/affiliate-terms" },
];

export const FOOTER_CONTACTS = [
  { label: "hello@amplivanta.com", href: "mailto:hello@amplivanta.com" },
  { label: "support@amplivanta.com", href: "mailto:support@amplivanta.com" },
  { label: "partners@amplivanta.com", href: "mailto:partners@amplivanta.com" },
];

export const SOCIAL_TILES = [
  { key: "twitter", label: "Twitter / X", href: "https://twitter.com/amplivanta" },
  { key: "linkedin", label: "LinkedIn", href: "https://linkedin.com/company/amplivanta" },
  { key: "youtube", label: "YouTube", href: "https://youtube.com/@amplivanta" },
  { key: "instagram", label: "Instagram", href: "https://instagram.com/amplivanta" },
  { key: "facebook", label: "Facebook", href: "https://facebook.com/amplivanta" },
];

export const ADVISOR_STEPS = [
  { icon: "scan", title: "1. Scan & Audit", desc: "Automated crawl of funnel, SEO, and paid performance." },
  { icon: "list", title: "2. Prioritize Insights", desc: "AI ranks highest ROI growth opportunities." },
  { icon: "settings", title: "3. Action Engine", desc: "Generate copy, workflows, and automated campaigns." },
  { icon: "gauge", title: "4. Measure Impact", desc: "Real-time attribution and pipeline impact tracking." },
  { icon: "refresh", title: "5. Continuous Learning", desc: "Always-on tuning based on outcome data." },
];

export const HOME_CAPABILITIES = [
  { key: "advisor", href: "/platform/ai-advisor", icon: "sparkles", title: "AI Advisor", desc: "Strategic co-pilot for automated growth insights." },
  { key: "marketing", href: "/platform/marketing", icon: "mail", title: "Marketing Automation", desc: "Multi-channel journeys, emails, and triggers." },
  { key: "crm", href: "/platform/crm", icon: "users", title: "CRM & Pipelines", desc: "Unified leads, stages, and contact intelligence." },
  { key: "social", href: "/platform/social", icon: "megaphone", title: "Social Publishing", desc: "Multi-network composer, approvals & calendar." },
  { key: "creative", href: "/platform/creative-studio", icon: "wand", title: "Creative Studio", desc: "Brand kits, assets, and AI copy generation." },
  { key: "analytics", href: "/platform/analytics", icon: "bar-chart", title: "Analytics & Attribution", desc: "End-to-end multi-touch ROI tracking." },
];

export const CAPABILITIES = HOME_CAPABILITIES;

export const HOME_INDUSTRIES = [
  { label: "SaaS & Tech", href: "/industries/saas", icon: "cloud" },
  { label: "E-Commerce", href: "/industries/ecommerce", icon: "cart" },
  { label: "Healthcare", href: "/industries/healthcare", icon: "heart" },
  { label: "Financial Services", href: "/industries/financial-services", icon: "briefcase" },
  { label: "Real Estate", href: "/industries/real-estate", icon: "home" },
  { label: "Professional Services", href: "/industries/professional-services", icon: "bank" },
];

export const HOME_RESOURCES = [
  { title: "Knowledge Base", desc: "Documentation and platform guides.", href: "/resources/knowledge-base", icon: "book" },
  { title: "Video Tutorials", desc: "Step-by-step masterclasses.", href: "/resources/videos", icon: "monitor" },
  { title: "Workflow Templates", desc: "Pre-built automation blueprints.", href: "/resources/templates", icon: "layout" },
  { title: "Help Center", desc: "24/7 support and assistance.", href: "/help", icon: "life-buoy" },
];

export const STATS = [
  { value: "10x", suffix: "", label: "Faster Campaign Execution" },
  { value: "3.4x", suffix: "", label: "Average ROI on Ad Spend" },
  { value: "99.9%", suffix: "", label: "Platform Uptime SLA" },
  { value: "500+", suffix: "", label: "Enterprise Workspaces" },
];

export const BUDGET_OPTIONS = [
  "$500 - $1,000",
  "$1,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000 - $25,000",
  "$25,000+",
];
