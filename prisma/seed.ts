import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  MOCK_SERVICES,
  MOCK_PORTFOLIO,
  MOCK_BLOG,
  MOCK_REVIEWS,
  MOCK_TEAM,
} from "../lib/mock-data";

const db = new PrismaClient();

const slugByMockId: Record<string, string> = {
  "1": "social-media-marketing",
  "2": "content-writing",
  "3": "seo",
  "4": "video-production",
  "5": "pay-per-click",
  "6": "web-design",
};

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
  await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@amplivanta.com" },
    update: {
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123456", 12),
      name: "Admin",
      role: "SUPER_ADMIN",
    },
    create: {
      email: process.env.ADMIN_EMAIL || "admin@amplivanta.com",
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123456", 12),
      name: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  // 2. Services
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

  // 3. Portfolio (link to services by slug)
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

  // 4. Blog posts
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

  // 5. Reviews
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

  // 6. Team
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

  // 7. Site settings
  const settings: Record<string, string> = {
    siteName: "Amplivanta",
    siteDescription: "Full-service digital marketing agency.",
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
