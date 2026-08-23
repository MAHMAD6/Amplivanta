/**
 * Static content for the in-app Resources section (Blog, Knowledge Base, Guides,
 * Videos, Webinars, Templates, Help Center). Replace with CMS/API reads once the
 * content service exists — the page components read only from these shapes.
 */

/* ------------------------------------------------------------------- blog */

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryTone: string;
  author: string;
  date: string;
  readTime: string;
  cover: string;
}

export const BLOG_FEATURED = {
  badge: "Featured",
  title: "The Future of Marketing Automation in 2025",
  excerpt:
    "Discover the key trends, tools, and strategies shaping marketing automation and how to stay ahead.",
  author: "James Carter",
  date: "May 6, 2025",
  readTime: "8 min read",
};

export const BLOG_TOPICS = [
  { label: "All Topics", count: 0 },
  { label: "Marketing Automation", count: 24 },
  { label: "Growth Strategy", count: 18 },
  { label: "Social Media", count: 16 },
  { label: "Analytics", count: 14 },
  { label: "Productivity", count: 12 },
  { label: "Email Marketing", count: 10 },
];

export const BLOGPOSTS: BlogPost[] = [
  {
    id: "b1",
    title: "7 Workflow Automation Examples That Drive Results",
    excerpt: "See real-world automation workflows that save time and boost conversions.",
    category: "Marketing Automation",
    categoryTone: "bg-violet/10 text-violet",
    author: "Sarah Johnson",
    date: "May 6, 2025",
    readTime: "6 min read",
    cover: "from-violet/25 to-royal-tint",
  },
  {
    id: "b2",
    title: "How to Set SMART Goals for Explosive Growth",
    excerpt: "A step-by-step guide to setting goals that your team can actually achieve.",
    category: "Growth Strategy",
    categoryTone: "bg-orange-brand/10 text-orange-brand",
    author: "David Lee",
    date: "May 5, 2025",
    readTime: "7 min read",
    cover: "from-orange-brand/20 to-pink-brand/15",
  },
  {
    id: "b3",
    title: "Social Media Content Calendar That Works",
    excerpt: "Plan, organize, and publish content that engages your audience daily.",
    category: "Social Media",
    categoryTone: "bg-royal-blue/10 text-royal-blue",
    author: "Emily Davis",
    date: "May 4, 2025",
    readTime: "5 min read",
    cover: "from-royal-tint to-violet/15",
  },
];

export const BLOG_POSTS = BLOGPOSTS;

export const BLOG_TOP_READS = [
  { rank: "01", title: "The Complete Guide to Marketing Automation", readTime: "12 min read" },
  { rank: "02", title: "Building a High-Converting Landing Page", readTime: "9 min read" },
  { rank: "03", title: "Email Marketing Best Practices in 2025", readTime: "8 min read" },
];

/* --------------------------------------------------------- knowledge base */

export const KB_POPULAR_SEARCHES = [
  "Email Automation",
  "Workflows",
  "Landing Pages",
  "Campaign Reports",
];

export const KB_CATEGORIES = [
  { title: "Getting Started", desc: "Basics to help you set up and get started quickly.", count: 12, icon: "rocket", tone: "bg-violet/12 text-violet" },
  { title: "Marketing Automation", desc: "Automate campaigns and nurture your audience.", count: 24, icon: "workflow", tone: "bg-emerald-500/12 text-emerald-600" },
  { title: "Content & Creative", desc: "Create, manage, and optimize content that converts.", count: 18, icon: "pen", tone: "bg-orange-brand/12 text-orange-brand" },
  { title: "Analytics & Reporting", desc: "Track performance and gain valuable insights.", count: 16, icon: "chart", tone: "bg-royal-blue/12 text-royal-blue" },
  { title: "Account & Settings", desc: "Manage users, roles, and your account settings.", count: 14, icon: "settings", tone: "bg-pink-brand/12 text-pink-brand" },
];

