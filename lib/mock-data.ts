import type { Service, Portfolio, BlogPost, Review, TeamMember } from "@/types";

const now = new Date();

export const MOCK_SERVICES: Service[] = [
  {
    id: "1",
    slug: "social-media-marketing",
    title: "Social Media Marketing",
    icon: "📱",
    description: "Grow your brand's reach on social platforms with targeted campaigns.",
    longDesc:
      "We craft data-driven social media strategies that build communities, spark engagement, and convert followers into customers. From content calendars to paid campaigns, we manage every touchpoint of your social presence.",
    features: [
      "Instagram Growth",
      "Facebook Ads",
      "LinkedIn Strategy",
      "Twitter/X Management",
      "Analytics & Reporting",
    ],
    image: null,
    order: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "2",
    slug: "content-writing",
    title: "Content Writing",
    icon: "✍️",
    description: "Compelling content that converts visitors into customers.",
    longDesc:
      "Words that work. Our writers produce SEO-optimized, on-brand content that ranks, resonates, and drives action across every stage of your funnel.",
    features: [
      "Blog Writing",
      "Copywriting",
      "Email Campaigns",
      "Website Copy",
      "Product Descriptions",
    ],
    image: null,
    order: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "3",
    slug: "seo",
    title: "SEO Optimization",
    icon: "🔍",
    description: "Rank higher on search engines and drive organic traffic.",
    longDesc:
      "We combine technical SEO, content strategy, and authoritative link building to push your site to the top of search results and keep it there.",
    features: [
      "Keyword Research",
      "On-Page SEO",
      "Link Building",
      "Technical SEO",
      "Local SEO",
    ],
    image: null,
    order: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "4",
    slug: "video-production",
    title: "Video Production",
    icon: "🎬",
    description: "Professional videos that tell your brand's story.",
    longDesc:
      "From concept to final cut, we produce scroll-stopping video content — brand films, social reels, and motion graphics that captivate your audience.",
    features: [
      "Brand Videos",
      "Social Reels",
      "Animation",
      "Testimonials",
      "Product Videos",
    ],
    image: null,
    order: 4,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "5",
    slug: "pay-per-click",
    title: "Pay Per Click",
    icon: "💰",
    description: "Maximize ROI with targeted PPC campaigns.",
    longDesc:
      "Every click counts. We build, optimize, and scale paid campaigns across Google and social networks to deliver measurable, profitable growth.",
    features: [
      "Google Ads",
      "Facebook Ads",
      "Retargeting",
      "Shopping Ads",
      "Display Network",
    ],
    image: null,
    order: 5,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "6",
    slug: "web-design",
    title: "Web Design",
    icon: "🎨",
    description: "Beautiful, high-converting websites built for your brand.",
    longDesc:
      "We design and build fast, responsive websites that look stunning and convert visitors into customers — from landing pages to full e-commerce experiences.",
    features: [
      "UI/UX Design",
      "Responsive Design",
      "Landing Pages",
      "E-commerce",
      "Maintenance",
    ],
    image: null,
    order: 6,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_PORTFOLIO: Portfolio[] = [
  {
    id: "1",
    slug: "brand-revamp-techcorp",
    title: "Brand Revamp for TechCorp",
    client: "TechCorp Inc.",
    description: "Complete social media overhaul that grew followers by 340%.",
    longDesc:
      "TechCorp came to us with a stale social presence. We rebuilt their content strategy from the ground up, launching a coordinated campaign across Instagram, LinkedIn, and X.",
    coverImage: null,
    images: [],
    tags: ["Social Media", "Branding"],
    results: [
      { metric: "Follower Growth", value: "340%" },
      { metric: "Engagement Rate", value: "8.2%" },
      { metric: "Leads Generated", value: "1.2k" },
    ],
    serviceId: "1",
    isFeatured: true,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "2",
    slug: "seo-surge-greenleaf",
    title: "SEO Surge for GreenLeaf",
    client: "GreenLeaf Organics",
    description: "Tripled organic traffic in six months through technical SEO.",
    longDesc:
      "A full technical audit, content overhaul, and link-building sprint took GreenLeaf from page three to the top of search for their key terms.",
    coverImage: null,
    images: [],
    tags: ["SEO", "Content"],
    results: [
      { metric: "Organic Traffic", value: "+310%" },
      { metric: "Keywords Top 3", value: "84" },
      { metric: "Domain Rating", value: "+22" },
    ],
    serviceId: "3",
    isFeatured: true,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "3",
    slug: "ppc-scale-urbanfit",
    title: "PPC Scale for UrbanFit",
    client: "UrbanFit Apparel",
    description: "5x return on ad spend with a rebuilt Google Ads account.",
    longDesc:
      "We restructured UrbanFit's ad account, tightened targeting, and layered in retargeting to drive a 5x ROAS during peak season.",
    coverImage: null,
    images: [],
    tags: ["PPC", "Social Media"],
    results: [
      { metric: "ROAS", value: "5.1x" },
      { metric: "CPA Reduction", value: "-42%" },
      { metric: "Revenue", value: "$1.4M" },
    ],
    serviceId: "5",
    isFeatured: true,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "4",
    slug: "website-relaunch-northstar",
    title: "Website Relaunch for NorthStar",
    client: "NorthStar Finance",
    description: "A blazing-fast redesign that doubled conversion rate.",
    longDesc:
      "We redesigned NorthStar's website with a focus on speed and clarity, doubling their lead conversion rate within eight weeks of launch.",
    coverImage: null,
    images: [],
    tags: ["Web Design", "Content"],
    results: [
      { metric: "Conversion Rate", value: "+112%" },
      { metric: "Page Speed", value: "0.9s" },
      { metric: "Bounce Rate", value: "-38%" },
    ],
    serviceId: "6",
    isFeatured: false,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "5",
    slug: "video-campaign-bloom",
    title: "Video Campaign for Bloom",
    client: "Bloom Cosmetics",
    description: "A viral reel series that reached 12M views.",
    longDesc:
      "Our creative team produced a series of short-form videos for Bloom's product launch, racking up 12 million organic views across platforms.",
    coverImage: null,
    images: [],
    tags: ["Video Production", "Social Media"],
    results: [
      { metric: "Total Views", value: "12M" },
      { metric: "Shares", value: "48k" },
      { metric: "Sales Lift", value: "+67%" },
    ],
    serviceId: "4",
    isFeatured: false,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "6",
    slug: "content-engine-stackly",
    title: "Content Engine for Stackly",
    client: "Stackly SaaS",
    description: "An always-on content machine driving inbound leads.",
    longDesc:
      "We built a repeatable content system for Stackly — pillar pages, newsletters, and case studies — that turned their blog into a lead-generation engine.",
    coverImage: null,
    images: [],
    tags: ["Content", "SEO"],
    results: [
      { metric: "Inbound Leads", value: "+230%" },
      { metric: "Newsletter Subs", value: "18k" },
      { metric: "Blog Traffic", value: "+180%" },
    ],
    serviceId: "2",
    isFeatured: false,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
];

const blogBody = `
<p>Digital marketing moves fast. The strategies that worked last year may already be losing steam, and the brands that win are the ones willing to test, learn, and adapt.</p>
<h2>Why strategy beats tactics</h2>
<p>It is tempting to chase the latest platform or format, but sustainable growth comes from a clear strategy anchored in your audience and goals.</p>
<blockquote>The best marketing does not feel like marketing.</blockquote>
<h3>Where to focus first</h3>
<ul>
  <li>Understand your audience deeply</li>
  <li>Pick channels that match your strengths</li>
  <li>Measure what actually matters</li>
</ul>
<p>Do these three things well and you will outperform competitors spreading themselves thin across every channel.</p>
`;

export const MOCK_BLOG: BlogPost[] = [
  {
    id: "1",
    slug: "digital-marketing-trends-2026",
    title: "Digital Marketing Trends to Watch in 2026",
    excerpt: "AI, short-form video, and privacy-first advertising are reshaping the game. Here's what to prioritize.",
    content: blogBody,
    coverImage: null,
    tags: ["Strategy", "Tools"],
    author: "Ava Mitchell",
    authorImage: null,
    isFeatured: true,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "2",
    slug: "seo-fundamentals-that-still-work",
    title: "SEO Fundamentals That Still Work",
    excerpt: "Algorithms change, but the fundamentals endure. A practical guide to ranking in a noisy world.",
    content: blogBody,
    coverImage: null,
    tags: ["SEO"],
    author: "Marcus Lee",
    authorImage: null,
    isFeatured: false,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "3",
    slug: "building-a-content-engine",
    title: "How to Build a Content Engine That Scales",
    excerpt: "Stop publishing randomly. Build a repeatable system that compounds over time.",
    content: blogBody,
    coverImage: null,
    tags: ["Content", "Strategy"],
    author: "Ava Mitchell",
    authorImage: null,
    isFeatured: false,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "4",
    slug: "social-media-that-converts",
    title: "Social Media That Actually Converts",
    excerpt: "Vanity metrics are easy. Revenue is hard. Here's how to make social pay off.",
    content: blogBody,
    coverImage: null,
    tags: ["Social Media"],
    author: "Priya Nair",
    authorImage: null,
    isFeatured: false,
    isPublished: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_REVIEWS: Review[] = [
  { id: "1", name: "Sarah Chen", company: "TechCorp", role: "CMO", content: "Amplivanta transformed our social presence. The results speak for themselves — engagement up, leads flowing.", rating: 5, avatar: null, isFeatured: true, isApproved: true, createdAt: now, updatedAt: now },
  { id: "2", name: "James Rivera", company: "GreenLeaf", role: "Founder", content: "Our organic traffic tripled in six months. Best marketing investment we have made.", rating: 5, avatar: null, isFeatured: true, isApproved: true, createdAt: now, updatedAt: now },
  { id: "3", name: "Emily Zhang", company: "UrbanFit", role: "Head of Growth", content: "5x ROAS during our biggest season. The team is sharp, responsive, and genuinely cares.", rating: 5, avatar: null, isFeatured: true, isApproved: true, createdAt: now, updatedAt: now },
  { id: "4", name: "David Okafor", company: "NorthStar", role: "CEO", content: "The new website doubled our conversion rate. Fast, clean, and exactly on brand.", rating: 5, avatar: null, isFeatured: false, isApproved: true, createdAt: now, updatedAt: now },
  { id: "5", name: "Laura Bianchi", company: "Bloom", role: "Marketing Lead", content: "12 million views on our launch campaign. Creative that actually moves product.", rating: 5, avatar: null, isFeatured: false, isApproved: true, createdAt: now, updatedAt: now },
  { id: "6", name: "Tom Fletcher", company: "Stackly", role: "VP Marketing", content: "They built us a content engine that keeps delivering leads month after month.", rating: 5, avatar: null, isFeatured: false, isApproved: true, createdAt: now, updatedAt: now },
  { id: "7", name: "Nadia Ali", company: "Vertex", role: "Director", content: "Professional, data-driven, and a pleasure to work with. Highly recommend.", rating: 4, avatar: null, isFeatured: false, isApproved: true, createdAt: now, updatedAt: now },
  { id: "8", name: "Chris Park", company: "Lumen", role: "COO", content: "Amplivanta feels like an extension of our own team. Results-obsessed in the best way.", rating: 5, avatar: null, isFeatured: false, isApproved: true, createdAt: now, updatedAt: now },
];

export const MOCK_TEAM: TeamMember[] = [
  { id: "1", name: "Ava Mitchell", role: "Founder & CEO", bio: "15 years building brands that people love. Obsessed with measurable growth.", image: null, linkedin: "https://linkedin.com", twitter: "https://twitter.com", order: 1, isActive: true },
  { id: "2", name: "Marcus Lee", role: "Head of SEO", bio: "Technical SEO wizard who has ranked hundreds of sites on page one.", image: null, linkedin: "https://linkedin.com", twitter: "https://twitter.com", order: 2, isActive: true },
  { id: "3", name: "Priya Nair", role: "Creative Director", bio: "Turns ideas into scroll-stopping visuals and stories.", image: null, linkedin: "https://linkedin.com", twitter: "https://twitter.com", order: 3, isActive: true },
  { id: "4", name: "Diego Santos", role: "Lead Developer", bio: "Builds fast, beautiful websites that convert.", image: null, linkedin: "https://linkedin.com", twitter: "https://twitter.com", order: 4, isActive: true },
];

export const FAQS = [
  { q: "How much does a project cost?", a: "Every engagement is scoped to your goals. Most clients invest between $1,000 and $25,000 per month depending on channels and ambition. We'll give you a clear quote after our first call." },
  { q: "How long until I see results?", a: "Paid channels can show results within weeks. SEO and content compound over 3-6 months. We set realistic milestones and report on them transparently." },
  { q: "Do you work with small businesses?", a: "Absolutely. We tailor strategies to your stage and budget, whether you're a startup or an established brand." },
  { q: "What industries do you serve?", a: "We've worked across SaaS, e-commerce, finance, health, and more. Great marketing principles translate across sectors." },
  { q: "Do I have to sign a long contract?", a: "No lengthy lock-ins. We work month-to-month after an initial ramp period, because we'd rather earn your business every month." },
  { q: "Who owns the content and accounts?", a: "You do. Everything we create and every ad account we build is yours to keep." },
];

export const HOME_FEATURES = [
  { title: "Smart Design System", description: "Consistent, conversion-focused design across every touchpoint of your brand." },
  { title: "Cutting-Edge SEO & Organic Growth", description: "Technical excellence and content strategy that keeps you ranking." },
  { title: "Lightning-Speed Performance", description: "Fast sites and faster campaigns that respect your audience's time." },
];

/* ------------------------------------------------------------------ */
/* Unsplash placeholder imagery                                        */
/* ------------------------------------------------------------------ */

function unsplash(id: string, w = 1200): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

// Curated, long-standing Unsplash photo IDs (marketing / office / people).
const SERVICE_IMAGES = [
  "1611926653458-09294b3142bf", // social media
  "1455390582262-044cdead277a", // writing
  "1432888622747-4eb9a8efeb07", // seo/analytics
  "1574717024653-61fd2cf4d44d", // video production
  "1533750349088-cd871a92f312", // ppc / ads
  "1467232004584-a241de8bcf5d", // web design
];

const PORTFOLIO_IMAGES = [
  "1460925895917-afdab827c52f", // analytics dashboard
  "1432888622747-4eb9a8efeb07", // seo
  "1533750349088-cd871a92f312", // ppc
  "1517245386807-bb43f82c33c4", // web relaunch
  "1574717024653-61fd2cf4d44d", // video
  "1455390582262-044cdead277a", // content
];

const BLOG_IMAGES = [
  "1557804506-669a67965ba0", // trends / team
  "1432888622747-4eb9a8efeb07", // seo
  "1455390582262-044cdead277a", // content engine
  "1611926653458-09294b3142bf", // social
];

const TEAM_IMAGES = [
  "1560250097-0b93528c311a", // exec portrait
  "1500648767791-00dcc994a43e", // man portrait
  "1494790108377-be9c29b29330", // woman portrait
  "1519085360753-af0119f7cbe7", // man portrait
];

MOCK_SERVICES.forEach((s, i) => {
  s.image = unsplash(SERVICE_IMAGES[i % SERVICE_IMAGES.length], 800);
});
MOCK_PORTFOLIO.forEach((p, i) => {
  p.coverImage = unsplash(PORTFOLIO_IMAGES[i % PORTFOLIO_IMAGES.length], 1200);
});
MOCK_BLOG.forEach((b, i) => {
  b.coverImage = unsplash(BLOG_IMAGES[i % BLOG_IMAGES.length], 1200);
});
MOCK_TEAM.forEach((t, i) => {
  t.image = unsplash(TEAM_IMAGES[i % TEAM_IMAGES.length], 600);
});
MOCK_REVIEWS.forEach((r, i) => {
  r.avatar = unsplash(TEAM_IMAGES[i % TEAM_IMAGES.length], 200);
});

// Imagery for static marketing sections (hero, about, CTA).
export const SITE_IMAGES = {
  hero: unsplash("1552664730-d307ca884978", 1000), // marketing team
  heroSecondary: unsplash("1522071820081-009f0129c71c", 800),
  aboutMain: unsplash("1600880292203-757bb62b4baf", 1000), // team collaboration
  aboutBanner: unsplash("1497215728101-856f4ea42174", 800), // modern office
  servicesShowcase: unsplash("1551434678-e076c223a692", 1000), // team working
};
