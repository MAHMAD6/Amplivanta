import type { Metadata } from "next";
import { PageHeader } from "@/components/amplivanta/page-header";
import { SocialSubnav } from "@/components/amplivanta/social-subnav";

export const metadata: Metadata = { title: "Social Settings" };

export default function SocialSettingsPage() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader title="Social Publishing Settings" subtitle="Module-scoped preferences for how your team publishes content." />
      <SocialSubnav />

      <div className="space-y-6">
        <Section title="Publishing Defaults" desc="Applied to new posts unless overridden.">
          <Row label="Default posting timezone" value="America/Los_Angeles (PST · UTC-8)" />
          <Row label="URL shortening" value="Amplivanta short links (amp.li)" toggle />
          <Row label="Default UTM medium" value="social-organic" />
          <Row label="Auto-save drafts" value="Every 30 seconds" toggle />
          <Row label="Auto-add tracking parameters" value="On" toggle />
        </Section>

        <Section title="Notifications" desc="Who gets notified when.">
          <Row label="Notify me when a post publishes" value="In-app + email" toggle />
          <Row label="Notify me when a post is approved" value="In-app" toggle />
          <Row label="Notify me on publish failure" value="In-app + email + SMS" toggle />
          <Row label="Weekly analytics digest" value="Monday mornings" toggle />
        </Section>

        <Section title="Content & Media" desc="Defaults for uploads and generated media.">
          <Row label="Image compression" value="Balanced (recommended)" />
          <Row label="Video max upload" value="500 MB" />
          <Row label="Alt-text required" value="On for accessibility" toggle />
          <Row label="Watermark exports" value="Off" toggle />
        </Section>

        <Section title="Security & Privacy" desc="Who can do what with your accounts.">
          <Row label="Require approval before publishing" value="For Editors and below" toggle />
          <Row label="Publishing lock during approval" value="On" toggle />
          <Row label="Two-factor for account connect" value="Required" toggle />
        </Section>

        <div className="flex justify-end gap-2">
          <button className="rounded-xl border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink">Cancel</button>
          <button className="rounded-xl bg-grad-cta px-4 py-2 text-[13px] font-bold text-white shadow-violet">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="mb-4">
        <div className="text-[14px] font-bold text-ink">{title}</div>
        <div className="text-[12px] text-ink-muted">{desc}</div>
      </div>
      <div className="divide-y divide-line">{children}</div>
    </div>
  );
}

function Row({ label, value, toggle }: { label: string; value: string; toggle?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-[13px] font-semibold text-ink">{label}</div>
        <div className="text-[11.5px] text-ink-muted">{value}</div>
      </div>
      {toggle ? (
        <div className="relative h-6 w-11 rounded-full bg-grad-brand-2 p-0.5">
          <span className="block h-5 w-5 translate-x-5 rounded-full bg-white shadow" />
        </div>
      ) : (
        <button className="rounded-lg border border-line px-3 py-1 text-[11.5px] font-semibold text-ink-soft">Edit</button>
      )}
    </div>
  );
}
