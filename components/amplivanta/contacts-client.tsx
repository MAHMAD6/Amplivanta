"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, Filter, List, LayoutGrid, ArrowUpDown, MoreHorizontal, X, Mail, Phone, MessageSquare, StickyNote, Building2, MapPin, Clock, Tag, User, Zap, Calendar, Pencil, Trash2 } from "lucide-react";
import { CONTACTS, PIPELINE_STAGES, STAGE_TONE, type Contact } from "@/lib/crm-data";
import { StatusPill, Avatar, CompanyIcon } from "./status-pill";
import { ResourceDialog } from "./crud/resource-dialog";
import { DeleteAction } from "./crud/delete-action";
import { CONTACT_FIELDS } from "./crm/crm-fields";
import { cn } from "@/lib/utils";

const STATUS_BY_STAGE: Record<string, string> = { New: "new", Qualified: "qualified", Proposal: "engaged", Negotiation: "engaged", Won: "customer" };

const TABS = [
  { key: "contacts", label: "All Contacts", count: 2456 },
  { key: "companies", label: "Companies", count: 842 },
  { key: "deals", label: "Deals", count: 189 },
  { key: "tasks", label: "Tasks", count: 28 },
  { key: "activities", label: "Activities" },
  { key: "notes", label: "Notes" },
];

