import { NavLink } from "@/types";

export const SITE_NAME = "Amplivanta";
export const SITE_SHORT = "Amplivanta";
export const SITE_TAGLINE = "Your Business Success Starts Here";
export const SITE_DESCRIPTION =
  "Amplivanta is a full-service digital marketing agency helping businesses grow their online presence through strategic campaigns, creative content, and data-driven results.";
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
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Social Media Marketing", href: "/services/social-media-marketing" },
      { label: "Content Writing", href: "/services/content-writing" },
      { label: "SEO", href: "/services/seo" },
      { label: "Video Production", href: "/services/video-production" },
      { label: "Pay Per Click", href: "/services/pay-per-click" },
      { label: "Web Design", href: "/services/web-design" },
    ],
  },
  {
    label: "Work",
    href: "/portfolio",
    children: [
      { label: "Case Studies", href: "/portfolio" },
      { label: "Reviews", href: "/reviews" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_SERVICES = [
  { label: "Social Media Marketing", href: "/services/social-media-marketing" },
  { label: "Content Writing", href: "/services/content-writing" },
  { label: "SEO Optimization", href: "/services/seo" },
  { label: "Video Production", href: "/services/video-production" },
  { label: "Pay Per Click", href: "/services/pay-per-click" },
  { label: "Web Design", href: "/services/web-design" },
];

export const FOOTER_COMPANY = [
  { label: "About", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const STATS = [
  { value: "472", suffix: "+", label: "Projects Completed" },
  { value: "50", suffix: "+", label: "Strong Client Relationships" },
  { value: "233", suffix: "+", label: "Expertise Across Channels" },
  { value: "100", suffix: "+", label: "Happy Clients" },
];

export const SERVICES_LIST = [
  { number: "01", label: "Social Media" },
  { number: "02", label: "Content Writing" },
  { number: "03", label: "SEO" },
  { number: "04", label: "Video Production" },
  { number: "05", label: "Pay Per Click" },
];

export const BUDGET_OPTIONS = [
  "$500 - $1,000",
  "$1,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000 - $25,000",
  "$25,000+",
];
