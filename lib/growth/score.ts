/**
 * Growth Score engine. Pure and deterministic: the caller passes measured
 * workspace facts, so any score can be reproduced and explained from the
 * signals below.
 *
 * Rules that keep it honest:
 *  - A dimension scores only when its required data exists; otherwise it is
 *    uncovered and contributes nothing.
 *  - With fewer than two covered dimensions the overall score is null and the
 *    status is "insufficient_data" — never a made-up number.
 *  - Every signal states its target, so the UI can show why a score is what it
 *    is. Targets are platform configuration, not claims about the customer.
 */

export type GrowthFacts = {
  /** Landing page visits in the window. */
  visits: number;
  /** Landing page visits marked converted. */
  conversions: number;
  formSubmissions: number;
  newContacts: number;
  totalContacts: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  unsubscribes: number;
  activeCampaigns: number;
  campaignClicks: number;
  campaignImpressions: number;
  campaignSpend: number;
  campaignRevenue: number;
  publishedPages: number;
  activeForms: number;
  activeWorkflows: number;
  workflowRuns: number;
  workflowFailures: number;
  socialPostsPublished: number;
  connectedIntegrations: number;
  /** Days the figures cover. */
  windowDays: number;
};

export type Signal = { label: string; value: string; target: string; points: number; max: number };
export type DimensionKey = "acquisition" | "conversion" | "retention" | "execution";
export type Dimension = {
  key: DimensionKey;
  label: string;
  /** 0-100, or null when the data for it does not exist yet. */
  score: number | null;
  covered: boolean;
  /** What is needed before the dimension can be scored. */
  requirement: string;
  signals: Signal[];
};

export type GrowthScore = {
  score: number | null;
  status: "scored" | "insufficient_data";
  dimensions: Dimension[];
  /** Covered dimensions over total, 0-1. */
  coverage: number;
  missing: string[];
  windowDays: number;
};

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  acquisition: "Acquisition",
  conversion: "Conversion",
  retention: "Retention",
  execution: "Execution",
};

const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);
const clamp = (n: number, max: number) => Math.max(0, Math.min(max, n));
/** Points for a ratio against a target, capped at the maximum. */
const ratioPoints = (value: number, target: number, max: number) => (target <= 0 ? 0 : clamp(Math.round((value / target) * max), max));
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const pctText = (n: number) => `${n.toFixed(1)}%`;

function dimension(key: DimensionKey, covered: boolean, requirement: string, signals: Signal[]): Dimension {
  const max = signals.reduce((a, s) => a + s.max, 0);
  return {
    key,
    label: DIMENSION_LABELS[key],
    covered,
    requirement,
    signals,
    score: covered && max > 0 ? Math.round((signals.reduce((a, s) => a + s.points, 0) / max) * 100) : null,
  };
}