export function ContactsClient({ contacts = CONTACTS, live = false }: { contacts?: Contact[]; live?: boolean }) {
  const data = contacts.length ? contacts : CONTACTS;
  const [view, setView] = useState<"list" | "grid">("list");
  const [selectedId, setSelectedId] = useState<string | null>(data[0]?.id ?? null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return data;
    const s = q.toLowerCase();
    return data.filter((c) =>
      [c.name, c.company, c.email, c.role].some((v) => v.toLowerCase().includes(s))
    );
  }, [q, data]);

  const selected = data.find((c) => c.id === selectedId) ?? data[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-4">
        {/* Tabs */}
        <div className="flex items-end gap-6 border-b border-line">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              className={cn(
                "relative pb-3 text-[13px] font-semibold transition",
                i === 0 ? "text-violet" : "text-ink-soft hover:text-ink"
              )}
            >
              {t.label}
              {t.count && (
                <span className={cn("ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold", i === 0 ? "bg-violet/10 text-violet" : "bg-bg-soft text-ink-muted")}>
                  {t.count.toLocaleString()}
                </span>
              )}
              {i === 0 && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-grad-brand" />}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
            <Search className="h-3.5 w-3.5 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search contacts…"
              className="min-w-0 flex-1 bg-transparent text-[13px] focus:outline-none"
            />
          </div>
          {["All Owners", "All Tags", "All Stages"].map((l) => (
            <button key={l} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-[12.5px] font-semibold text-ink-soft hover:border-ink/30">
              {l} <ChevronDown className="h-3 w-3" />
            </button>
          ))}
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/5 px-3 text-[12.5px] font-semibold text-violet">
            <Filter className="h-3.5 w-3.5" /> More Filters
          </button>
          <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-[12.5px] font-semibold text-ink-soft">
            Sort: Recently Added <ArrowUpDown className="h-3 w-3" />
          </button>
          <div className="flex overflow-hidden rounded-xl border border-line">
            <button onClick={() => setView("list")} className={cn("flex h-10 w-10 items-center justify-center", view === "list" ? "bg-violet/10 text-violet" : "text-ink-muted")}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setView("grid")} className={cn("flex h-10 w-10 items-center justify-center border-l border-line", view === "grid" ? "bg-violet/10 text-violet" : "text-ink-muted")}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Contacts table */}
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-bg-soft/60 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Last Activity</th>
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "cursor-pointer border-b border-line transition last:border-0 hover:bg-bg-soft/50",
                      selectedId === c.id && "bg-violet/[0.04]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size={32} />
                        <div>
                          <div className="text-[13px] font-semibold text-ink">{c.name}</div>
                          <div className="text-[11px] text-ink-muted">{c.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CompanyIcon name={c.company} size={24} />
                        <span className="text-[12.5px] text-ink">{c.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-blue-600 underline">{c.email}</td>
                    <td className="px-4 py-3 text-[12px] text-ink-soft">{c.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", c.leadScore >= 80 ? "bg-emerald-500" : c.leadScore >= 60 ? "bg-amber-500" : "bg-red-500")} />
                        <span className="text-[12.5px] font-bold text-ink">{c.leadScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusPill tone={STAGE_TONE[c.stage]}>{c.stage}</StatusPill></td>
                    <td className="px-4 py-3"><Avatar name={c.owner} size={22} /></td>
                    <td className="px-4 py-3 text-[12px] text-ink-muted">{c.lastActivity}</td>
                    <td className="px-2 py-3 text-right">
                      <button className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft"><MoreHorizontal className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[12px] text-ink-muted">
            <span>Showing 1 to {filtered.length} of 2,456 results</span>
            <div className="flex items-center gap-1">
              <button className="rounded-lg px-2 py-1 hover:bg-bg-soft">‹</button>
              <button className="rounded-lg bg-violet/10 px-2.5 py-1 font-bold text-violet">1</button>
              <button className="rounded-lg px-2.5 py-1 hover:bg-bg-soft">2</button>
              <button className="rounded-lg px-2.5 py-1 hover:bg-bg-soft">3</button>
              <span className="px-1">…</span>
              <button className="rounded-lg px-2.5 py-1 hover:bg-bg-soft">307</button>
              <button className="rounded-lg px-2 py-1 hover:bg-bg-soft">›</button>
            </div>
          </div>
        </div>

        {/* Pipeline overview at bottom */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[13px] font-bold text-ink">Pipeline Overview</div>
            <button className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2 text-[11px] font-semibold text-ink-soft">
              All Pipelines <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="grid gap-3 lg:grid-cols-5">
            {PIPELINE_STAGES.map((s) => (
              <div key={s.key} className="rounded-xl border border-line bg-bg-soft/40 p-3">
                <div className="flex items-center justify-between">
                  <StatusPill tone={STAGE_TONE[s.key]}>{s.label}</StatusPill>
                </div>
                <div className="mt-2 text-[18px] font-extrabold text-ink">{s.deals}</div>
                <div className="text-[10.5px] font-semibold text-emerald-600">${s.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right drawer */}
      <aside className="sticky top-20 h-fit rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[13px] font-bold text-ink">Contact Details</div>
          <div className="flex items-center gap-1">
            {live && selected && (
              <>
                <ResourceDialog
                  title="Edit Contact"
                  fields={CONTACT_FIELDS}
                  endpoint={`/api/contacts/${selected.id}`}
                  method="PATCH"
                  submitLabel="Save changes"
                  successMessage="Contact updated"
                  initial={{
                    firstName: selected.name.split(" ")[0],
                    lastName: selected.name.split(" ").slice(1).join(" "),
                    email: selected.email !== "—" ? selected.email : "",
                    phone: selected.phone !== "—" ? selected.phone : "",
                    jobTitle: selected.role !== "—" ? selected.role : "",
                    leadScore: selected.leadScore,
                    status: STATUS_BY_STAGE[selected.stage] ?? "new",
                  }}
                  trigger={
                    <button className="rounded-lg p-1.5 text-ink-muted hover:bg-bg-soft hover:text-violet" aria-label="Edit contact">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  }
                />
                <DeleteAction
                  endpoint={`/api/contacts/${selected.id}`}
                  label="contact"
                  name={selected.name}
                  successMessage="Contact deleted"
                  trigger={
                    <button className="rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete contact">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  }
                />
              </>
            )}
            <button onClick={() => setSelectedId(null)} className="rounded-lg p-1 text-ink-muted hover:bg-bg-soft">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Avatar name={selected.name} size={56} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold text-ink">{selected.name}</div>
            <div className="text-[12px] text-ink-muted">{selected.role}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-ink-muted" />
              <span className="text-[11.5px] text-ink-soft">{selected.company}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Lead Score</div>
            <div className="text-[20px] font-extrabold text-emerald-600">{selected.leadScore}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { icon: Mail, label: "Email" },
            { icon: Phone, label: "Call" },
            { icon: MessageSquare, label: "SMS" },
            { icon: StickyNote, label: "Note" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex flex-col items-center gap-1 rounded-xl border border-line bg-white p-2 text-[10px] font-semibold text-ink-soft hover:border-violet/30 hover:text-violet">
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-4 border-b border-line text-[12px] font-semibold">
          {["Overview", "Activity", "Deals", "Notes", "Files"].map((t, i) => (
            <button
              key={t}
              className={cn("relative pb-2", i === 0 ? "text-violet" : "text-ink-muted hover:text-ink")}
            >
              {t}
              {i === 0 && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-violet" />}
            </button>
          ))}
        </div>

        <dl className="mt-4 space-y-2.5 text-[12px]">
          <DetailRow icon={Mail} label="Email" value={selected.email} link />
          <DetailRow icon={Phone} label="Phone" value={selected.phone} />
          <DetailRow icon={Building2} label="Company" value={selected.company} />
          <DetailRow icon={MapPin} label="Location" value={selected.location} />
          <DetailRow icon={Clock} label="Time Zone" value={selected.timezone} />
          <div className="flex items-start gap-2">
            <Tag className="mt-0.5 h-3.5 w-3.5 text-ink-muted" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Tags</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {selected.tags.map((t) => (
                  <span key={t} className="rounded-md bg-violet/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-violet">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <DetailRow icon={User} label="Owner" value={selected.owner} />
          <DetailRow icon={Zap} label="Lead Source" value={selected.source} />
          <DetailRow icon={Calendar} label="Created" value={selected.createdAt} />
        </dl>

        <div className="mt-5 border-t border-line pt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[11.5px] font-bold text-ink">Recent Activity</div>
            <Link href="/app/crm/activities" className="text-[11px] font-semibold text-violet">View All</Link>
          </div>
          <div className="space-y-2.5">
            {[
              { emoji: "✉️", title: "Email opened", body: "Welcome to Amplivanta!", when: "Today, 10:30 AM" },
              { emoji: "📞", title: "Phone call", body: "Discussed proposal details", when: "Yesterday, 3:45 PM" },
              { emoji: "📝", title: "Note added", body: "Interested in enterprise plan", when: "May 27, 2026" },
            ].map((a, i) => (
              <div key={i} className="flex gap-2">
                <div className="mt-0.5 text-[13px]">{a.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-semibold text-ink">{a.title}</div>
                  <div className="text-[10.5px] text-ink-soft">{a.body}</div>
                  <div className="text-[10px] text-ink-muted">{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, link }: { icon: any; label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
      <div className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">{label}</div>
      <span className={cn("text-[12px] font-medium", link ? "text-blue-600 underline" : "text-ink")}>{value}</span>
    </div>
  );
}
