# Super Admin — approved handoff implementation

Source package: `Amplivanta_Super_Admin_Developer_Handoff` (index.html, app.js,
`route-manifest.json`, 41 approved design screens, `FINAL_APPROVED_SUPER_ADMIN_DASHBOARD.png`).

## What was built

| Piece | Location |
| --- | --- |
| Route/IA registry (generated from `route-manifest.json`) | `lib/super/registry.ts` |
| Navy shell — sidebar, sections, badges, collapse, header, footer | `components/super/super-shell.tsx` |
| Page primitives — cards, table, empty states, stat tiles, info note | `components/super/primitives.tsx` |
| Search / filter / pagination (URL-driven) | `components/super/filters.tsx` |
| Super Admin Dashboard (approved visual reference) | `components/super/dashboard.tsx` |
| Grant Access / Credit flow | `components/super/grant-access-form.tsx`, `app/(super)/super/actions.ts` |
| Data loaders (real Prisma queries) | `lib/server/super-queries.ts` |
| Single renderer for every destination | `app/(super)/super/[[...slug]]/page.tsx` |
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

## Gaps / follow-ups

- **Careers content screens** (Job Openings, Add Job Opening, Job Opening Detail,
  Applications, Application Details) exist in the approved designs but have **no entry in
  `route-manifest.json`**. They were added to the registry under Content Management using
  the design as the spec.
- **`Growth Audit™`** appears in the manifest with a corrupted trademark character; the
  registry strips it.
- **Duplicate destinations.** The manifest lists the same page in several groups (Audit
  Log ×4, Roles & Permissions ×3, Email Deliverability, Publish & Domains, Landing Page
  Publishing, Billing & Subscription, Security & 2FA, Help Center). Each keeps its own
  route so the approved IA is intact; they share loaders.
- **Governance models use plain id columns** for `userId` / `organizationId` rather than
  foreign keys, to keep the addition self-contained and avoid migrating existing tables.
  Referential integrity for those links is not enforced by the database yet.
- **Not yet wired to a source:** system health/uptime, usage & costs ingestion, pricing
  benchmarks, deliverability, domains, and the analytics/report-builder screens. They have
  models and/or empty states but no producer writing rows.
- **Directory lookup** in Grant Access / Credit takes a raw identifier; there is no user or
  organization picker yet.
- **Detail screens** render a "no record selected" state — deep record pages (Admin /
  Sub-Admin Detail, Deal Detail, Ticket Detail, Application Details) need per-record routes
  once the list screens can link to ids.
- **Bulk actions, Export/Import, and the Filters button** are present per the designs but
  not yet implemented.
- **Accessibility QA** (rule 17: keyboard, focus, labelling, contrast, screen reader) has
  not been run against the built screens.

## Regenerating the registry

`lib/super/registry.ts` is generated. Re-run the generator against an updated
`route-manifest.json` rather than hand-editing it, then re-apply the deep-link map and the
per-screen column definitions it carries.
