import { Sparkles, Search, Mail, Users, Share2, BarChart3, Wand2, Plug, Bot, Workflow, LayoutDashboard, Target, MessageSquare, Calendar, FileText, LineChart, ShieldCheck, ImageIcon, Video, Palette } from "lucide-react";
import type { MarketingPageProps } from "@/components/amplivanta/marketing-page";

export const MODULE_PAGES: Record<string, MarketingPageProps> = {
  "ai-advisor": {
    eyebrow: "AI Advisor™",
    title: <>Your always-on growth strategist, powered by AI.</>,
    subtitle: "Ask any business question. Get prioritized growth actions, projected impact, and one-click execution.",
    ctas: [{ label: "Start Free", href: "/signup", primary: true }, { label: "Watch Demo", href: "/demo" }],
    bullets: ["Personalized to your data", "Explains its reasoning", "Handoffs into every module"],
    stats: [
      { value: "3.2×", label: "Faster decisions" },
      { value: "47%", label: "More qualified leads" },
      { value: "$180K", label: "Avg. revenue lift" },
      { value: "12 min", label: "To first insight" },
    ],
    features: [
      { title: "Conversational asks", desc: "Ask in plain language — 'why did leads drop?' — get a scored answer with sources.", icon: MessageSquare },
      { title: "Growth score & radar", desc: "See a live health score across acquisition, activation, revenue, retention.", icon: Target },
      { title: "Take-Action controls", desc: "Turn any recommendation into a campaign, landing page, email or automation.", icon: Bot },
    ],
    quote: { text: "The AI Advisor spotted a channel we'd overlooked. Two weeks later it drove 40% of our new pipeline.", author: "Priya Ramesh", role: "Head of Growth, NextGen" },
  },
  "growth-audit": {
    eyebrow: "Growth Audit™",
    title: <>Deep audits of your entire growth stack, in minutes.</>,
    subtitle: "Score your website, funnel, content, and channels against benchmarks. Get a prioritized fix list.",
    ctas: [{ label: "Run a Free Audit", href: "/signup", primary: true }, { label: "See Example Report", href: "#" }],
    features: [
      { title: "Score & breakdown", desc: "Overall growth score + 12 dimensions scored against industry benchmarks.", icon: LineChart },
      { title: "Competitor benchmark", desc: "Radar view of you vs top competitors across paid, organic, social, retention.", icon: BarChart3 },
      { title: "Fix-list export", desc: "PDF report + schedule-able recurring audits for stakeholders.", icon: FileText },
    ],
  },
  "marketing-automation": {
    eyebrow: "Marketing Automation",
    title: <>Automate the boring. Convert the interested.</>,
    subtitle: "Visual workflow builder, email campaigns, lead capture forms, landing pages, lead scoring — one stack.",
    ctas: [{ label: "Start Free", href: "/signup", primary: true }, { label: "See Templates", href: "#" }],
    features: [
      { title: "Workflow builder", desc: "Drag-and-drop triggers, actions, waits, branches. Ship in an afternoon.", icon: Workflow },
      { title: "Email campaigns", desc: "Drag-and-drop composer with AI spam scoring and A/B testing built in.", icon: Mail },
      { title: "Lead capture forms", desc: "Compliance-ready forms with consent logging, double opt-in, reCAPTCHA.", icon: FileText },
      { title: "Landing pages", desc: "Hosted, SEO-ready pages with launch-readiness checks and analytics.", icon: LayoutDashboard },
      { title: "Segments & scoring", desc: "Dynamic segments and behavior-based lead scoring keep sales prioritized.", icon: Target },
      { title: "Publish & domains", desc: "Custom domain publishing with DNS verification and safe rollbacks.", icon: ShieldCheck },
    ],
  },
  crm: {
    eyebrow: "CRM",
    title: <>Every contact, every deal, every touchpoint.</>,
    subtitle: "A CRM that actually shows the whole story — not a spreadsheet with tabs.",
    ctas: [{ label: "Start Free", href: "/signup", primary: true }, { label: "Import Contacts", href: "/signup" }],
    features: [
      { title: "Pipeline & deals", desc: "Kanban and forecast views. Stage changes update every widget.", icon: Target },
      { title: "Rich contact detail", desc: "Activity, deals, notes, files, lead score — one drawer.", icon: Users },
      { title: "Activities & tasks", desc: "Log calls, meetings, emails. Nothing falls through the cracks.", icon: Calendar },
    ],
  },
  "social-publishing": {
    eyebrow: "Social Publishing",
    title: <>Publish everywhere. Measure what worked.</>,
    subtitle: "Compose once, preview per platform, schedule to the calendar, approve, publish, analyze.",
    ctas: [{ label: "Connect Accounts", href: "/signup", primary: true }, { label: "See Composer", href: "#" }],
    features: [
      { title: "Multi-platform composer", desc: "Per-platform customization, live previews, character limits validated pre-publish.", icon: Share2 },
      { title: "Content calendar", desc: "Month/week/day views with drag-to-reschedule and status colors.", icon: Calendar },
      { title: "Approvals & governance", desc: "Reviewer workflows, changes requested, publishing lock until approved.", icon: ShieldCheck },
    ],
  },
  "creative-studio": {
    eyebrow: "AI Creative Studio™",
    title: <>Content, images, video, docs — on-brand, in minutes.</>,
    subtitle: "AI generation locked to your brand kit. Templates for every format. Real project management underneath.",
    ctas: [{ label: "Start Free", href: "/signup", primary: true }, { label: "See Templates", href: "#" }],
    features: [
      { title: "AI images", desc: "Text-to-image, background removal, resize, brand-kit locked palettes.", icon: ImageIcon },
      { title: "AI video", desc: "Text-to-video, script-to-video, image-to-video, URL repurposing.", icon: Video },
      { title: "Brand kit", desc: "Logos, colors, typography, guidelines — one source of truth for every editor.", icon: Palette },
    ],
  },
  analytics: {
    eyebrow: "Analytics",
    title: <>Every metric that matters, one date range.</>,
    subtitle: "Traffic, campaigns, funnel, attribution — reconciled from every source, one place.",
    ctas: [{ label: "See Live Dashboard", href: "/signup", primary: true }],
    features: [
      { title: "Traffic analytics", desc: "Sessions, sources, devices, geography, landing-page drilldowns.", icon: LineChart },
      { title: "Campaign analytics", desc: "Cross-channel campaign performance for reach, engagement, spend, revenue.", icon: BarChart3 },
      { title: "Conversion funnel", desc: "Visualize drop-off. Surface high-impact leaks with AI recommendations.", icon: Target },
      { title: "Revenue attribution", desc: "Multi-touch attribution with model comparison and ROAS.", icon: LineChart },
    ],
  },
  integrations: {
    eyebrow: "Integrations",
    title: <>Connect everything. Eliminate the busywork.</>,
    subtitle: "Two-way integrations with the tools you already use. Webhooks and a full REST API for the rest.",
    ctas: [{ label: "See Integrations", href: "#", primary: true }, { label: "Read API Docs", href: "#" }],
    features: [
      { title: "Connected apps", desc: "HubSpot, Salesforce, Slack, Shopify, Stripe, Google, Meta, LinkedIn and more.", icon: Plug },
      { title: "Webhooks", desc: "Sign, retry, inspect. Full delivery logs.", icon: Workflow },
      { title: "API + SDKs", desc: "Named-scope API keys, rate limits, usage attribution.", icon: FileText },
    ],
  },
};

