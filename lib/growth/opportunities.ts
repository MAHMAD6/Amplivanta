import type { GrowthFacts, GrowthScore } from "@/lib/growth/score";

/**
 * Opportunity detection. Pure and rule-based, so opportunities exist without
 * an AI provider and every one carries the numbers it was derived from.
 *
 * Each rule states the affected metric, the evidence (measured figures), the
 * action, and an effort/impact/confidence drawn from the size of the gap —
 * never a guessed percentage uplift.
 */

export type Opportunity = {
  key: string;
  title: string;
  /** Affected metric, e.g. "Visit-to-conversion rate". */
  metric: string;
  /** Measured figures behind it. */
  evidence: string;
  /** What to do next. */
  action: string;
  href: string;
  category: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  /** 0-1: how strongly the measured data supports the finding. */
  confidence: number;
};

const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);
const num = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const rate = (n: number, d: number) => `${pct(n, d).toFixed(1)}%`;

/** Confidence grows with the sample size behind a rule, capped at 0.9. */
const sampleConfidence = (sample: number, full: number) => Math.min(0.9, Math.max(0.4, Math.round((0.4 + 0.5 * Math.min(1, sample / full)) * 100) / 100));

export function detectOpportunities(f: GrowthFacts, score: GrowthScore): Opportunity[] {
  const out: Opportunity[] = [];
  const days = f.windowDays;
  const period = `the last ${days} days`;

  if (f.visits >= 100 && pct(f.conversions, f.visits) < 2) {
    out.push({
      key: "low-page-conversion",
      title: "Landing pages convert below target",
      metric: "Visit-to-conversion rate",
      evidence: `${num(f.conversions)} conversions from ${num(f.visits)} visits in ${period} (${rate(f.conversions, f.visits)}), against a 3% target.`,
      action: "Review the top pages: shorten forms, match the headline to the ad or email that sends the traffic, and start an A/B test on the highest-traffic page.",
      href: "/app/marketing/ab-testing",
      category: "Conversion",
      impact: f.visits >= 500 ? "high" : "medium",
      effort: "medium",
      confidence: sampleConfidence(f.visits, 1000),
    });
  }

  if (f.emailsSent >= 200 && pct(f.emailsOpened, f.emailsSent) < 20) {
    out.push({
      key: "low-open-rate",
      title: "Email open rate is below target",
      metric: "Email open rate",
      evidence: `${num(f.emailsOpened)} opens from ${num(f.emailsSent)} sends in ${period} (${rate(f.emailsOpened, f.emailsSent)}), against a 25% target.`,
      action: "Test subject lines on the next send, check sender reputation on Deliverability, and drop unengaged contacts from the next segment.",
      href: "/app/marketing/deliverability",
      category: "Retention",
      impact: f.emailsSent >= 2000 ? "high" : "medium",
      effort: "low",
      confidence: sampleConfidence(f.emailsSent, 2000),
    });
  }

  if (f.emailsSent >= 200 && pct(f.unsubscribes, f.emailsSent) > 0.5) {
    out.push({
      key: "high-unsubscribes",
      title: "Unsubscribes are above the safe range",
      metric: "Unsubscribe rate",
      evidence: `${num(f.unsubscribes)} unsubscribes from ${num(f.emailsSent)} sends in ${period} (${rate(f.unsubscribes, f.emailsSent)}), above the 0.5% ceiling.`,
      action: "Reduce send frequency for low-engagement segments and make sure each campaign matches what the contact signed up for.",
      href: "/app/marketing/segments",
      category: "Retention",
      impact: "high",
      effort: "low",
      confidence: sampleConfidence(f.emailsSent, 2000),
    });
  }

  if (f.formSubmissions >= 20 && f.newContacts > 0 && f.formSubmissions > f.newContacts * 1.5) {
    out.push({
      key: "submissions-not-contacts",
      title: "Form submissions are not all becoming contacts",
      metric: "Lead capture",
      evidence: `${num(f.formSubmissions)} submissions but ${num(f.newContacts)} new contacts in ${period}.`,
      action: "Check the forms' field mapping and duplicate handling so every submission creates or updates a contact.",
      href: "/app/marketing/form-analytics",
      category: "Conversion",
      impact: "medium",
      effort: "low",
      confidence: sampleConfidence(f.formSubmissions, 100),
    });
  }

  if (f.workflowRuns >= 20 && pct(f.workflowFailures, f.workflowRuns) > 5) {
    out.push({
      key: "workflow-failures",
      title: "Automations are failing often",
      metric: "Automation success rate",
      evidence: `${num(f.workflowFailures)} of ${num(f.workflowRuns)} runs failed in ${period} (${rate(f.workflowFailures, f.workflowRuns)} failure rate).`,
      action: "Open Execution Logs, fix the failing step, then retry the failed runs from that step.",
      href: "/app/marketing/execution-logs",
      category: "Execution",
      impact: "high",
      effort: "medium",
      confidence: sampleConfidence(f.workflowRuns, 100),
    });
  }

  if (f.campaignSpend > 0 && f.campaignRevenue < f.campaignSpend) {
    out.push({
      key: "campaign-roi",
      title: "Campaign spend is ahead of recorded revenue",
      metric: "Marketing ROI",
      evidence: `Spend ${num(f.campaignSpend)} against recorded revenue ${num(f.campaignRevenue)} in ${period}.`,
      action: "Compare campaigns on Campaign Analytics, pause the ones with no recorded conversions, and confirm revenue is being attributed.",
      href: "/app/analytics/campaigns",
      category: "Acquisition",
      impact: "high",
      effort: "medium",
      confidence: 0.7,
    });
  }

  if (f.totalContacts >= 50 && f.emailsSent === 0) {
    out.push({
      key: "contacts-never-emailed",
      title: "Contacts are not being followed up",
      metric: "Contacts reached",
      evidence: `${num(f.totalContacts)} contacts in the CRM and no email sends in ${period}.`,
      action: "Send one relevant campaign to a segment, or publish a welcome automation so new contacts hear from you.",
      href: "/app/marketing/templates",
      category: "Retention",
      impact: "high",
      effort: "low",
      confidence: 0.8,
    });
  }

  if (f.newContacts >= 20 && f.openDeals + f.wonDeals + f.lostDeals === 0) {
    out.push({
      key: "no-pipeline",
      title: "New contacts are not entering the pipeline",
      metric: "Open pipeline",
      evidence: `${num(f.newContacts)} new contacts in ${period} and no deals recorded.`,
      action: "Create deals for the qualified contacts so pipeline value and win rate can be measured.",
      href: "/app/crm/deals",
      category: "Conversion",
      impact: "medium",
      effort: "low",
      confidence: 0.7,
    });
  }

  if (f.connectedIntegrations === 0) {
    out.push({
      key: "no-data-source",
      title: "No data source is connected",
      metric: "Data coverage",
      evidence: `Coverage is ${Math.round(score.coverage * 100)}% of the four growth dimensions with no connected integration.`,
      action: "Connect analytics, ads or a CRM so acquisition and conversion can be measured from real data.",
      href: "/app/integrations",
      category: "Measurement",
      impact: "high",
      effort: "low",
      confidence: 0.9,
    });
  }

  if (f.publishedPages === 0 && f.activeForms === 0) {
    out.push({
      key: "no-capture-surface",
      title: "Nothing is capturing demand",
      metric: "Live conversion surfaces",
      evidence: `No published landing page and no active form, with ${num(f.visits)} visits recorded in ${period}.`,
      action: "Publish a landing page from a template and put a lead capture form on it.",
      href: "/app/marketing/landing-page-templates",
      category: "Conversion",
      impact: "high",
      effort: "medium",
      confidence: 0.8,
    });
  }

  // Weakest covered dimension first, then impact, then confidence.
  const weakness = new Map(score.dimensions.filter((d) => d.covered).map((d) => [d.label, d.score ?? 100]));
  const rank = { high: 0, medium: 1, low: 2 } as const;
  return out.sort((a, b) => (weakness.get(a.category) ?? 100) - (weakness.get(b.category) ?? 100) || rank[a.impact] - rank[b.impact] || b.confidence - a.confidence);
}
