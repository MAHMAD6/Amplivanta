export const CAMPAIGN_STATUSES: [string, string][] = [["planning", "Planning"], ["active", "Active"], ["completed", "Completed"], ["archived", "Archived"]];
export const TASK_STATUSES: [string, string][] = [["open", "Not Started"], ["in_progress", "In Progress"], ["waiting", "Waiting"], ["done", "Completed"]];
export const TASK_PRIORITIES: [string, string][] = [["low", "Low"], ["medium", "Medium"], ["high", "High"]];
export const NOTE_CATEGORIES: [string, string][] = [["idea", "Ideas"], ["meeting", "Meetings"], ["research", "Research"], ["strategy", "Strategy"], ["uncategorized", "Uncategorized"]];
export const WORKFLOW_STATUSES: [string, string][] = [["active", "Active"], ["inactive", "Inactive"], ["draft", "Draft"]];
export const WORKFLOW_TRIGGERS: [string, string][] = [
  ["contact.created", "Contact created"],
  ["form.submitted", "Form submitted"],
  ["deal.won", "Deal won"],
  ["tag.added", "Tag added"],
  ["schedule", "On a schedule"],
];
export const label = (list: [string, string][], v: string) => list.find(([k]) => k === v)?.[1] ?? v;
