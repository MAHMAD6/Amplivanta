import type { Field } from "./resource-dialog";

/** Field definitions for the non-CRM module create/edit dialogs. */

const STATUS = (opts: [string, string][]): Field["options"] => opts.map(([value, label]) => ({ value, label }));

export const CAMPAIGN_FIELDS: Field[] = [
  { name: "name", label: "Campaign name", required: true, placeholder: "Spring Product Launch" },
  { name: "objective", label: "Objective", colSpan: 1, placeholder: "Generate 1,000 leads" },
  { name: "budget", label: "Budget (USD)", type: "number", colSpan: 1, min: 0, placeholder: "50000" },
  {
    name: "status", label: "Status", type: "select", colSpan: 1,
    options: STATUS([["draft", "Draft"], ["active", "Active"], ["paused", "Paused"], ["scheduled", "Scheduled"], ["ended", "Ended"]]),
  },
  { name: "startDate", label: "Start date", type: "date", colSpan: 1 },
  { name: "endDate", label: "End date", type: "date", colSpan: 1 },
];

export const WORKFLOW_FIELDS: Field[] = [
  { name: "name", label: "Workflow name", required: true, placeholder: "Welcome Series — 5 emails" },
  { name: "trigger", label: "Trigger", colSpan: 1, placeholder: "New signup" },
  {
    name: "status", label: "Status", type: "select", colSpan: 1,
    options: STATUS([["draft", "Draft"], ["active", "Active"], ["paused", "Paused"]]),
  },
];

export const EMAIL_CAMPAIGN_FIELDS: Field[] = [
  { name: "name", label: "Campaign name", required: true, placeholder: "August Newsletter" },
  { name: "subject", label: "Subject line", required: true, placeholder: "What's new this month" },
  { name: "fromName", label: "From name", colSpan: 1, placeholder: "Amplivanta" },
  { name: "fromEmail", label: "From email", type: "email", colSpan: 1, placeholder: "hello@amplivanta.com" },
  { name: "previewText", label: "Preview text", placeholder: "Peek inside…" },
];

export const EMAIL_TEMPLATE_FIELDS: Field[] = [
  { name: "name", label: "Template name", required: true, placeholder: "Welcome email" },
  { name: "subject", label: "Default subject", placeholder: "Welcome to Amplivanta" },
  { name: "content", label: "Content", type: "textarea", placeholder: "Hi {{firstName}}, …" },
];

export const FORM_FIELDS: Field[] = [
  { name: "name", label: "Form name", required: true, placeholder: "Newsletter signup" },
  { name: "submitButtonText", label: "Button text", colSpan: 1, placeholder: "Subscribe" },
  { name: "successMessage", label: "Success message", colSpan: 1, placeholder: "Thank you!" },
  { name: "redirectUrl", label: "Redirect URL (optional)", placeholder: "https://…" },
];

export const SEGMENT_FIELDS: Field[] = [
  { name: "name", label: "Segment name", required: true, placeholder: "High-value SaaS leads" },
  { name: "description", label: "Description", type: "textarea", placeholder: "Contacts with lead score > 80…" },
];

export const LANDING_PAGE_FIELDS: Field[] = [
  { name: "title", label: "Page title", required: true, placeholder: "Growth Audit Promo" },
  { name: "slug", label: "URL slug", required: true, placeholder: "growth-audit" },
];

export const SOCIAL_POST_FIELDS: Field[] = [
  { name: "content", label: "Post content", type: "textarea", required: true, placeholder: "What's happening…" },
  {
    name: "status", label: "Status", type: "select", colSpan: 1,
    options: STATUS([["draft", "Draft"], ["scheduled", "Scheduled"], ["published", "Published"]]),
  },
  { name: "scheduledAt", label: "Schedule for", type: "date", colSpan: 1 },
];

export const STRATEGY_FIELDS: Field[] = [
  { name: "name", label: "Strategy name", required: true, placeholder: "H2 Growth Strategy" },
  { name: "description", label: "Description", type: "textarea", placeholder: "Focus areas, bets, and thesis…" },
  {
    name: "status", label: "Status", type: "select", colSpan: 1,
    options: STATUS([["active", "Active"], ["draft", "Draft"], ["archived", "Archived"]]),
  },
  { name: "startDate", label: "Start date", type: "date", colSpan: 1 },
  { name: "endDate", label: "End date", type: "date", colSpan: 1 },
];

export const GOAL_FIELDS: Field[] = [
  { name: "title", label: "Goal", required: true, placeholder: "Reach 10,000 MQLs" },
  { name: "metric", label: "Metric", colSpan: 1, required: true, placeholder: "MQLs" },
  { name: "targetValue", label: "Target", type: "number", colSpan: 1, required: true, placeholder: "10000" },
  { name: "currentValue", label: "Current", type: "number", colSpan: 1, min: 0, placeholder: "0" },
  { name: "deadline", label: "Deadline", type: "date", colSpan: 1 },
];

export const PERSONA_FIELDS: Field[] = [
  { name: "name", label: "Persona name", required: true, placeholder: "Growth Gary" },
  { name: "role", label: "Role / title", placeholder: "VP of Marketing" },
];

export const PROJECT_FIELDS: Field[] = [
  { name: "name", label: "Project name", required: true, placeholder: "Q3 Brand Refresh" },
  { name: "description", label: "Description", type: "textarea", placeholder: "Scope and goals…" },
  {
    name: "status", label: "Status", type: "select", colSpan: 1,
    options: STATUS([["active", "Active"], ["on_hold", "On hold"], ["completed", "Completed"]]),
  },
];

export const WEBHOOK_FIELDS: Field[] = [
  { name: "url", label: "Endpoint URL", required: true, placeholder: "https://example.com/webhooks/amplivanta" },
  { name: "events", label: "Events (comma-separated)", required: true, placeholder: "contact.created, deal.won" },
];

export const API_KEY_FIELDS: Field[] = [
  { name: "name", label: "Key name", required: true, placeholder: "Production server" },
];

export const ORGANIZATION_FIELDS: Field[] = [
  { name: "name", label: "Organization name", required: true, placeholder: "Acme Corp" },
  {
    name: "plan", label: "Plan", type: "select", colSpan: 1,
    options: STATUS([["Free", "Free"], ["Starter", "Starter"], ["Growth", "Growth"], ["Enterprise", "Enterprise"]]),
  },
  {
    name: "status", label: "Status", type: "select", colSpan: 1,
    options: STATUS([["active", "Active"], ["trial", "Trial"], ["suspended", "Suspended"]]),
  },
  { name: "userCount", label: "Seats", type: "number", colSpan: 1, min: 1, placeholder: "1" },
];

export const RECOMMENDATION_FIELDS: Field[] = [
  { name: "title", label: "Recommendation", required: true, placeholder: "Add exit-intent popup to pricing page" },
  { name: "body", label: "Details", type: "textarea", placeholder: "Why and how…" },
  {
    name: "impact", label: "Impact", type: "select", colSpan: 1,
    options: STATUS([["high", "High"], ["medium", "Medium"], ["low", "Low"]]),
  },
  {
    name: "category", label: "Category", type: "select", colSpan: 1,
    options: STATUS([["growth", "Growth"], ["acquisition", "Acquisition"], ["retention", "Retention"], ["conversion", "Conversion"]]),
  },
];
