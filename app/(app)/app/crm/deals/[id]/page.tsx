import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, DollarSign, Calendar, User, Building2, Percent, Mail, Phone, MessageSquare, StickyNote, Paperclip, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/amplivanta/page-header";
import { StatusPill, Avatar, CompanyIcon } from "@/components/amplivanta/status-pill";
import { DEALS, CONTACTS, ACTIVITIES, CRM_TASKS, STAGE_TONE, PIPELINE_STAGES, type DealStage } from "@/lib/crm-data";

const STAGES_ORDER: DealStage[] = ["New", "Qualified", "Proposal", "Negotiation", "Won"];

export function generateStaticParams() {
  return DEALS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const deal = DEALS.find((d) => d.id === id);
  return deal ? { title: `${deal.name} — Amplivanta` } : {};
}

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = DEALS.find((d) => d.id === id);
  if (!deal) notFound();
  const contact = CONTACTS.find((c) => c.name === deal.contact);
  const dealActivities = ACTIVITIES.filter((a) => a.contact === deal.contact).slice(0, 6);
  const dealTasks = CRM_TASKS.filter((t) => t.related === deal.company).slice(0, 4);

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link href="/app/crm/deals" className="mb-3 inline-flex items-center gap-1 text-[12px] font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Deals
      </Link>
      <PageHeader
        title={deal.name}
        subtitle={`Deal ID: ${deal.id.toUpperCase()} · Age ${deal.age} days`}
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold text-ink hover:border-ink/30">Edit Deal</button>
            <button className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-grad-cta px-4 text-[13px] font-bold text-white shadow-violet">
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Won
            </button>
          </>
        }
      />

      {/* Stage progression */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-4 shadow-card">
        <div className="flex items-center gap-2 overflow-x-auto">
          {STAGES_ORDER.map((s, i) => {
            const idx = STAGES_ORDER.indexOf(deal.stage);
            const isPast = i < idx;
            const isCurrent = i === idx;
            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={
                    "flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[12px] font-semibold " +
                    (isCurrent
                      ? "bg-grad-brand-2 text-white shadow-violet"
                      : isPast
                      ? "bg-violet/10 text-violet"
                      : "bg-bg-soft text-ink-muted")
                  }
                >
                  {isPast && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {s}
                </div>
                {i < STAGES_ORDER.length - 1 && <span className="text-ink-muted">›</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Left: main */}
        <div className="space-y-4">
          {/* Deal header card */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Metric icon={DollarSign} label="Value" value={`$${deal.value.toLocaleString()}`} tone="green" />
              <Metric icon={StageBadge(deal.stage)} label="Stage" value={deal.stage} tone={STAGE_TONE[deal.stage] as any} />
              <Metric icon={Percent} label="Probability" value={`${deal.probability}%`} tone="violet" />
              <Metric icon={Calendar} label="Expected Close" value={deal.expectedClose} tone="blue" />
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Mail, label: "Email" },
              { icon: Phone, label: "Call" },
              { icon: MessageSquare, label: "SMS" },
              { icon: StickyNote, label: "Note" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="flex flex-col items-center gap-1 rounded-xl border border-line bg-white p-3 text-[11px] font-semibold text-ink-soft hover:border-violet/30 hover:text-violet">
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Activity timeline */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[14px] font-bold text-ink">Activity Timeline</div>
              <button className="text-[12px] font-semibold text-violet">Log activity →</button>
            </div>
            <div className="relative space-y-4 border-l border-line pl-6">
              {dealActivities.map((a) => (
                <div key={a.id} className="relative">
                  <div className="absolute -left-[29px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-violet/10 text-[12px]">
                    {a.type === "email" ? "✉️" : a.type === "call" ? "📞" : a.type === "meeting" ? "📅" : a.type === "note" ? "📝" : a.type === "sms" ? "💬" : "✅"}
                  </div>
                  <div className="text-[13px] font-semibold text-ink">{a.title}</div>
                  {a.detail && <div className="mt-1 text-[12px] text-ink-soft">{a.detail}</div>}
                  <div className="mt-1 text-[11px] text-ink-muted">{a.owner} · {a.when}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[14px] font-bold text-ink">Tasks</div>
              <button className="text-[12px] font-semibold text-violet">+ Add task</button>
            </div>
            <div className="space-y-2">
              {dealTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-line p-6 text-center text-[12px] text-ink-muted">No tasks yet.</div>
              )}
              {dealTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                  <input type="checkbox" defaultChecked={t.status === "Done"} className="h-4 w-4 rounded border-line accent-violet" />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-ink">{t.title}</div>
                    <div className="text-[11px] text-ink-muted">{t.owner} · Due {t.dueDate}</div>
                  </div>
                  <StatusPill tone={t.priority === "High" ? "red" : t.priority === "Medium" ? "amber" : "gray"}>{t.priority}</StatusPill>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: contact + files */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-muted">Primary Contact</div>
            {contact ? (
              <div className="flex items-center gap-3">
                <Avatar name={contact.name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-ink">{contact.name}</div>
                  <div className="text-[11px] text-ink-muted">{contact.role}</div>
                  <Link href={`/app/crm/contacts?id=${contact.id}`} className="mt-1 inline-block text-[11px] font-semibold text-violet">
                    View contact →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-[12px] text-ink-muted">No contact linked.</div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-muted">Company</div>
            <div className="flex items-center gap-3">
              <CompanyIcon name={deal.company} size={36} />
              <div>
                <div className="text-[13px] font-semibold text-ink">{deal.company}</div>
                <div className="text-[11px] text-ink-muted">Enterprise · 500-1,000 employees</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[12px] font-bold uppercase tracking-wider text-ink-muted">Files</div>
              <button className="text-[11px] font-semibold text-violet">+ Upload</button>
            </div>
            <div className="space-y-2">
              {["Proposal-v3.pdf", "MSA-signed.pdf", "Onboarding-plan.docx"].map((f) => (
                <div key={f} className="flex items-center gap-2 rounded-lg border border-line p-2">
                  <Paperclip className="h-3.5 w-3.5 text-ink-muted" />
                  <span className="flex-1 truncate text-[12px] text-ink">{f}</span>
                  <button className="text-ink-muted"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="mb-3 text-[12px] font-bold uppercase tracking-wider text-ink-muted">Deal Owner</div>
            <div className="flex items-center gap-3">
              <Avatar name={deal.owner} size={36} />
              <div>
                <div className="text-[13px] font-semibold text-ink">{deal.owner}</div>
                <div className="text-[11px] text-ink-muted">Account Executive</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StageBadge(_: DealStage) {
  return function BadgeIcon() { return null; };
}

function Metric({ icon: Icon, label, value, tone = "violet" }: { icon: any; label: string; value: string; tone?: "green" | "violet" | "blue" | "amber" | "red" | "teal" }) {
  const toneCls = { green: "text-emerald-600", violet: "text-violet", blue: "text-blue-600", amber: "text-amber-600", red: "text-red-600", teal: "text-teal-600" }[tone];
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {typeof Icon === "function" ? <Icon /> : <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className={"text-[18px] font-extrabold " + toneCls}>{value}</div>
    </div>
  );
}
