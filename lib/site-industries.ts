/**
 * Industries section content, from the approved design reference.
 */

export type IndustryPage = {
  slug: string;
  name: string;
  eyebrow: string;
  h1: string;
  lead: string;
  actions: [string, string][];
  visualTitle: string;
  visualItems: string[];
  useTitle: string;
  useLead: string;
  useCards: [string, string, string][];
  capTitle: string;
  capLead: string;
  capCards: [string, string][];
  flowTitle: string;
  flowLead: string;
  steps: [string, string][];
};

export const INDUSTRY_PAGES: IndustryPage[] = [
  {
    slug: "technology",
    name: "Technology",
    eyebrow: "INDUSTRIES · TECHNOLOGY",
    h1: "Connect product marketing, demand generation, content, and pipeline work.",
    lead: "Technology teams can coordinate launches, campaigns, content, lead and opportunity workflows, social publishing, and performance review across connected Amplivanta modules.",
    actions: [["Explore the Platform", "/signup"], ["Book a Demo", "/book-demo"]],
    visualTitle: "A connected technology marketing workflow",
    visualItems: ["Coordinate go-to-market work", "Organize demand programs", "Maintain pipeline visibility", "Review available performance data"],
    useTitle: "Common technology workflows",
    useLead: "Use the capabilities that match the work your team is performing.",
    useCards: [["Product Launch Planning", "Organize launch goals, audiences, messaging, campaign details, and related assets.", "Launch Planning →"], ["Demand Generation", "Create and manage campaigns, audiences, content, forms, and follow-up workflows.", "Demand Generation →"], ["Lead & Opportunity Tracking", "Use CRM records and pipeline views to keep lead and opportunity context visible.", "CRM & Pipelines →"], ["Content Collaboration", "Create, organize, review, and reuse marketing assets through Creative Studio and related workflows.", "Creative Studio →"], ["Performance Review", "Review available campaign, channel, content, and pipeline reporting to inform next actions.", "Analytics & Reports →"]],
    capTitle: "How Amplivanta capabilities can support this work",
    capLead: "Use only the modules, integrations, data, and channels that are actually enabled and configured.",
    capCards: [["AI Advisor", "Review available context and generate suggested next steps that users can evaluate before acting."], ["Marketing Automation", "Build campaigns and workflows using configured triggers, audiences, content, and actions."], ["CRM & Pipelines", "Manage contacts, companies, deals, pipeline stages, activities, and tasks."], ["Social Publishing", "Create, approve, schedule, publish, and review social content for connected accounts."], ["Creative Studio", "Create and organize images, video, graphics, documents, social posts, and brand assets."], ["Analytics & Reports", "Review available campaign, channel, CRM, content, and attribution data where supported."], ["Integrations", "Connect supported external tools and data sources through configured integrations."]],
    flowTitle: "From launch planning to performance review",
    flowLead: "Keep the relevant context connected as work moves across teams and modules.",
    steps: [["Plan the launch", "Define the product, audience, message, and campaign structure."], ["Prepare content", "Create or organize the assets needed for the initiative."], ["Execute campaigns", "Use configured channels, forms, workflows, and publishing tools."], ["Manage pipeline", "Keep lead and opportunity activity visible in CRM."], ["Review results", "Use available reporting to decide what to adjust next."]],
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    eyebrow: "INDUSTRIES · PROFESSIONAL SERVICES",
    h1: "Connect expertise, outreach, inquiries, content, and pipeline activity.",
    lead: "Professional services teams can coordinate service marketing, inquiry capture, contact management, thought-leadership content, campaign execution, and pipeline visibility in one connected workspace.",
    actions: [["Explore Professional Services", "/signup"], ["Book a Demo", "/book-demo"]],
    visualTitle: "A connected professional-services workflow",
    visualItems: ["Showcase expertise", "Capture inquiries", "Coordinate follow-up", "Maintain pipeline context"],
    useTitle: "Common professional-services workflows",
    useLead: "Support marketing and client-development work without inventing a separate system for each stage.",
    useCards: [["Service Marketing", "Plan campaigns and content around services, expertise, events, or business-development priorities.", "Service Marketing →"], ["Inquiry Capture", "Use forms, landing pages, campaigns, and connected workflows to organize incoming inquiries.", "Lead Capture →"], ["Contact Management", "Keep contact, company, activity, task, and deal context together in CRM.", "CRM →"], ["Thought-Leadership Content", "Create and organize articles, social content, graphics, documents, and related assets.", "Creative Studio →"], ["Pipeline Visibility", "Track opportunities, activity, and next steps through CRM and reporting views.", "Pipeline →"]],
    capTitle: "How Amplivanta capabilities can support this work",
    capLead: "Use only the modules, integrations, data, and channels that are actually enabled and configured.",
    capCards: [["AI Advisor", "Review available context and generate suggested next steps that users can evaluate before acting."], ["Marketing Automation", "Build campaigns and workflows using configured triggers, audiences, content, and actions."], ["CRM & Pipelines", "Manage contacts, companies, deals, pipeline stages, activities, and tasks."], ["Social Publishing", "Create, approve, schedule, publish, and review social content for connected accounts."], ["Creative Studio", "Create and organize images, video, graphics, documents, social posts, and brand assets."], ["Analytics & Reports", "Review available campaign, channel, CRM, content, and attribution data where supported."], ["Integrations", "Connect supported external tools and data sources through configured integrations."]],
    flowTitle: "A practical workflow for professional services",
    flowLead: "Move from marketing activity to inquiry and pipeline management while preserving context.",
    steps: [["Plan outreach", "Define the service, audience, message, and campaign objective."], ["Prepare content", "Create or organize the assets needed to support outreach."], ["Capture inquiries", "Collect permitted information through configured forms and channels."], ["Manage follow-up", "Use CRM, tasks, campaigns, and workflows to coordinate next steps."], ["Review activity", "Use available reporting to understand engagement and pipeline movement."]],
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    eyebrow: "INDUSTRIES · E-COMMERCE",
    h1: "Coordinate product content, campaigns, engagement, and performance review.",
    lead: "E-commerce teams can organize product marketing assets, plan campaigns, manage audiences and customer records, publish content through supported channels, and review available performance data.",
    actions: [["Explore E-commerce", "/signup"], ["Book a Demo", "/book-demo"]],
    visualTitle: "A connected e-commerce marketing workflow",
    visualItems: ["Plan campaigns", "Organize product content", "Publish through supported channels", "Review available results"],
    useTitle: "Common e-commerce workflows",
    useLead: "Use Amplivanta around the parts of the customer journey that your configured tools and data support.",
    useCards: [["Campaign Planning", "Coordinate goals, audiences, products, content, channels, timing, and launch decisions.", "Campaigns →"], ["Product Content", "Create and organize images, graphics, videos, documents, and campaign assets.", "Creative Studio →"], ["Audience & Customer Records", "Use segments, contacts, companies, and activity records where relevant to your workflow.", "CRM & Audiences →"], ["Publishing & Automation", "Use configured social publishing and marketing automation capabilities for supported channels and actions.", "Execution →"], ["Performance Review", "Review available campaign, content, channel, CRM, and attribution data without assuming unsupported revenue links.", "Analytics & Reports →"]],
    capTitle: "How Amplivanta capabilities can support this work",
    capLead: "Use only the modules, integrations, data, and channels that are actually enabled and configured.",
    capCards: [["AI Advisor", "Review available context and generate suggested next steps that users can evaluate before acting."], ["Marketing Automation", "Build campaigns and workflows using configured triggers, audiences, content, and actions."], ["CRM & Pipelines", "Manage contacts, companies, deals, pipeline stages, activities, and tasks."], ["Social Publishing", "Create, approve, schedule, publish, and review social content for connected accounts."], ["Creative Studio", "Create and organize images, video, graphics, documents, social posts, and brand assets."], ["Analytics & Reports", "Review available campaign, channel, CRM, content, and attribution data where supported."], ["Integrations", "Connect supported external tools and data sources through configured integrations."]],
    flowTitle: "From campaign idea to performance review",
    flowLead: "Keep product marketing work coordinated across content, audiences, execution, and measurement.",
    steps: [["Define the campaign", "Set the objective, audience, products, message, and timing."], ["Prepare assets", "Create or organize product content and campaign materials."], ["Configure execution", "Select supported channels, audiences, workflows, and publishing actions."], ["Launch and manage", "Run the approved work through the relevant Amplivanta modules."], ["Review performance", "Use available analytics to identify what deserves attention next."]],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    eyebrow: "INDUSTRIES · HEALTHCARE",
    h1: "Support healthcare marketing, educational content, outreach, and inquiry workflows.",
    lead: "Healthcare marketing teams can coordinate service-line campaigns, educational content, community outreach, inquiry capture, publishing, and reporting using the Amplivanta capabilities appropriate to their configured environment.",
    actions: [["Explore Healthcare", "/signup"], ["Book a Demo", "/book-demo"]],
    visualTitle: "A marketing and outreach workflow",
    visualItems: ["Plan outreach", "Create educational content", "Organize permitted inquiries", "Review marketing activity"],
    useTitle: "Common healthcare marketing workflows",
    useLead: "Keep the page focused on marketing and outreach—not clinical care, diagnosis, treatment, or unsupported compliance claims.",
    useCards: [["Service-Line Marketing", "Plan and coordinate marketing for services, programs, locations, events, or community initiatives.", "Campaigns →"], ["Educational Content", "Create and organize approved educational and informational marketing assets.", "Creative Studio →"], ["Inquiry Capture", "Use configured forms and channels to collect information your organization is permitted to process.", "Lead Capture →"], ["Campaign Coordination", "Coordinate content, schedules, audiences, and supported outreach workflows across available channels.", "Marketing Automation →"], ["Reporting & Insights", "Review available marketing, content, campaign, and engagement data to inform next actions.", "Analytics & Reports →"]],
    capTitle: "How Amplivanta capabilities can support this work",
    capLead: "Use only the modules, integrations, data, and channels that are actually enabled and configured.",
    capCards: [["AI Advisor", "Review available context and generate suggested next steps that users can evaluate before acting."], ["Marketing Automation", "Build campaigns and workflows using configured triggers, audiences, content, and actions."], ["CRM & Pipelines", "Manage contacts, companies, deals, pipeline stages, activities, and tasks."], ["Social Publishing", "Create, approve, schedule, publish, and review social content for connected accounts."], ["Creative Studio", "Create and organize images, video, graphics, documents, social posts, and brand assets."], ["Analytics & Reports", "Review available campaign, channel, CRM, content, and attribution data where supported."], ["Integrations", "Connect supported external tools and data sources through configured integrations."]],
    flowTitle: "A common healthcare marketing workflow",
    flowLead: "Keep planning, content, outreach, inquiry handling, and reporting connected while respecting your organization’s data and compliance requirements.",
    steps: [["Plan outreach", "Define the permitted audience, objective, message, and campaign scope."], ["Prepare content", "Create and approve educational or promotional marketing materials."], ["Configure channels", "Use only supported channels, data, and workflows approved for your environment."], ["Manage inquiries", "Route permitted inquiries into the appropriate CRM or follow-up process."], ["Review results", "Use available marketing data to understand activity and plan next steps."]],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    eyebrow: "INDUSTRIES · REAL ESTATE",
    h1: "Coordinate listing marketing, lead capture, content, publishing, and follow-up.",
    lead: "Real estate teams can organize property marketing assets, capture and manage inquiries, coordinate campaigns and publishing, maintain CRM context, and review available performance data from one connected workspace.",
    actions: [["Explore Real Estate", "/signup"], ["Book a Demo", "/book-demo"]],
    visualTitle: "A connected real-estate marketing workflow",
    visualItems: ["Organize listings and assets", "Capture inquiries", "Publish marketing content", "Track campaign activity"],
    useTitle: "Common real-estate marketing workflows",
    useLead: "Use the platform to coordinate marketing work while property, transaction, and brokerage systems remain in their appropriate tools.",
    useCards: [["Property Marketing", "Plan campaigns and messaging around listings, developments, services, or geographic areas.", "Campaigns →"], ["Lead Capture", "Use forms, landing pages, campaigns, and supported channels to organize incoming inquiries.", "Lead Capture →"], ["Asset Coordination", "Create and organize listing images, graphics, videos, documents, and campaign materials.", "Creative Studio →"], ["Publishing & Follow-up", "Coordinate supported publishing, contact management, tasks, and marketing workflows.", "Execution →"], ["Campaign Reporting", "Review available campaign, content, channel, and CRM activity to inform next actions.", "Analytics & Reports →"]],
    capTitle: "How Amplivanta capabilities can support this work",
    capLead: "Use only the modules, integrations, data, and channels that are actually enabled and configured.",
    capCards: [["AI Advisor", "Review available context and generate suggested next steps that users can evaluate before acting."], ["Marketing Automation", "Build campaigns and workflows using configured triggers, audiences, content, and actions."], ["CRM & Pipelines", "Manage contacts, companies, deals, pipeline stages, activities, and tasks."], ["Social Publishing", "Create, approve, schedule, publish, and review social content for connected accounts."], ["Creative Studio", "Create and organize images, video, graphics, documents, social posts, and brand assets."], ["Analytics & Reports", "Review available campaign, channel, CRM, content, and attribution data where supported."], ["Integrations", "Connect supported external tools and data sources through configured integrations."]],
    flowTitle: "From listing preparation to campaign review",
    flowLead: "Keep property marketing assets, inquiries, publishing, follow-up, and reporting connected.",
    steps: [["Prepare the listing campaign", "Define the property, audience, message, channels, and campaign objective."], ["Organize assets", "Create or collect the approved listing content and supporting materials."], ["Capture inquiries", "Collect permitted inquiry information through configured channels."], ["Coordinate follow-up", "Use CRM, tasks, publishing, and automation where configured."], ["Review activity", "Use available data to understand campaign activity and next steps."]],
  },
];