export const INDUSTRY_PAGES: Record<string, MarketingPageProps> = {
  manufacturing: {
    eyebrow: "Manufacturing",
    title: <>Long sales cycles, engineered end to end.</>,
    subtitle: "Distributor enablement, spec-sheet content, and multi-touch attribution for complex buying groups.",
    ctas: [{ label: "Talk to Sales", href: "/contact?intent=enterprise", primary: true }],
    features: [
      { title: "Buying-group tracking", desc: "Map every stakeholder in a deal and nurture each one differently.", icon: Target },
      { title: "Spec & catalog content", desc: "Generate spec sheets, datasheets, and product pages from your catalog.", icon: FileText },
      { title: "Distributor enablement", desc: "Co-branded assets and campaigns your channel can launch instantly.", icon: Share2 },
    ],
  },
  ecommerce: {
    eyebrow: "E-commerce",
    title: <>Grow revenue per visitor, not just traffic.</>,
    subtitle: "Cart recovery, product retargeting, review flows, and lifecycle emails wired to your store.",
    ctas: [{ label: "Start Free", href: "/signup", primary: true }],
    features: [
      { title: "Store integrations", desc: "Shopify, WooCommerce, BigCommerce with product-level attribution.", icon: Plug },
      { title: "Lifecycle automation", desc: "Abandoned cart, browse abandonment, post-purchase, winback flows.", icon: Workflow },
      { title: "AI product content", desc: "Product descriptions, ad creative, on-brand imagery — from your catalog.", icon: Wand2 },
    ],
  },
  saas: {
    eyebrow: "SaaS",
    title: <>PLG + sales-assisted, without duct tape.</>,
    subtitle: "Onboarding automation, trial-to-paid nurture, PQL scoring, and revenue attribution for SaaS teams.",
    ctas: [{ label: "Start Free", href: "/signup", primary: true }],
    features: [
      { title: "PQL scoring", desc: "Behavior-based scoring with product-usage signals.", icon: Target },
      { title: "Trial-to-paid nurture", desc: "Templates for onboarding, feature adoption, expansion.", icon: Mail },
      { title: "Revenue attribution", desc: "Match MRR to campaigns and channels with multi-touch models.", icon: LineChart },
    ],
  },
  healthcare: {
    eyebrow: "Healthcare",
    title: <>Compliant marketing that respects patient trust.</>,
    subtitle: "HIPAA-ready consent capture, audit-ready workflows, and content approval built in.",
    ctas: [{ label: "Talk to Sales", href: "/contact?intent=enterprise", primary: true }],
    features: [
      { title: "Compliance-first", desc: "Consent logging, double opt-in, redacted audit trail.", icon: ShieldCheck },
      { title: "Content approval", desc: "Every asset can require sign-off from clinical or legal reviewers.", icon: FileText },
      { title: "Patient education", desc: "AI-generated on-brand content reviewed before it ever ships.", icon: Wand2 },
    ],
  },
  "real-estate": {
    eyebrow: "Real Estate",
    title: <>Fill your pipeline. Close more listings.</>,
    subtitle: "Listing landing pages, buyer/seller nurture, and open-house follow-up on autopilot.",
    ctas: [{ label: "Start Free", href: "/signup", primary: true }],
    features: [
      { title: "Listing landing pages", desc: "Publish beautiful pages per property in minutes.", icon: LayoutDashboard },
      { title: "Buyer nurture", desc: "Automated drip based on price range, area, and behavior.", icon: Mail },
      { title: "Post-visit follow-up", desc: "Trigger from CRM activity — never lose a lead again.", icon: Workflow },
    ],
  },
  education: {
    eyebrow: "Education",
    title: <>Grow enrollment. Reduce admissions overhead.</>,
    subtitle: "Applicant journeys, scholarship nurture, and event promotion — one platform for admissions and marketing.",
    ctas: [{ label: "Talk to Sales", href: "/contact", primary: true }],
    features: [
      { title: "Applicant journeys", desc: "Stage-based automation from inquiry through enrollment.", icon: Workflow },
      { title: "Event & webinar", desc: "Registration pages, reminders, and attendance tracking.", icon: Calendar },
      { title: "Reporting for boards", desc: "Executive dashboards on funnel, source, and yield.", icon: BarChart3 },
    ],
  },
  "financial-services": {
    eyebrow: "Financial Services",
    title: <>Grow AUM. Stay auditable.</>,
    subtitle: "Consent capture, disclosure workflows, and audit-grade record keeping for regulated marketing.",
    ctas: [{ label: "Talk to Sales", href: "/contact?intent=enterprise", primary: true }],
    features: [
      { title: "Disclosure control", desc: "Require disclosures per audience, region, or product.", icon: ShieldCheck },
      { title: "Audit trail", desc: "Immutable audit records of every communication and edit.", icon: FileText },
      { title: "Segment governance", desc: "Attribute-level access controls on sensitive contact data.", icon: Users },
    ],
  },
  agencies: {
    eyebrow: "Agencies",
    title: <>One workspace per client. One platform for your agency.</>,
    subtitle: "Multi-workspace, white-labeled deliverables, and per-client analytics for agencies scaling growth work.",
    ctas: [{ label: "Talk to Sales", href: "/contact?intent=enterprise", primary: true }],
    features: [
      { title: "Multi-workspace", desc: "One login. Isolated data per client. Role-based access.", icon: Users },
      { title: "White-label reports", desc: "Branded exports and shared dashboards clients actually read.", icon: FileText },
      { title: "Retainer economics", desc: "Templates and AI cut delivery time so retainers stay profitable.", icon: LineChart },
    ],
  },
  "professional-services": {
    eyebrow: "Professional Services",
    title: <>Turn expertise into a marketing engine.</>,
    subtitle: "Thought leadership, referral programs, and account-based nurture for consulting, legal, and pro-services.",
    ctas: [{ label: "Start Free", href: "/signup", primary: true }],
    features: [
      { title: "Thought leadership", desc: "AI-assisted long-form content, distributed across channels.", icon: Wand2 },
      { title: "Referral programs", desc: "Track and reward partner and client referrals.", icon: Share2 },
      { title: "Account-based nurture", desc: "Segment by firm, role, and buying committee stage.", icon: Target },
    ],
  },
};

