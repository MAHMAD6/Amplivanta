/**
 * Published pricing, from the approved design reference.
 *
 * List price is the plan's undiscounted monthly price. The launch offer takes
 * 25% off it; annual billing then takes a further 10% off that result, which
 * the reference states as 32.5% effective savings. Both derived prices are
 * computed here rather than stored, so a change to the offer cannot leave the
 * page quoting two different numbers.
 *
 * These figures are what the page displays. Entitlements and what a customer is
 * actually charged are resolved server-side from the billing provider — this
 * module is presentation only.
 */

export const LAUNCH_DISCOUNT = 0.25;
export const ANNUAL_EXTRA_DISCOUNT = 0.1;

export type Plan = {
  id: string;
  initial: string;
  name: string;
  description: string;
  /** Undiscounted monthly list price in USD; null for Free and Enterprise. */
  listMonthly: number | null;
  /** Shown instead of a price when there is no published figure. */
  priceLabel?: string;
  priceNote?: string;
  features: string[];
  commission: string;
  cta: { label: string; href: string };
  fine: string;
  recommended?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    initial: "F",
    name: "Free Forever",
    description: "Explore core capabilities with a practical entry plan.",
    listMonthly: 0,
    priceNote: "No time limit",
    features: [
      "1 user",
      "250 contacts",
      "500 emails per month",
      "1 landing page",
      "Basic reports",
      "1 Amplivanta subdomain",
    ],
    commission: "Marketplace seller commission: 20%*",
    cta: { label: "Start Free", href: "/signup" },
    fine: "Free plan availability is subject to plan entitlements.",
  },
  {
    id: "starter",
    initial: "S",
    name: "Starter",
    description: "For smaller teams beginning structured growth work.",
    listMonthly: 49,
    features: [
      "Up to 2 users",
      "2,500 contacts",
      "5,000 emails per month",
      "5 landing pages",
      "10 automations",
      "5 integrations",
      "1 custom domain",
      "AI assistance included",
    ],
    commission: "Marketplace seller commission: 15%*",
    cta: { label: "Start Engineering Growth", href: "/signup" },
    fine: "Price shown reflects the selected billing cycle and active launch offer.",
  },
  {
    id: "growth",
    initial: "G",
    name: "Growth",
    description: "For teams coordinating broader campaigns, automation, and reporting.",
    listMonthly: 99,
    recommended: true,
    features: [
      "Up to 5 users",
      "10,000 contacts",
      "25,000 emails per month",
      "25 landing pages",
      "50 automations",
      "15 integrations",
      "3 custom domains",
      "More AI assistance",
    ],
    commission: "Marketplace seller commission: 15%*",
    cta: { label: "Start Engineering Growth", href: "/signup" },
    fine: "Price shown reflects the selected billing cycle and active launch offer.",
  },
  {
    id: "professional",
    initial: "P",
    name: "Professional",
    description: "For larger teams needing higher capacity across core workflows.",
    listMonthly: 249,
    features: [
      "Up to 15 users",
      "50,000 contacts",
      "100,000 emails per month",
      "100 landing pages",
      "250 automations",
      "Unlimited integrations",
      "10 custom domains",
      "More AI assistance",
    ],
    commission: "Marketplace seller commission: 15%*",
    cta: { label: "Start Engineering Growth", href: "/signup" },
    fine: "Price shown reflects the selected billing cycle and active launch offer.",
  },
  {
    id: "enterprise",
    initial: "E",
    name: "Enterprise",
    description: "For organizations with requirements beyond published plan limits.",
    listMonthly: null,
    priceLabel: "Custom pricing",
    priceNote: "Terms and limits are defined through the sales process.",
    features: [
      "Custom user limits",
      "Custom contact limits",
      "Custom email volume",
      "Custom landing-page limits",
      "Custom automation limits",
      "Plan-specific integration limits",
      "Custom domain limits",
      "Custom AI usage",
    ],
    commission: "Marketplace seller commission: 15% when eligible*",
    cta: { label: "Contact Sales", href: "/contact" },
    fine: "Enterprise terms are confirmed before purchase.",
  },
];

