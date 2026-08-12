import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const [services, portfolio, posts, team, messages] = await Promise.all([
      db.service.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, title: true, slug: true, icon: true },
      }),
      db.portfolio.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { client: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, title: true, slug: true, client: true },
      }),
      db.blogPost.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, title: true, slug: true, author: true },
      }),
      db.teamMember.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { role: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, name: true, role: true },
      }),
      db.contact.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 4,
        select: { id: true, name: true, email: true, status: true, createdAt: true },
      }),
    ]);

    const results = [
      ...services.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: `Service • Icon: ${item.icon}`,
        type: "service",
        href: `/admin/services/${item.id}`,
      })),
      ...portfolio.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: `Portfolio • Client: ${item.client}`,
        type: "portfolio",
        href: `/admin/portfolio/${item.id}`,
      })),
      ...posts.map((item) => ({
        id: item.id,
        title: item.title,
        subtitle: `Blog Post • Author: ${item.author}`,
        type: "blog",
        href: `/admin/blog/${item.id}`,
      })),
      ...team.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: `Team Member • Role: ${item.role}`,
        type: "team",
        href: `/admin/team/${item.id}`,
      })),
      ...messages.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: `Message • ${item.email} (${item.status})`,
        type: "message",
        href: `/admin/messages/${item.id}`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Admin search error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
