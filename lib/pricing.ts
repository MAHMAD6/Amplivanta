export type PlanTier = "FREE" | "STARTER" | "GROWTH" | "PROFESSIONAL" | "ENTERPRISE";

export interface Plan {
  key: PlanTier;
  name: string;
  tagline: string;
  icon: "leaf" | "rocket" | "trending" | "briefcase" | "shield";
  /** Monthly list price (shown struck through on annual). null = custom. */
  priceMonthly: number | null;
  /** Effective monthly price when billed annually. null = custom. */
  priceAnnual: number | null;
  /** Total charged per year on annual billing. null = free/custom. */
  annualTotal: number | null;
  annualSaving: number | null;
  ctaLabel: string;
  ctaHref: string;
  outline?: boolean;
  featured?: boolean;
  bullets: string[];
}

export const PLANS: Plan[] = [
  {
    key: "FREE",
    name: "Free Plan",
    tagline: "Explore the basics and get started.",
    icon: "leaf",
    priceMonthly: 0,
    priceAnnual: 0,
    annualTotal: null,
    annualSaving: null,
    ctaLabel: "Start Free",
    ctaHref: "/signup?plan=free",
    outline: true,
    bullets: ["1 user", "250 contacts", "500 emails per month", "1 landing page", "1 subdomain", "Basic reports"],
  },
  {
    key: "STARTER",
    name: "Starter",
    tagline: "Everything you need to get your growth moving.",
    icon: "rocket",
    priceMonthly: 49,
    priceAnnual: 33.08,
    annualTotal: 396.9,
    annualSaving: 191.1,
    ctaLabel: "Start Engineering Growth",
    ctaHref: "/signup?plan=starter",
    bullets: ["Up to 2 users", "2,500 contacts", "5,000 emails per month", "5 landing pages", "10 automations", "5 integrations", "1 custom domain", "AI assistance included"],
  },
  {
    key: "GROWTH",
    name: "Growth",
    tagline: "Grow faster with advanced tools and automation.",
    icon: "trending",
    priceMonthly: 99,
    priceAnnual: 66.83,
    annualTotal: 801.9,
    annualSaving: 386.1,
    ctaLabel: "Start Engineering Growth",
    ctaHref: "/signup?plan=growth",
    featured: true,
    bullets: ["Up to 5 users", "10,000 contacts", "25,000 emails per month", "25 landing pages", "50 automations", "15 integrations", "3 custom domains", "More AI assistance"],
  },
  {
    key: "PROFESSIONAL",
    name: "Professional",
    tagline: "Scale with power, control and flexibility.",
    icon: "briefcase",
    priceMonthly: 249,
    priceAnnual: 168.08,
    annualTotal: 2016.9,
    annualSaving: 971.1,
    ctaLabel: "Start Engineering Growth",
    ctaHref: "/signup?plan=professional",
    bullets: ["Up to 15 users", "50,000 contacts", "100,000 emails per month", "100 landing pages", "250 automations", "Unlimited integrations", "10 custom domains", "More AI assistance"],
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    tagline: "For large organizations with advanced requirements.",
    icon: "shield",
    priceMonthly: null,
    priceAnnual: null,
    annualTotal: null,
    annualSaving: null,
    ctaLabel: "Contact Sales",
    ctaHref: "/contact?intent=enterprise",
    outline: true,
    bullets: ["Unlimited users", "Unlimited contacts", "Custom email volume", "Custom limits", "Advanced security", "Account management support", "Priority support", "Enhanced AI assistance"],
  },
];

export const FEATURE_MATRIX: {
  section: string;
  rows: { label: string; values: Record<PlanTier, string | boolean> }[];
}[] = [
  {
    section: "Core Platform",
    rows: [
      { label: "Users", values: { FREE: "1", STARTER: "2", GROWTH: "5", PROFESSIONAL: "15", ENTERPRISE: "Unlimited" } },
      { label: "Contacts", values: { FREE: "250", STARTER: "2,500", GROWTH: "10,000", PROFESSIONAL: "50,000", ENTERPRISE: "Unlimited" } },
      { label: "Emails / month", values: { FREE: "500", STARTER: "5,000", GROWTH: "25,000", PROFESSIONAL: "100,000", ENTERPRISE: "Custom" } },
      { label: "Landing pages", values: { FREE: "1", STARTER: "5", GROWTH: "25", PROFESSIONAL: "100", ENTERPRISE: "Unlimited" } },
      { label: "Automations", values: { FREE: false, STARTER: "10", GROWTH: "50", PROFESSIONAL: "250", ENTERPRISE: "Unlimited" } },
      { label: "Integrations", values: { FREE: false, STARTER: "5", GROWTH: "15", PROFESSIONAL: "Unlimited", ENTERPRISE: "Unlimited" } },
      { label: "Custom domains", values: { FREE: false, STARTER: "1", GROWTH: "3", PROFESSIONAL: "10", ENTERPRISE: "Custom" } },
    ],
  },
  {
    section: "AI & Support",
    rows: [
      { label: "AI assistance", values: { FREE: false, STARTER: "Included", GROWTH: "More", PROFESSIONAL: "More", ENTERPRISE: "Enhanced" } },
      { label: "Advanced security", values: { FREE: false, STARTER: false, GROWTH: false, PROFESSIONAL: true, ENTERPRISE: true } },
      { label: "Priority support", values: { FREE: false, STARTER: false, GROWTH: true, PROFESSIONAL: true, ENTERPRISE: true } },
      { label: "Account management", values: { FREE: false, STARTER: false, GROWTH: false, PROFESSIONAL: false, ENTERPRISE: true } },
    ],
  },
];

export const PRICING_FAQ = [
  {
    q: "Can I change plans anytime?",
    a: "Yes. Upgrade instantly with a prorated credit, or downgrade at the end of your billing period. Your entitlements update automatically.",
  },
  {
    q: "What does annual billing mean?",
    a: "Annual billing charges once per year at a discounted effective monthly rate — you save an additional 10% compared with paying month to month.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no long-term contracts on self-serve plans. Cancel whenever you like and you keep access until the end of your paid period.",
  },
  {
    q: "What happens if I reach a limit?",
    a: "We'll notify you as you approach a plan limit. You can upgrade at any time; we never silently overcharge or cut off your data.",
  },
  {
    q: "How does AI assistance work?",
    a: "AI assistance powers recommendations, content generation, and automation suggestions across the platform. Higher plans include more AI usage and enhanced capabilities.",
  },
];
