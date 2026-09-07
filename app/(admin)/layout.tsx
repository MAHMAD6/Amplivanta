import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

/** Roles allowed into the administration console. */
const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "OWNER"]);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;

  if (!session?.user && process.env.NODE_ENV !== "development") redirect("/login?next=/admin");
  if (session?.user && !ADMIN_ROLES.has(user?.role ?? "") && process.env.NODE_ENV !== "development") {
    redirect("/app");
  }

  return (
    <>
      <AdminShell
        adminName={user?.name || "Administrator"}
        adminEmail={user?.email || "Signed in"}
        role={user?.role ?? "ADMIN"}
      >
        {children}
      </AdminShell>
      <Toaster position="top-right" richColors closeButton gap={12} />
    </>
  );
}
