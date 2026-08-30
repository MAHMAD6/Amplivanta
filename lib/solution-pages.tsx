import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Compass,
  DollarSign,
  FileText,
  Filter,
  Gauge,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  LineChart,
  Mail,
  MessageSquare,
  Palette,
  PenLine,
  PieChart,
  Rocket,
  Search,
  Send,
  Share2,
  ShoppingCart,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  UploadCloud,
  UserCheck,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import type { SolutionPageProps } from "@/components/amplivanta/solution-page";
import { PreviewPanel } from "@/components/amplivanta/solution-page";

/* Step medallion tones, in the order used across every chain in the approved designs. */
const TONE = [
  "bg-[#6D3BF5]",
  "bg-[#1D3E86]",
  "bg-[#1D5FD6]",
  "bg-[#0F9D77]",
  "bg-[#F5731A]",
  "bg-[#E5A800]",
];

/* ------------------------------------------------------------------ previews */

function StatRow({ items }: { items: { label: string; value: string; delta?: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl border border-line p-3">
          <div className="text-[10.5px] text-ink-muted">{s.label}</div>
          <div className="mt-1 text-[18px] font-extrabold text-deep-navy">{s.value}</div>
          {s.delta && <div className="text-[10.5px] font-semibold text-emerald-600">▲ {s.delta}</div>}
        </div>
      ))}
    </div>
  );
}

function Sparkline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 70" className={`h-16 w-full ${className}`} aria-hidden>
      <path
        d="M0,58 C30,52 55,60 80,44 C105,30 125,48 150,36 C178,22 200,32 225,20 C250,10 275,16 300,6"
        fill="none"
        stroke="#1D5FD6"
        strokeWidth="2"
      />
    </svg>
  );
}

