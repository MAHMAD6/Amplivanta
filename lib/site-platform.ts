/**
 * Platform section content, from the approved design reference.
 *
 * The reference shipped both hero buttons as non-interactive spans, so the
 * destinations here are the site conventions used everywhere else: the primary
 * action starts signup, the secondary books a demo.
 */

export type PlatformPage = {
  slug: string;
  /** Display name — the eyebrow is set in caps and reads badly as a title. */
  name: string;
  eyebrow: string;
  h1: string;
  lead: string;
  actionLabels: [string, string];
  visualTitle: string;
  visualItems: string[];
  sectionTitle: string;
  sectionLead: string;
  cards: [string, string][];
  band: [string, string];
};

export const PLATFORM_PAGES: PlatformPage[] = [
  {
    slug: "ai-advisor",
    name: "AI Advisor",
    eyebrow: "PLATFORM · AI ADVISOR",
    h1: "Turn business questions into clearer growth decisions.",
    lead: "Use AI to explore your business context, organize opportunities, and turn recommendations you approve into practical next steps.",
    actionLabels: ["Start Engineering Growth", "Explore AI Advisor"],
    visualTitle: "Your growth workspace",
    visualItems: ["Ask a growth question", "Review available context", "Compare suggested actions", "Save or add to an action plan"],
    sectionTitle: "What you can do",
    sectionLead: "Built to support informed, reviewable decisions.",
    cards: [["Ask AI Advisor", "Ask questions in plain language using the context available to your workspace."], ["Recommendations", "Review suggested opportunities, supporting context, and next steps before acting."], ["Saved Insights", "Save useful findings so they remain available for later review and planning."], ["Action Plans", "Turn selected recommendations into organized, trackable next steps."], ["Connected Context", "Bring in supported data sources to improve relevance when they are configured."], ["Human Control", "Review, edit, or dismiss AI suggestions before they affect your work."]],
    band: ["From insight to action, with you in control.", "AI Advisor helps organize context, recommendations, and next steps while keeping decisions reviewable."],
  },
  {
    slug: "marketing-automation",
    name: "Marketing Automation",
    eyebrow: "PLATFORM · MARKETING AUTOMATION",
    h1: "Build, organize, and manage marketing workflows.",
    lead: "Bring campaigns, workflows, email, lead capture, landing pages, and audience management into one coordinated workspace.",
    actionLabels: ["Start Engineering Growth", "Explore Automation"],
    visualTitle: "Workflow structure",
    visualItems: ["Trigger or entry condition", "Audience / eligibility check", "Action or wait step", "Review, test, and publish"],
    sectionTitle: "What you can do",
    sectionLead: "Coordinate the workflows that move marketing forward.",
    cards: [["Campaigns", "Define campaign details, audiences, channels, and launch steps in one place."], ["Workflow Builder", "Build step-based workflows with separate test and live states and clear execution history."], ["Email Campaigns", "Create and manage email campaigns through configured sending services."], ["Lead Capture Forms", "Build forms with configurable consent, privacy, and CRM handling."], ["Landing Pages", "Create, preview, publish, and manage landing pages and connected domains."], ["Segments & Audiences", "Organize reusable audience segments for eligible campaigns and workflows."]],
    band: ["Automation that stays understandable.", "Keep testing, publishing, and execution states clear so your team knows what is running and why."],
  },
  {
    slug: "crm-pipelines",
    name: "CRM & Pipelines",
    eyebrow: "PLATFORM · CRM & PIPELINES",
    h1: "Keep relationships, deals, and activity connected.",
    lead: "Organize contacts, companies, deals, pipeline stages, activities, and tasks in a workspace designed for coordinated follow-up.",
    actionLabels: ["Start Engineering Growth", "Explore CRM"],
    visualTitle: "Pipeline view",
    visualItems: ["New", "Qualified", "Proposal", "Closed"],
    sectionTitle: "What you can do",
    sectionLead: "Manage customer relationships with a shared, current view.",
    cards: [["Contacts", "Keep prospect and customer records organized with relevant workspace context."], ["Companies", "Group contacts, deals, and activity around business accounts when applicable."], ["Deals", "Track opportunities, ownership, stage, and next steps as activity develops."], ["Pipeline", "Move opportunities through configurable stages and views."], ["Activities & Tasks", "Record follow-ups, meetings, notes, and assigned work in context."], ["Clear Data States", "Distinguish available, incomplete, and not-yet-added information at a glance."]],
    band: ["A CRM built around the real customer journey.", "Keep contacts, companies, deals, and activity connected while respecting workspace roles and permissions."],
  },
  {
    slug: "growth-audit",
    name: "Growth Audit\u2122",
    eyebrow: "PLATFORM · GROWTH AUDIT™",
    h1: "Review your growth foundation and identify areas to improve.",
    lead: "Bring website, SEO, content, conversion, and channel observations into a structured audit with clearly sourced findings and priorities.",
    actionLabels: ["Start Engineering Growth", "Explore Growth Audit"],
    visualTitle: "Audit areas",
    visualItems: ["Website", "SEO & visibility", "Content", "Conversion & funnel"],
    sectionTitle: "What you can do",
    sectionLead: "Turn available evidence into a structured growth review.",
    cards: [["Website Review", "Review configured website inputs and surface observations supported by available data."], ["SEO & Visibility", "Organize crawl, metadata, keyword, and visibility findings when source data is available."], ["Content Review", "Evaluate available content against defined quality and relevance criteria."], ["Conversion Review", "Review configured funnel events and conversion signals from connected data."], ["Prioritized Findings", "Group findings by impact, urgency, or other transparent criteria."], ["Audit History", "Compare prior audits when historical results are available."]],
    band: ["Evidence first. Recommendations second.", "Scores, benchmarks, and comparisons appear only when the underlying data and methodology are available."],
  },
  {
    slug: "social-publishing",
    name: "Social Publishing",
    eyebrow: "PLATFORM · SOCIAL PUBLISHING",
    h1: "Plan, create, and manage social publishing.",
    lead: "Manage social content, calendars, publishing workflows, and performance views from one workspace as channels are connected and enabled.",
    actionLabels: ["Start Engineering Growth", "Explore Social Publishing"],
    visualTitle: "Publishing workflow",
    visualItems: ["Create content", "Choose connected channels", "Review / approve", "Publish or schedule"],
    sectionTitle: "What you can do",
    sectionLead: "Coordinate content across the channels you actually use.",
    cards: [["Calendar", "Plan scheduled content in a clear calendar view."], ["Posts", "Create, review, and manage social posts from one place."], ["Publishing Queue", "Track eligible content waiting to publish or requiring attention."], ["Social Analytics", "Review performance when supported channel data is connected."], ["Approvals", "Use review and approval states when they are enabled for your workspace."], ["Marketplace Promotion", "Eligible sellers can send product details into Social Publishing to prepare promotional content."]],
    band: ["One publishing workflow, grounded in real connections.", "Available channels, permissions, publishing status, and performance data reflect your actual configuration."],
  },
  {
    slug: "creative-studio",
    name: "Creative Studio",
    eyebrow: "PLATFORM · CREATIVE STUDIO",
    h1: "Create and manage marketing assets in one workspace.",
    lead: "Work across images, video, graphics, documents, brand assets, projects, and templates with AI assistance where the required capabilities are available.",
    actionLabels: ["Start Engineering Growth", "Explore Creative Studio"],
    visualTitle: "Creative workspace",
    visualItems: ["Choose asset type", "Start blank or from a template", "Create / edit", "Save to project"],
    sectionTitle: "What you can do",
    sectionLead: "Bring your creative work together.",
    cards: [["Images", "Create, upload, organize, and edit image-based marketing assets."], ["Video", "Work with video projects using the creation and editing tools available to your workspace."], ["Graphics", "Design visual assets for campaigns, social, and other marketing use."], ["Documents", "Create and organize marketing documents and content assets."], ["Brand Kit", "Keep approved brand assets and preferences available to eligible editors."], ["Projects & Templates", "Organize work and reuse approved starting points across creative projects."]],
    band: ["AI assistance where available. Human control throughout.", "Available AI creation tools are shown only when the corresponding capability is enabled for your workspace."],
  },
  {
    slug: "analytics-reports",
    name: "Analytics & Reports",
    eyebrow: "PLATFORM · ANALYTICS & REPORTS",
    h1: "See performance in one clearer view.",
    lead: "Bring available traffic, campaign, conversion, attribution, and reporting data together while keeping every metric tied to the selected data window and source.",
    actionLabels: ["Start Engineering Growth", "Explore Analytics"],
    visualTitle: "Performance view",
    visualItems: ["Traffic", "Campaigns", "Conversions", "Reports"],
    sectionTitle: "What you can do",
    sectionLead: "Work from real data, consistent filters, and clear states.",
    cards: [["Performance Overview", "Summarize the metrics available for the active workspace."], ["Campaign Analytics", "Review campaign performance from supported production sources."], ["Conversion & Attribution", "Analyze configured conversion events and attribution views where supported."], ["Reports", "Create and review reports from workspace data."], ["Filters & Comparison", "Keep date ranges and comparison settings consistent across charts and tables."], ["Clear Data States", "Know when data is unavailable instead of seeing misleading placeholders."]],
    band: ["Clear reporting starts with consistent data.", "Date ranges, filters, and source context stay aligned so teams can interpret results with confidence."],
  },
  {
    slug: "integrations",
    name: "Integrations",
    eyebrow: "PLATFORM · INTEGRATIONS",
    h1: "Connect the tools your workflow depends on.",
    lead: "Manage supported connections from one integration library. Available providers and connection capabilities reflect your active production configuration.",
    actionLabels: ["Start Engineering Growth", "Explore Integrations"],
    visualTitle: "Connection categories",
    visualItems: ["CRM & sales", "Analytics", "Email & communication", "Commerce / other"],
    sectionTitle: "What you can do",
    sectionLead: "Connect supported tools with clear status and permissions.",
    cards: [["Integration Library", "Browse supported connections available to your workspace."], ["Connection Status", "See whether a connection is active, disconnected, or requires setup."], ["Permissions", "Review requested scopes and permissions before you authorize a connection."], ["Data Sources", "Use connected sources to support eligible analytics and intelligence workflows."], ["API / Webhooks", "Access developer capabilities when they are implemented and enabled for your workspace."], ["Connection Details", "Review provider, scope, and status information without assumed connection states."]],
    band: ["Integration availability stays factual and configuration-driven.", "Provider names, connection status, and developer capabilities appear only when supported by the active configuration."],
  },
];

export const PLATFORM_BY_SLUG = new Map(PLATFORM_PAGES.map((p) => [p.slug, p]));
