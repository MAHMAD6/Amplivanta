/**
 * Growth Audit readiness checks. Pure: the caller supplies workspace facts, so
 * the scoring is deterministic and unit-testable. The score is the share of
 * checks passed — it measures setup readiness, not market performance, and is
 * never compared against invented benchmarks.
 */

export type AuditFacts = {
  analyticsConnected: boolean;
  searchConsoleConnected: boolean;
  adsConnected: boolean;
  socialAccounts: number;
  contacts: number;
  openDeals: number;
  activeCampaigns: number;
  sentEmails: number;
  publishedPages: number;
  forms: number;
  goals: number;
  personas: number;
  competitors: number;
};

export type AuditCheck = { key: string; dimension: string; label: string; passed: boolean; detail: string; href: string };

export const AUDIT_DIMENSIONS = ["Measurement", "Acquisition", "Conversion", "Pipeline & Retention", "Strategy"] as const;

export function runAuditChecks(f: AuditFacts): { score: number; checks: AuditCheck[] } {
  const n = (v: number, one: string, many: string) => `${v.toLocaleString("en-US")} ${v === 1 ? one : many}`;
  const checks: AuditCheck[] = [
    { key: "analytics", dimension: "Measurement", label: "Web analytics connected", passed: f.analyticsConnected, detail: f.analyticsConnected ? "Google Analytics is connected." : "Connect Google Analytics to measure traffic and conversions.", href: "/app/integrations#catalog" },
    { key: "search_console", dimension: "Measurement", label: "Search Console connected", passed: f.searchConsoleConnected, detail: f.searchConsoleConnected ? "Search Console is connected." : "Connect Search Console to see organic search visibility.", href: "/app/integrations#catalog" },
    { key: "ads", dimension: "Acquisition", label: "Ad accounts connected", passed: f.adsConnected, detail: f.adsConnected ? "An ad account is connected." : "Connect an ad account to track paid spend and returns.", href: "/app/integrations#catalog" },
    { key: "social", dimension: "Acquisition", label: "Social accounts connected", passed: f.socialAccounts > 0, detail: f.socialAccounts > 0 ? `${n(f.socialAccounts, "account", "accounts")} connected.` : "Connect a social account to publish and measure.", href: "/app/social/accounts" },
    { key: "campaigns", dimension: "Acquisition", label: "Active campaigns", passed: f.activeCampaigns > 0, detail: f.activeCampaigns > 0 ? `${n(f.activeCampaigns, "campaign is", "campaigns are")} active.` : "No campaign is currently active.", href: "/app/workspace/plan" },
    { key: "pages", dimension: "Conversion", label: "Published landing pages", passed: f.publishedPages > 0, detail: f.publishedPages > 0 ? `${n(f.publishedPages, "page", "pages")} published.` : "Publish a landing page to capture demand.", href: "/app/marketing/landing-pages" },
    { key: "forms", dimension: "Conversion", label: "Lead capture forms", passed: f.forms > 0, detail: f.forms > 0 ? `${n(f.forms, "form", "forms")} available.` : "Create a form to capture leads.", href: "/app/marketing/forms" },
    { key: "contacts", dimension: "Pipeline & Retention", label: "Contacts in CRM", passed: f.contacts > 0, detail: f.contacts > 0 ? `${n(f.contacts, "contact", "contacts")} in the CRM.` : "Import or capture contacts to build a pipeline.", href: "/app/crm/contacts" },
    { key: "deals", dimension: "Pipeline & Retention", label: "Open pipeline", passed: f.openDeals > 0, detail: f.openDeals > 0 ? `${n(f.openDeals, "open deal", "open deals")}.` : "No open deals are being tracked.", href: "/app/crm/deals" },
    { key: "email", dimension: "Pipeline & Retention", label: "Email campaigns sent", passed: f.sentEmails > 0, detail: f.sentEmails > 0 ? `${n(f.sentEmails, "email campaign", "email campaigns")} sent.` : "No email campaign has been sent yet.", href: "/app/marketing/emails" },
    { key: "goals", dimension: "Strategy", label: "Measurable goals defined", passed: f.goals > 0, detail: f.goals > 0 ? `${n(f.goals, "goal", "goals")} defined.` : "Define at least one measurable marketing goal.", href: "/app/strategy/goals" },
    { key: "personas", dimension: "Strategy", label: "Buyer personas documented", passed: f.personas > 0, detail: f.personas > 0 ? `${n(f.personas, "persona", "personas")} documented.` : "Document who you are selling to.", href: "/app/strategy/personas" },
    { key: "competitors", dimension: "Strategy", label: "Competitors tracked", passed: f.competitors > 0, detail: f.competitors > 0 ? `${n(f.competitors, "competitor", "competitors")} tracked.` : "Track competitors to spot gaps.", href: "/app/content-intelligence/competitors" },
  ];
  const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);
  return { score, checks };
}

/** Per-dimension pass rate (0-100) for the score breakdown. */
export function dimensionScores(checks: AuditCheck[]): [string, number][] {
  return AUDIT_DIMENSIONS.map((d) => {
    const in_ = checks.filter((c) => c.dimension === d);
    return [d, in_.length ? Math.round((in_.filter((c) => c.passed).length / in_.length) * 100) : 0];
  });
}

export function parseChecks(v: unknown): AuditCheck[] {
  return Array.isArray(v) ? (v.filter((c) => c && typeof c === "object" && typeof (c as AuditCheck).key === "string") as AuditCheck[]) : [];
}
