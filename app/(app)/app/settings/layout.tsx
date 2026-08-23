import { PageHeader } from "@/components/amplivanta/page-header";
import { SettingsNav } from "@/components/amplivanta/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader title="Settings" subtitle="Workspace profile, users, billing, security, notifications, data, API — one place." />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <SettingsNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
