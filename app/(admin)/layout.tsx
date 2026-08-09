import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Toaster } from "sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { name?: string | null; role?: string };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar userName={user.name ?? "Admin"} userRole={user.role ?? "ADMIN"} />
      <div className="lg:ml-64">
        <AdminTopbar />
        <main className="p-6">{children}</main>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
