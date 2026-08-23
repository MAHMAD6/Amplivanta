/**
 * Part 2 taskbook — types + static fallback data for the newly designed pages.
 * Live loaders in lib/server/loaders.ts hydrate these shapes from Postgres and
 * fall back to the constants here when a workspace has no rows yet.
 */

/* ---------------------------------------------------------------- Companies */

export type HealthTone = "Healthy" | "Neutral" | "At Risk" | "Critical";

export interface CompanyRow {
  id: string;
  name: string;
  domain: string;
  industry: string;
  owner: string;
  plan: string;
  arr: number;
  openDeals: number;
  contacts: number;
  health: HealthTone;
  lastActivity: string;
}

export const COMPANIES: CompanyRow[] = [
  { id: "c1", name: "Nexora Systems", domain: "nexora.com", industry: "Software", owner: "Sarah Johnson", plan: "Growth", arr: 215000, openDeals: 3, contacts: 12, health: "Healthy", lastActivity: "2h ago" },
  { id: "c2", name: "Orbit Health", domain: "orbithealth.io", industry: "Healthcare", owner: "Marcus Reid", plan: "Enterprise", arr: 184000, openDeals: 2, contacts: 18, health: "Healthy", lastActivity: "5h ago" },
  { id: "c3", name: "BlueStone Capital", domain: "bluestone.co", industry: "Financial Services", owner: "Elena Cruz", plan: "Growth", arr: 123000, openDeals: 1, contacts: 9, health: "At Risk", lastActivity: "1d ago" },
  { id: "c4", name: "Luminary Retail", domain: "luminary.shop", industry: "Retail", owner: "Priya Nair", plan: "Growth", arr: 98500, openDeals: 2, contacts: 15, health: "Neutral", lastActivity: "2d ago" },
  { id: "c5", name: "Vertex Analytics", domain: "vertex.ai", industry: "Analytics", owner: "Tom Fisher", plan: "Enterprise", arr: 276000, openDeals: 4, contacts: 22, health: "Healthy", lastActivity: "1h ago" },
  { id: "c6", name: "Pioneer Logistics", domain: "pioneerlog.com", industry: "Logistics", owner: "Dana White", plan: "Growth", arr: 110000, openDeals: 1, contacts: 11, health: "Neutral", lastActivity: "3d ago" },
  { id: "c7", name: "Greenfield Energy", domain: "greenfield.energy", industry: "Energy", owner: "Sarah Johnson", plan: "Growth", arr: 142000, openDeals: 2, contacts: 14, health: "At Risk", lastActivity: "4h ago" },
  { id: "c8", name: "Summit Tech", domain: "summittech.io", industry: "Technology", owner: "Marcus Reid", plan: "Enterprise", arr: 320000, openDeals: 5, contacts: 27, health: "Healthy", lastActivity: "30m ago" },
];

/* ------------------------------------------------------------ Conversions */

export type ConversionType = "Website" | "Form" | "Event";

export interface ConversionRow {
  id: string;
  name: string;
  hint: string;
  type: ConversionType;
  source: string;
  status: "Active" | "Paused";
  conversions: number;
  rate: number;
  delta: number;
  value: number;
  lastTriggered: string;
}

export const CONVERSIONS: ConversionRow[] = [
  { id: "cv1", name: "Purchase Completed", hint: "Thank you page", type: "Website", source: "Landing Page", status: "Active", conversions: 8742, rate: 7.23, delta: 0.86, value: 72430, lastTriggered: "2m ago" },
  { id: "cv2", name: "Lead Form Submitted", hint: "Contact us form", type: "Form", source: "All Pages", status: "Active", conversions: 6391, rate: 5.11, delta: 0.73, value: 12782, lastTriggered: "5m ago" },
  { id: "cv3", name: "Trial Started", hint: "Signup completed", type: "Event", source: "Signup Page", status: "Active", conversions: 4128, rate: 9.34, delta: 1.12, value: 0, lastTriggered: "12m ago" },
  { id: "cv4", name: "Demo Booked", hint: "Calendar booking", type: "Event", source: "All Pages", status: "Active", conversions: 1826, rate: 3.45, delta: 0.98, value: 9130, lastTriggered: "18m ago" },
  { id: "cv5", name: "Content Download", hint: "Resource center", type: "Event", source: "Blog Pages", status: "Paused", conversions: 1234, rate: 2.11, delta: -0.21, value: 0, lastTriggered: "3h ago" },
];

/* --------------------------------------------------------- Deliverability */

export interface DeliverabilityCampaign {
  id: string;
  name: string;
  sent: number;
  delivered: number;
  inboxRate: number;
  openRate: number;
  bounceRate: number;
  spamRate: number;
  status: "Good" | "Warning" | "Poor";
}

