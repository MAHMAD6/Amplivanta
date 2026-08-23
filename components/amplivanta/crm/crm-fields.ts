import type { Field } from "../crud/resource-dialog";

/** Shared field definitions for the CRM create/edit dialogs. */

export const CONTACT_FIELDS: Field[] = [
  { name: "firstName", label: "First name", colSpan: 1, required: true, placeholder: "Sophia" },
  { name: "lastName", label: "Last name", colSpan: 1, placeholder: "Martinez" },
  { name: "email", label: "Email", type: "email", placeholder: "sophia@company.com" },
  { name: "phone", label: "Phone", colSpan: 1, placeholder: "(555) 234-5678" },
  { name: "jobTitle", label: "Job title", colSpan: 1, placeholder: "Marketing Director" },
  { name: "leadScore", label: "Lead score", type: "number", colSpan: 1, min: 0, max: 100, placeholder: "50" },
  {
    name: "status",
    label: "Stage",
    type: "select",
    colSpan: 1,
    options: [
      { value: "new", label: "New" },
      { value: "qualified", label: "Qualified" },
      { value: "engaged", label: "Engaged" },
      { value: "customer", label: "Customer" },
    ],
  },
];

export const COMPANY_FIELDS: Field[] = [
  { name: "name", label: "Company name", required: true, placeholder: "BrightTech Inc." },
  { name: "domain", label: "Domain", colSpan: 1, placeholder: "brighttech.com" },
  { name: "industry", label: "Industry", colSpan: 1, placeholder: "Software" },
  {
    name: "size",
    label: "Size",
    type: "select",
    colSpan: 1,
    options: [
      { value: "smb", label: "SMB" },
      { value: "growth", label: "Growth" },
      { value: "enterprise", label: "Enterprise" },
    ],
  },
  { name: "location", label: "Location", colSpan: 1, placeholder: "San Francisco, CA" },
];

export const TASK_FIELDS: Field[] = [
  { name: "title", label: "Task", required: true, placeholder: "Send proposal to BrightTech" },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    colSpan: 1,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    colSpan: 1,
    options: [
      { value: "open", label: "Todo" },
      { value: "in_progress", label: "In Progress" },
      { value: "done", label: "Done" },
    ],
  },
  { name: "dueDate", label: "Due date", type: "date", colSpan: 1 },
];

/** Deal fields depend on the workspace's pipeline stages, so they're built dynamically. */
export function dealFields(stages: { value: string; label: string }[]): Field[] {
  return [
    { name: "name", label: "Deal name", required: true, placeholder: "BrightTech — Enterprise Upgrade" },
    { name: "value", label: "Value (USD)", type: "number", colSpan: 1, min: 0, placeholder: "34850" },
    { name: "closeDate", label: "Expected close", type: "date", colSpan: 1 },
    ...(stages.length ? [{ name: "stageId", label: "Stage", type: "select" as const, options: stages }] : []),
  ];
}
