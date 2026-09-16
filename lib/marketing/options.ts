/** Marketing Automation option lists: [value, label] pairs shared by pages and actions. */

export type Opt = [string, string][];
export const label = (list: Opt, v: string | null | undefined) => list.find(([k]) => k === v)?.[1] ?? (v || "—");
export const inList = (v: string, list: Opt) => list.some(([k]) => k === v);

/** "planning" is the AI Workspace's name for a campaign that has not started; it reads as Draft here. */
export const CAMPAIGN_STATUSES: Opt = [["planning", "Draft"], ["scheduled", "Scheduled"], ["active", "Active"], ["paused", "Paused"], ["completed", "Completed"], ["archived", "Archived"]];
export const CAMPAIGN_CHANNELS: Opt = [["email", "Email"], ["social", "Social"], ["landing_page", "Landing Page"], ["paid", "Paid Ads"], ["multi", "Multi-channel"]];
export const CAMPAIGN_GOALS: Opt = [["awareness", "Awareness"], ["leads", "Lead Generation"], ["conversion", "Conversion"], ["retention", "Retention"], ["event", "Event Registration"]];

export const WORKFLOW_STATUSES: Opt = [["draft", "Draft"], ["active", "Active"], ["inactive", "Paused"]];
export const WORKFLOW_TRIGGERS: Opt = [
  ["contact.created", "Contact created"],
  ["form.submitted", "Form submitted"],
  ["deal.won", "Deal won"],
  ["tag.added", "Tag added"],
  ["event", "Custom event"],
  ["manual", "Manual / API"],
];
export const EXECUTION_STATUSES: Opt = [["running", "Running"], ["waiting", "Waiting"], ["completed", "Completed"], ["failed", "Failed"]];
export const ENVIRONMENTS: Opt = [["live", "Live"], ["test", "Test"]];

export const EMAIL_STATUSES: Opt = [["draft", "Draft"], ["scheduled", "Scheduled"], ["sending", "Sending"], ["sent", "Sent"], ["paused", "Paused"]];
export const FORM_STATUSES: Opt = [["draft", "Draft"], ["active", "Active"], ["archived", "Archived"]];
export const PAGE_STATUSES: Opt = [["draft", "Draft"], ["scheduled", "Scheduled"], ["published", "Published"], ["archived", "Archived"]];
export const SEGMENT_TYPES: Opt = [["dynamic", "Dynamic Segment"], ["static", "Static List"]];
export const SEGMENT_STATUSES: Opt = [["active", "Active"], ["paused", "Paused"]];
export const SEGMENT_SOURCES: Opt = [["crm", "CRM"], ["import", "Import"], ["form", "Form"]];
export const EXPERIMENT_STATUSES: Opt = [["draft", "Draft"], ["running", "Running"], ["paused", "Paused"], ["completed", "Completed"]];
export const EXPERIMENT_GOALS: Opt = [["form_submission", "Form submission"], ["form_start", "Form start"]];

export const EVENT_SOURCES: Opt = [["custom", "Custom / API"], ["form", "Forms"], ["crm", "CRM"], ["landing_page", "Landing Pages"], ["webhook", "Webhook"]];
export const ATTRIBUTION_MODELS: Opt = [["first_touch", "First touch"], ["last_touch", "Last touch"], ["linear", "Linear"], ["time_decay", "Time decay"]];
export const LOOKBACK_WINDOWS: Opt = [["7", "7 days"], ["14", "14 days"], ["30", "30 days"], ["60", "60 days"], ["90", "90 days"]];

export const TEMPLATE_CATEGORIES: Opt = [
  ["lead_generation", "Lead Generation"],
  ["nurturing", "Nurturing"],
  ["sales", "Sales & Conversion"],
  ["onboarding", "Customer Onboarding"],
  ["retention", "Customer Retention"],
  ["events", "Events & Webinars"],
  ["post_purchase", "Post-Purchase"],
  ["reengagement", "Re-engagement"],
  ["feedback", "Surveys & Feedback"],
  ["internal", "Internal Workflows"],
];
export const TEMPLATE_OBJECTIVES: Opt = [["convert", "Drive conversions"], ["engage", "Engagement"], ["experience", "Customer experience"]];
