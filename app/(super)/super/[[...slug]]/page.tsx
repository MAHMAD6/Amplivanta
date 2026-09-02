import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ClipboardList, Database, Plus } from "lucide-react";
import { SuperDashboard } from "@/components/super/dashboard";
import { GrantAccessForm } from "@/components/super/grant-access-form";
import { JobOpeningForm } from "@/components/super/job-opening-form";
import { SuperFilterBar, SuperPagination } from "@/components/super/filters";
import {
  SuperExportButton,
  SuperHealthCheckButton,
  SuperImportButton,
  SuperSelectableTable,
} from "@/components/super/table-actions";
import {
  SuperActionBar,
  SuperButton,
  SuperCard,
  SuperEmptyState,
  SuperInfoNote,
  SuperTable,
} from "@/components/super/primitives";
import { detailParent, findSuperPage, SUPER_PAGE_BY_KEY, type SuperPage } from "@/lib/super/registry";
import { importableHeaders } from "@/app/(super)/super/actions";
import { hasLoader, loadSuperPage, loadSuperRecord, type SuperResult } from "@/lib/server/super-queries";

type Params = { slug?: string[] };
type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const found = findSuperPage(slug);
  return { title: found ? `${found.page.page} — Super Admin` : "Super Admin" };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Plural noun used in empty-state copy, derived from the page name. */
function subject(page: SuperPage) {
  const n = page.page.toLowerCase();
  if (n.includes("job opening") || n.includes("careers")) return "job openings";
  if (n.includes("application")) return "applications";
  if (n.includes("user")) return "users";
  if (n.includes("admin")) return "administrators";
  if (n.includes("role")) return "roles";
  if (n.includes("invitation")) return "invitations";
  if (n.includes("session")) return "sessions";
  if (n.includes("organization") || n.includes("tenant")) return "organizations";
  if (n.includes("invoice") || n.includes("billing")) return "invoices";
  if (n.includes("subscription")) return "subscriptions";
  if (n.includes("plan") || n.includes("pricing") || n.includes("benchmark")) return "plans";
  if (n.includes("module")) return "modules";
  if (n.includes("flag")) return "feature flags";
  if (n.includes("affiliate")) return "affiliates";
  if (n.includes("partner")) return "partners";
  if (n.includes("commission")) return "commissions";
  if (n.includes("payout")) return "payouts";
  if (n.includes("ticket") || n.includes("case")) return "tickets";
  if (n.includes("audit") || n.includes("activity") || n.includes("log")) return "activity";
  if (n.includes("announcement")) return "announcements";
  if (n.includes("domain")) return "domains";
  if (n.includes("health")) return "health checks";
  if (n.includes("blog") || n.includes("content") || n.includes("article")) return "content";
  return "records";
}

function EmptyFor({ page, result }: { page: SuperPage; result: SuperResult }) {
  const noun = subject(page);
  if (hasLoader(page.canonical) && !result.connected) {
    return (
      <SuperEmptyState
        icon={Database}
        title="Data source unavailable"
        description={`The platform database could not be reached, so ${noun} cannot be shown right now. This is a connection problem, not an empty result — retry once the service is available.`}
      />
    );
  }
  return (
    <SuperEmptyState
      icon={ClipboardList}
      title={`No ${noun} found`}
      description={
        hasLoader(page.canonical)
          ? `No ${noun} match your current filters, or the platform has none yet.`
          : `${page.page} is not connected to a production data source yet. Records will appear here once it is.`
      }
    />
  );
}

async function ListPage({ page, result }: { page: SuperPage; result: SuperResult }) {
  const connected = hasLoader(page.canonical);
  const importHeaders = await importableHeaders(page.canonical);
  // Rows link through to the detail screen that opens this list's records.
  const detail = [...SUPER_PAGE_BY_KEY.values()].find((p) => p.detailOf === page.key);

  return (
    <>
      <SuperActionBar>
        <Suspense fallback={null}>
          <SuperExportButton pageKey={page.key} disabled={!connected} />
        </Suspense>
        <SuperImportButton pageKey={page.canonical} headers={importHeaders} />
        {page.canonical === "content-management-careers-job-openings" ? (
          <SuperButton icon={Plus} variant="primary" href="/super/content-management/add-job-opening">
            New job opening
          </SuperButton>
        ) : (
          <SuperButton icon={Plus} variant="primary" disabled>
            New
          </SuperButton>
        )}
      </SuperActionBar>

      <Suspense fallback={<div className="mb-6 h-12 rounded-xl border border-line bg-white" />}>
        <SuperFilterBar searchPlaceholder={`Search ${subject(page)}...`} filters={page.filters} />
      </Suspense>

      {page.canonical === "system-management-system-health" && (
        <div className="mb-6">
          <SuperHealthCheckButton />
        </div>
      )}

      {result.rows.length ? (
        <SuperSelectableTable
          columns={page.columns}
          rows={result.rows}
          pageKey={page.key}
          detailHref={detail?.href}
        />
      ) : (
        <SuperTable columns={page.columns} empty={<EmptyFor page={page} result={result} />} />
      )}

      <Suspense fallback={null}>
        <SuperPagination total={result.total} />
      </Suspense>

      <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
    </>
  );
}