export const KB_RECENT_ARTICLES = [
  { title: "How to Create Your First Automation Workflow", desc: "Learn how to build and launch your first automated workflow.", category: "Marketing Automation", tone: "bg-emerald-500/10 text-emerald-700", updated: "May 8, 2025" },
  { title: "Email Campaign Best Practices in 2025", desc: "Tips and strategies to improve open rates and drive engagement.", category: "Email Marketing", tone: "bg-royal-blue/10 text-royal-blue", updated: "May 6, 2025" },
  { title: "Understanding Analytics Dashboards", desc: "A complete guide to tracking and interpreting key metrics.", category: "Analytics & Reporting", tone: "bg-violet/10 text-violet", updated: "May 5, 2025" },
  { title: "Building High-Converting Landing Pages", desc: "Step-by-step guide to designing landing pages that convert.", category: "Landing Pages", tone: "bg-orange-brand/10 text-orange-brand", updated: "May 2, 2025" },
  { title: "Managing Users and Permissions", desc: "Learn how to add team members and set the right permissions.", category: "Account & Settings", tone: "bg-pink-brand/10 text-pink-brand", updated: "Apr 30, 2025" },
];

export const KB_POPULAR_ARTICLES = [
  { rank: "01", title: "How to Create an Automation Workflow", updated: "Updated May 8, 2025" },
  { rank: "02", title: "Email Campaign Best Practices", updated: "Updated May 6, 2025" },
  { rank: "03", title: "How to Read Your Analytics Reports", updated: "Updated May 5, 2025" },
  { rank: "04", title: "Create a Landing Page from Scratch", updated: "Updated May 2, 2025" },
  { rank: "05", title: "User Roles and Permissions Explained", updated: "Updated Apr 30, 2025" },
];

/* ------------------------------------------------------------ help center */

export const HELP_POPULAR_SEARCHES = [
  "Connect Email",
  "Create Workflow",
  "Landing Pages",
  "User Permissions",
  "Tracking & Analytics",
];

export const HELP_TOPICS = [
  { title: "Getting Started", desc: "New to Amplivanta? Learn the basics.", count: 12, icon: "rocket", tone: "bg-violet/12 text-violet" },
  { title: "Marketing Automation", desc: "Automate campaigns and nurture your audience.", count: 18, icon: "workflow", tone: "bg-emerald-500/12 text-emerald-600" },
  { title: "Creative Studio", desc: "Create stunning content that converts.", count: 16, icon: "pen", tone: "bg-royal-blue/12 text-royal-blue" },
  { title: "Social Publishing", desc: "Plan, publish, and analyze your social posts.", count: 14, icon: "share", tone: "bg-orange-brand/12 text-orange-brand" },
  { title: "Analytics & Reports", desc: "Track performance and make data-driven decisions.", count: 20, icon: "chart", tone: "bg-pink-brand/12 text-pink-brand" },
  { title: "Account & Settings", desc: "Manage your account, teams, and preferences.", count: 15, icon: "settings", tone: "bg-royal-blue/12 text-royal-blue" },
];

export const HELP_POPULAR_ARTICLES = [
  { title: "How to Create Your First Automation Workflow", desc: "Learn how to build and launch your first automated workflow.", category: "Marketing Automation", tone: "bg-emerald-500/10 text-emerald-700", date: "May 8, 2025", views: "12.4K" },
  { title: "Connect Your Email Account", desc: "Step-by-step guide to connect and verify your email.", category: "Getting Started", tone: "bg-royal-blue/10 text-royal-blue", date: "May 6, 2025", views: "8.7K" },
  { title: "Build a Landing Page from Scratch", desc: "Create high-converting landing pages in minutes.", category: "Marketing Automation", tone: "bg-emerald-500/10 text-emerald-700", date: "May 2, 2025", views: "9.3K" },
  { title: "User Roles and Permissions Explained", desc: "Understand roles and manage permissions effectively.", category: "Account & Settings", tone: "bg-royal-blue/10 text-royal-blue", date: "Apr 30, 2025", views: "6.2K" },
  { title: "Track Campaign Performance with Analytics", desc: "Measure KPIs and generate insightful reports.", category: "Analytics & Reports", tone: "bg-pink-brand/10 text-pink-brand", date: "Apr 28, 2025", views: "7.1K" },
];