export const DELIVERABILITY_CAMPAIGNS: DeliverabilityCampaign[] = [
  { id: "d1", name: "Product Launch: Amplivanta AI", sent: 512340, delivered: 507621, inboxRate: 88.6, openRate: 29.3, bounceRate: 0.74, spamRate: 0.05, status: "Good" },
  { id: "d2", name: "Weekly Newsletter #124", sent: 496210, delivered: 482901, inboxRate: 87.1, openRate: 27.6, bounceRate: 0.68, spamRate: 0.06, status: "Good" },
  { id: "d3", name: "Webinar: Growth Playbook", sent: 132890, delivered: 131642, inboxRate: 85.3, openRate: 31.8, bounceRate: 0.94, spamRate: 0.07, status: "Good" },
  { id: "d4", name: "Customer Spotlight Series", sent: 98310, delivered: 97102, inboxRate: 84.7, openRate: 25.2, bounceRate: 0.89, spamRate: 0.06, status: "Good" },
  { id: "d5", name: "Q2 Product Update", sent: 276540, delivered: 273884, inboxRate: 86.9, openRate: 28.5, bounceRate: 0.71, spamRate: 0.05, status: "Good" },
];

/* ------------------------------------------------- Triggers / Event Manager */

export interface TriggerRow {
  id: string;
  name: string;
  status: "Active" | "Paused";
  priority: "High" | "Medium" | "Low";
  source: string;
  lastFired: string;
}

export const TRIGGERS: TriggerRow[] = [
  { id: "t1", name: "Form Submitted", status: "Active", priority: "High", source: "Web Forms", lastFired: "2m ago" },
  { id: "t2", name: "Email Opened", status: "Active", priority: "Medium", source: "Email", lastFired: "4m ago" },
  { id: "t3", name: "Link Clicked", status: "Active", priority: "Medium", source: "Email", lastFired: "7m ago" },
  { id: "t4", name: "Landing Page Visit", status: "Active", priority: "Medium", source: "Website", lastFired: "9m ago" },
  { id: "t5", name: "Deal Stage Changed", status: "Active", priority: "High", source: "CRM", lastFired: "11m ago" },
  { id: "t6", name: "Webinar Registered", status: "Active", priority: "Medium", source: "Web Forms", lastFired: "13m ago" },
  { id: "t7", name: "Lead Score Threshold Met", status: "Active", priority: "High", source: "CRM", lastFired: "15m ago" },
  { id: "t8", name: "Subscription Cancelled", status: "Paused", priority: "Low", source: "Billing", lastFired: "—" },
];

export interface EventStreamRow {
  id: string;
  when: string;
  event: string;
  source: string;
  subject: string;
  workflow: string;
  result: "Success" | "Failed" | "Retrying";
}

export const EVENT_STREAM: EventStreamRow[] = [
  { id: "e1", when: "10:24:31 AM", event: "Form Submitted", source: "Web Forms", subject: "jane@acme.com", workflow: "Onboarding Flow", result: "Success" },
  { id: "e2", when: "10:24:12 AM", event: "Email Opened", source: "Email", subject: "John Smith", workflow: "Nurture Flow", result: "Success" },
  { id: "e3", when: "10:23:58 AM", event: "Link Clicked", source: "Email", subject: "sarah@globex.com", workflow: "Product Interest", result: "Success" },
  { id: "e4", when: "10:23:41 AM", event: "Landing Page Visit", source: "Website", subject: "Globex Corp", workflow: "Web Engagement", result: "Success" },
  { id: "e5", when: "10:23:09 AM", event: "Deal Stage Changed", source: "CRM", subject: "Deal #AC-2451", workflow: "Sales Follow-up", result: "Success" },
  { id: "e6", when: "10:22:51 AM", event: "Webhook Received", source: "Webhooks", subject: "invoice.paid", workflow: "Billing Sync", result: "Success" },
];

/* --------------------------------------------------- Super Admin: Orgs */

export interface OrgRow {
  id: string;
  name: string;
  domain: string;
  plan: string;
  users: number;
  health: number;
  mrr: number;
  status: "Active" | "Warning" | "Suspended";
}

export const ORGANIZATIONS: OrgRow[] = [
  { id: "o1", name: "Paws & People", domain: "pawsandpeople.com", plan: "Enterprise", users: 1245, health: 92, mrr: 4950, status: "Active" },
  { id: "o2", name: "PetConnect Global", domain: "petconnect.global", plan: "Pro", users: 856, health: 88, mrr: 2950, status: "Active" },
  { id: "o3", name: "Furry Friends Club", domain: "furryfriends.club", plan: "Growth", users: 420, health: 76, mrr: 1250, status: "Active" },
  { id: "o4", name: "Happy Tails Rescue", domain: "happytailsrescue.org", plan: "Pro", users: 315, health: 68, mrr: 980, status: "Warning" },
  { id: "o5", name: "VetCare Plus", domain: "vetcareplus.com", plan: "Enterprise", users: 2158, health: 94, mrr: 6780, status: "Active" },
  { id: "o6", name: "Pet Lovers United", domain: "petloversunited.com", plan: "Growth", users: 189, health: 54, mrr: 490, status: "Suspended" },
  { id: "o7", name: "Meow & Woof", domain: "meowandwoof.co", plan: "Starter", users: 98, health: 62, mrr: 190, status: "Active" },
  { id: "o8", name: "Animal Angels", domain: "animalangels.net", plan: "Pro", users: 642, health: 81, mrr: 1980, status: "Active" },
];

export const HEALTH_TONE: Record<HealthTone, "green" | "amber" | "orange" | "red"> = {
  Healthy: "green",
  Neutral: "amber",
  "At Risk": "orange",
  Critical: "red",
};
