import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      servicesCount,
      portfolioCount,
      postsCount,
      teamCount,
      newMessagesCount,
      pendingReviewsCount,
      unreadMessages,
      pendingReviews,
    ] = await Promise.all([
      db.service.count(),
      db.portfolio.count(),
      db.blogPost.count(),
      db.teamMember.count(),
      db.contact.count({ where: { status: "NEW" } }),
      db.review.count({ where: { isApproved: false } }),
      db.contact.findMany({
        where: { status: "NEW" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true, service: true },
      }),
      db.review.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, rating: true, content: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      counts: {
        services: servicesCount,
        portfolio: portfolioCount,
        posts: postsCount,
        team: teamCount,
        newMessages: newMessagesCount,
        pendingReviews: pendingReviewsCount,
      },
      notifications: {
        unreadMessages,
        pendingReviews,
        totalNotifications: newMessagesCount + pendingReviewsCount,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      {
        counts: { services: 0, portfolio: 0, posts: 0, team: 0, newMessages: 0, pendingReviews: 0 },
        notifications: { unreadMessages: [], pendingReviews: [], totalNotifications: 0 },
      },
      { status: 500 }
    );
  }
}
