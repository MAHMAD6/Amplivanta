/**
 * Editorial content for the marketing blog.
 *
 * The index and the article pages read from this one list so a card can never
 * link to a post that does not exist. Adding a post here publishes it in both
 * places; there is no separate route file to remember.
 */

export type BlogSection = { heading: string; paragraphs: string[]; bullets?: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tag: string;
  /** One of the blog's topic cards, used by the library filter. */
  topic: string;
  readMinutes: number;
  intro: string;
  sections: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "growth-loops-vs-funnels",
    title: "Growth loops vs funnels: which one actually compounds?",
    excerpt: "Funnels leak. Loops compound. Here's how to design and instrument the difference.",
    author: "Alex Johnson",
    date: "Aug 10, 2026",
    tag: "Strategy",
    topic: "Growth Strategy",
    readMinutes: 7,
    intro:
      "A funnel spends attention to produce a customer. A loop spends a customer to produce more attention. That single difference decides whether your acquisition costs rise every quarter or fall.",
    sections: [
      {
        heading: "The funnel is a budget, not a system",
        paragraphs: [
          "Funnels model a one-way trip: impressions become visits, visits become signups, signups become customers. Every stage leaks, and the only lever that reliably increases output is more input at the top. That makes growth a function of spend, which means the moment budget flattens, growth flattens with it.",
          "This is not an argument against measuring funnels. Stage conversion is the clearest diagnostic you have. It is an argument against treating the funnel as your growth model, because a diagnostic tool cannot tell you where compounding comes from.",
        ],
      },
      {
        heading: "What makes a loop a loop",
        paragraphs: [
          "A growth loop closes: the output of one cycle becomes the input of the next. If new users produce something — content, invitations, referrals, public artifacts, data that improves the product — and that output brings in new users, you have a loop. If it does not close, you have a funnel with extra steps.",
          "Most products can run more than one. They compete for the same engineering time, so it is worth naming them explicitly rather than discovering them by accident.",
        ],
        bullets: [
          "Content loop: users create public artifacts that rank and attract more users.",
          "Viral loop: users invite collaborators because the product is more useful shared.",
          "Paid loop: revenue from a cohort funds acquisition of the next, and only compounds if payback is shorter than the reinvestment cycle.",
          "Data loop: usage improves recommendations, which improves retention, which increases usage.",
        ],
      },
      {
        heading: "Instrument the closing step, not the whole diagram",
        paragraphs: [
          "The mistake teams make is measuring every stage of the loop with equal care. The stage that matters is the one where the loop closes — the point where output becomes new input. If that number is below one, the loop is decorative: it is a funnel that happens to be drawn in a circle.",
          "Track the loop's cycle time alongside its coefficient. A loop with a coefficient of 1.2 and a cycle time of nine months compounds more slowly than a coefficient of 1.05 that turns over weekly. Cycle time is usually the more tractable of the two.",
        ],
      },
      {
        heading: "When a funnel is the right answer",
        paragraphs: [
          "High-consideration enterprise sales, regulated categories, and products bought once every few years do not loop well. Forcing a loop onto them produces referral programs nobody uses. In those markets the honest model is a funnel, and the work is stage conversion and sales efficiency.",
          "The useful question is not which model is better. It is which one your category actually supports, and whether you are investing as if the answer were the other one.",
        ],
      },
    ],
  },
  {
    slug: "ai-in-lifecycle-marketing",
    title: "The realistic guide to AI in lifecycle marketing (2026 edition)",
    excerpt: "What actually works — and where AI still gets teams into trouble.",
    author: "Priya Ramesh",
    date: "Aug 7, 2026",
    tag: "AI",
    topic: "AI & Workflows",
    readMinutes: 9,
    intro:
      "Two years of production experience has sorted AI's lifecycle claims into three piles: reliably useful, useful with supervision, and still a liability. Here is where each line falls today.",
    sections: [
      {
        heading: "Reliably useful",
        paragraphs: [
          "Drafting is solved well enough to change how teams work. Variant generation, subject-line alternatives, tone adaptation across segments, and translating one campaign into six locales are all faster and no worse than what a rushed human produces on a Friday.",
          "Summarisation across unstructured inputs is the other clear win: support transcripts, survey free-text, sales call notes. These are tasks where a slightly imperfect result still beats the realistic alternative, which is that nobody reads the data at all.",
        ],
      },
      {
        heading: "Useful with supervision",
        paragraphs: [
          "Segmentation suggestions and send-time optimisation work, but they need a human to sanity-check the segment definition before it drives a send. Models are good at finding a pattern and bad at knowing when the pattern is an artifact of a tracking bug.",
          "The same applies to churn scoring. A score is a prioritisation aid. The moment it becomes an automatic trigger for a discount, you have built a system that teaches customers to look like they are leaving.",
        ],
      },
      {
        heading: "Still a liability",
        paragraphs: [
          "Anything that makes a factual claim about a customer's account, entitlement, or billing state should not be generated. Retrieve it. A model that writes \"your plan includes\" is guessing at exactly the sentence a customer will hold you to.",
          "Fully autonomous campaign launches remain a bad trade. The failure mode is not a slightly worse email; it is ten thousand slightly worse emails sent before anyone notices, in a channel where reputation damage is measured in months of deliverability.",
        ],
      },
      {
        heading: "The controls that actually matter",
        paragraphs: [
          "Teams that run AI safely in lifecycle share the same four controls, and none of them are exotic.",
        ],
        bullets: [
          "A hard approval gate before anything reaches a real recipient list.",
          "Volume caps per campaign, enforced by the sending system rather than by policy.",
          "Retrieval, not generation, for any account-specific fact.",
          "An audit trail that records which model, which prompt, and which human approved it.",
        ],
      },
      {
        heading: "The honest summary",
        paragraphs: [
          "AI has substantially reduced the cost of producing lifecycle marketing. It has not reduced the cost of being wrong, and in a channel with unsubscribe buttons and spam complaints, being wrong is still the expensive part. Spend the savings on review capacity rather than on volume.",
        ],
      },
    ],
  },
  {
    slug: "attribution-that-holds-up",
    title: "Attribution that holds up in the boardroom",
    excerpt: "A model finance signs off on, without pretending single-touch works.",
    author: "Sarah Chen",
    date: "Aug 3, 2026",
    tag: "Analytics",
    topic: "Analytics",
    readMinutes: 8,
    intro:
      "Attribution arguments are rarely about statistics. They are about whether the marketing team's numbers and the finance team's numbers can be reconciled in the same meeting. That is a solvable problem, and it does not require a perfect model.",
    sections: [
      {
        heading: "Start from the reconciliation, not the model",
        paragraphs: [
          "Pick the finance number first — booked revenue, recognised revenue, net of refunds, whatever the board sees — and make attribution explain that number and no other. Most credibility problems come from marketing reporting on a metric that has no arithmetic relationship to anything in the financial statements.",
          "Once the denominator matches, disagreements become about credit allocation, which is a far more productive argument than one about whether the number is real.",
        ],
      },
      {
        heading: "Run two models on purpose",
        paragraphs: [
          "Keep a deterministic, last-non-direct model as the operational default. It is simple, stable, and reproducible, which makes it good for week-to-week decisions and terrible for measuring brand or upper-funnel work.",
          "Alongside it, run an incrementality view built from holdouts and geo tests. Do not try to reconcile the two into a single number. Report them as what they are: one measures routing, the other measures lift. Presenting both, with their disagreement visible, builds more trust than presenting one with false confidence.",
        ],
      },
      {
        heading: "Say what the model cannot see",
        paragraphs: [
          "Every attribution deck should carry a short, unglamorous list of known blind spots — cross-device gaps, consent-declined traffic, dark social, offline conversations. Naming them costs you nothing and pre-empts the question that otherwise derails the meeting.",
          "The teams whose attribution survives scrutiny are not the ones with the most sophisticated model. They are the ones who can state, without hedging, which decisions their model is good enough to support and which it is not.",
        ],
      },
      {
        heading: "The minimum viable setup",
        paragraphs: ["If you are rebuilding from scratch, this order gets you to a defensible position fastest."],
        bullets: [
          "Agree the revenue definition with finance, in writing.",
          "Instrument conversions server-side so consent and ad-blocking do not silently reshape the data.",
          "Ship last-non-direct as the operational model.",
          "Add a quarterly holdout for your two largest channels.",
          "Publish the blind-spot list with every report.",
        ],
      },
    ],
  },
  {
    slug: "pql-scoring-for-plg",
    title: "PQL scoring for PLG: 12 signals that actually predict conversion",
    excerpt: "The signals worth tracking — and the ones you should stop weighting.",
    author: "Marcus Lee",
    date: "Jul 28, 2026",
    tag: "PLG",
    topic: "Growth Strategy",
    readMinutes: 6,
    intro:
      "Most product-qualified lead scores are demographic models wearing a product-usage costume. The signals below are the ones that repeatedly survive validation across self-serve products.",
    sections: [
      {
        heading: "Signals that predict",
        paragraphs: [
          "The common thread is investment that is costly to fake and expensive to abandon. A user who has imported their own data, invited a colleague, and connected a system of record has made three decisions that are annoying to reverse.",
        ],
        bullets: [
          "Real data imported, rather than sample data explored.",
          "A second user from the same email domain, active in the same workspace.",
          "An integration connected to a system the company already depends on.",
          "A scheduled or recurring action configured, not just run once.",
          "Return visits on three separate days within the first week.",
          "Depth: reaching a feature that only makes sense after the core workflow is understood.",
          "An export, share link, or report sent to someone outside the workspace.",
          "A billing page visit that is not immediately followed by a churn signal.",
          "A support question about limits or pricing tiers rather than about how to start.",
          "Workspace naming and settings customised away from defaults.",
          "Volume crossing a threshold that makes the free tier genuinely inconvenient.",
          "A second workspace or project created.",
        ],
      },
      {
        heading: "Signals to stop weighting",
        paragraphs: [
          "Total session count and total time-in-app correlate with confusion as often as with intent. Company size and job title are useful for routing and useless for timing. Email opens on onboarding sequences measure your subject lines, not the account.",
          "Feature-flag exposure is the subtlest offender: if you score on features you selectively expose, your model will faithfully learn your rollout plan and tell you nothing about the user.",
        ],
      },
      {
        heading: "Scoring hygiene",
        paragraphs: [
          "Score at the account level, not the user level; in a PLG motion the buying unit is almost never one person. Decay scores over time so an account that was hot in March does not stay in the queue in July. And validate against closed-won, never against sales-accepted, or you are measuring how your own team triages.",
        ],
      },
    ],
  },
  {
    slug: "workflow-anti-patterns",
    title: "8 workflow anti-patterns to avoid",
    excerpt: "The automations that quietly cost you more than they earn.",
    author: "Emily Davis",
    date: "Jul 22, 2026",
    tag: "Automation",
    topic: "Marketing Automation",
    readMinutes: 6,
    intro:
      "Automation failures are rarely loud. They are workflows that run correctly for months while producing a slightly worse outcome than doing nothing. These eight show up most often.",
    sections: [
      {
        heading: "The eight",
        paragraphs: ["Each of these has a plausible-sounding rationale, which is exactly why they survive review."],
        bullets: [
          "The unbounded loop: a workflow whose output re-triggers its own entry condition. Always cap executions per record.",
          "The silent failure: an error branch that logs and exits. If nobody is paged, the workflow has been off since April.",
          "The overlapping enrolment: a contact enrolled in four sequences that each assume they are the only sender.",
          "The stale condition: branching on a field that a migration renamed six months ago, so every record takes the else path.",
          "The instant follow-up: firing a \"just checking in\" message ninety seconds after a form submission.",
          "The unreversible action: automation that deletes, merges, or downgrades with no audit trail and no undo.",
          "The timezone assumption: send-time logic written in the builder's timezone, delivered at 3am to half the list.",
          "The orphan: a workflow whose owner left, whose purpose nobody remembers, and which nobody will turn off.",
        ],
      },
      {
        heading: "The review that catches all eight",
        paragraphs: [
          "Once a quarter, list every active workflow with its execution count, error rate, and last-modified date. Anything with zero executions is dead weight. Anything with a non-zero error rate and no alert is an outage you have not noticed. Anything without a named owner gets one or gets disabled.",
          "This review takes an afternoon and consistently finds more value than building the next automation would have.",
        ],
      },
    ],
  },
  {
    slug: "landing-page-ab-testing",
    title: "Landing page A/B testing: a rigorous checklist",
    excerpt: "Stop shipping tests you can't read. Here's the discipline that works.",
    author: "Daniel Williams",
    date: "Jul 15, 2026",
    tag: "CRO",
    topic: "Analytics",
    readMinutes: 7,
    intro:
      "Most landing page tests are unreadable before they launch. The sample size was never going to be sufficient, the metric was chosen after the fact, or the variant changed six things at once. A short pre-launch checklist prevents nearly all of it.",
    sections: [
      {
        heading: "Before you build the variant",
        paragraphs: [
          "Write down the hypothesis as a sentence with a direction and a mechanism: not \"a new headline will perform better\" but \"leading with the integration list will increase demo requests from visitors arriving on integration keywords, because they are evaluating compatibility first.\"",
          "Then compute the required sample size from your current conversion rate and the smallest lift that would change a decision. If the answer is longer than your traffic can supply in six weeks, do not run the test. Ship the change you believe in, or find a higher-traffic surface to test on.",
        ],
      },
      {
        heading: "Before you launch",
        paragraphs: ["Five checks, none of which take more than a few minutes."],
        bullets: [
          "One primary metric, declared in writing, before any data exists.",
          "A minimum runtime covering at least two full business cycles, so weekday and weekend traffic are both represented.",
          "Variants that differ in one mechanism, even if that mechanism touches several elements.",
          "An A/A sanity check if you have never validated the assignment mechanism on this surface.",
          "Confirmation that assignment is sticky across sessions and devices where you can identify the visitor.",
        ],
      },
      {
        heading: "While it runs, and after",
        paragraphs: [
          "Do not stop early on a good-looking result. Peeking and stopping is the single most common way teams generate lifts that fail to replicate. Set the runtime, then leave it alone.",
          "When it ends, record the outcome whatever it was — including flat results, which are the majority and the most useful for calibrating future hypotheses. A test log that only contains wins is a record of your stopping rule, not your learning.",
        ],
      },
    ],
  },
];

export const BLOG_POST_BY_SLUG = new Map(BLOG_POSTS.map((p) => [p.slug, p]));
