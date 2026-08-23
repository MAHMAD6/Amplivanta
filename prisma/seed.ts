import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  MOCK_SERVICES,
  MOCK_PORTFOLIO,
  MOCK_BLOG,
  MOCK_REVIEWS,
  MOCK_TEAM,
} from "../lib/mock-data";
import { CONTACTS, DEALS, ACTIVITIES, CRM_TASKS } from "../lib/crm-data";
import { CAMPAIGNS, WORKFLOWS } from "../lib/marketing-auto-data";
import { INTEGRATIONS } from "../lib/integrations-data";
import { COMPANIES } from "../lib/part2-data";

const db = new PrismaClient();

const slugByMockId: Record<string, string> = {
  "1": "social-media-marketing",
  "2": "content-writing",
  "3": "seo",
  "4": "video-production",
  "5": "pay-per-click",
  "6": "web-design",
};

/** Parse a display date like "Aug 5, 2026" into a Date, or null if unparseable. */
function parseDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const STAGE_BY_DISPLAY: Record<string, string> = {
  New: "New Lead",
  Qualified: "Qualified",
  Proposal: "Proposal",
  Negotiation: "Negotiation",
  Won: "Won",
};

const CAMPAIGN_STATUS_DB: Record<string, string> = {
  Active: "active",
  Paused: "paused",
  Draft: "draft",
  Scheduled: "scheduled",
  Ended: "ended",
};

const WORKFLOW_STATUS_DB: Record<string, string> = {
  Active: "active",
  Paused: "paused",
  Draft: "draft",
};

const TASK_STATUS_DB: Record<string, string> = {
  Todo: "open",
  "In Progress": "in_progress",
  Done: "done",
};

const PROVIDER_SLUG: Record<string, string> = {
  HubSpot: "hubspot",
  Salesforce: "salesforce",
  "Google Ads": "google",
  "Google Analytics 4": "google",
  "Meta Business Suite": "meta",
  Slack: "slack",
  Stripe: "stripe",
};

