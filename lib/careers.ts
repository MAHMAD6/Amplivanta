export interface Job {
  slug: string;
  title: string;
  type: string;
  location: string;
  department: string;
  reportsTo: string;
  postedOn: string;
  summary: string;
  about: string;
  doList: string[];
  bringList: string[];
  niceList: string[];
  compensation: string;
}

export const JOBS: Job[] = [
  {
    slug: "marketing-strategist",
    title: "Marketing Strategist",
    type: "Part-time",
    location: "Remote (US)",
    department: "Marketing",
    reportsTo: "Head of Marketing",
    postedOn: "May 16, 2026",
    summary: "Help us engineer growth for ambitious brands. You'll shape strategies that drive real business impact.",
    about: "We're looking for a strategic marketer who loves turning data and insights into actionable growth plans. You'll lead go-to-market strategies, brand positioning, campaigns, and performance marketing to accelerate customer acquisition, engagement, and retention.",
    doList: ["Develop and execute Amplivanta's marketing strategy.", "Plan campaigns across digital, social, email, and content channels.", "Analyze market trends, competitors, customer behavior, and campaign data.", "Identify growth opportunities and improve customer acquisition.", "Create positioning and messaging aligned with the Amplivanta brand.", "Track KPIs, optimize campaigns, and report marketing performance.", "Collaborate with product, sales, and creative teams to drive growth."],
    bringList: ["3+ years of experience in marketing strategy, growth, or demand generation.", "Strong analytical skills with data-driven decision making.", "Experience with digital marketing channels, SEO/SEM, and content strategy.", "Excellent communication and project management skills.", "A growth mindset and passion for solving complex problems."],
    niceList: ["Experience in B2B SaaS or technology marketing.", "Familiarity with marketing automation and CRM platforms.", "Hands-on experience with analytics tools (GA4, Looker Studio, etc.)."],
    compensation: "Competitive compensation based on experience, plus a comprehensive benefits package. We invest in your growth and well-being.",
  },
  {
    slug: "senior-product-designer",
    title: "Senior Product Designer",
    type: "Full-time",
    location: "Remote (US)",
    department: "Design",
    reportsTo: "Head of Product",
    postedOn: "May 10, 2026",
    summary: "Design intuitive, beautiful experiences across the Amplivanta growth platform.",
    about: "We're seeking a senior product designer to own end-to-end design for core platform surfaces — from research and interaction design to polished, accessible UI that scales across the product.",
    doList: ["Own design for core platform features end to end.", "Partner with product and engineering from discovery to delivery.", "Build and maintain components in our design system.", "Run usability testing and translate insights into design.", "Champion accessibility and consistency across the product."],
    bringList: ["5+ years designing complex SaaS products.", "Strong systems thinking and a polished portfolio.", "Fluency in Figma and modern prototyping.", "Excellent collaboration and communication skills."],
    niceList: ["Experience with data-heavy dashboards and analytics UIs.", "Front-end familiarity (HTML/CSS/React).", "Motion / interaction design skills."],
    compensation: "Competitive compensation based on experience, plus a comprehensive benefits package. We invest in your growth and well-being.",
  },
  {
    slug: "backend-engineer",
    title: "Backend Engineer",
    type: "Full-time",
    location: "Remote (Global)",
    department: "Engineering",
    reportsTo: "Engineering Manager",
    postedOn: "May 4, 2026",
    summary: "Build the reliable, scalable services that power Amplivanta's growth engine.",
    about: "Join our engineering team to design and build the APIs, data pipelines, and automation infrastructure behind the platform. You'll work across services with a focus on reliability, performance, and developer experience.",
    doList: ["Design and build scalable backend services and APIs.", "Own reliability, performance, and observability of your services.", "Collaborate with product and frontend on end-to-end features.", "Write clean, well-tested, maintainable code."],
    bringList: ["4+ years building production backend systems.", "Strong TypeScript/Node.js or similar experience.", "Solid understanding of databases and distributed systems.", "A pragmatic, quality-focused engineering mindset."],
    niceList: ["Experience with Postgres, Prisma, and queue systems.", "Familiarity with marketing/automation domains.", "Cloud infrastructure experience."],
    compensation: "Competitive compensation based on experience, plus a comprehensive benefits package. We invest in your growth and well-being.",
  },
];