export const SOLUTION_PAGES: Record<string, MarketingPageProps> = {
  "business-type": {
    eyebrow: "By Business Type",
    title: <>Solutions tuned to how you sell.</>,
    subtitle: "B2B, B2C, marketplace, or agency — Amplivanta adapts to your model.",
    ctas: [{ label: "Explore", href: "/pricing", primary: true }],
    features: [
      { title: "B2B", desc: "Lead scoring, ABM, and sales handoff for high-consideration purchases.", icon: Target },
      { title: "B2C", desc: "Lifecycle automation, loyalty, and cross-channel attribution.", icon: Users },
      { title: "Marketplace", desc: "Two-sided nurture: supply and demand, one platform.", icon: Workflow },
    ],
  },
  "use-case": {
    eyebrow: "By Use Case",
    title: <>Pick the outcome. We&apos;ll route the tools.</>,
    subtitle: "Lead gen, brand awareness, retention, revenue attribution — one platform, many outcomes.",
    ctas: [{ label: "Explore", href: "/pricing", primary: true }],
    features: [
      { title: "Lead generation", desc: "Forms, landing pages, scoring, and nurture in one motion.", icon: FileText },
      { title: "Brand awareness", desc: "Social publishing, competitor watch, and content amplification.", icon: Share2 },
      { title: "Retention", desc: "Lifecycle automation, winback, and expansion campaigns.", icon: Mail },
    ],
  },
  startups: {
    eyebrow: "Startups",
    title: <>Ship growth work like a 20-person team.</>,
    subtitle: "AI-assisted execution so a founder can run marketing without hiring an agency.",
    ctas: [{ label: "Start Free", href: "/signup?plan=starter", primary: true }],
  },
  enterprises: {
    eyebrow: "Enterprises",
    title: <>Governance, scale, and residency your legal team will approve.</>,
    subtitle: "SSO, SCIM, custom data residency, immutable audit logs, and dedicated success.",
    ctas: [{ label: "Talk to Sales", href: "/contact?intent=enterprise", primary: true }],
  },
};

