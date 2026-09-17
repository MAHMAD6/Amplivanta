export type DealStage = "New" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";

export const STAGE_TONE: Record<DealStage, "blue" | "green" | "violet" | "amber" | "teal" | "red"> = {
  New: "blue",
  Qualified: "green",
  Proposal: "violet",
  Negotiation: "amber",
  Won: "teal",
  Lost: "red",
};

export interface Contact {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  leadScore: number;
  stage: DealStage;
  owner: string;
  lastActivity: string;
  tags: string[];
  location: string;
  timezone: string;
  createdAt: string;
  source: string;
  avatar?: string;
}

export const CONTACTS: Contact[] = [
  { id: "c1", name: "Sophia Martinez", role: "Marketing Director", company: "BrightTech Inc.", email: "sophia@brighttech.com", phone: "(555) 234-5678", leadScore: 92, stage: "Qualified", owner: "Alex Johnson", lastActivity: "2h ago", tags: ["High Value", "SaaS", "Marketing"], location: "San Francisco, CA, USA", timezone: "PST (UTC-8)", createdAt: "May 1, 2026", source: "Website Form" },
  { id: "c2", name: "Daniel Williams", role: "CEO", company: "NextGen Solutions", email: "daniel@nextgensol.com", phone: "(555) 987-6543", leadScore: 88, stage: "Proposal", owner: "Sarah Chen", lastActivity: "5h ago", tags: ["Enterprise"], location: "Austin, TX", timezone: "CST (UTC-6)", createdAt: "Apr 24, 2026", source: "LinkedIn Ad" },
  { id: "c3", name: "James Anderson", role: "Sales Manager", company: "Alpha Systems", email: "james@alphasys.com", phone: "(555) 345-6789", leadScore: 75, stage: "Negotiation", owner: "Emily Davis", lastActivity: "1d ago", tags: ["Mid-Market"], location: "Chicago, IL", timezone: "CST (UTC-6)", createdAt: "Apr 20, 2026", source: "Webinar" },
  { id: "c4", name: "Emily Lee", role: "Operations Director", company: "GreenLeaf Co.", email: "emily@greenleafi.com", phone: "(555) 456-7890", leadScore: 68, stage: "Qualified", owner: "Alex Johnson", lastActivity: "1d ago", tags: ["SMB"], location: "Portland, OR", timezone: "PST (UTC-8)", createdAt: "Apr 15, 2026", source: "Referral" },
  { id: "c5", name: "Michael Brown", role: "Founder", company: "InnovateX", email: "michael@innovatex.com", phone: "(555) 567-8901", leadScore: 95, stage: "Negotiation", owner: "Priya Ramesh", lastActivity: "2d ago", tags: ["Enterprise", "Priority"], location: "New York, NY", timezone: "EST (UTC-5)", createdAt: "Apr 10, 2026", source: "Cold Outbound" },
  { id: "c6", name: "Sarah Rodriguez", role: "Marketing Manager", company: "Visionary Labs", email: "sarah@visionarylabs.com", phone: "(555) 678-9012", leadScore: 60, stage: "New", owner: "Emily Davis", lastActivity: "2d ago", tags: ["Trial"], location: "Miami, FL", timezone: "EST (UTC-5)", createdAt: "Apr 5, 2026", source: "Website Form" },
  { id: "c7", name: "David Thompson", role: "CTO", company: "DataPro Analytics", email: "david@datapro.com", phone: "(555) 789-0123", leadScore: 84, stage: "Proposal", owner: "Alex Johnson", lastActivity: "3d ago", tags: ["Enterprise", "AI"], location: "Seattle, WA", timezone: "PST (UTC-8)", createdAt: "Mar 30, 2026", source: "Content Download" },
  { id: "c8", name: "Christine Harris", role: "Business Dev. Manager", company: "CloudServe", email: "christine@cloudserve.com", phone: "(555) 890-1234", leadScore: 72, stage: "Qualified", owner: "Sarah Chen", lastActivity: "3d ago", tags: ["Mid-Market"], location: "Boston, MA", timezone: "EST (UTC-5)", createdAt: "Mar 24, 2026", source: "Partner" },
];

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  contact: string;
  company: string;
  owner: string;
  probability: number;
  expectedClose: string;
  age: number;
}

