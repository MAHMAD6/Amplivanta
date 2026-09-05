# Super Admin — approved handoff implementation

Source package: `Amplivanta_Super_Admin_Developer_Handoff` (index.html, app.js,
`route-manifest.json`, 41 approved design screens, `FINAL_APPROVED_SUPER_ADMIN_DASHBOARD.png`).

## What was built

| Piece | Location |
| --- | --- |
| Route/IA registry (generated from `route-manifest.json`) | `lib/admin/registry.ts` |
| Navy shell — sidebar, sections, badges, collapse, header, footer | `components/admin/super-shell.tsx` |
| Page primitives — cards, table, empty states, stat tiles, info note | `components/admin/primitives.tsx` |
| Search / filter / pagination (URL-driven) | `components/admin/filters.tsx` |
| Super Admin Dashboard (approved visual reference) | `components/admin/dashboard.tsx` |
| Grant Access / Credit flow | `components/admin/grant-access-form.tsx`, `app/(super)/admin/actions.ts` |
| Data loaders (real Prisma queries) | `lib/server/super-queries.ts` |
| Single renderer for every destination | `app/(super)/admin/[[...slug]]/page.tsx` |
| Platform governance models | `prisma/schema.prisma` (Super Admin section) |

194 destinations total: **106 built under `/super`**, **88 deep-linked** to screens that
already exist in the product.

## Decisions

1. **Brand color.** `admin-navy #071F45` (handoff rule 3) is a new token scoped to the
   Super Admin shell. Marketing keeps `deep-navy #0B2350` so approved public pages are
   unchanged.
2. **Deep-linking.** The manifest's PLATFORM product routes (CRM, Social Publishing,
   Marketing Automation, Creative Studio, AI Management, Integrations) and the PUBLIC
   EXPERIENCE routes already exist under `/app` and the public site. The Super Admin nav
   preserves the approved IA but links to those screens (marked with an ↗ icon) rather
   than duplicating them. Content Management is **not** deep-linked — it ships with
   approved designs, so it is built under `/super`.
3. **One renderer, many page families.** Per the handoff's own note, destinations are
   rendered from the registry by kind (`dashboard`, `list`, `detail`, `settings`,
   `board`) instead of 106 near-identical files.
4. **No fabricated data (rule 5).** Every loader queries the real database. A page with
   no connected source renders "not connected to a production data source yet"; a
   database that cannot be reached renders "Data source unavailable" — deliberately
   distinct from "no records", so an outage never reads as an empty platform. The old
   `lib/super-data.ts` mock metrics were deleted.
5. **Server-side authorization (rule 7).** `/super` is gated by middleware plus the
   layout's `SUPER_ADMIN` check, and `grantAccessCredit` re-checks the role in the server
   action. A reason is mandatory and every grant writes a `PlatformAuditLog` row (rule 11).

## Gap closure (second pass)

All eight gaps from the first pass were closed:

1. **Careers** — `JobOpening` / `JobApplication` models added, wired to the Careers and
   Applications screens, with a working "Add Job Opening" form (`createJobOpening`).
2. **Duplicate destinations** — the registry now carries `canonical`. Duplicated routes
   (Audit Log ×4, Roles & Permissions ×3, Module Controls, System Health, Security & 2FA,
   Data Management, API & Domains, Billing & Subscription, Help Center, and the Quick
   Action shortcuts) keep their approved route but inherit one canonical implementation —
   same columns, filters and loader.
3. **Producers** — System Health is populated by `runSystemHealthCheck`, which probes the
   database, user directory, billing and audit log and writes measured `SystemHealthCheck`
   rows. Domains, API keys, deliverability, landing-page publishing and connected apps are
   wired to their existing models. Pricing benchmarks are populated by CSV import.
4. **Detail routes** — `findSuperPage` treats an unmatched trailing segment as a record id,
   so `<detail route>/<id>` loads that record via `loadSuperRecord`. List rows link into it.
5. **Export / Import / filters / bulk** — CSV export at `/api/admin/export` (honours the
   active search and filters, escapes formula injection, and is itself audit-logged); CSV
   import for reference data only (suppression list, pricing benchmarks); real per-screen
   filter dropdowns wired to the query layer; row selection with "Export selected".