async function DetailPage({ page, recordId }: { page: SuperPage; recordId?: string }) {
  const parent = detailParent(page);
  const backLink = parent && (
    <Link
      href={parent.href}
      className="mb-5 inline-flex items-center gap-2 text-[13px] font-bold text-royal-blue hover:underline"
    >
      <ArrowLeft className="h-4 w-4" /> Back to {parent.page}
    </Link>
  );

  if (!recordId || !parent) {
    return (
      <>
        {backLink}
        <SuperCard>
          <SuperEmptyState
            icon={Database}
            title="No record selected"
            description={
              parent
                ? `Open a record from ${parent.page} to review it here.`
                : `This screen opens a single record. Select one from its list screen.`
            }
            action={parent ? <SuperButton href={parent.href}>Go to {parent.page}</SuperButton> : undefined}
          />
        </SuperCard>
        <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
      </>
    );
  }

  const record = await loadSuperRecord(parent.canonical, recordId, parent.columns);

  return (
    <>
      {backLink}
      <SuperCard>
        {record ? (
          <div className="px-6 py-2">
            {record.fields
              .filter((f) => f.label !== "Actions")
              .map((f) => (
                <div key={f.label} className="flex items-start justify-between gap-6 border-b border-line py-4 last:border-0">
                  <dt className="text-[13px] font-semibold text-ink-soft">{f.label}</dt>
                  <dd className={f.value ? "text-[13.5px] font-semibold text-admin-navy" : "text-[13px] text-ink-muted"}>
                    {f.value ?? "Not recorded"}
                  </dd>
                </div>
              ))}
          </div>
        ) : (
          <SuperEmptyState
            icon={Database}
            title="Record not found"
            description={`No record with id ${recordId} exists in ${parent.page}, or the platform database could not be reached.`}
            action={<SuperButton href={parent.href}>Back to {parent.page}</SuperButton>}
          />
        )}
      </SuperCard>
      <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
    </>
  );
}

function SettingsPage({ page }: { page: SuperPage }) {
  return (
    <>
      {page.canonical === "system-management-system-health" && (
        <div className="mb-6">
          <SuperHealthCheckButton />
        </div>
      )}
      <SuperCard>
        <SuperEmptyState
          icon={Database}
          title="Not connected yet"
          description={`${page.page} has no connected production source. Controls become available once the underlying service is configured — no placeholder values are shown.`}
        />
      </SuperCard>
      <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
    </>
  );
}

export default async function SuperCatchAllPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const found = findSuperPage(slug);
  if (!found) notFound();
  const { page, recordId } = found;

  // Approved destinations that already exist in the product live at their own
  // route; the nav links straight there, this is just a safety net.
  if (page.external) redirect(page.href);

  if (page.kind === "dashboard") return <SuperDashboard />;

  if (page.key === "quick-actions-grant-access-credit") {
    return (
      <>
        <GrantAccessForm />
        <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
      </>
    );
  }

  if (page.key === "content-management-add-job-opening") {
    return (
      <>
        <Link
          href="/super/content-management/careers-job-openings"
          className="mb-5 inline-flex items-center gap-2 text-[13px] font-bold text-royal-blue hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Careers / Job Openings
        </Link>
        <JobOpeningForm />
        <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
      </>
    );
  }

  if (page.kind === "detail") return <DetailPage page={page} recordId={recordId} />;
  if (page.kind === "settings") return <SettingsPage page={page} />;

  const sp = await searchParams;
  const filters: Record<string, string | undefined> = {};
  for (const f of page.filters) {
    const v = one(sp[f.key]);
    if (v) filters[f.key] = v;
  }

  const result = await loadSuperPage(page.canonical, {
    q: one(sp.q),
    page: Number(one(sp.page) ?? "1") || 1,
    pageSize: Number(one(sp.pageSize) ?? "25") || 25,
    filters,
  });

  if (page.kind === "board" && !hasLoader(page.canonical)) {
    return (
      <>
        <SuperCard>
          <SuperEmptyState
            icon={Database}
            title="No data available"
            description={`${page.page} will populate once its production data source is connected. Metrics are never estimated or filled with sample values.`}
          />
        </SuperCard>
        <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
      </>
    );
  }

  return <ListPage page={page} result={result} />;
}