export const INDUSTRY_BY_SLUG = new Map(INDUSTRY_PAGES.map((p) => [p.slug, p]));

/** The Industries index, which the reference builds from the same blocks. */
export const INDUSTRY_OVERVIEW = {
  eyebrow: "INDUSTRIES",
  h1: "Industry-specific workflows, built on one connected platform.",
  lead: "Amplivanta brings planning, content, campaigns, CRM, automation, social publishing, and analytics into one workspace. Explore practical ways these capabilities can support different marketing and growth workflows.",
  actions: [["Explore Industries", "/signup"], ["Book a Demo", "/book-demo"]],
  visualTitle: "One platform, different operating contexts",
  visualItems: ["Plan and prioritize", "Create and organize", "Execute through connected modules", "Review available results"],
  useTitle: "Explore by industry",
  useLead: "Choose the industry closest to your workflow and operating context.",
  useCards: [["Technology", "Coordinate product marketing, demand generation, content, pipeline activity, and reporting.", "Technology →"], ["Professional Services", "Organize service marketing, inquiries, client outreach, content, and pipeline work.", "Professional Services →"], ["E-commerce", "Coordinate product content, campaigns, customer engagement, channel activity, and reporting.", "E-commerce →"], ["Healthcare", "Support marketing, educational content, community outreach, inquiry management, and reporting.", "Healthcare →"], ["Real Estate", "Coordinate listing promotion, lead capture, marketing assets, publishing, and campaign reporting.", "Real Estate →"]],
  capTitle: "How Amplivanta capabilities can support this work",
  capLead: "Use only the modules, integrations, data, and channels that are actually enabled and configured.",
  capCards: [["AI Advisor", "Review available context and generate suggested next steps that users can evaluate before acting."], ["Marketing Automation", "Build campaigns and workflows using configured triggers, audiences, content, and actions."], ["CRM & Pipelines", "Manage contacts, companies, deals, pipeline stages, activities, and tasks."], ["Social Publishing", "Create, approve, schedule, publish, and review social content for connected accounts."], ["Creative Studio", "Create and organize images, video, graphics, documents, social posts, and brand assets."], ["Analytics & Reports", "Review available campaign, channel, CRM, content, and attribution data where supported."], ["Integrations", "Connect supported external tools and data sources through configured integrations."]],
  flowTitle: "A common operating pattern",
  flowLead: "The details change by industry, but the core workflow remains connected.",
  steps: [["Define the objective", "Clarify the audience, offer, service, product, or campaign context."], ["Prepare the work", "Organize content, assets, contacts, and campaign requirements."], ["Execute", "Use the relevant Amplivanta modules for the work being performed."], ["Measure", "Review available campaign, content, CRM, and channel results."], ["Refine", "Use what is available to decide what to adjust next."]],
} as const;