6. **Foreign keys** — governance models now use real relations to `User` and `Organization`
   instead of loose id columns.
7. **Accessibility** — audited and fixed: heading order, duplicate SVG gradient ids,
   sidebar label and badge contrast (page now reports 0 contrast failures), focus ring on
   the navy surface, labelled controls, `scope` on table headers.
8. **Directory picker** — Grant Access / Credit uses a type-ahead backed by
   `/api/admin/directory`, so a grant binds to a real user or organization id.

## Remaining follow-ups

- **Write actions beyond the ones built.** Grant Access / Credit, job-opening creation,
  diagnostics and CSV import are implemented. Other row actions (Revoke, Suspend, Resend,
  Approve) still render as labels — each needs its own authorized, audited server action.
- **`Growth Audit™`** appears in the manifest with a corrupted trademark character; the
  registry strips it.
- **Analytics screens** (Reports & Analytics, Content Analytics, Usage & Costs ingestion)
  have models and empty states but no aggregation job writing rows yet.
- **Import is intentionally limited** to suppression lists and pricing benchmarks.
  Governance and billing records must originate from their own system of record.
- **Accessibility** is verified for contrast, headings, labels, ids and focus. A screen
  reader pass on the collapsible nav and the import dialog has not been done.

## Regenerating the registry

`lib/admin/registry.ts` is generated. Re-run the generator against an updated
`route-manifest.json` rather than hand-editing it, then re-apply the deep-link map and the
per-screen column definitions it carries.

## Consolidation and gap closure (2026-09-06)

The `/super` console and the legacy `/admin` CMS are now **one surface at `/admin`**.
`/super` and `/super/:path*` redirect there. `/admin/marketplace/*` and
`/admin/system/*` are real routes now, which is what the marketplace handoff
specified natively. `/admin` requires SUPER_ADMIN, ADMIN or OWNER.

Gaps closed in this pass:

| Gap | Resolution |
| --- | --- |
| Orders marked PAID without a charge | Placing an order no longer grants access. `fulfilOrder` is the only path to PAID/ACCESS_READY and refuses a non-zero order without a confirmed payment. Signed webhook at `/api/webhooks/marketplace`. |
| Migration history 55 tables behind | Reconcile migration generated against a shadow database and baselined; `prisma migrate status` reports up to date. |
| Scoped RBAC modelled but unenforced | `lib/server/rbac.ts` unions role grants with non-expired `AdminAssignment`s at Global/Org/Workspace/Module scope. `canGrant` blocks escalation. |
| Console effectively read-only | Roles, access grants/revokes, invitations, session revoke, suspend/lift, DSAR, announcements, tickets, marketplace settings all have working, audited write paths. |
| Fabricated metrics in the product UI | 134 hardcoded KPI values across 44 pages and 7 fake trend charts replaced with honest empty states. |
| Stale cart pricing | Checkout re-resolves each line to the newest published version. |
| Downloads permanently blocked | Scanning is required unless an operator explicitly records a decision to run without a scanner; admins can record scan results. |
| No chargeback ingestion | `chargeback.opened` opens a dispute and revokes entitlements. |
| Partial module evaluation | Global kill switch, then plan/entitlement, then org/workspace override. |
| Thin catalogue | Category and type filters, pagination, and real product listings on category and store pages. |
| No tests | 38 tests, covering the RBAC scoping/escalation rules and the fulfilment guards. |
| Accessibility | User app shell audited and fixed; audited pages report zero contrast, duplicate-id, heading-order and unnamed-control issues. |
| Naming | Partner Marketplace displays as "Partner Program", matching the handoff vocabulary. |

### Still open

- Paid checkout, payouts and downloads stay blocked until an operator sets the
  provider ids in Marketplace Settings. The mechanisms are built and tested.
- The HTTP purchase flow is not click-tested end to end; the data layer and the
  policy rules are.
- Reviews, favorites, coupons, bundles and sponsored listings remain Phase 4 /
  flag-gated with no UI.
- The legacy CMS pages render inside the new console shell but keep their own
  older styling.
