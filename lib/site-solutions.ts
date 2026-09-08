/**
 * Solutions section content, from the approved design reference.
 *
 * As with Platform, the reference shipped the hero buttons as non-interactive
 * spans; destinations follow the site convention.
 */

export type SolutionPage = {
  slug: string;
  name: string;
  eyebrow: string;
  h1: string;
  lead: string;
  actionLabels: string[];
  visualTitle: string;
  visualItems: string[];
  sectionTitle: string;
  sectionLead: string;
  cards: [string, string][];
  stepsTitle: string;
  stepsLead: string;
  steps: [string, string][];
  band: [string, string] | null;
};

export const SOLUTION_PAGES: SolutionPage[] = [
  {
    slug: "growth-marketing",

    name: "Growth Marketing",
    eyebrow: "SOLUTIONS · GROWTH MARKETING",
    h1: "Coordinate growth work from planning through measurement.",
    lead: "Use Amplivanta capabilities for planning, audiences, creative, campaigns, automation, social publishing, CRM context, and analytics as part of a connected workflow.",
    actionLabels: ["Start Engineering Growth", "Explore Growth Marketing"],
    visualTitle: "A connected growth workflow",
    visualItems: ["Define the goal and audience", "Prepare creative and campaign work", "Execute through the relevant modules", "Review available results"],
    sectionTitle: "Connect the work around a shared growth objective",
    sectionLead: "Use the Amplivanta capabilities relevant to each stage.",
    cards: [["Growth Planning", "Organize goals, priorities, audiences, and next steps before execution begins."], ["Campaign Execution", "Prepare campaign details, channels, creative, and launch steps with the relevant campaign tools."], ["Audience & Segments", "Use available contact and audience context to organize who each initiative is intended to reach."], ["Creative & Content", "Create and manage marketing assets in Creative Studio, then move reviewed work into supported execution flows."], ["Social & Automation", "Use scheduling, publishing, and automation capabilities when they are enabled and configured."], ["Performance Review", "Review available analytics and reporting data to understand results and identify follow-up work."]],
    stepsTitle: "A practical operating pattern",
    stepsLead: "",
    steps: [["1 · Plan", "Define the objective, audience, and information available."], ["2 · Create", "Prepare campaign and creative work in the relevant modules."], ["3 · Execute", "Launch or schedule work through supported channels and workflows."], ["4 · Measure", "Review available data and decide what to adjust next."]],
    band: ["Keep planning, execution, and measurement connected.", "Growth Marketing brings together Amplivanta planning, creative, campaign, CRM, automation, social, and analytics capabilities around a shared objective."],
  },
  {
    slug: "revenue-acceleration",

    name: "Revenue Acceleration",
    eyebrow: "SOLUTIONS · REVENUE ACCELERATION",
    h1: "Connect acquisition, customer, and pipeline work.",
    lead: "Use lead capture, CRM, pipeline, campaigns, follow-up workflows, and analytics as connected parts of the customer journey.",
    actionLabels: ["Start Engineering Growth", "Explore Revenue Acceleration"],
    visualTitle: "From customer signal to follow-up",
    visualItems: ["Capture customer interest", "Organize contacts and deals", "Coordinate follow-up activity", "Review pipeline and campaign data"],
    sectionTitle: "Coordinate marketing and revenue workflows",
    sectionLead: "Keep relevant customer context available across acquisition, follow-up, and pipeline activity.",
    cards: [["CRM & Pipeline", "Manage contacts, companies, deals, pipeline stages, activities, and tasks in CRM."], ["Lead Capture", "Capture contact information through configured forms and landing pages."], ["Segments & Audiences", "Group contacts using the data and rules available to your workspace."], ["Nurture & Follow-up", "Build follow-up steps with campaigns and workflows when those capabilities are enabled."], ["Campaign Context", "Associate campaign and engagement activity with relevant records and workflows where supported."], ["Revenue Analytics", "Review available pipeline, campaign, conversion, and attribution data with consistent filters."]],
    stepsTitle: "A practical operating pattern",
    stepsLead: "",
    steps: [["1 · Capture", "Bring in customer or lead information through configured entry points."], ["2 · Organize", "Connect records, deals, stages, and related activities."], ["3 · Follow up", "Use campaigns, tasks, and workflows as configured."], ["4 · Review", "Examine pipeline, conversion, and attribution data when available."]],
    band: ["Keep acquisition, follow-up, and pipeline context connected.", "Revenue Acceleration organizes Amplivanta marketing and CRM capabilities around customer and pipeline workflows."],
  },
  {
    slug: "ai-workflows",

    name: "AI Workflows",
    eyebrow: "SOLUTIONS · AI WORKFLOWS",
    h1: "Use AI assistance inside reviewable workflows.",
    lead: "Where AI features are enabled, use them to organize context, generate drafts, summarize information, and suggest next steps while users remain responsible for review and execution.",
    actionLabels: ["Start Engineering Growth", "Explore AI Workflows"],
    visualTitle: "AI-assisted workflow",
    visualItems: ["Define the goal and context", "Generate or review AI output", "Review and edit the result", "Send selected work to a module"],
    sectionTitle: "Use AI to support the work while keeping users in control",
    sectionLead: "Connect AI assistance to the places where users review, edit, save, or act.",
    cards: [["AI Advisor", "Ask questions and review recommendations based on available workspace context."], ["Draft Generation", "Assist with copy, creative concepts, summaries, and structured drafts where AI features are enabled."], ["Workflow Builder", "Use AI-assisted steps in supported workflows when appropriate to the task."], ["Human Review", "Keep review, edit, save, and approval paths available before AI-assisted outputs are used in subsequent actions."], ["Connected Context", "Use supported business, campaign, CRM, creative, and analytics context as input when available."], ["Measure & Refine", "Use available performance data to inform future prompts, workflows, and recommendations."]],
    stepsTitle: "A practical operating pattern",
    stepsLead: "",
    steps: [["1 · Context", "Provide the goal and relevant workspace information."], ["2 · Assist", "Generate or review AI-assisted drafts and recommendations."], ["3 · Review", "Edit, approve, save, or dismiss outputs as appropriate."], ["4 · Act", "Send selected work to the relevant execution module."]],
    band: ["AI assistance with user control.", "AI Workflows combine enabled AI features with contextual inputs, review steps, and controlled handoff to Amplivanta modules."],
  },
  {
    slug: "brand-intelligence",

    name: "Brand Intelligence",
    eyebrow: "SOLUTIONS · BRAND INTELLIGENCE",
    h1: "Use brand guidance and assets as reusable creative context.",
    lead: "Organize logos, colors, typography, assets, and brand guidelines in Brand Kit and make them available to supported creative workflows.",
    actionLabels: ["Start Engineering Growth", "Explore Brand Intelligence"],
    visualTitle: "Your Brand Kit context",
    visualItems: ["Add brand guidelines", "Organize logos and assets", "Set colors and typography", "Use Brand Kit in supported editors"],
    sectionTitle: "Turn Brand Kit information into working context",
    sectionLead: "Keep brand identity resources close to the content workflows that use them.",
    cards: [["Brand Guidelines", "Maintain reusable brand guidance and reference information."], ["Logos & Assets", "Organize logo variants and other brand assets in Brand Kit."], ["Colors & Typography", "Define brand colors and typography settings for reuse."], ["Supported Editors", "Use Brand Kit context in supported image, graphic, video, email, and landing-page workflows where enabled."], ["Team Access", "Manage Brand Kit access according to workspace roles and permissions."], ["Reusable Brand Kits", "Maintain Brand Kits and select a default for future projects."]],
    stepsTitle: "A practical operating pattern",
    stepsLead: "",
    steps: [["1 · Define", "Add brand guidelines, colors, typography, and assets."], ["2 · Organize", "Maintain reusable Brand Kit resources and access."], ["3 · Create", "Use Brand Kit context in supported creative workflows."], ["4 · Review", "Check the resulting content before publishing or reuse."]],
    band: ["Keep brand identity connected to content production.", "Brand Intelligence uses Brand Kit information and assets as reusable context across supported Amplivanta creative workflows."],
  },
];

export const SOLUTION_BY_SLUG = new Map(SOLUTION_PAGES.map((p) => [p.slug, p]));