export const HELP_QUICK_LINKS = [
  { title: "Submit a Support Ticket", desc: "Get help from our team", icon: "ticket", tone: "bg-pink-brand/12 text-pink-brand" },
  { title: "Live Chat Support", desc: "Chat with our support team", icon: "chat", tone: "bg-violet/12 text-violet" },
  { title: "Community Forum", desc: "Connect and learn from others", icon: "users", tone: "bg-orange-brand/12 text-orange-brand" },
  { title: "Feature Request", desc: "Suggest and vote for features", icon: "bulb", tone: "bg-royal-blue/12 text-royal-blue" },
];

export const HELP_SYSTEM_STATUS = {
  state: "All Systems Operational",
  updated: "May 12, 2025, 10:30 AM",
};

/* ----------------------------------------------------------------- videos */

export const VIDEO_FEATURED = {
  badge: "Featured",
  title: "Getting Started with Amplivanta",
  desc: "A quick overview of Amplivanta and how to set up your account, connect tools, and launch your first campaign.",
  duration: "12:45",
  level: "Beginner",
  track: "Onboarding",
};

export const VIDEO_FILTERS = ["All Videos", "Onboarding", "Marketing Automation", "CRM", "Analytics", "Social Media"];

export const VIDEOS = [
  { id: "v1", title: "Dashboard Overview", desc: "Understand the Amplivanta dashboard and key metrics.", duration: "10:32", level: "Beginner", cover: "from-royal-tint to-violet/20" },
  { id: "v2", title: "Create Your First Workflow", desc: "Build your first automation workflow from scratch.", duration: "15:48", level: "Beginner", cover: "from-emerald-500/15 to-royal-tint" },
  { id: "v3", title: "Audience Segmentation", desc: "Learn how to segment your audience for better results.", duration: "13:20", level: "Intermediate", cover: "from-violet/25 to-pink-brand/15" },
  { id: "v4", title: "Schedule Social Posts", desc: "Plan and schedule content across multiple platforms.", duration: "9:16", level: "Beginner", cover: "from-royal-tint to-emerald-500/15" },
  { id: "v5", title: "Campaign Performance Basics", desc: "Track and analyze your campaign performance.", duration: "11:05", level: "Intermediate", cover: "from-teal-500/20 to-royal-tint" },
  { id: "v6", title: "Email Campaign Best Practices", desc: "Design and send high-performing email campaigns.", duration: "14:22", level: "Intermediate", cover: "from-orange-brand/20 to-pink-brand/15" },
  { id: "v7", title: "Connect Integrations", desc: "Connect Amplivanta with your favorite tools.", duration: "8:47", level: "Beginner", cover: "from-royal-tint to-violet/15" },
  { id: "v8", title: "AI-Powered Insights", desc: "Use AI to generate insights and improve results.", duration: "10:14", level: "Advanced", cover: "from-violet/35 to-royal-blue/25" },
];

export const VIDEO_CONTINUE = [
  { title: "Marketing Automation 101", progress: 60, left: "12:45 left" },
  { title: "Advanced Workflows", progress: 35, left: "18:20 left" },
  { title: "Analytics Deep Dive", progress: 75, left: "8:10 left" },
];

export const VIDEO_PROGRESS = { completed: 24, inProgress: 10, notStarted: 8, percent: 68 };

export const VIDEO_CATEGORIES = [
  { label: "Marketing Automation", count: 24 },
  { label: "Onboarding", count: 18 },
  { label: "Analytics", count: 16 },
  { label: "Social Media", count: 14 },
  { label: "CRM", count: 12 },
];

/* --------------------------------------------------------------- webinars */

export const WEBINAR_FEATURED = {
  status: "Live",
  badge: "Featured",
  title: "Scaling Growth with Marketing Automation",
  desc: "Discover how smart automation can help you nurture leads, engage audiences, and drive measurable growth at scale.",
  date: "May 28, 2025",
  time: "11:00 AM (ET)",
  duration: "60 min",
  seatsLeft: 128,
  countdown: { days: "02", hours: "14", mins: "36", secs: "48" },
  speakers: [
    { name: "Priya Sharma", role: "Head of Growth, Amplivanta" },
    { name: "Rohan Mehta", role: "Marketing Automation Expert" },
  ],
};