async function seedAmplivantaModules(workspaceId: string, userId: string, pipelineId: string) {
  // Wipe (FK-safe order): activities/tasks -> deals -> contacts -> companies,
  // campaign metrics -> campaigns, workflows, integrations.
  await db.activity.deleteMany({ where: { workspaceId } });
  await db.task.deleteMany({ where: { workspaceId } });
  await db.deal.deleteMany({ where: { workspaceId } });
  await db.contact.deleteMany({ where: { workspaceId } });
  await db.company.deleteMany({ where: { workspaceId } });
  await db.campaignMetric.deleteMany({ where: { campaign: { workspaceId } } });
  await db.campaign.deleteMany({ where: { workspaceId } });
  await db.workflow.deleteMany({ where: { workspaceId } });
  await db.integration.deleteMany({ where: { workspaceId } });

  // Stage name -> id
  const stageRows = await db.stage.findMany({ where: { workspaceId } });
  const stageIdByName = new Map(stageRows.map((s) => [s.name, s.id]));

  // Companies
  const companyIdByName = new Map<string, string>();
  for (const c of COMPANIES) {
    const row = await db.company.create({
      data: {
        workspaceId,
        name: c.name,
        domain: c.domain,
        industry: c.industry,
        size: c.plan === "Enterprise" ? "enterprise" : "growth",
      },
    });
    companyIdByName.set(c.name, row.id);
  }

  // Contacts
  const contactIdByName = new Map<string, string>();
  for (const c of CONTACTS) {
    const [firstName, ...rest] = c.name.split(" ");
    const row = await db.contact.create({
      data: {
        workspaceId,
        firstName,
        lastName: rest.join(" ") || null,
        name: c.name,
        email: c.email,
        phone: c.phone,
        jobTitle: c.role,
        companyName: c.company,
        companyId: companyIdByName.get(c.company) ?? null,
        leadScore: c.leadScore,
        status: c.stage.toLowerCase(),
      },
    });
    contactIdByName.set(c.name, row.id);
  }

  // Deals
  for (const d of DEALS) {
    await db.deal.create({
      data: {
        workspaceId,
        name: d.name,
        value: d.value,
        pipelineId,
        stageId: stageIdByName.get(STAGE_BY_DISPLAY[d.stage] ?? "") ?? null,
        closeDate: parseDate(d.expectedClose),
        contactId: contactIdByName.get(d.contact) ?? null,
        companyId: companyIdByName.get(d.company) ?? null,
        status: d.stage === "Won" ? "won" : "open",
      },
    });
  }

  // Activities
  for (const a of ACTIVITIES) {
    await db.activity.create({
      data: {
        workspaceId,
        type: a.type,
        subject: a.title,
        contactId: contactIdByName.get(a.contact) ?? null,
        userId,
      },
    });
  }

  // Tasks
  for (const t of CRM_TASKS) {
    await db.task.create({
      data: {
        workspaceId,
        title: t.title,
        status: TASK_STATUS_DB[t.status] ?? "open",
        isCompleted: t.status === "Done",
        priority: t.priority.toLowerCase(),
        dueDate: parseDate(t.dueDate),
        assigneeId: userId,
      },
    });
  }

  // Campaigns + one aggregated metric row each
  for (const cp of CAMPAIGNS) {
    const campaign = await db.campaign.create({
      data: {
        workspaceId,
        name: cp.name,
        objective: cp.goal,
        status: CAMPAIGN_STATUS_DB[cp.status] ?? "draft",
      },
    });
    await db.campaignMetric.create({
      data: {
        campaignId: campaign.id,
        impressions: cp.reach,
        clicks: Math.round((cp.reach * cp.ctr) / 100),
        conversions: cp.conversions,
        revenue: cp.revenue,
      },
    });
  }

  // Workflows
  for (const wf of WORKFLOWS) {
    await db.workflow.create({
      data: {
        workspaceId,
        name: wf.name,
        trigger: wf.trigger,
        status: WORKFLOW_STATUS_DB[wf.status] ?? "draft",
      },
    });
  }

  // Integrations
  for (const i of INTEGRATIONS) {
    const connected = i.status === "Connected";
    await db.integration.create({
      data: {
        workspaceId,
        provider: PROVIDER_SLUG[i.name] ?? i.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        status: connected ? "connected" : "available",
        isConnected: connected,
        scopes: Array.from({ length: i.scopes }, (_, n) => `scope_${n + 1}`),
        lastSyncAt: connected ? new Date() : null,
      },
    });
  }

  console.log(
    `   • Amplivanta modules: ${COMPANIES.length} companies, ${CONTACTS.length} contacts, ${DEALS.length} deals, ${ACTIVITIES.length} activities, ${CRM_TASKS.length} tasks, ${CAMPAIGNS.length} campaigns, ${WORKFLOWS.length} workflows, ${INTEGRATIONS.length} integrations`,
  );
}

