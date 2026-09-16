/** Workflow graph model shared by the builder, the engine and templates. Nodes run in list order. */

export const NODE_TYPES = ["trigger", "condition", "delay", "email", "tag", "webhook", "goal"] as const;
export type NodeType = (typeof NODE_TYPES)[number];

export type WorkflowNodeSpec = { id: string; type: NodeType; name: string; config: Record<string, string> };

export const NODE_LABELS: Record<NodeType, string> = {
  trigger: "Trigger",
  condition: "Condition",
  delay: "Delay",
  email: "Email",
  tag: "Tag",
  webhook: "Webhook",
  goal: "Goal",
};

/** Config fields each node type accepts, with their labels. */
export const NODE_FIELDS: Record<NodeType, [key: string, label: string, kind: "text" | "number" | "select"][]> = {
  trigger: [["event", "Starts when", "select"]],
  condition: [["field", "Contact field", "select"], ["operator", "Operator", "select"], ["value", "Value", "text"]],
  delay: [["minutes", "Wait (minutes)", "number"]],
  email: [["subject", "Subject", "text"], ["body", "Message", "text"]],
  tag: [["tag", "Tag to add", "text"]],
  webhook: [["url", "HTTPS endpoint", "text"]],
  goal: [["name", "Goal name", "text"]],
};

export const CONDITION_FIELDS: [string, string][] = [["email", "Email"], ["status", "Status"], ["jobTitle", "Job title"], ["companyName", "Company"], ["leadScore", "Lead score"], ["tags", "Tags"]];
export const CONDITION_OPERATORS: [string, string][] = [["equals", "equals"], ["contains", "contains"], ["gte", "is at least"], ["exists", "is set"]];

export type ContactFacts = { email?: string | null; status?: string | null; jobTitle?: string | null; companyName?: string | null; leadScore?: number | null; tags?: string[] };

export function evaluateCondition(config: Record<string, string>, contact: ContactFacts | null): boolean {
  if (!contact) return false;
  const raw = (contact as Record<string, unknown>)[config.field ?? ""];
  const want = (config.value ?? "").trim().toLowerCase();
  switch (config.operator) {
    case "exists":
      return Array.isArray(raw) ? raw.length > 0 : raw != null && String(raw) !== "";
    case "equals":
      return Array.isArray(raw) ? raw.some((t) => String(t).toLowerCase() === want) : String(raw ?? "").toLowerCase() === want;
    case "contains":
      return Array.isArray(raw) ? raw.some((t) => String(t).toLowerCase().includes(want)) : String(raw ?? "").toLowerCase().includes(want);
    case "gte":
      return Number(raw ?? 0) >= Number(want);
    default:
      return false;
  }
}

/** Problems that block publishing. An empty list means the graph can go live. */
export function validateGraph(nodes: WorkflowNodeSpec[]): string[] {
  const issues: string[] = [];
  if (!nodes.length) return ["Add a trigger to begin."];
  if (nodes[0].type !== "trigger") issues.push("The first node must be a trigger.");
  if (nodes.filter((n) => n.type === "trigger").length > 1) issues.push("Use a single trigger per workflow.");
  if (nodes.length < 2) issues.push("Add at least one action after the trigger.");
  for (const n of nodes) {
    const c = n.config ?? {};
    if (n.type === "trigger" && !c.event) issues.push(`${n.name}: choose what starts the workflow.`);
    if (n.type === "delay" && !(Number(c.minutes) > 0)) issues.push(`${n.name}: enter a wait longer than zero minutes.`);
    if (n.type === "email" && (!c.subject?.trim() || !c.body?.trim())) issues.push(`${n.name}: add a subject and message.`);
    if (n.type === "tag" && !c.tag?.trim()) issues.push(`${n.name}: enter a tag.`);
    if (n.type === "webhook" && !/^https:\/\//i.test(c.url ?? "")) issues.push(`${n.name}: webhooks must use an https URL.`);
    if (n.type === "condition" && (!c.field || !c.operator)) issues.push(`${n.name}: choose a field and operator.`);
  }
  return issues;
}

/** Parses untrusted builder JSON into node specs, dropping anything malformed. */
export function parseNodes(input: unknown): WorkflowNodeSpec[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 50).flatMap((n, i) => {
    if (!n || typeof n !== "object") return [];
    const o = n as Record<string, unknown>;
    if (!NODE_TYPES.includes(o.type as NodeType)) return [];
    const cfg = o.config && typeof o.config === "object" ? (o.config as Record<string, unknown>) : {};
    const config = Object.fromEntries(
      NODE_FIELDS[o.type as NodeType].map(([k]) => [k, String(cfg[k] ?? "").slice(0, k === "body" ? 5000 : 300)]),
    );
    return [{ id: typeof o.id === "string" && o.id ? o.id.slice(0, 40) : `n${i}`, type: o.type as NodeType, name: String(o.name || NODE_LABELS[o.type as NodeType]).slice(0, 80), config }];
  });
}