export const WEBINAR_FILTERS = [
  "All Webinars",
  "Upcoming",
  "Live",
  "On-Demand",
  "Product Demos",
  "Strategy Sessions",
  "Customer Training",
  "Expert Talks",
];

export const WEBINARS = [
  { id: "w1", tag: "UPCOMING", title: "From Leads to Loyal Customers", host: "Anita Desai", when: "Jun 04, 2025 · 2:00 PM (ET)", duration: "60 min", action: "Register", cover: "from-orange-brand/25 to-violet/20" },
  { id: "w2", tag: "LIVE NOW", title: "AI-Powered Marketing: What's Working Now", host: "Arjun Nair", when: "May 21, 2025 · 10:00 AM (ET)", duration: "60 min", action: "Join Live", cover: "from-royal-blue/30 to-violet/25" },
  { id: "w3", tag: "ON-DEMAND", title: "Building High-Converting Funnels", host: "Meera Kapoor", when: "On-Demand", duration: "45 min", action: "Watch Replay", cover: "from-violet/25 to-pink-brand/20" },
  { id: "w4", tag: "PRODUCT DEMO", title: "Amplivanta Platform Walkthrough", host: "Rohan Mehta", when: "May 30, 2025 · 11:00 AM (ET)", duration: "45 min", action: "Register", cover: "from-royal-tint to-royal-blue/25" },
  { id: "w5", tag: "STRATEGY SESSION", title: "Growth Strategy Masterclass", host: "Priya Sharma", when: "Jun 11, 2025 · 1:00 PM (ET)", duration: "60 min", action: "Register", cover: "from-deep-navy/25 to-violet/25" },
  { id: "w6", tag: "EXPERT TALK", title: "The Future of Customer Engagement", host: "Vikram Iyer", when: "On-Demand", duration: "45 min", action: "Watch Replay", cover: "from-orange-brand/25 to-royal-blue/20" },
];

export const WEBINAR_SCHEDULE = [
  { month: "MAY", day: "28", title: "Scaling Growth with Marketing Automation", time: "11:00 AM (ET)", state: "Live" },
  { month: "JUN", day: "04", title: "From Leads to Loyal Customers", time: "2:00 PM (ET)", state: "Upcoming" },
  { month: "JUN", day: "11", title: "Growth Strategy Masterclass", time: "1:00 PM (ET)", state: "Upcoming" },
];

export const WEBINAR_REGISTRATIONS = { total: 6, upcoming: 2, live: 2, onDemand: 2, progress: 72 };

export const WEBINAR_RECOMMENDED = [
  { title: "Marketing Automation Best Practices", meta: "On-Demand · 38 min" },
  { title: "Lead Scoring that Drives Results", meta: "On-Demand · 42 min" },
];

export const WEBINAR_RESOURCES = [
  { title: "Webinar Slide Decks", meta: "PDF · Download" },
  { title: "Webinar Notes & Recaps", meta: "PDF · Download" },
  { title: "Recording Guidelines", meta: "PDF · Download" },
];

/* -------------------------------------------------------------- templates */

export const TEMPLATE_TYPES = [
  { title: "Email Templates", count: 142, icon: "mail", tone: "bg-emerald-500/12 text-emerald-600" },
  { title: "Landing Pages", count: 86, icon: "layout", tone: "bg-orange-brand/12 text-orange-brand" },
  { title: "Social Posts", count: 215, icon: "share", tone: "bg-violet/12 text-violet" },
  { title: "Forms", count: 64, icon: "form", tone: "bg-royal-blue/12 text-royal-blue" },
  { title: "Automation", count: 39, icon: "workflow", tone: "bg-pink-brand/12 text-pink-brand" },
  { title: "Reports", count: 28, icon: "chart", tone: "bg-amber-500/12 text-amber-600" },
];

export const TEMPLATE_TABS = ["All Templates", "Popular", "Recently Added", "My Favorites"];

