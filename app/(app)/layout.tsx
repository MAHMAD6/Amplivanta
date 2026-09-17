import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/amplivanta/app-shell";
import { getMarketplaceViewer, marketplaceNavVisibility } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/tenant";
import { unreadWhere } from "@/lib/notifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Authoritative server-side guard for the product app. The edge middleware
  // only does a fast cookie presence check; this verifies the real session.
  // Dev keeps the demo workspace open without login (mirrors the super layout).
  const session = await auth();
  if (!session?.user && process.env.NODE_ENV !== "development") {
    redirect("/login?next=/app");
  }

  // Marketplace navigation visibility is resolved server-side: module state,
  // seller status and feature flags decide what appears, never the client.
  const viewer = await getMarketplaceViewer();
  const navVisibility = marketplaceNavVisibility(viewer);

  // Bell badge: the member's real unread count; null (no badge) when unknown.
  let unreadNotifications: number | null = null;
  try {
    const ctx = await getSessionContext();
    unreadNotifications = await prisma.notification.count({ where: unreadWhere(ctx.workspaceId, ctx.userId) });
  } catch {
    unreadNotifications = null;
  }

  return (
    <AppShell
      navVisibility={navVisibility}
      user={{ name: viewer.name, email: viewer.email }}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </AppShell>
  );
}