export const COMPANY_PAGES: Record<string, MarketingPageProps> = {
  about: {
    eyebrow: "About",
    title: <>We engineer growth for businesses that matter.</>,
    subtitle: "Amplivanta was built by growth operators for growth operators. We believe the future of marketing is AI-native, transparent, and honest about what works.",
    ctas: [{ label: "Careers", href: "/company/careers", primary: true }, { label: "Contact", href: "/contact" }],
    stats: [
      { value: "10K+", label: "Businesses" },
      { value: "2M+", label: "Leads generated" },
      { value: "$250M+", label: "Revenue driven" },
      { value: "48", label: "Countries served" },
    ],
    quote: { text: "We don't ship what we wouldn't run our own business on. Every feature ships with governance, not against it.", author: "Amplivanta Founding Team", role: "Product & Engineering" },
  },
  careers: {
    eyebrow: "Careers",
    title: <>Build with us.</>,
    subtitle: "Remote-first. Async by default. High trust, high standards. We're hiring across engineering, design, and go-to-market.",
    ctas: [{ label: "Open Roles", href: "#", primary: true }, { label: "Life at Amplivanta", href: "#" }],
    features: [
      { title: "Remote-first", desc: "Work from anywhere. Overlap 4 hours with your team.", icon: Users },
      { title: "Real ownership", desc: "Equity, autonomy, and ideas that ship the same quarter.", icon: Target },
      { title: "Learning budget", desc: "$2,000/year for books, courses, and conferences.", icon: FileText },
    ],
  },
  partners: {
    eyebrow: "Partners",
    title: <>Partner with Amplivanta.</>,
    subtitle: "Referral, reseller, agency, and technology partners. Grow with us.",
    ctas: [{ label: "Become a Partner", href: "/contact?intent=partner", primary: true }],
  },
  press: {
    eyebrow: "Press",
    title: <>Newsroom.</>,
    subtitle: "Press releases, brand assets, and media contacts.",
    ctas: [{ label: "Media Kit", href: "#", primary: true }, { label: "Contact PR", href: "/contact" }],
  },
};

