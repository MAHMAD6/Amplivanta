import { SettingsNav } from "@/components/amplivanta/settings-nav";

export function SettingsHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: React.ReactNode }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[14px] text-ink-soft">Settings / Administration</div>
          <h1 className="mt-2 font-display text-[32px] font-bold leading-tight text-deep-navy">{title}</h1>
          <p className="mt-1 text-[15px] text-ink-soft">{subtitle}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      <SettingsNav />
    </>
  );
}
