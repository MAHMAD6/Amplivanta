import type { Metadata } from "next";
import { BarChart3, Lock } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Pricing Benchmark & Positioning" };

const COLUMNS = ["Benchmark / Source", "Plan / Tier", "Price", "Value Dimensions", "Effective Date", "Notes"];

const AUTHORIZED = new Set(["SUPER_ADMIN", "ADMIN", "OWNER"]);

function Control({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-[12.5px] font-bold text-deep-navy">{label}</div>
      <div className="flex h-12 items-center rounded-xl border border-line bg-white px-3.5 text-[13.5px] text-ink-muted">
        {value}
      </div>
    </div>
  );
}

export default async function PricingBenchmarkPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  // Internal screen: authorization is enforced here, not by hiding the nav item.
  if (!role || !AUTHORIZED.has(role)) {
    return (
      <>
        <MpHeader
          title="Pricing Benchmark & Positioning"
          breadcrumb={[{ label: "Settings", href: "/app/settings" }, { label: "Benchmark & Positioning" }]}
        />
        <MpCard>
          <MpEmpty
            icon={Lock}
            title="Internal — authorized roles only"
            description="Pricing benchmarks are an internal workspace. Your role does not include access to it."
          />
        </MpCard>
      </>
    );
  }

  let rows: { id: string; competitor: string; planName: string; price: number; currency: string; interval: string; capturedAt: Date; sourceUrl: string | null }[] | null = null;
  try {
    rows = await prisma.pricingBenchmark.findMany({ orderBy: { capturedAt: "desc" }, take: 200 });
  } catch {
    rows = null;
  }

  const money = (n: number, c: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(n);
  const date = (d: Date) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(d);

  return (
    <>
      <MpHeader
        title="Pricing Benchmark & Positioning"
        description="Internal workspace for reviewing maintained pricing benchmarks and positioning assumptions."
        breadcrumb={[
          { label: "Settings", href: "/app/settings" },
          { label: "Internal Pricing" },
          { label: "Benchmark & Positioning" },
        ]}
        action={
          <div className="flex flex-wrap gap-2.5">
            <MpButton
              href="/super/plans-pricing/pricing-benchmark-and-positioning"
              variant="primary"
            >
              Add Benchmark
            </MpButton>
            <MpButton disabled title="Export becomes available once benchmark data exists.">
              Export
            </MpButton>
          </div>
        }
      />

      <div className="mb-6 inline-flex items-center gap-2 rounded-xl border border-orange-cta/40 bg-orange-cta/[0.06] px-4 py-2.5 text-[12.5px] font-bold text-orange-cta">
        Internal — Authorized Roles Only
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <MpCard className="h-fit p-6">
          <h2 className="mb-5 text-[16px] font-bold text-deep-navy">Benchmark Controls</h2>
          <Control label="Benchmark Set" value="Not configured" />
          <Control label="Effective Date" value="Not selected" />
          <Control label="Comparison Dimension" value="Plan / Price / Capabilities" />
          <Control label="Currency" value="Use benchmark source" />
          <div className="mb-4">
            <div className="mb-1.5 text-[12.5px] font-bold text-deep-navy">Assumptions & Notes</div>
            <div className="min-h-[140px] rounded-xl border border-line bg-white px-3.5 py-3 text-[13px] text-ink-muted">
              No internal pricing notes yet.
            </div>
          </div>
          <MpButton disabled title="Notes are saved once a benchmark set is configured.">Save Notes</MpButton>
        </MpCard>

        <div>
          <MpCard>
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-[16px] font-bold text-deep-navy">Benchmark Dataset</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    {COLUMNS.map((c) => (
                      <th key={c} scope="col" className="whitespace-nowrap px-6 py-3.5 text-left text-[12.5px] font-bold text-deep-navy">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                {rows && rows.length > 0 && (
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b border-line last:border-0">
                        <td className="px-6 py-3.5 text-[13px] font-semibold text-deep-navy">{r.competitor}</td>
                        <td className="px-6 py-3.5 text-[13px] text-ink">{r.planName}</td>
                        <td className="px-6 py-3.5 text-[13px] text-ink">{money(r.price, r.currency)}</td>
                        <td className="px-6 py-3.5 text-[13px] text-ink-muted">per {r.interval}</td>
                        <td className="px-6 py-3.5 text-[13px] text-ink">{date(r.capturedAt)}</td>
                        <td className="px-6 py-3.5 text-[13px] text-ink-muted">{r.sourceUrl ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
            {(!rows || rows.length === 0) && (
              <MpEmpty
                icon={BarChart3}
                title={rows === null ? "Benchmark data unavailable" : "No benchmark data loaded"}
                description={
                  rows === null
                    ? "The platform database could not be reached, so benchmarks cannot be shown right now."
                    : "External comparison inputs will appear only after an authorized user adds maintained benchmark data."
                }
              />
            )}
          </MpCard>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <MpCard className="p-6">
              <h3 className="text-[15px] font-bold text-deep-navy">Amplivanta Positioning</h3>
              <div className="py-8 text-center">
                <div className="text-[15px] font-bold text-deep-navy">No positioning comparison yet</div>
                <p className="mt-1.5 text-[12.5px] text-ink-soft">
                  Plan/value comparisons appear when benchmark inputs exist.
                </p>
              </div>
            </MpCard>
            <MpCard className="p-6">
              <h3 className="text-[15px] font-bold text-deep-navy">Data Governance</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                Benchmark records retain source attribution, assumptions, effective dates and update
                history. External pricing inputs are maintainable without code changes.
              </p>
            </MpCard>
          </div>
        </div>
      </div>

      <MpNote title="Where benchmark data comes from">
        Benchmarks are maintained records, not scraped estimates. They are added through Super Admin
        (Plans &amp; Pricing → Pricing Benchmark) or imported as CSV, and every row keeps its source.
      </MpNote>
    </>
  );
}
