// Demo-data provisioner. Run with the dev server up:  node scripts/seed-demo.mjs
// Creates demo users through Better Auth (correct password hashing), then attaches
// a full workspace of CRM / marketing / social / notification data via Prisma.
import { PrismaClient } from "@prisma/client";

const BASE = process.env.SEED_BASE_URL || "http://localhost:3000";
const db = new PrismaClient();

async function signUp(name, email, password) {
  const res = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok && res.status !== 422) {
    // 422 = already exists; tolerate for idempotent re-runs.
    const t = await res.text();
    throw new Error(`sign-up failed (${res.status}): ${t}`);
  }
  return db.user.findUnique({ where: { email } });
}

async function main() {
  const password = "amplivanta123";

  const owner = await signUp("Alex Johnson", "owner@amplivanta.com", password);
  const superUser = await signUp("Amplivanta Super Admin", "super@amplivanta.com", password);
  if (!owner) throw new Error("owner user not created");

  // Promote the super admin.
  await db.user.update({ where: { id: superUser.id }, data: { role: "SUPER_ADMIN" } });

  // The sign-up hook auto-creates a workspace; grab the owner's.
  const membership = await db.membership.findFirst({
    where: { userId: owner.id },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });
  const workspace = membership.workspace;
  const wid = workspace.id;
  await db.workspace.update({
    where: { id: wid },
    data: { name: "Amplivanta Workspace", industry: "Marketing Technology", size: "51-200", domain: "amplivanta.com", planTier: "GROWTH" },
  });

  // Idempotent reset of demo domain data.
  await db.$transaction([
    db.socialPostMetric.deleteMany({ where: { post: { workspaceId: wid } } }),
    db.socialPost.deleteMany({ where: { workspaceId: wid } }),
    db.socialAccount.deleteMany({ where: { workspaceId: wid } }),
    db.campaignMetric.deleteMany({ where: { campaign: { workspaceId: wid } } }),
    db.campaign.deleteMany({ where: { workspaceId: wid } }),
    db.workflow.deleteMany({ where: { workspaceId: wid } }),
    db.activity.deleteMany({ where: { workspaceId: wid } }),
    db.deal.deleteMany({ where: { workspaceId: wid } }),
    db.pipelineStage.deleteMany({ where: { pipeline: { workspaceId: wid } } }),
    db.pipeline.deleteMany({ where: { workspaceId: wid } }),
    db.task.deleteMany({ where: { workspaceId: wid } }),
    db.emailSend.deleteMany({ where: { campaign: { workspaceId: wid } } }),
    db.emailCampaign.deleteMany({ where: { workspaceId: wid } }),
    db.dailyEventAggregate.deleteMany({ where: { workspaceId: wid } }),
    db.eventDefinition.deleteMany({ where: { workspaceId: wid } }),
    db.subscription.deleteMany({ where: { workspaceId: wid } }),
    db.contact.deleteMany({ where: { workspaceId: wid } }),
    db.company.deleteMany({ where: { workspaceId: wid } }),
    db.notification.deleteMany({ where: { workspaceId: wid } }),
    db.recommendation.deleteMany({ where: { workspaceId: wid } }),
    db.integration.deleteMany({ where: { workspaceId: wid } }),
  ]);

  // Companies + contacts
  const companyDefs = [
    { name: "BrightWave Inc.", industry: "SaaS", size: "51-200" },
    { name: "NorthPeak Retail", industry: "Ecommerce", size: "201-500" },
    { name: "Vireo Health", industry: "Healthcare", size: "500+" },
    { name: "Ledgerline Financial", industry: "Financial Services", size: "51-200" },
    { name: "Kern & Co Agency", industry: "Professional Services", size: "11-50" },
  ];
  const companies = [];
  for (const c of companyDefs) {
    companies.push(await db.company.create({ data: { ...c, workspaceId: wid, domain: `${c.name.split(" ")[0].toLowerCase()}.com` } }));
  }

  const firstNames = ["Sarah", "David", "Emily", "Rohan", "Meera", "Noah", "Priya", "James", "Anita", "Vikram"];
  const lastNames = ["Chen", "Lee", "Davis", "Mehta", "Kapoor", "Thompson", "Ramesh", "Carter", "Desai", "Iyer"];
  const statuses = ["new", "qualified", "engaged", "customer"];
  const contacts = [];
  for (let i = 0; i < 24; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const company = companies[i % companies.length];
    contacts.push(await db.contact.create({
      data: {
        workspaceId: wid, companyId: company.id, firstName: fn, lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${company.domain}`,
        phone: `+1 (555) 0${String(100 + i).slice(-3)}-01${String(10 + i).slice(-2)}`,
        jobTitle: ["Marketing Director", "Growth Lead", "CEO", "VP Sales", "Content Manager"][i % 5],
        status: statuses[i % statuses.length], leadScore: 40 + ((i * 7) % 60),
      },
    }));
  }

  // Pipeline + deals
  const pipeline = await db.pipeline.create({ data: { workspaceId: wid, name: "Sales Pipeline", isDefault: true } });
  const stageDefs = [
    { name: "New Lead", position: 1, probability: 0.1 },
    { name: "Qualified", position: 2, probability: 0.3 },
    { name: "Proposal", position: 3, probability: 0.55 },
    { name: "Negotiation", position: 4, probability: 0.75 },
    { name: "Won", position: 5, probability: 1, isClosed: true },
  ];
  const stages = [];
  for (const s of stageDefs) stages.push(await db.pipelineStage.create({ data: { ...s, pipelineId: pipeline.id } }));

  for (let i = 0; i < 18; i++) {
    const stage = stages[i % stages.length];
    const deal = await db.deal.create({
      data: {
        workspaceId: wid, pipelineId: pipeline.id, stageId: stage.id,
        name: `${companies[i % companies.length].name} — ${["Annual Plan", "Expansion", "Pilot", "Renewal"][i % 4]}`,
        value: 8000 + ((i * 4300) % 60000), closeDate: new Date(2026, 6 + (i % 3), 10 + i), ownerId: owner.id,
      },
    });
    await db.activity.create({
      data: { workspaceId: wid, type: ["call", "email", "meeting"][i % 3], subject: "Follow-up on proposal", dealId: deal.id, contactId: contacts[i % contacts.length].id, ownerId: owner.id },
    });
  }

  // Campaigns + metrics
  const campaignDefs = [
    { name: "Spring Product Launch", objective: "Awareness", status: "live", budget: 42000 },
    { name: "Q3 Winback", objective: "Retention", status: "in_progress", budget: 8400 },
    { name: "Enterprise ABM Batch 3", objective: "Pipeline", status: "live", budget: 62000 },
  ];
  for (const c of campaignDefs) {
    const campaign = await db.campaign.create({ data: { ...c, workspaceId: wid, ownerId: owner.id, startDate: new Date(2026, 4, 1), endDate: new Date(2026, 7, 31) } });
    for (let d = 0; d < 6; d++) {
      await db.campaignMetric.create({
        data: { campaignId: campaign.id, date: new Date(2026, 4 + Math.floor(d / 2), 1 + d), impressions: 12000 + d * 3400, clicks: 640 + d * 120, conversions: 42 + d * 8, spend: 2000 + d * 800, revenue: 9000 + d * 3200 },
      });
    }
  }

  // Workflows (+ nodes so runs produce steps)
  for (const name of ["Welcome Nurture", "Abandoned Cart Recovery", "Lead Score Re-engagement"]) {
    const wf = await db.workflow.create({ data: { workspaceId: wid, name, status: "active", trigger: { type: "form_submission" } } });
    const nodeTypes = ["trigger", "wait", "send_email", "condition", "add_tag"];
    for (let i = 0; i < nodeTypes.length; i++) {
      await db.workflowNode.create({ data: { workflowId: wf.id, type: nodeTypes[i], position: { order: i }, config: {} } });
    }
  }

  // CRM tasks
  const taskDefs = [
    { title: "Send proposal to BrightWave", status: "open", priority: "high" },
    { title: "Follow up with Vireo Health", status: "open", priority: "high" },
    { title: "Schedule discovery call — NorthPeak", status: "in_progress", priority: "medium" },
    { title: "Send contract to Ledgerline", status: "in_progress", priority: "high" },
    { title: "Onboarding checklist — Kern & Co", status: "done", priority: "medium" },
    { title: "Q3 outbound list — Enterprise", status: "open", priority: "low" },
  ];
  for (let i = 0; i < taskDefs.length; i++) {
    await db.task.create({ data: { ...taskDefs[i], workspaceId: wid, assigneeId: owner.id, dueDate: new Date(2026, 7, 10 + i) } });
  }

  // Connected integrations
  const integrationDefs = [
    { provider: "hubspot", status: "connected", scopes: ["crm.read", "crm.write"] },
    { provider: "google", status: "connected", scopes: ["analytics.read"] },
    { provider: "slack", status: "connected", scopes: ["chat.write"] },
  ];
  for (const ig of integrationDefs) {
    await db.integration.create({ data: { ...ig, workspaceId: wid, lastSyncAt: new Date() } });
  }

  // Social
  const account = await db.socialAccount.create({ data: { workspaceId: wid, platform: "linkedin", accountName: "Amplivanta" } });
  for (let i = 0; i < 6; i++) {
    await db.socialPost.create({
      data: { workspaceId: wid, accountId: account.id, content: `Growth tip #${i + 1}: publish where your audience already is. 🚀`, status: i < 3 ? "published" : "scheduled", scheduledAt: new Date(2026, 4, 20 + i), publishedAt: i < 3 ? new Date(2026, 4, 20 + i) : null },
    });
  }

  // AI recommendations
  for (const r of [
    { title: "Improve Conversion Rate", category: "Analytics", impact: "High", confidence: 0.94 },
    { title: "Optimize Email Campaign Timing", category: "Marketing", impact: "Medium", confidence: 0.81 },
    { title: "Reduce CPA on Paid Social", category: "Advertising", impact: "High", confidence: 0.88 },
  ]) {
    await db.recommendation.create({ data: { ...r, workspaceId: wid, body: "AI-generated recommendation." } });
  }

  // Notifications
  for (const n of [
    { category: "approvals", title: "New content awaiting your approval", userId: owner.id },
    { category: "billing", title: "Your invoice for May is ready", userId: null },
    { category: "automation", title: "Workflow 'Welcome Nurture' completed 128 runs", userId: owner.id },
    { category: "social", title: "3 posts published successfully", userId: null },
  ]) {
    await db.notification.create({ data: { ...n, workspaceId: wid } });
  }

  // Event definitions — power Conversion Settings + Trigger / Event Manager
  const eventDefs = [
    { name: "Purchase Completed", description: "Thank you page", properties: { type: "Website", source: "Landing Page", value: 72430, status: "active" } },
    { name: "Lead Form Submitted", description: "Contact us form", properties: { type: "Form", source: "All Pages", value: 12782, status: "active" } },
    { name: "Trial Started", description: "Signup completed", properties: { type: "Event", source: "Signup Page", value: 0, status: "active" } },
    { name: "Demo Booked", description: "Calendar booking", properties: { type: "Event", source: "All Pages", value: 9130, status: "active" } },
    { name: "Content Download", description: "Resource center", properties: { type: "Event", source: "Blog Pages", value: 0, status: "paused" } },
  ];
  for (const e of eventDefs) {
    const def = await db.eventDefinition.create({ data: { workspaceId: wid, name: e.name, description: e.description, properties: e.properties } });
    // Daily aggregates → conversion counts.
    for (let d = 0; d < 5; d++) {
      await db.dailyEventAggregate.create({
        data: { workspaceId: wid, eventName: def.name, date: new Date(2026, 7, 14 + d), count: 300 + ((def.name.length * (d + 3)) % 900) },
      });
    }
  }

  // Email campaigns + sends → Email Deliverability
  const emailCampaignDefs = [
    { name: "Product Launch: Amplivanta AI", n: 60 },
    { name: "Weekly Newsletter #124", n: 50 },
    { name: "Webinar: Growth Playbook", n: 40 },
    { name: "Q2 Product Update", n: 45 },
  ];
  for (const ec of emailCampaignDefs) {
    const camp = await db.emailCampaign.create({ data: { workspaceId: wid, name: ec.name, subject: ec.name, status: "sent", fromName: "Amplivanta", fromEmail: "news@amplivanta.com" } });
    const sends = [];
    for (let i = 0; i < ec.n; i++) {
      const delivered = i % 25 !== 0; // ~96% delivered
      const bounced = !delivered;
      const opened = delivered && i % 3 === 0;
      sends.push({
        campaignId: camp.id,
        status: bounced ? "bounced" : "delivered",
        deliveredAt: delivered ? new Date() : null,
        openedAt: opened ? new Date() : null,
        bouncedAt: bounced ? new Date() : null,
      });
    }
    await db.emailSend.createMany({ data: sends });
  }

  // Plan + subscription → MRR on Super Admin Organizations
  const plan = await db.plan.upsert({
    where: { id: "demo-growth-plan" },
    update: {},
    create: { id: "demo-growth-plan", name: "Growth", description: "Demo growth plan", price: 4950, interval: "monthly" },
  });
  await db.subscription.create({ data: { workspaceId: wid, planId: plan.id, status: "active" } });

  console.log("Demo data seeded:", { workspace: workspace.slug, owner: owner.email, super: superUser.email, companies: companies.length, contacts: contacts.length, deals: 18, campaigns: campaignDefs.length, eventDefs: eventDefs.length, emailCampaigns: emailCampaignDefs.length });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
