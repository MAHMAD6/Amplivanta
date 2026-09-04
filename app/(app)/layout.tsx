import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/amplivanta/app-shell";
import { getMarketplaceViewer, marketplaceNavVisibility } from "@/lib/server/marketplace-access";
import { prisma } from "@/lib/prisma";

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

  // Real workspaces for the switcher; an unreachable database yields none
  // rather than placeholder organizations.
  let workspaces: { id: string; name: string; plan: string }[] = [];
  try {
    if (viewer.userId) {
      const rows = await prisma.membership.findMany({
        where: { userId: viewer.userId },
        select: { workspace: { select: { id: true, name: true, planTier: true } } },
        orderBy: { createdAt: "asc" },
      });
      workspaces = rows.map((r) => ({ id: r.workspace.id, name: r.workspace.name, plan: r.workspace.planTier }));
    }
  } catch {
    workspaces = [];
  }

  return (
    <AppShell
      navVisibility={navVisibility}
      workspaces={workspaces}
      user={{ name: viewer.name, email: viewer.email }}
    >
      {children}
    </AppShell>
  );
}