async function main() {
  console.log("🌱 Seeding database...");

  // Wipe content tables for a clean, repeatable seed (respect FK: portfolio before service).
  await db.portfolio.deleteMany();
  await db.blogPost.deleteMany();
  await db.review.deleteMany();
  await db.teamMember.deleteMany();
  await db.siteSetting.deleteMany();
  await db.service.deleteMany();

  // 1. Admin user
  const adminUser = await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@amplivanta.com" },
    update: {
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123456", 12),
      name: "Amplivanta Admin",
      role: "SUPER_ADMIN",
    },
    create: {
      email: process.env.ADMIN_EMAIL || "admin@amplivanta.com",
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123456", 12),
      name: "Amplivanta Admin",
      role: "SUPER_ADMIN",
    },
  });

  // 2. Default Workspace & Membership
  const workspace = await db.workspace.upsert({
    where: { slug: "amplivanta-hq" },
    update: { name: "Amplivanta HQ" },
    create: {
      name: "Amplivanta HQ",
      slug: "amplivanta-hq",
    },
  });

  await db.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: adminUser.id,
        workspaceId: workspace.id,
      },
    },
    update: { role: "OWNER" },
    create: {
      userId: adminUser.id,
      workspaceId: workspace.id,
      role: "OWNER",
    },
  });

  // 3. Plans — stripePriceId pulled from env so real Stripe Prices wire up
  //    without code changes (leave unset to run the local no-charge fallback).
  const plans = [
    { id: "free", name: "Free", price: 0, features: ["1 user", "250 contacts", "500 emails/month"], stripePriceId: null },
    { id: "starter", name: "Starter", price: 49, features: ["3 users", "2,500 contacts", "10,000 emails/month"], stripePriceId: process.env.STRIPE_PRICE_STARTER ?? null },
    { id: "growth", name: "Growth", price: 149, features: ["10 users", "15,000 contacts", "50,000 emails/month"], stripePriceId: process.env.STRIPE_PRICE_GROWTH ?? null },
    { id: "enterprise", name: "Enterprise", price: 499, features: ["Unlimited users", "100k+ contacts", "Dedicated IP"], stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE ?? null },
  ];

  for (const p of plans) {
    await db.plan.upsert({
      where: { id: p.id },
      update: { name: p.name, price: p.price, features: p.features, stripePriceId: p.stripePriceId },
      create: { id: p.id, name: p.name, price: p.price, features: p.features, stripePriceId: p.stripePriceId },
    });
  }

  // 4. Default CRM Pipeline & Stages
  const pipeline = await db.pipeline.create({
    data: {
      workspaceId: workspace.id,
      name: "Standard Sales Pipeline",
      isDefault: true,
    },
  });

  const stages = [
    { name: "New Lead", order: 1, probability: 0.1 },
    { name: "Qualified", order: 2, probability: 0.3 },
    { name: "Proposal", order: 3, probability: 0.6 },
    { name: "Negotiation", order: 4, probability: 0.8 },
    { name: "Won", order: 5, probability: 1.0 },
  ];

  for (const st of stages) {
    await db.stage.create({
      data: {
        workspaceId: workspace.id,
        pipelineId: pipeline.id,
        name: st.name,
        order: st.order,
        probability: st.probability,
      },
    });
  }

  // 4b. Amplivanta module data (CRM / marketing / integrations) — mirrors the
  //     static mock arrays so the DB-backed loaders return `live: true` instead
  //     of always falling back to mock. Idempotent: wipe-then-recreate.
  await seedAmplivantaModules(workspace.id, adminUser.id, pipeline.id);

  // 5. Services
  for (const s of MOCK_SERVICES) {
    await db.service.create({
      data: {
        title: s.title,
        slug: s.slug,
        description: s.description,
        longDesc: s.longDesc,
        icon: s.icon,
        image: s.image ?? null,
        features: s.features,
        order: s.order,
        isActive: s.isActive,
      },
    });
  }

  // 6. Portfolio
  const serviceMap = new Map((await db.service.findMany()).map((s) => [s.slug, s.id]));
  for (const p of MOCK_PORTFOLIO) {
    const svcSlug = p.serviceId ? slugByMockId[p.serviceId] : undefined;
    await db.portfolio.create({
      data: {
        title: p.title,
        slug: p.slug,
        client: p.client,
        description: p.description,
        longDesc: p.longDesc,
        coverImage: p.coverImage ?? "",
        images: p.images,
        tags: p.tags,
        results: p.results as unknown as Prisma.InputJsonValue,
        serviceId: svcSlug ? serviceMap.get(svcSlug) ?? null : null,
        isFeatured: p.isFeatured,
        isPublished: p.isPublished,
      },
    });
  }

  // 7. Blog posts
  for (const b of MOCK_BLOG) {
    await db.blogPost.create({
      data: {
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content,
        coverImage: b.coverImage ?? null,
        tags: b.tags,
        author: b.author,
        authorImage: b.authorImage ?? null,
        isFeatured: b.isFeatured,
        isPublished: b.isPublished,
        publishedAt: b.isPublished ? new Date() : null,
      },
    });
  }

  // 8. Reviews
  for (const r of MOCK_REVIEWS) {
    await db.review.create({
      data: {
        name: r.name,
        company: r.company,
        role: r.role,
        content: r.content,
        rating: r.rating,
        avatar: r.avatar ?? null,
        isFeatured: r.isFeatured,
        isApproved: r.isApproved,
      },
    });
  }

  // 9. Team
  for (const t of MOCK_TEAM) {
    await db.teamMember.create({
      data: {
        name: t.name,
        role: t.role,
        bio: t.bio ?? null,
        image: t.image ?? null,
        linkedin: t.linkedin ?? null,
        twitter: t.twitter ?? null,
        order: t.order,
        isActive: t.isActive,
      },
    });
  }

  // 10. Site settings
  const settings: Record<string, string> = {
    siteName: "Amplivanta",
    siteDescription: "We Engineer Growth — enterprise AI marketing automation platform.",
    contactEmail: "hello@amplivanta.com",
    phone: "+1 (555) 000-0000",
    address: "123 Agency Street, New York, NY 10001",
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.create({ data: { key, value } });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