export const DEALS: Deal[] = [
  { id: "d1", name: "BrightTech — Enterprise Upgrade", value: 128450, stage: "Won", contact: "Sophia Martinez", company: "BrightTech Inc.", owner: "Alex Johnson", probability: 100, expectedClose: "Aug 5, 2026", age: 42 },
  { id: "d2", name: "NextGen — Growth Plan", value: 34850, stage: "Proposal", contact: "Daniel Williams", company: "NextGen Solutions", owner: "Sarah Chen", probability: 60, expectedClose: "Aug 22, 2026", age: 18 },
  { id: "d3", name: "InnovateX — Scale Plan", value: 78200, stage: "Negotiation", contact: "Michael Brown", company: "InnovateX", owner: "Priya Ramesh", probability: 75, expectedClose: "Aug 18, 2026", age: 24 },
  { id: "d4", name: "GreenLeaf — Starter Kit", value: 12400, stage: "Qualified", contact: "Emily Lee", company: "GreenLeaf Co.", owner: "Alex Johnson", probability: 40, expectedClose: "Sep 3, 2026", age: 8 },
  { id: "d5", name: "Alpha — Automation Add-on", value: 18940, stage: "Negotiation", contact: "James Anderson", company: "Alpha Systems", owner: "Emily Davis", probability: 65, expectedClose: "Aug 27, 2026", age: 22 },
  { id: "d6", name: "DataPro — Analytics Suite", value: 46800, stage: "Proposal", contact: "David Thompson", company: "DataPro Analytics", owner: "Alex Johnson", probability: 55, expectedClose: "Sep 10, 2026", age: 14 },
  { id: "d7", name: "Visionary Labs — Trial Upgrade", value: 8900, stage: "New", contact: "Sarah Rodriguez", company: "Visionary Labs", owner: "Emily Davis", probability: 20, expectedClose: "Sep 20, 2026", age: 4 },
];

export const PIPELINE_STAGES: { key: DealStage; label: string; deals: number; value: number }[] = [
  { key: "New", label: "New", deals: 320, value: 28450 },
  { key: "Qualified", label: "Qualified", deals: 610, value: 56230 },
  { key: "Proposal", label: "Proposal", deals: 430, value: 34850 },
  { key: "Negotiation", label: "Negotiation", deals: 210, value: 18940 },
  { key: "Won", label: "Won", deals: 65, value: 128450 },
];

export type ActivityType = "email" | "call" | "meeting" | "note" | "task" | "sms";

export const ACTIVITIES: {
  id: string;
  type: ActivityType;
  title: string;
  contact: string;
  owner: string;
  when: string;
  detail?: string;
}[] = [
  { id: "a1", type: "email", title: "Email opened — 'Welcome to Amplivanta!'", contact: "Sophia Martinez", owner: "Alex Johnson", when: "Today, 10:30 AM" },
  { id: "a2", type: "call", title: "Discovery call — proposal details discussed", contact: "Daniel Williams", owner: "Sarah Chen", when: "Yesterday, 3:45 PM", detail: "Reviewed Growth plan; deciding between Growth and Scale." },
  { id: "a3", type: "note", title: "Note added — interested in Enterprise features", contact: "Michael Brown", owner: "Priya Ramesh", when: "Yesterday, 2:12 PM" },
  { id: "a4", type: "meeting", title: "Demo scheduled — Aug 20, 2:00 PM", contact: "Emily Lee", owner: "Alex Johnson", when: "May 27, 2026" },
  { id: "a5", type: "email", title: "Proposal sent — Growth Plan pricing", contact: "James Anderson", owner: "Emily Davis", when: "May 26, 2026" },
  { id: "a6", type: "task", title: "Task completed — send onboarding docs", contact: "Sophia Martinez", owner: "Alex Johnson", when: "May 25, 2026" },
  { id: "a7", type: "call", title: "Left voicemail — follow-up after webinar", contact: "David Thompson", owner: "Alex Johnson", when: "May 24, 2026" },
  { id: "a8", type: "sms", title: "SMS sent — reminder about demo", contact: "Christine Harris", owner: "Sarah Chen", when: "May 23, 2026" },
];

export type TaskStatus = "Todo" | "In Progress" | "Done";
export type TaskPriority = "High" | "Medium" | "Low";

export const CRM_TASKS: {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner: string;
  related: string;
  dueDate: string;
}[] = [
  { id: "t1", title: "Send proposal to BrightTech", status: "Todo", priority: "High", owner: "Alex Johnson", related: "BrightTech Inc.", dueDate: "Aug 15, 2026" },
  { id: "t2", title: "Follow up with Michael Brown", status: "Todo", priority: "High", owner: "Priya Ramesh", related: "InnovateX", dueDate: "Aug 14, 2026" },
  { id: "t3", title: "Schedule discovery call — GreenLeaf", status: "In Progress", priority: "Medium", owner: "Alex Johnson", related: "GreenLeaf Co.", dueDate: "Aug 16, 2026" },
  { id: "t4", title: "Send contract to DataPro", status: "In Progress", priority: "High", owner: "Alex Johnson", related: "DataPro Analytics", dueDate: "Aug 18, 2026" },
  { id: "t5", title: "Review pricing for NextGen", status: "In Progress", priority: "Medium", owner: "Sarah Chen", related: "NextGen Solutions", dueDate: "Aug 19, 2026" },
  { id: "t6", title: "Onboarding checklist — BrightTech", status: "Done", priority: "Medium", owner: "Emily Davis", related: "BrightTech Inc.", dueDate: "Aug 8, 2026" },
  { id: "t7", title: "Q3 outbound list — Enterprise segment", status: "Todo", priority: "Low", owner: "Priya Ramesh", related: "—", dueDate: "Aug 25, 2026" },
  { id: "t8", title: "Sync notes from webinar", status: "Done", priority: "Low", owner: "Sarah Chen", related: "Webinar Series", dueDate: "Aug 7, 2026" },
];