/**
 * Round to whole cents, half away from zero. The derived prices land exactly on
 * half-cent boundaries (49 × 0.675 = 33.075), where binary floating point can
 * fall either side — so rounding is done explicitly rather than left to the
 * currency formatter.
 */
const cents = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Monthly price with the launch offer applied. */
export function monthlyPrice(list: number): number {
  return cents(list * (1 - LAUNCH_DISCOUNT));
}

/** Effective monthly price when billed annually: launch offer, then annual. */
export function annualMonthlyPrice(list: number): number {
  return cents(list * (1 - LAUNCH_DISCOUNT) * (1 - ANNUAL_EXTRA_DISCOUNT));
}

/** Annual total. Computed from the unrounded rate so twelve months sum exactly. */
export function annualTotal(list: number): number {
  return cents(list * (1 - LAUNCH_DISCOUNT) * (1 - ANNUAL_EXTRA_DISCOUNT) * 12);
}

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const COMPARISON: { feature: string; values: [string, string, string, string, string] }[] = [
  { feature: "Users", values: ["1", "Up to 2", "Up to 5", "Up to 15", "Custom"] },
  { feature: "Contacts", values: ["250", "2,500", "10,000", "50,000", "Custom"] },
  { feature: "Emails / month", values: ["500", "5,000", "25,000", "100,000", "Custom"] },
  { feature: "Landing pages", values: ["1", "5", "25", "100", "Custom"] },
  { feature: "Automations", values: ["Plan-limited", "10", "50", "250", "Custom"] },
  { feature: "Integrations", values: ["Plan-limited", "5", "15", "Unlimited", "Plan-specific"] },
  {
    feature: "Domains",
    values: ["1 subdomain", "1 custom domain", "3 custom domains", "10 custom domains", "Custom"],
  },
  {
    feature: "AI assistance",
    values: ["Plan-limited", "Included", "More usage", "More usage", "Custom usage"],
  },
  {
    feature: "Marketplace seller commission*",
    values: ["20%", "15%", "15%", "15%", "15% when eligible"],
  },
];

export const COMMISSION_FOOTNOTE =
  "* Marketplace seller commission applies to eligible Marketplace sales under the applicable seller terms. It is separate from payment-processing fees, taxes, refunds, chargebacks, and Affiliate Program commissions. Plan eligibility and seller status must be validated server-side.";

export const PRICING_NOTES: [string, string][] = [
  [
    "Simple billing choice",
    "Switch the full pricing view between monthly and annual billing from one control.",
  ],
  [
    "Clear plan limits",
    "Compare users, contacts, email volume, landing pages, automations, domains, and related capacity in one place.",
  ],
  [
    "Seller plan benefit",
    "Marketplace sellers can sell without a paid plan, while eligible paid plans reduce commission from 20% to 15%.",
  ],
  [
    "Enterprise flexibility",
    "Enterprise pricing and limits are defined through the sales process for requirements beyond published plans.",
  ],
];

export const PRICING_FAQ: [string, string][] = [
  [
    "How does annual billing work?",
    "Annual billing applies the 25% launch discount to the list price first, then a further 10% discount on that result — a 32.5% effective saving compared with list pricing. The annual total is charged up front for twelve months.",
  ],
  [
    "Do Marketplace sellers need a paid plan?",
    "No. A seller can participate under seller-only terms at a 20% Marketplace commission. An eligible paid plan reduces that commission to 15%, so a subscription is worth having but is never required to sell.",
  ],
  [
    "Can plan prices or limits change?",
    "Published prices and limits can change, and the launch offer is time-limited. Any change applies to your workspace from your next billing period, and the terms in force at the time of purchase are what you are charged.",
  ],
  [
    "What happens if I reach a plan limit?",
    "You are told which limit you have reached and what the options are. Work already stored stays accessible; the platform does not delete data because a limit was crossed.",
  ],
];
