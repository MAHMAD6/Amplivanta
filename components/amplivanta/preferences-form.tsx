"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Image as ImageIcon, Link2, Loader2, Send, Settings, Shield, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SECTION_ICONS: Record<string, LucideIcon> = { general: Settings, publishing: Send, notifications: Bell, content: ImageIcon, security: Shield, integrations: Link2, advanced: SlidersHorizontal };
import { cn } from "@/lib/utils";
import { toastResult } from "@/lib/action-toast";
import { savePreferences } from "@/app/(app)/app/preferences-actions";
import type { PrefScope, PreferenceValues } from "@/lib/preferences";

const control = "h-10 w-full rounded-md border border-line bg-white px-3 text-[13px] text-deep-navy focus:border-[#0B5CFF] focus:outline-none";

function Toggle({ name, defaultChecked, label }: { name: string; defaultChecked: boolean; label: string }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => setOn((v) => !v)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition", on ? "bg-[#0B5CFF]" : "bg-line")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition", on ? "left-[22px]" : "left-0.5")} />
      <input type="hidden" name={name} value={on ? "on" : ""} />
    </button>
  );
}

/**
 * Settings form driven by a preference scope. `layout` matches the two
 * designs: top tabs, or a left section menu. All sections stay mounted so a
 * save always submits every field; tabs only change what is visible.
 */
export function PreferencesForm({
  def,
  values,
  path,
  canEdit,
  layout = "tabs",
}: {
  def: PrefScope;
  values: PreferenceValues;
  path: string;
  canEdit: boolean;
  layout?: "tabs" | "sidebar" | "flat";
}) {
  const tabs = def.tabs?.filter(([id]) => def.sections.some((s) => s.tab === id)) ?? [];
  const [tab, setTab] = useState(tabs[0]?.[0] ?? "");
  const [pending, start] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const sections = def.sections.map((s) => (
    <section key={s.id} hidden={layout !== "flat" && tabs.length > 0 && s.tab !== tab} className="rounded-xl border border-line bg-white p-5">
      <h2 className="mb-2 text-[15px] font-semibold text-deep-navy">{s.title}</h2>
      <div className="divide-y divide-line">
        {s.fields.map((f) => (
          <div key={f.key} className="grid grid-cols-1 items-center gap-2 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <div className="text-[13.5px] font-semibold text-deep-navy">{f.label}</div>
              {f.description && <div className="text-[12px] text-ink-soft">{f.description}</div>}
            </div>
            <div className={cn(f.kind === "toggle" && "flex justify-end")}>
              {f.kind === "toggle" ? (
                <Toggle name={f.key} label={f.label} defaultChecked={values[f.key] === true} />
              ) : f.kind === "select" ? (
                <select name={f.key} defaultValue={typeof values[f.key] === "string" ? (values[f.key] as string) : ""} disabled={!canEdit} className={control}>
                  <option value="">{f.placeholder ?? "No default selected"}</option>
                  {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <input name={f.key} defaultValue={typeof values[f.key] === "string" ? (values[f.key] as string) : ""} maxLength={f.maxLength ?? 120} placeholder={f.placeholder ?? "No default selected"} disabled={!canEdit} className={control} />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  ));

  return (
    <form
      ref={form}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          if (toastResult(await savePreferences(def.scope, path, fd))) router.refresh();
        });
      }}
    >
      {layout === "tabs" && tabs.length > 0 && (
        <div role="tablist" className="no-scrollbar mb-4 flex gap-1 overflow-x-auto border-b border-line">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn("shrink-0 px-3.5 py-2.5 text-[13.5px] font-semibold", tab === id ? "-mb-px border-b-2 border-[#0B5CFF] text-[#0B5CFF]" : "text-ink-soft hover:text-deep-navy")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className={cn(layout === "sidebar" && "grid grid-cols-1 gap-4 lg:grid-cols-[210px_minmax(0,1fr)]")}>
        {layout === "sidebar" && (
          <nav className="h-fit rounded-xl border border-line bg-white p-2" aria-label="Settings sections">
            {tabs.map(([id, label]) => {
              const Icon = SECTION_ICONS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px]", tab === id ? "bg-royal-tint font-semibold text-[#0B5CFF]" : "text-deep-navy hover:bg-bg-soft")}
                >
                  {Icon && <Icon className="h-4 w-4" />} {label}
                </button>
              );
            })}
          </nav>
        )}
        <div className="space-y-4">{sections}</div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!canEdit || pending} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0B5CFF] px-6 text-[13.5px] font-semibold text-white hover:bg-[#0A4FE0] disabled:opacity-50">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
        </button>
        <button type="button" disabled={pending} onClick={() => { form.current?.reset(); router.refresh(); }} className="inline-flex h-10 items-center rounded-md border border-line bg-white px-6 text-[13.5px] font-semibold text-deep-navy hover:bg-bg-soft">
          Reset
        </button>
        {!canEdit && <span className="text-[12.5px] text-ink-muted">Only workspace admins can change these settings.</span>}
      </div>
    </form>
  );
}
