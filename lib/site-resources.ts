/**
 * Resources section content, from the approved design reference.
 *
 * Listing content itself is not hard-coded: each page shows what the platform
 * actually has published and otherwise renders the reference's neutral state.
 */

export type ResourcePage = {
  slug: string;
  name: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  actions: [string, string][];
  visualTitle: string;
  visualItems: string[];
  topicsTitle: string;
  topicsLead: string;
  topics: [string, string][];
  empty: [string, string] | null;
  /** The listing panel below the topics, from the reference. */
  library: {
    heroPlaceholder: string;
    title: string;
    lead: string;
    allTopicsLabel: string;
    sortOptions: string[];
    /** Quick filters above the search row, where the reference shows them. */
    chips?: string[];
    side: [string, string];
    emptyActions: [string, string][];
  };
};

export const RESOURCE_PAGES: ResourcePage[] = [
  {
    slug: "blog",
    name: "Blog",
    description: "Read Amplivanta articles about growth strategy, marketing automation, CRM, creative workflows, social publishing, analytics and AI-assisted marketing work.",
    eyebrow: "RESOURCES / BLOG",
    h1: "Practical ideas for connected growth work.",
    lead: "Explore Amplivanta articles on growth strategy, marketing automation, CRM, creative workflows, social publishing, analytics, and AI-assisted marketing. Published content should be sourced from the Amplivanta CMS.",
    actions: [["Search", "#library"], ["Explore the Platform", "/platform"]],
    visualTitle: "Explore by topic",
    visualItems: ["Growth strategy", "Marketing automation", "CRM & pipeline", "Creative & content", "Analytics & measurement", "AI-assisted workflows"],
    topicsTitle: "Browse by topic",
    topicsLead: "Use topic navigation without invented content counts or popularity claims.",
    topics: [["Growth Strategy", "Planning, prioritization, campaign structure, and growth operations."], ["Marketing Automation", "Campaigns, workflows, email, forms, landing pages, and audiences."], ["CRM & Pipeline", "Contacts, companies, deals, pipeline stages, activities, and follow-up."], ["Creative & Content", "Brand assets, social content, images, video, documents, and creative workflows."], ["Analytics", "Measurement, attribution, reporting, and performance review."], ["AI & Workflows", "Responsible AI assistance, review, and execution-ready workflows."]],
    empty: ["No published articles yet", "When Amplivanta publishes articles, they will appear here with their real title, topic, author, publication date, and destination URL."],
    library: {"heroPlaceholder": "Search blog...", "title": "Latest articles", "lead": "Published Amplivanta articles appear here from the CMS.", "allTopicsLabel": "All topics", "sortOptions": ["Newest", "Oldest", "A–Z"], "side": ["Editorial standard", "Resource content should explain actual Amplivanta capabilities, avoid invented performance claims, and clearly distinguish guidance from product functionality."], "emptyActions": [["Explore the Platform", "/platform"], ["Visit Help Center", "/resources/help-center"]]},
  },
  {
    slug: "videos",
    name: "Videos",
    description: "Watch Amplivanta product walkthroughs, workflow explainers and educational videos for marketing, CRM, automation, creative, social publishing and analytics.",
    eyebrow: "RESOURCES / VIDEOS",
    h1: "Watch Amplivanta workflows in context.",
    lead: "Use this library for product walkthroughs, workflow explainers, and educational videos covering Amplivanta capabilities. Only published videos and verified metadata should appear.",
    actions: [["Search", "#library"], ["Explore the Platform", "/platform"]],
    visualTitle: "Video topics",
    visualItems: ["Getting started", "Marketing automation", "CRM & pipelines", "Creative Studio", "Social publishing", "Analytics & reports"],
    topicsTitle: "Browse by topic",
    topicsLead: "Use topic navigation without invented content counts or popularity claims.",
    topics: [["Getting Started", "Workspace setup, navigation, and core product orientation."], ["Marketing Automation", "Campaigns, workflows, email, forms, landing pages, and audiences."], ["CRM & Pipelines", "Contacts, companies, deals, pipelines, activities, and tasks."], ["Creative Studio", "Images, video, graphics, documents, social posts, and Brand Kit."], ["Social Publishing", "Composer, calendar, approvals, publishing queue, and analytics."], ["Analytics & Reports", "Performance views, attribution, reporting, and measurement workflows."]],
    empty: ["No published videos yet", "When videos are published, show the actual title, topic, duration, thumbnail, accessibility metadata, and destination."],
    library: {"heroPlaceholder": "Search videos...", "title": "Video library", "lead": "Published videos appear here with production metadata.", "allTopicsLabel": "All topics", "sortOptions": ["Newest", "A–Z"], "side": ["Video publishing standard", "Use captions or transcripts where available, accurate titles and descriptions, and no fabricated view counts, ratings, or customer outcomes."], "emptyActions": [["Explore the Platform", "/platform"], ["Visit Help Center", "/resources/help-center"]]},
  },
  {
    slug: "webinars",
    name: "Webinars",
    description: "Find scheduled and on-demand Amplivanta webinars covering marketing, automation, CRM, creative, social publishing, analytics and responsible AI use.",
    eyebrow: "RESOURCES / WEBINARS",
    h1: "Learn through scheduled and on-demand sessions.",
    lead: "Find Amplivanta sessions covering platform workflows, marketing operations, automation, CRM, creative work, analytics, and responsible AI use. Dates, speakers, and availability should come from the live event system.",
    actions: [["Search", "#library"], ["Explore Videos", "/resources/videos"]],
    visualTitle: "Session themes",
    visualItems: ["Platform workflows", "Growth strategy", "Marketing automation", "CRM & pipeline", "Creative operations", "Analytics & AI"],
    topicsTitle: "Browse by topic",
    topicsLead: "Use topic navigation without invented content counts or popularity claims.",
    topics: [["Platform Workflows", "Connected workflows from planning through execution and measurement."], ["Growth Strategy", "Practical planning, prioritization, and campaign operating patterns."], ["Marketing Automation", "Campaign, workflow, email, form, and landing-page sessions."], ["CRM & Pipeline", "Contact management, pipeline operations, tasks, and follow-up."], ["Creative Operations", "Brand assets, content production, and publishing handoffs."], ["Analytics & AI", "Measurement, reporting, AI assistance, and human review practices."]],
    empty: ["No webinars are currently published", "Scheduled sessions and approved recordings will appear here when available. Do not hard-code dates, speakers, attendance counts, or availability."],
    library: {"heroPlaceholder": "Search webinars...", "title": "Webinar library", "lead": "Upcoming and on-demand sessions are driven by real event records.", "allTopicsLabel": "All sessions", "sortOptions": ["Upcoming", "A–Z"], "chips": ["All sessions", "Upcoming", "On-demand"], "side": ["Event information standard", "Registration status, date/time, speaker details, replay availability, and capacity must reflect the production event system rather than design placeholders."], "emptyActions": [["Explore Videos", "/resources/videos"], ["Visit Help Center", "/resources/help-center"]]},
  },
  {
    slug: "templates",
    name: "Templates",
    description: "Browse Amplivanta resource templates for campaign planning, email, social publishing, CRM, reporting and workflow planning. Marketplace seller products remain separate.",
    eyebrow: "RESOURCES / TEMPLATES",
    h1: "Reusable templates for practical growth work.",
    lead: "Browse Amplivanta-provided resource templates for planning and execution. These resources are separate from seller products in the Amplivanta Marketplace and should use their own access and licensing rules.",
    actions: [["Search", "#library"], ["Explore Marketplace", "/marketplace"]],
    visualTitle: "Template categories",
    visualItems: ["Campaign planning", "Email & messaging", "Social publishing", "CRM & pipeline", "Reporting", "Workflow planning"],
    topicsTitle: "Browse by topic",
    topicsLead: "Use topic navigation without invented content counts or popularity claims.",
    topics: [["Campaign Planning", "Reusable structures for campaign goals, audiences, messaging, and review."], ["Email & Messaging", "Planning resources for email campaigns, sequences, and messaging."], ["Social Publishing", "Planning resources for posts, calendars, approvals, and publishing workflows."], ["CRM & Pipeline", "Templates for contact, deal, pipeline, task, and follow-up planning."], ["Reporting", "Structures for measurement plans, reporting inputs, and performance review."], ["Workflow Planning", "Reusable planning aids for triggers, conditions, actions, and review steps."]],
    empty: ["No resource templates published yet", "When Amplivanta publishes templates, display verified format, description, access requirements, and license or usage information. Marketplace seller products remain under Marketplace."],
    library: {"heroPlaceholder": "Search templates...", "title": "Resource template library", "lead": "Only Amplivanta-published resource templates appear here.", "allTopicsLabel": "All categories", "sortOptions": ["Newest", "A–Z"], "side": ["Marketplace separation", "This page is for Amplivanta resource templates. Seller-created downloadable products belong in Marketplace and follow Marketplace licensing, purchase, and seller-governance rules."], "emptyActions": [["Explore Marketplace", "/marketplace"], ["Visit Help Center", "/resources/help-center"]]},
  },
  {
    slug: "help-center",
    name: "Help Center",
    description: "Search Amplivanta help articles and support topics for account setup, marketing automation, CRM, Creative Studio, social publishing, analytics, marketplace and billing.",
    eyebrow: "RESOURCES / HELP CENTER",
    h1: "Find help for the work you are doing.",
    lead: "Search product guidance, setup information, troubleshooting articles, and support topics. The Help Center serves as the public knowledge base so users do not have to choose between overlapping support destinations.",
    actions: [["Search", "#library"], ["Contact Us", "/contact"]],
    visualTitle: "Common help areas",
    visualItems: ["Getting started", "Account & workspace", "Marketing automation", "CRM & pipelines", "Creative Studio", "Marketplace & billing"],
    topicsTitle: "Browse by topic",
    topicsLead: "Use topic navigation without invented content counts or popularity claims.",
    topics: [["Getting Started", "Account creation, onboarding, workspace setup, and navigation."], ["Account & Workspace", "Profile, workspace, team, domain, integration, and settings guidance."], ["Marketing Automation", "Campaigns, workflows, email, forms, landing pages, and audiences."], ["CRM & Pipelines", "Contacts, companies, deals, pipeline, activities, tasks, and imports."], ["Creative & Social", "Creative Studio, Brand Kit, content creation, publishing, and channel workflows."], ["Marketplace & Billing", "Marketplace access, purchases, seller workflows, plans, billing, and credits."]],
    empty: ["Search the Help Center", "Enter a topic or question to find published help content. When no result is available, provide a clear path to contact support without inventing response times or availability."],
    library: {"heroPlaceholder": "Search help center...", "title": "Search help articles", "lead": "Help results should come from the current support knowledge base.", "allTopicsLabel": "All help topics", "sortOptions": ["Relevance", "A–Z"], "chips": ["All help", "Getting started", "Product help", "Account & billing"], "side": ["Need additional help?", "Use the production Contact Support or request workflow when available. Support hours, response times, live chat, AI assistance, and system-status features should appear only when they are actually configured."], "emptyActions": [["Contact Us", "/contact"], ["Explore the Platform", "/platform"]]},
  },
];

export const RESOURCE_BY_SLUG = new Map(RESOURCE_PAGES.map((p) => [p.slug, p]));