export type AutomationTemplate = { key: string; name: string; description: string; category: string; objective: string; channel: string; tags: string[]; trigger: string; nodes: Omit<WorkflowNodeSpec, "id">[] };

const email = (name: string, subject: string, body: string) => ({ type: "email" as const, name, config: { subject, body } });
const wait = (days: number) => ({ type: "delay" as const, name: `Wait ${days} day${days > 1 ? "s" : ""}`, config: { minutes: String(days * 1440) } });
const start = (event: string) => ({ type: "trigger" as const, name: "Trigger", config: { event } });

/** Starting points only: every template creates an editable draft; nothing is sent until published. */
export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  { key: "lead-nurture", name: "Lead Nurture", description: "Nurture leads with relevant content and timely follow-ups to build trust and move them closer to conversion.", category: "nurturing", objective: "convert", channel: "email", tags: ["Nurturing", "Multi-step"], trigger: "form.submitted", nodes: [start("form.submitted"), email("Welcome", "Thanks for your interest, {{firstName}}", "Here is what to expect next."), wait(3), email("Helpful resources", "Resources picked for you", "A short guide to getting results."), { type: "tag", name: "Tag nurtured", config: { tag: "nurtured" } }] },
  { key: "welcome-series", name: "Welcome Series", description: "Make a great first impression with an automated series that welcomes and introduces your brand.", category: "onboarding", objective: "engage", channel: "email", tags: ["Onboarding", "Email"], trigger: "contact.created", nodes: [start("contact.created"), email("Welcome email", "Welcome aboard, {{firstName}}", "We're glad you're here."), wait(2), email("Getting started", "Your first steps", "Three things to try this week.")] },
  { key: "re-engagement", name: "Re-engagement", description: "Reconnect with inactive contacts with personalized messages and incentives.", category: "reengagement", objective: "engage", channel: "email", tags: ["Re-engagement", "Win-back"], trigger: "tag.added", nodes: [start("tag.added"), email("We miss you", "Still interested, {{firstName}}?", "Here's what's new since your last visit."), wait(7), { type: "tag", name: "Tag win-back sent", config: { tag: "win-back-sent" } }] },
  { key: "demo-follow-up", name: "Demo Follow-up", description: "Follow up after a demo with helpful resources and next steps to keep the conversation moving.", category: "sales", objective: "convert", channel: "email", tags: ["Sales", "Follow-up"], trigger: "form.submitted", nodes: [start("form.submitted"), wait(1), email("Demo recap", "Thanks for the demo, {{firstName}}", "A recap and suggested next steps."), { type: "goal", name: "Meeting booked", config: { name: "Meeting booked" } }] },
  { key: "webinar-reminder", name: "Webinar Reminder", description: "Drive attendance and reduce no-shows with timely reminders and follow-up communications.", category: "events", objective: "engage", channel: "email", tags: ["Events", "Reminders"], trigger: "form.submitted", nodes: [start("form.submitted"), email("Registration confirmed", "You're registered", "Save the date and add it to your calendar."), wait(1), email("Reminder", "Starting soon", "Join link and agenda inside.")] },
  { key: "abandoned-form", name: "Abandoned Form Recovery", description: "Automatically follow up with leads who started but didn't complete your forms.", category: "lead_generation", objective: "convert", channel: "email", tags: ["Recovery", "Lead Capture"], trigger: "event:form.abandoned", nodes: [start("event:form.abandoned"), wait(1), email("Finish where you left off", "Need a hand, {{firstName}}?", "You were almost done — pick up where you left off.")] },
  { key: "post-purchase", name: "Post-Purchase Follow-up", description: "Delight customers after purchase with onboarding tips, resources, and support.", category: "post_purchase", objective: "experience", channel: "email", tags: ["Customer Success", "Retention"], trigger: "deal.won", nodes: [start("deal.won"), email("Thank you", "Thank you for choosing us", "Here is how to get started."), wait(14), email("Check-in", "How is it going?", "Reply to this email if you need anything.")] },
  { key: "feedback-request", name: "Feedback Request", description: "Collect feedback and reviews to improve your offering and build social proof.", category: "feedback", objective: "experience", channel: "email", tags: ["Feedback", "Surveys"], trigger: "deal.won", nodes: [start("deal.won"), wait(30), email("Feedback", "Two minutes of feedback?", "Tell us what's working and what isn't."), { type: "tag", name: "Tag feedback requested", config: { tag: "feedback-requested" } }] },
];
