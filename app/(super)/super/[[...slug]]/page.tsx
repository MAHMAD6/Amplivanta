import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  ClipboardList,
  Database,
  Download,
  FileText,
  Plus,
  Upload,
} from "lucide-react";
import { SuperDashboard } from "@/components/super/dashboard";
import { GrantAccessForm } from "@/components/super/grant-access-form";
import { SuperFilterBar, SuperPagination } from "@/components/super/filters";
import {
  SuperActionBar,
  SuperButton,
  SuperCard,
  SuperEmptyState,
  SuperInfoNote,
  SuperTable,
} from "@/components/super/primitives";
import { findSuperPage, type SuperPage } from "@/lib/super/registry";
import { hasLoader, loadSuperPage } from "@/lib/server/super-queries";

type Params = { slug?: string[] };
type Search = Record<string, string | string[] | undefined>;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = findSuperPage(slug);
  return { title: page ? `${page.page} — Super Admin` : "Super Admin" };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Singular noun used in the empty-state copy, derived from the page name. */
function subject(page: SuperPage) {
  const n = page.page.toLowerCase();
  if (n.includes("user")) return "users";
  if (n.includes("admin")) return "administrators";
  if (n.includes("role")) return "roles";
  if (n.includes("invitation")) return "invitations";
  if (n.includes("session")) return "sessions";
  if (n.includes("organization") || n.includes("tenant")) return "organizations";
  if (n.includes("invoice") || n.includes("billing")) return "invoices";
  if (n.includes("subscription")) return "subscriptions";
  if (n.includes("plan") || n.includes("pricing")) return "plans";
  if (n.includes("module")) return "modules";
  if (n.includes("flag")) return "feature flags";
  if (n.includes("affiliate")) return "affiliates";
  if (n.includes("partner")) return "partners";
  if (n.includes("commission")) return "commissions";
  if (n.includes("payout")) return "payouts";
  if (n.includes("ticket") || n.includes("case")) return "tickets";
  if (n.includes("audit") || n.includes("activity") || n.includes("log")) return "activity";
  if (n.includes("announcement")) return "announcements";
  if (n.includes("blog") || n.includes("content") || n.includes("article")) return "content";
  if (n.includes("application")) return "applications";
  return "records";
}

function ListPage({ page, result }: { page: SuperPage; result: Awaited<ReturnType<typeof loadSuperPage>> }) {
  const noun = subject(page);
  return (
    <>
      <SuperActionBar>
        <SuperButton icon={Download}>Export</SuperButton>
        <SuperButton icon={Upload}>Import</SuperButton>
        <SuperButton icon={Plus} variant="primary">
          New
        </SuperButton>
      </SuperActionBar>

      <Suspense fallback={<div className="mb-6 h-12 rounded-xl border border-line bg-white" />}>
        <SuperFilterBar searchPlaceholder={`Search ${noun}...`} />
      </Suspense>

      <SuperTable
        columns={page.columns}
        rows={
          result.rows.length
            ? result.rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-bg-soft">
                  {r.cells.map((c, i) => (
                    <td key={i} className="whitespace-nowrap px-6 py-4 text-[13px] text-ink">
                      {c ?? <span className="text-ink-muted">—</span>}
                    </td>
                  ))}
                </tr>
              ))
            : undefined
        }
        empty={
          hasLoader(page.key) && !result.connected ? (
            <SuperEmptyState
              icon={Database}
              title="Data source unavailable"
              description={`The platform database could not be reached, so ${noun} cannot be shown right now. This is a connection problem, not an empty result — retry once the service is available.`}
            />
          ) : (
            <SuperEmptyState
              icon={ClipboardList}
              title={`No ${noun} found`}
              description={
                hasLoader(page.key)
                  ? `No ${noun} match your current filters, or the platform has none yet.`
                  : `${page.page} is not connected to a production data source yet. Records will appear here once it is.`
              }
            />
          )
        }
      />

      <Suspense fallback={null}>
        <SuperPagination total={result.total} />
      </Suspense>

      <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
    </>
  );
}

function DetailPage({ page }: { page: SuperPage }) {
  return (
    <>
      <SuperActionBar>
        <SuperButton icon={FileText}>View audit trail</SuperButton>
        <SuperButton variant="primary">Edit</SuperButton>
      </SuperActionBar>
      <SuperCard>
        <SuperEmptyState
          icon={Database}
          title="No record selected"
          description={`Open a record from the list to review its ${page.page.toLowerCase()}. Details load from the platform database.`}
        />
      </SuperCard>
      <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
    </>
  );
}

function SettingsPage({ page }: { page: SuperPage }) {
  return (
    <>
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

function BoardPage({ page, result }: { page: SuperPage; result: Awaited<ReturnType<typeof loadSuperPage>> }) {
  if (hasLoader(page.key)) return <ListPage page={page} result={result} />;
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

export default async function SuperCatchAllPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const page = findSuperPage(slug);
  if (!page) notFound();

  // Approved destinations that already exist in the product live at their own
  // route; the nav links straight there, this is just a safety net.
  if (page.external) redirect(page.href);

  if (page.kind === "dashboard") return <SuperDashboard />;

  const sp = await searchParams;
  const result = await loadSuperPage(page.key, {
    q: one(sp.q),
    page: Number(one(sp.page) ?? "1") || 1,
    pageSize: Number(one(sp.pageSize) ?? "25") || 25,
  });

  // Grant Access / Credit is a fully built flow, not a placeholder screen.
  if (page.key === "quick-actions-grant-access-credit") {
    return (
      <>
        <GrantAccessForm />
        <SuperInfoNote title={`About ${page.page}`}>{page.objective}</SuperInfoNote>
      </>
    );
  }

  if (page.kind === "detail") return <DetailPage page={page} />;
  if (page.kind === "settings") return <SettingsPage page={page} />;
  if (page.kind === "board") return <BoardPage page={page} result={result} />;
  return <ListPage page={page} result={result} />;
}