export const TEMPLATES = [
  { id: "t1", name: "Welcome Email Series", desc: "A friendly welcome email to introduce your brand and build trust.", type: "Email", views: "12.4K", rating: "4.8", cover: "from-royal-tint to-violet/20" },
  { id: "t2", name: "Product Launch Email", desc: "Announce your new product with style and drive early interest.", type: "Email", views: "8.7K", rating: "4.7", cover: "from-royal-blue/20 to-teal-500/15" },
  { id: "t3", name: "Event Registration Page", desc: "Capture registrations for webinars, events, or workshops.", type: "Landing Page", views: "9.3K", rating: "4.6", cover: "from-violet/30 to-pink-brand/20" },
  { id: "t4", name: "Lead Capture Form", desc: "Simple and effective form to collect high-quality leads.", type: "Form", views: "15.6K", rating: "4.9", cover: "from-deep-navy/25 to-royal-blue/20" },
  { id: "t5", name: "Social Media Promo Post", desc: "Engaging post template to promote offers and announcements.", type: "Social Post", views: "7.2K", rating: "4.5", cover: "from-orange-brand/25 to-violet/20" },
  { id: "t6", name: "Customer Feedback Survey", desc: "Gather valuable feedback to improve products and services.", type: "Form", views: "6.1K", rating: "4.4", cover: "from-emerald-500/15 to-royal-tint" },
  { id: "t7", name: "Monthly Newsletter", desc: "Share updates, tips, and news with your audience.", type: "Email", views: "11.3K", rating: "4.8", cover: "from-royal-tint to-orange-brand/15" },
  { id: "t8", name: "Automated Nurture Workflow", desc: "Nurture leads with a multi-step email automation workflow.", type: "Automation", views: "5.9K", rating: "4.6", cover: "from-emerald-500/18 to-violet/15" },
];

export const TEMPLATE_FILTER_GROUPS = {
  types: ["All Types", "Email", "Landing Page", "Social Post", "Form", "Automation", "Report"],
  goals: ["All Goals", "Acquire", "Nurture", "Convert", "Retain"],
  industries: ["All Industries", "SaaS", "Ecommerce", "Healthcare", "Education", "Financial Services"],
  features: ["Mobile Responsive", "Drag & Drop Editor", "Customizable", "Pre-built Content"],
  colors: ["#6D3BF5", "#1D5FD6", "#0F9D77", "#F5731A", "#E8398F", "#9AA1B2"],
};

export const TEMPLATE_TAGS = [
  "Welcome", "Promotion", "Webinar", "Lead Gen", "Newsletter", "Event", "Ecommerce", "Survey", "Onboarding", "Re-engagement",
];

/* ----------------------------------------------------------------- guides */

export const GUIDE_TRACKS = [
  { title: "Launch Amplivanta", desc: "Set up your workspace, connect data, and invite your team.", steps: 6, minutes: 35, tone: "bg-violet/12 text-violet", icon: "rocket" },
  { title: "First Automation", desc: "Design, test, and publish your first nurture workflow.", steps: 8, minutes: 45, tone: "bg-emerald-500/12 text-emerald-600", icon: "workflow" },
  { title: "Content Engine", desc: "Build a repeatable content pipeline with Creative Studio.", steps: 7, minutes: 40, tone: "bg-orange-brand/12 text-orange-brand", icon: "pen" },
  { title: "Prove ROI", desc: "Wire up attribution and ship your first stakeholder report.", steps: 5, minutes: 30, tone: "bg-royal-blue/12 text-royal-blue", icon: "chart" },
];

export const GUIDES = [
  { title: "Connect your first data source", track: "Launch Amplivanta", minutes: 6, level: "Beginner" },
  { title: "Invite your team and assign roles", track: "Launch Amplivanta", minutes: 5, level: "Beginner" },
  { title: "Build a lead-capture form that converts", track: "First Automation", minutes: 9, level: "Beginner" },
  { title: "Design a 5-step nurture workflow", track: "First Automation", minutes: 12, level: "Intermediate" },
  { title: "Set up your Brand Kit", track: "Content Engine", minutes: 7, level: "Beginner" },
  { title: "Plan a month of content in one sitting", track: "Content Engine", minutes: 11, level: "Intermediate" },
  { title: "Choose the right attribution model", track: "Prove ROI", minutes: 10, level: "Advanced" },
  { title: "Schedule a recurring stakeholder report", track: "Prove ROI", minutes: 6, level: "Intermediate" },
];