function PipelinePreview() {
  const stages = [
    { name: "New Lead", deals: "28 deals", value: "$72,600" },
    { name: "Qualified", deals: "18 deals", value: "$98,400" },
    { name: "Proposal", deals: "12 deals", value: "$125,300" },
    { name: "Negotiation", deals: "7 deals", value: "$86,200" },
    { name: "Won", deals: "15 deals", value: "$210,400" },
  ];
  return (
    <PreviewPanel title="Deals Pipeline" action={<span className="rounded-lg border border-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft">This Month</span>}>
      <div className="grid gap-2 sm:grid-cols-5">
        {stages.map((s) => (
          <div key={s.name} className="rounded-xl border border-line p-2.5">
            <div className="text-[11px] font-bold text-deep-navy">{s.name}</div>
            <div className="text-[10px] text-ink-muted">{s.deals}</div>
            <div className="text-[11px] font-semibold text-ink-soft">{s.value}</div>
            <div className="mt-2 rounded-lg border border-line bg-bg-soft p-2">
              <div className="text-[10.5px] font-semibold text-deep-navy">BrightWave Inc.</div>
              <div className="text-[10px] text-ink-muted">$12,000</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <StatRow
          items={[
            { label: "Won Deals (This Month)", value: "$87,420", delta: "18.2%" },
            { label: "Active Deals", value: "62", delta: "12.5%" },
            { label: "Avg. Deal Value", value: "$14,910", delta: "8.7%" },
            { label: "Win Rate", value: "34%", delta: "4.1%" },
          ]}
        />
      </div>
    </PreviewPanel>
  );
}

function JourneyPreview() {
  const nodes = [
    { icon: UserCheck, title: "New Lead Captured", sub: "Form submission" },
    { icon: Mail, title: "Send Welcome Email", sub: "Thanks for joining!" },
    { icon: Clock, title: "Wait 2 Days", sub: "Delay step" },
    { icon: Target, title: "Apply Tag: Interested", sub: "Segment update" },
    { icon: Send, title: "Send Follow-up Email", sub: "Check out our resources" },
    { icon: Bell, title: "Notify Sales Team", sub: "New hot lead" },
  ];
  return (
    <PreviewPanel title="Journey Builder">
      <div className="space-y-2">
        {nodes.map((n) => (
          <div key={n.title} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal-tint text-royal-blue">
              <n.icon className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[12px] font-semibold text-deep-navy">{n.title}</div>
              <div className="text-[10.5px] text-ink-muted">{n.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <StatRow
          items={[
            { label: "Active Workflows", value: "24", delta: "20.4%" },
            { label: "Emails Sent", value: "128,540", delta: "18.6%" },
            { label: "Open Rate", value: "42.6%", delta: "6.3%" },
            { label: "Conversions", value: "3,245", delta: "15.2%" },
          ]}
        />
      </div>
    </PreviewPanel>
  );
}

function SocialPreview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PreviewPanel title="Content Calendar" badge="Week">
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-ink-muted">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className={`h-6 rounded ${[2, 5, 9, 13, 16, 19].includes(i) ? "bg-royal-blue/25" : "bg-bg-soft"}`}
            />
          ))}
        </div>
      </PreviewPanel>
      <PreviewPanel title="Create Post" badge="Draft">
        <p className="rounded-xl border border-line bg-bg-soft p-3 text-[11.5px] leading-relaxed text-ink-soft">
          Excited to share our latest update! 🚀 Check out what&apos;s new and how it can help your
          business grow.
        </p>
        <button className="mt-3 w-full rounded-lg bg-royal-blue py-2 text-[12px] font-semibold text-white">
          Schedule
        </button>
      </PreviewPanel>
      <div className="sm:col-span-2">
        <PreviewPanel title="Engagement Overview" badge="This Month">
          <div className="text-[22px] font-extrabold text-deep-navy">
            28,540 <span className="text-[12px] font-semibold text-emerald-600">▲ 18.2%</span>
          </div>
          <Sparkline />
          <StatRow
            items={[
              { label: "Likes", value: "8,420" },
              { label: "Comments", value: "2,136" },
              { label: "Shares", value: "1,842" },
              { label: "Clicks", value: "6,452" },
            ]}
          />
        </PreviewPanel>
      </div>
    </div>
  );
}

function CreativePreview() {
  const assets = [
    { tag: "TEMPLATE", name: "Instagram Post", size: "1080x1080" },
    { tag: "AI", name: "Facebook Ad", size: "1200x628" },
    { tag: "AI", name: "Product Banner", size: "1200x628" },
    { tag: "AI", name: "Promo Video", size: "1920x1080" },
    { tag: "TEMPLATE", name: "LinkedIn Post", size: "1200x1200" },
    { tag: "AI", name: "Presentation Cover", size: "1920x1080" },
  ];
  return (
    <PreviewPanel
      title="Creative Workspace"
      action={
        <span className="rounded-lg bg-deep-navy px-2.5 py-1 text-[11px] font-semibold text-white">
          + Create New
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {assets.map((a) => (
          <div key={a.name} className="overflow-hidden rounded-xl border border-line">
            <div className="relative h-20 bg-gradient-to-br from-royal-tint to-violet/15">
              <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[8.5px] font-bold text-deep-navy">
                {a.tag}
              </span>
            </div>
            <div className="p-2">
              <div className="text-[11px] font-semibold text-deep-navy">{a.name}</div>
              <div className="text-[10px] text-ink-muted">{a.size}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-16 items-center justify-center rounded-xl border border-dashed border-line text-[11.5px] text-ink-muted">
        <UploadCloud className="mr-2 h-4 w-4" /> Upload or drag &amp; drop
      </div>
    </PreviewPanel>
  );
}

function IntelligencePreview() {
  return (
    <PreviewPanel
      title="Growth Intelligence Overview"
      action={<span className="rounded-lg border border-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft">Last 30 days</span>}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line p-3">
          <div className="text-[10.5px] text-ink-muted">Growth Score</div>
          <div className="mt-1 text-[26px] font-extrabold text-deep-navy">86</div>
          <div className="text-[11px] font-semibold text-emerald-600">Excellent · ▲ 16% vs 30 days ago</div>
        </div>
        <div className="rounded-xl border border-line p-3">
          <div className="text-[10.5px] text-ink-muted">Total Opportunities</div>
          <div className="mt-1 text-[26px] font-extrabold text-deep-navy">24</div>
          <div className="text-[11px] font-semibold text-royal-blue">High Impact · ▲ 4 vs last 30 days</div>
        </div>
        <div className="rounded-xl border border-line p-3">
          <div className="text-[10.5px] text-ink-muted">Financial Impact</div>
          <div className="mt-1 text-[26px] font-extrabold text-deep-navy">$2.48M</div>
          <div className="text-[11px] font-semibold text-emerald-600">▲ 18.7% vs last 30 days</div>
        </div>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-line p-3">
          <div className="text-[11.5px] font-bold text-deep-navy">Opportunity Impact Matrix</div>
          <svg viewBox="0 0 260 130" className="mt-2 h-32 w-full" aria-hidden>
            <line x1="20" y1="115" x2="250" y2="115" stroke="#e9e7f0" />
            <line x1="20" y1="8" x2="20" y2="115" stroke="#e9e7f0" />
            {[
              [70, 40, "#F5731A"],
              [120, 24, "#E5A800"],
              [190, 34, "#0F9D77"],
              [95, 74, "#1D5FD6"],
              [155, 82, "#6D3BF5"],
              [60, 96, "#E8398F"],
            ].map(([cx, cy, fill], i) => (
              <circle key={i} cx={cx as number} cy={cy as number} r="7" fill={fill as string} />
            ))}
          </svg>
        </div>
        <div className="rounded-xl border border-line p-3">
          <div className="text-[11.5px] font-bold text-deep-navy">Top Opportunity</div>
          <div className="mt-1 text-[12px] text-ink-soft">Abandoned Cart Recovery</div>
          <div className="mt-2 text-[10.5px] text-ink-muted">Potential Revenue</div>
          <div className="text-[20px] font-extrabold text-deep-navy">$412K</div>
          <div className="mt-2 text-[10.5px] text-ink-muted">Confidence</div>
          <div className="text-[16px] font-extrabold text-emerald-600">92%</div>
        </div>
      </div>
    </PreviewPanel>
  );
}

function AnalyticsPreview() {
  return (
    <PreviewPanel
      title="Performance Overview"
      action={<span className="rounded-lg border border-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft">Last 30 days</span>}
    >
      <StatRow
        items={[
          { label: "Sessions", value: "184,320", delta: "12.4%" },
          { label: "Conversions", value: "6,148", delta: "9.8%" },
          { label: "Revenue", value: "$482K", delta: "16.1%" },
          { label: "ROAS", value: "4.2×", delta: "6.5%" },
        ]}
      />
      <div className="mt-3 rounded-xl border border-line p-3">
        <div className="text-[11.5px] font-bold text-deep-navy">Revenue trend</div>
        <Sparkline />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line p-3">
          <div className="text-[11.5px] font-bold text-deep-navy">Channel mix</div>
          {[
            ["Organic", 42],
            ["Paid", 27],
            ["Email", 18],
            ["Social", 13],
          ].map(([label, pct]) => (
            <div key={label as string} className="mt-2">
              <div className="flex justify-between text-[10.5px] text-ink-soft">
                <span>{label}</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                <div className="h-full rounded-full bg-royal-blue" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-line p-3">
          <div className="text-[11.5px] font-bold text-deep-navy">Attribution</div>
          <div className="mt-2 text-[10.5px] text-ink-muted">Model</div>
          <div className="text-[12.5px] font-semibold text-deep-navy">Data-driven</div>
          <div className="mt-3 text-[10.5px] text-ink-muted">Attributed revenue</div>
          <div className="text-[20px] font-extrabold text-deep-navy">$412,880</div>
        </div>
      </div>
    </PreviewPanel>
  );
}

/* ------------------------------------------------------------------- pages */

export const SOLUTION_DETAIL_PAGES: Record<string, SolutionPageProps> = {
  "growth-intelligence": {
    name: "Growth Intelligence",
    headline: (
      <>
        Discover Your Next
        <br />
        Growth Opportunity.
      </>
    ),
    subtitle:
      "Amplivanta turns fragmented data into prioritized growth opportunities, recommended actions, and measurable business impact.",
    primaryCta: { label: "Start Your Growth Audit", href: "/app/growth-audit" },
    secondaryCta: { label: "See How It Works", href: "/platform" },
    preview: <IntelligencePreview />,
    pills: [
      { title: "AI-Powered Intelligence", desc: "Learn and adapt to your business.", icon: Brain },
      { title: "Data Connected", desc: "Unify all your data sources in one place.", icon: Layers },
      { title: "Outcome Focused", desc: "Prioritize actions that deliver results.", icon: Rocket },
    ],
    chainTitle: "Impact",
    chainSubtitle:
      "Our AI engine continuously analyzes your data, identifies what's driving growth back, recommends the next best actions, and measures what changes.",
    chain: [
      { title: "Diagnose", desc: "Analyze performance across all channels, segments and touchpoints.", icon: Search, tone: TONE[1] },
      { title: "Prioritize", desc: "Score opportunities by impact, ease and confidence.", icon: Sparkles, tone: TONE[0] },
      { title: "Recommend", desc: "AI delivers actionable next steps with clear rationale.", icon: LineChart, tone: TONE[3] },
      { title: "Execute", desc: "Send actions to the right workflows and channels in one click.", icon: Rocket, tone: TONE[4] },
      { title: "Measure", desc: "Track impact, learn continuously, and refine recommendations.", icon: BarChart3, tone: TONE[2] },
    ],
    featuresTitle: "Intelligence That Drives Action",
    features: [
      { title: "Unified Data View", desc: "Connect all your data sources in one place with live AI insights.", icon: Layers },
      { title: "Opportunity Scoring", desc: "AI scores opportunities by impact, confidence, effort and urgency.", icon: Target },
      { title: "Smart Recommendations", desc: "Get specific, actionable next steps tailored to your business.", icon: Sparkles },
      { title: "Impact Forecasting", desc: "See predicted revenue and performance before you act.", icon: TrendingUp },
      { title: "Benchmarking", desc: "Compare performance against your industry and best performers.", icon: Gauge },
      { title: "Real-time Alerts", desc: "Get notified about new opportunities and at-risk performance.", icon: Bell },
    ],
    howItWorks: [
      { title: "Connect your data", desc: "Link analytics, ads, CRM and commerce in a few clicks.", icon: Layers },
      { title: "Review opportunities", desc: "See ranked opportunities with impact and confidence.", icon: Compass },
      { title: "Act and measure", desc: "Push actions downstream and track what changed.", icon: Activity },
    ],
    teams: [
      { title: "Marketing Teams", desc: "Find the next growth lever, fast.", icon: Users },
      { title: "Founders", desc: "See the whole business in one score.", icon: Building2 },
      { title: "Agencies", desc: "Prove impact across every client.", icon: Store },
      { title: "Growth Teams", desc: "Turn analysis into shipped experiments.", icon: Rocket },
    ],
    outcomesTitle: "Real Intelligence. Real Business Impact.",
    outcomesBlurb: "See how teams use Growth Intelligence to drive measurable results.",
    outcomes: [
      { title: "Grow Revenue", desc: "Improve ROAS and conversion rate through AI-prioritized campaigns.", icon: DollarSign },
      { title: "Build Pipeline", desc: "Identify and act on high-impact opportunities across the journey.", icon: TrendingUp },
      { title: "Lift Conversion", desc: "Personalize nurture flows to improve lead-to-booking conversion.", icon: Target },
    ],
    ctaTitle: "Ready to Unlock Your Next Growth Opportunity?",
    ctaBlurb: "Start your Growth Audit and discover what's limiting your growth and how to fix it.",
  },

  "crm-pipeline": {
    name: "CRM & Pipeline",
    headline: (
      <>
        Build Stronger
        <br />
        Relationships.
        <br />
        Close Smarter Deals.
      </>
    ),
    subtitle:
      "Turn leads into customers with one connected view of contacts, conversations, pipelines and next actions.",
    secondaryCta: { label: "See CRM in Action", href: "/demo" },
    preview: <PipelinePreview />,
    pills: [
      { title: "Centralize Contacts", desc: "All your contacts, companies and conversations in one place.", icon: Users },
      { title: "Manage Sales Pipelines", desc: "Visualize every stage of your pipeline and move deals forward.", icon: Filter },
      { title: "Strengthen Relationships", desc: "Deliver personalized experiences that build long-term loyalty.", icon: UserCheck },
    ],
    chainTitle: "Revenue",
    chainSubtitle:
      "Growth Intelligence identifies the opportunity. CRM & Pipeline helps your team act on it.",
    chain: [
      { title: "Opportunity Detected", desc: "AI analyzes your data and identifies high-impact growth opportunities.", icon: Target, tone: TONE[0] },
      { title: "Lead Scored & Prioritized", desc: "Leads are scored and prioritized based on potential impact.", icon: UserCheck, tone: TONE[1] },
      { title: "Assigned to Pipeline", desc: "Opportunities are added to the right pipeline at the right stage.", icon: Layers, tone: TONE[2] },
      { title: "Recommended Next Action", desc: "Get AI-recommended actions to move the deal forward.", icon: CheckCircle2, tone: TONE[3] },
      { title: "Follow-up Automated", desc: "Automate emails, tasks and reminders so nothing falls through.", icon: Mail, tone: TONE[4] },
      { title: "Deal Closed", desc: "Close more deals, drive revenue and measure impact.", icon: DollarSign, tone: TONE[5] },
    ],
    featuresTitle: "Everything You Need to Manage and Grow Relationships",
    features: [
      { title: "Contact Management", desc: "Organize contacts and companies with rich profiles and history.", icon: Users },
      { title: "Deal Pipeline", desc: "Track deals across custom pipelines and close more, faster.", icon: Filter },
      { title: "Activity Tracking", desc: "Log calls, emails, meetings and notes to keep every conversation in context.", icon: Activity },
      { title: "Lead Scoring", desc: "Score leads automatically and focus on the highest potential opportunities.", icon: Target },
      { title: "Tasks & Reminders", desc: "Stay on top of follow-ups with smart tasks and notifications.", icon: ClipboardList },
      { title: "Analytics & Reporting", desc: "Get real-time insights on pipelines, performance and revenue.", icon: BarChart3 },
    ],
    howItWorks: [
      { title: "Capture Customer Data", desc: "Collect leads, contacts and interactions from every source.", icon: UploadCloud },
      { title: "Organize & Prioritize", desc: "Segment, score and move leads through your sales pipeline.", icon: Filter },
      { title: "Follow Up & Close", desc: "Engage at the right time and close more deals consistently.", icon: CheckCircle2 },
    ],
    teams: [
      { title: "Sales Teams", desc: "Close more deals with less effort.", icon: TrendingUp },
      { title: "Founders", desc: "See customers, conversations and revenue in one place.", icon: Building2 },
      { title: "Agencies", desc: "Manage multiple client pipelines efficiently.", icon: Store },
      { title: "Growth Teams", desc: "Connect marketing activity to pipeline outcomes.", icon: Rocket },
    ],
    outcomesTitle: "Drive Revenue. Measure Impact.",
    outcomesBlurb:
      "Amplivanta CRM helps you focus on what matters — building relationships that grow your business.",
    outcomes: [
      { title: "Higher Win Rate", desc: "Close more deals with better visibility and smarter follow-ups.", icon: TrendingUp },
      { title: "Shorter Sales Cycle", desc: "Move deals forward faster with the right actions at every stage.", icon: Clock },
      { title: "Stronger Customer Relationships", desc: "Deliver personalized experiences that drive loyalty and repeat business.", icon: DollarSign },
    ],
    ctaTitle: "Ready to Build Stronger Relationships and Close Smarter Deals?",
    ctaBlurb:
      "Connect your customer data, prioritize the right opportunities and move more deals toward revenue.",
  },

  "marketing-automation": {
    name: "Marketing Automation",
    headline: (
      <>
        Automate every step.
        <br />
        Nurture every opportunity.
      </>
    ),
    subtitle:
      "Build powerful workflows that attract, engage, and convert — so you can focus on growth, not busywork.",
    secondaryCta: { label: "See Automation in Action", href: "/demo" },
    preview: <JourneyPreview />,
    pills: [
      { title: "Save Time", desc: "Automate repetitive tasks and streamline your marketing operations.", icon: Clock },
      { title: "Increase Conversions", desc: "Deliver the right message to the right person at the right time.", icon: TrendingUp },
      { title: "Drive Growth", desc: "Turn leads into loyal customers with data-driven nurturing.", icon: Users },
    ],
    chainTitle: "Automated Growth",
    chainSubtitle: "Growth Intelligence finds the opportunity. Marketing Automation turns it into results.",
    chain: [
      { title: "Opportunity Detected", desc: "AI identifies high-impact growth opportunities and audiences.", icon: Target, tone: TONE[1] },
      { title: "Audience Identified", desc: "We analyze data to find the right people most likely to engage.", icon: Users, tone: TONE[1] },
      { title: "Journey Recommended", desc: "AI recommends the best journey, content and timing.", icon: Workflow, tone: TONE[2] },
      { title: "Campaign Activated", desc: "Launch automated workflows across the right channels.", icon: Zap, tone: TONE[2] },
      { title: "Lead Nurtured", desc: "Engage leads with relevant content until they're ready to take action.", icon: Mail, tone: TONE[4] },
      { title: "Conversion Measured", desc: "Track performance and feed insights back to Growth Intelligence.", icon: BarChart3, tone: TONE[5] },
    ],
    featuresTitle: "Everything you need to automate and grow",
    features: [
      { title: "Email Automation", desc: "Create personalized email sequences that engage and convert.", icon: Mail },
      { title: "Workflow Builder", desc: "Visualize and automate complex journeys with our intuitive drag-and-drop builder.", icon: Workflow },
      { title: "Lead Management", desc: "Capture, score and segment leads to deliver the right message at the right time.", icon: UserCheck },
      { title: "Landing Pages & Forms", desc: "Build high-converting pages and forms without code.", icon: FileText },
      { title: "Analytics & Reports", desc: "Track performance and prove ROI with detailed insights.", icon: BarChart3 },
      { title: "Integrations", desc: "Connect with the apps and tools you already use.", icon: Layers },
    ],
    howItWorks: [
      { title: "Capture & Segment", desc: "Collect leads and segment your audience for targeted communications.", icon: Users },
      { title: "Automate the Journey", desc: "Build and activate workflows that nurture leads and move them forward.", icon: Workflow },
      { title: "Measure & Optimize", desc: "Analyze results, optimize performance, and scale what works.", icon: Target },
    ],
    teams: [
      { title: "Marketing Teams", desc: "Run smarter campaigns and nurture more leads.", icon: Users },
      { title: "Sales Teams", desc: "Receive better qualified leads ready to close.", icon: TrendingUp },
      { title: "Founders", desc: "Drive growth without getting buried in tasks.", icon: Building2 },
      { title: "Agencies", desc: "Deliver more value with automation at scale.", icon: Store },
    ],
    outcomesTitle: "Drive smarter campaigns. Measure real impact.",
    outcomesBlurb:
      "Amplivanta Marketing Automation helps you build meaningful connections that turn into measurable growth.",
    outcomes: [
      { title: "Higher Engagement", desc: "Deliver relevant messages that resonate and get more responses.", icon: TrendingUp },
      { title: "Shorter Sales Cycle", desc: "Nurture leads efficiently and move them toward conversion faster.", icon: Clock },
      { title: "Stronger ROI", desc: "Optimize every campaign and workflow for maximum return on investment.", icon: DollarSign },
    ],
    ctaTitle: "Ready to automate your growth?",
    ctaBlurb: "Join thousands of businesses using Amplivanta to scale smarter and faster.",
  },

  "social-publishing": {
    name: "Social Publishing",
    headline: (
      <>
        Publish Smarter.
        <br />
        Engage Everywhere.
      </>
    ),
    subtitle:
      "Plan, create, schedule, approve, publish, and analyze social content across all your channels from one connected platform.",
    secondaryCta: { label: "See Social Publishing in Action", href: "/demo" },
    preview: <SocialPreview />,
    pills: [
      { title: "Plan Content", desc: "Organize campaigns and content with an intuitive calendar and queue.", icon: Calendar },
      { title: "Publish Everywhere", desc: "Publish to multiple social channels from one platform.", icon: Send },
      { title: "Measure Engagement", desc: "Track performance and gain insights to optimize your content.", icon: BarChart3 },
    ],
    chainTitle: "Social Growth",
    chainSubtitle: "Social Publishing turns content opportunities into measurable engagement.",
    chain: [
      { title: "Opportunity Detected", desc: "AI identifies topics your audience cares about.", icon: Search, tone: TONE[1] },
      { title: "Audience Identified", desc: "Understand who it's for and where to engage.", icon: Users, tone: TONE[1] },
      { title: "Content Recommended", desc: "Get AI-powered ideas and content suggestions.", icon: Sparkles, tone: TONE[0] },
      { title: "Post Created", desc: "Craft compelling posts with our composer and media tools.", icon: PenLine, tone: TONE[2] },
      { title: "Published Across Channels", desc: "Schedule and publish to all your social channels.", icon: Send, tone: TONE[2] },
      { title: "Performance Measured", desc: "Analyze results and optimize for better engagement.", icon: BarChart3, tone: TONE[3] },
    ],
    featuresTitle: "Everything You Need to Manage Social Publishing",
    features: [
      { title: "Content Calendar", desc: "Visualize your content schedule with drag-and-drop calendar and campaign views.", icon: Calendar },
      { title: "Post Composer", desc: "Create engaging posts with media, templates, snippets and AI suggestions.", icon: PenLine },
      { title: "Scheduling Queue", desc: "Schedule posts in advance and manage your queue effortlessly.", icon: Clock },
      { title: "Approval Workflow", desc: "Streamline reviews and approvals with custom workflows and roles.", icon: CheckCircle2 },
      { title: "Multi-channel Publishing", desc: "Publish to multiple social networks from one unified platform.", icon: Share2 },
      { title: "Social Analytics", desc: "Track performance, audience growth and engagement across all channels.", icon: BarChart3 },
    ],
    howItWorks: [
      { title: "Create and Plan", desc: "Create content with our composer and plan it in your content calendar.", icon: PenLine },
      { title: "Schedule and Publish", desc: "Schedule posts and publish across all your social channels.", icon: Calendar },
      { title: "Analyze and Optimize", desc: "Monitor performance, engage with your audience, and improve results.", icon: BarChart3 },
    ],
    teams: [
      { title: "Marketing Teams", desc: "Plan aligned content that drives engagement and brand awareness.", icon: Users },
      { title: "Agencies", desc: "Manage multiple clients and campaigns at scale with ease.", icon: Store },
      { title: "E-commerce Brands", desc: "Promote products and boost conversions across social channels.", icon: ShoppingCart },
      { title: "Startups", desc: "Build brand presence and grow your audience from day one.", icon: Rocket },
    ],
    outcomesTitle: "Drive More Reach. Measure Real Impact.",
    outcomes: [
      { title: "Stronger Engagement", desc: "Deliver relevant content that resonates with your audience.", icon: MessageSquare },
      { title: "Faster Publishing", desc: "Save time with AI assistance, templates and streamlined workflows.", icon: Zap },
      { title: "More Efficient Growth", desc: "Make smarter content decisions with analytics and insights.", icon: TrendingUp },
    ],
    ctaTitle: "Ready to Publish Smarter and Engage Everywhere?",
    ctaBlurb:
      "Plan, publish, and grow your social presence from one powerful platform built for modern growth teams.",
  },

  "creative-studio": {
    name: "Creative Studio",
    headline: (
      <>
        Create Faster.
        <br />
        Stay On Brand.
        <br />
        Scale Content Production.
      </>
    ),
    subtitle:
      "Design social visuals, campaign assets, ad creatives, videos, and branded content faster with AI-powered tools, templates, and collaboration — all in one connected workspace.",
    secondaryCta: { label: "Watch Demo", href: "/demo" },
    preview: <CreativePreview />,
    pills: [
      { title: "AI-Powered", desc: "Create on-brand content in seconds.", icon: Sparkles },
      { title: "On-Brand", desc: "Use templates and brand kit to stay consistent.", icon: Palette },
      { title: "Team Collaboration", desc: "Review, comment, and approve with ease.", icon: Users },
    ],
    chainTitle: "Creative Output",
    chainSubtitle:
      "Growth Intelligence spots the content gap. Creative Studio produces the on-brand asset that fills it.",
    chain: [
      { title: "Opportunity Detected", desc: "AI finds the content gap worth filling.", icon: Search, tone: TONE[1] },
      { title: "Content Need Identified", desc: "The right format and channel are chosen.", icon: LayoutTemplate, tone: TONE[0] },
      { title: "Creative Direction Recommended", desc: "AI proposes direction locked to your brand kit.", icon: Compass, tone: TONE[2] },
      { title: "Asset Created", desc: "Generate images, video, docs and graphics in minutes.", icon: ImageIcon, tone: TONE[3] },
      { title: "Reviewed & Approved", desc: "Route through comment and approval workflows.", icon: CheckCircle2, tone: TONE[4] },
      { title: "Published Across Channels", desc: "Export in the right size for every channel.", icon: Send, tone: TONE[0] },
    ],
    featuresTitle: "Everything you need to create and scale",
    features: [
      { title: "AI Content Generator", desc: "Generate on-brand images, graphics, and copy in seconds.", icon: Sparkles },
      { title: "Template Library", desc: "Access a growing library of professional templates for any campaign.", icon: LayoutTemplate },
      { title: "Brand Kit", desc: "Manage logos, colors, fonts, and brand assets in one place.", icon: Palette },
      { title: "Asset Library", desc: "Organize, tag, and find all your assets in one central library.", icon: Layers },
      { title: "Collaboration & Approval", desc: "Comment, review, and approve with role-based workflows.", icon: Users },
      { title: "Bulk Creation & Export", desc: "Create variations and export in all sizes for every channel.", icon: UploadCloud },
    ],
    howItWorks: [
      { title: "Create", desc: "Use AI tools, templates, or start from scratch.", icon: Sparkles },
      { title: "Collaborate", desc: "Review, comment, and approve with your team.", icon: Users },
      { title: "Export & Publish", desc: "Download in any format and publish everywhere.", icon: Send },
    ],
    teams: [
      { title: "Marketing Teams", desc: "Create campaigns faster and maintain brand consistency.", icon: Users },
      { title: "Agencies", desc: "Deliver more creative at scale for your clients.", icon: Store },
      { title: "E-commerce Brands", desc: "Design high-converting ads and social content that drives sales.", icon: ShoppingCart },
      { title: "Startups", desc: "Move fast with professional content that scales.", icon: Rocket },
    ],
    outcomesTitle: "Create better content. Move faster.",
    outcomes: [
      { title: "Stronger Brand Consistency", desc: "Keep your brand consistent across every channel.", icon: Palette },
      { title: "Faster Production", desc: "Reduce turnaround time and increase output.", icon: Zap },
      { title: "Better Team Collaboration", desc: "Align teams and approvals in one smooth workflow.", icon: Users },
    ],
    ctaTitle: "Ready to create better content, faster?",
    ctaBlurb: "Create, collaborate, and scale on-brand content from one connected workspace.",
  },

  "analytics-reports": {
    name: "Analytics & Reports",
    headline: (
      <>
        Measure What Matters.
        <br />
        Prove Real Impact.
      </>
    ),
    subtitle:
      "Traffic, campaigns, funnels and revenue attribution — reconciled from every source into one date range you can trust.",
    secondaryCta: { label: "See Analytics in Action", href: "/demo" },
    preview: <AnalyticsPreview />,
    pills: [
      { title: "One Source of Truth", desc: "Every metric reconciled across channels and modules.", icon: Layers },
      { title: "Attribution Built In", desc: "Multi-touch models that tie spend to revenue.", icon: PieChart },
      { title: "Share Anywhere", desc: "Scheduled reports and exports for every stakeholder.", icon: FileText },
    ],
    chainTitle: "Proven Impact",
    chainSubtitle: "Growth Intelligence recommends the action. Analytics & Reports proves what it earned.",
    chain: [
      { title: "Events Collected", desc: "Sessions, campaigns and revenue events land in one warehouse.", icon: Activity, tone: TONE[1] },
      { title: "Sources Reconciled", desc: "Channels, campaigns and currencies normalized consistently.", icon: Layers, tone: TONE[1] },
      { title: "Funnel Mapped", desc: "See where visitors drop off at every stage.", icon: Filter, tone: TONE[2] },
      { title: "Attribution Applied", desc: "Multi-touch models assign revenue to real touchpoints.", icon: PieChart, tone: TONE[3] },
      { title: "Insights Surfaced", desc: "AI highlights the movement worth acting on.", icon: Sparkles, tone: TONE[4] },
      { title: "Reports Shared", desc: "Scheduled, exportable reporting for every stakeholder.", icon: FileText, tone: TONE[5] },
    ],
    featuresTitle: "Everything You Need to Measure Growth",
    features: [
      { title: "Traffic Analytics", desc: "Sessions, sources, devices, geography and landing-page drilldowns.", icon: LineChart },
      { title: "Campaign Analytics", desc: "Cross-channel performance for reach, engagement, spend and revenue.", icon: BarChart3 },
      { title: "Conversion Funnel", desc: "Visualize drop-off and surface the highest-impact leaks.", icon: Filter },
      { title: "Revenue Attribution", desc: "Compare models and see assisted conversions and ROAS.", icon: PieChart },
      { title: "Custom Reports", desc: "Build, save and schedule the reports your team actually reads.", icon: FileText },
      { title: "Live Dashboards", desc: "One date range across every widget, always reconciled.", icon: Gauge },
    ],
    howItWorks: [
      { title: "Connect Sources", desc: "Link analytics, ads, CRM, email and commerce data.", icon: Layers },
      { title: "Choose a Model", desc: "Pick the attribution model that fits your business.", icon: PieChart },
      { title: "Share the Result", desc: "Export or schedule reports for stakeholders.", icon: FileText },
    ],
    teams: [
      { title: "Marketing Teams", desc: "Prove which channels actually earn revenue.", icon: Users },
      { title: "Founders", desc: "One number you can trust across the business.", icon: Building2 },
      { title: "Agencies", desc: "Client-ready reporting without spreadsheet work.", icon: Store },
      { title: "Growth Teams", desc: "Measure every experiment against real outcomes.", icon: Rocket },
    ],
    outcomesTitle: "Fewer Dashboards. Better Decisions.",
    outcomes: [
      { title: "Trusted Numbers", desc: "Totals reconcile across modules, so nobody argues with the report.", icon: CheckCircle2 },
      { title: "Faster Reporting", desc: "Scheduled reports replace the monthly spreadsheet scramble.", icon: Clock },
      { title: "Clearer ROI", desc: "Attribution ties spend to revenue you can defend.", icon: DollarSign },
    ],
    ctaTitle: "Ready to Measure What Actually Drives Growth?",
    ctaBlurb: "Connect your data once and get reporting your whole team can act on.",
  },
};

/** Convenience helper for nav/footer links and static params. */
export const SOLUTION_DETAIL_SLUGS = Object.keys(SOLUTION_DETAIL_PAGES);