export function computeGrowthScore(f: GrowthFacts): GrowthScore {
  const perWeek = (n: number) => (f.windowDays > 0 ? (n / f.windowDays) * 7 : 0);

  // Acquisition — is new demand arriving, and from working channels?
  const acquisitionCovered = f.visits > 0 || f.campaignImpressions > 0 || f.socialPostsPublished > 0 || f.newContacts > 0;
  const acquisition = dimension("acquisition", acquisitionCovered, "Landing page visits, campaign delivery, published social posts or new contacts in the period.", [
    { label: "New contacts per week", value: fmt(perWeek(f.newContacts)), target: "10", points: ratioPoints(perWeek(f.newContacts), 10, 40), max: 40 },
    { label: "Page visits per week", value: fmt(perWeek(f.visits)), target: "250", points: ratioPoints(perWeek(f.visits), 250, 30), max: 30 },
    { label: "Campaign click-through rate", value: f.campaignImpressions > 0 ? pctText(pct(f.campaignClicks, f.campaignImpressions)) : "No delivery data", target: "2%", points: ratioPoints(pct(f.campaignClicks, f.campaignImpressions), 2, 15), max: 15 },
    { label: "Active channels", value: String(f.connectedIntegrations + (f.socialPostsPublished > 0 ? 1 : 0)), target: "3", points: ratioPoints(f.connectedIntegrations + (f.socialPostsPublished > 0 ? 1 : 0), 3, 15), max: 15 },
  ]);

  // Conversion — does arriving demand turn into leads and deals?
  const conversionCovered = f.visits > 0 || f.formSubmissions > 0 || f.openDeals + f.wonDeals + f.lostDeals > 0;
  const closed = f.wonDeals + f.lostDeals;
  const conversion = dimension("conversion", conversionCovered, "Landing page visits, form submissions or deals in the period.", [
    { label: "Visit-to-conversion rate", value: f.visits > 0 ? pctText(pct(f.conversions, f.visits)) : "No visits yet", target: "3%", points: ratioPoints(pct(f.conversions, f.visits), 3, 35), max: 35 },
    { label: "Form submissions per week", value: fmt(perWeek(f.formSubmissions)), target: "5", points: ratioPoints(perWeek(f.formSubmissions), 5, 25), max: 25 },
    { label: "Deal win rate", value: closed > 0 ? pctText(pct(f.wonDeals, closed)) : "No closed deals yet", target: "25%", points: ratioPoints(pct(f.wonDeals, closed), 25, 25), max: 25 },
    { label: "Live conversion surfaces", value: String(f.publishedPages + f.activeForms), target: "3", points: ratioPoints(f.publishedPages + f.activeForms, 3, 15), max: 15 },
  ]);

  // Retention — are existing contacts still engaged?
  const retentionCovered = f.totalContacts > 0 && (f.emailsSent > 0 || f.wonDeals > 0 || f.openDeals > 0);
  const retention = dimension("retention", retentionCovered, "Contacts in the CRM plus email sends or deals in the period.", [
    { label: "Email open rate", value: f.emailsSent > 0 ? pctText(pct(f.emailsOpened, f.emailsSent)) : "No sends yet", target: "25%", points: ratioPoints(pct(f.emailsOpened, f.emailsSent), 25, 30), max: 30 },
    { label: "Email click rate", value: f.emailsSent > 0 ? pctText(pct(f.emailsClicked, f.emailsSent)) : "No sends yet", target: "3%", points: ratioPoints(pct(f.emailsClicked, f.emailsSent), 3, 25), max: 25 },
    { label: "Contacts reached in period", value: pctText(pct(Math.min(f.emailsSent, f.totalContacts), f.totalContacts)), target: "50%", points: ratioPoints(pct(Math.min(f.emailsSent, f.totalContacts), f.totalContacts), 50, 25), max: 25 },
    { label: "Unsubscribe rate", value: f.emailsSent > 0 ? pctText(pct(f.unsubscribes, f.emailsSent)) : "No sends yet", target: "under 0.5%", points: f.emailsSent === 0 ? 0 : clamp(Math.round(20 - (pct(f.unsubscribes, f.emailsSent) / 0.5) * 20), 20), max: 20 },
  ]);

  // Execution — is the team actually shipping and are the systems healthy?
  const executionCovered = f.activeCampaigns + f.activeWorkflows + f.publishedPages + f.socialPostsPublished + f.workflowRuns > 0;
  const execution = dimension("execution", executionCovered, "Active campaigns or workflows, published pages, social posts or workflow runs.", [
    { label: "Active campaigns", value: String(f.activeCampaigns), target: "2", points: ratioPoints(f.activeCampaigns, 2, 25), max: 25 },
    { label: "Active automations", value: String(f.activeWorkflows), target: "2", points: ratioPoints(f.activeWorkflows, 2, 25), max: 25 },
    { label: "Automation success rate", value: f.workflowRuns > 0 ? pctText(pct(f.workflowRuns - f.workflowFailures, f.workflowRuns)) : "No runs yet", target: "95%", points: f.workflowRuns > 0 ? ratioPoints(pct(f.workflowRuns - f.workflowFailures, f.workflowRuns), 95, 30) : 0, max: 30 },
    { label: "Content published per week", value: fmt(perWeek(f.socialPostsPublished + f.publishedPages)), target: "3", points: ratioPoints(perWeek(f.socialPostsPublished + f.publishedPages), 3, 20), max: 20 },
  ]);

  const dimensions = [acquisition, conversion, retention, execution];
  const covered = dimensions.filter((d) => d.covered);
  const coverage = covered.length / dimensions.length;
  const missing = dimensions.filter((d) => !d.covered).map((d) => `${d.label}: ${d.requirement}`);

  // Two covered dimensions is the floor for a defensible overall score.
  if (covered.length < 2) return { score: null, status: "insufficient_data", dimensions, coverage, missing, windowDays: f.windowDays };

  return {
    score: Math.round(covered.reduce((a, d) => a + (d.score ?? 0), 0) / covered.length),
    status: "scored",
    dimensions,
    coverage,
    missing,
    windowDays: f.windowDays,
  };
}

export const SCORE_BANDS: [min: number, label: string][] = [
  [80, "Strong"],
  [60, "Healthy"],
  [40, "Developing"],
  [0, "Needs attention"],
];

export const scoreBand = (score: number | null) => (score == null ? "Not scored" : SCORE_BANDS.find(([min]) => score >= min)![1]);