export const RESOURCE_PAGES: Record<string, MarketingPageProps> = {
  templates: {
    eyebrow: "Templates",
    title: <>Plug-and-play growth templates.</>,
    subtitle: "Campaigns, landing pages, sequences, and reports you can launch the same day.",
    ctas: [{ label: "Browse Templates", href: "/signup", primary: true }],
  },
  videos: {
    eyebrow: "Videos",
    title: <>Product demos and tutorials.</>,
    subtitle: "Short walkthroughs of every module, from first setup to advanced automation.",
    ctas: [{ label: "Watch Now", href: "#", primary: true }],
  },
  "growth-engineering-playbook": {
    eyebrow: "Featured Resource",
    title: <>The Growth Engineering Playbook.</>,
    subtitle: "Proven frameworks to find, prioritize, and execute high-impact growth.",
    ctas: [{ label: "Download Now", href: "/signup", primary: true }],
    features: [
      { title: "Find", desc: "Diagnose where growth is actually leaking across your funnel.", icon: Search },
      { title: "Prioritize", desc: "Score opportunities by impact, effort, and confidence.", icon: Target },
      { title: "Execute", desc: "Turn each bet into a shipped campaign with measured outcomes.", icon: Workflow },
    ],
  },
  index: {
    eyebrow: "Resources",
    title: <>Learn how to engineer growth.</>,
    subtitle: "Guides, case studies, webinars, and playbooks from teams growing with Amplivanta.",
    ctas: [{ label: "Read the Blog", href: "/blog", primary: true }],
    features: [
      { title: "Guides", desc: "Practical playbooks on lifecycle, attribution, PLG, and more.", icon: FileText },
      { title: "Webinars", desc: "Live sessions with growth leaders. All replays free.", icon: Video },
      { title: "Case studies", desc: "How real teams shipped measurable outcomes with Amplivanta.", icon: BarChart3 },
    ],
  },
  guides: {
    eyebrow: "Guides",
    title: <>Playbooks that ship in a week, not a quarter.</>,
    subtitle: "Concrete, opinionated guides for growth operators.",
    ctas: [{ label: "Browse Guides", href: "#", primary: true }],
  },
  webinars: {
    eyebrow: "Webinars",
    title: <>Learn live. Watch anytime.</>,
    subtitle: "Weekly live sessions with growth operators. Every replay free.",
    ctas: [{ label: "See Schedule", href: "#", primary: true }],
  },
  "case-studies": {
    eyebrow: "Case Studies",
    title: <>Measurable outcomes, not vanity metrics.</>,
    subtitle: "Real teams. Real numbers. Real playbooks you can steal.",
    ctas: [{ label: "Read All", href: "#", primary: true }],
  },
};
