# Handoff package coverage audit

Audit of all 11 supplied packages against what is implemented. Verified against
production on 2026-09-04.

## Packages

| Package | Content | Status |
| --- | --- | --- |
| `Amplivanta_Marketplace_Connected_Dashboards_Developer_Handoff` | Master integration package: route catalog, nav targets, module/flags, RBAC, data-model rules, state machines, security/downloads, QA, launch decisions; Super Admin (49 screens) + User Dashboard (121) connected prototypes | Implemented |
| `UserMenu.zip` | User Dashboard developer handoff (104-screen route manifest) plus the per-module design batches | Implemented |
| `Amplivanta_Marketplace_Management_8_Pages_Final` | 8 Super Admin marketplace screens | Implemented |
| `Amplivanta_Seller_Marketplace_7_Screens_Final` | 6 seller screens + withdrawal drawer | Implemented |
| `Amplivanta_Marketplace_Legal_6_Documents` | 6 legal documents (DOCX/PDF) | Published at `/legal/*` |
| `Amplivanta_Marketing_Automation_9_Pages_Final` (and its duplicate) | 9 marketing automation screens | Subset of the 22 in the User Dashboard manifest |
| `Amplivanta_Marketing_Automation_Remaining_7_Locked` | 7 more marketing automation screens | Subset of the same 22 |
| `Amplivanta_Marketing_Automation_Extension_6_Locked` | 6 more marketing automation screens | Subset of the same 22 |
| `Amplivanta_Settings_Administration_8_Pages_Final_Locked` | 8 settings screens | Subset of the User Dashboard manifest |
| `Amplivanta_Seller_Marketplace_Final_Package` | Mechanical artwork + approved logo | Reference art only, nothing to implement |

The standalone module packs are all subsets of the 104-screen User Dashboard
manifest — 22 marketing automation, 15 social publishing, 12 growth
intelligence, 10 AI workspace, 9 CRM, 8 creative studio, 8 settings, 6 analytics,
5 integrations, 4 platform/pricing, 1 usage & credits sum to the manifest total.

## Route coverage, verified live

| Manifest | Routes | Result |
| --- | --- | --- |
| User Dashboard (104 screens) | 103 addressable | **103/103 resolve** |
| Marketplace route catalog | 25 (excl. the drawer) | **25/25 resolve** |
| Super Admin approved design manifest | 49 screens | **49/49 in the registry** (41 + 8 marketplace management) |
| Marketplace legal pack | 6 documents | **6/6 return 200** |

The 104th User Dashboard screen, `/app/partner-marketplace` ("Partner Marketplace
— coming soon"), is intentionally absent: the Marketplace handoff explicitly
removes that primary-nav entry and replaces it with the real Marketplace module.
Partner Program and Affiliate Program remain separate modules in Super Admin.

## How approved route names resolve

The approved manifests use `production_route` names this codebase does not use
(`/app/marketing-automation/*`, `/app/social-publishing/*`,
`/app/growth-intelligence/*`, `/app/ai-workspace/*`, `/app/analytics-reports/*`,
`/app/platform-experience-pricing/*`, `/admin/*`). Rather than renaming ~100 live
routes, `next.config.ts` carries an explicit, verified redirect for each approved
name to the route that implements it — 101 redirects, every destination checked
against the routes that actually exist.

Of the 104 User Dashboard screens: **91 redirected, 12 already native, 1
intentionally removed.**

## Screens actually built new for these packages

Everything else already existed. New in this work:

- 17 Marketplace buyer/seller routes + the withdrawal drawer
- 8 Super Admin Marketplace Management screens
- `/app/usage-credits`
- `/app/pricing-benchmark` (Pricing Benchmark & Positioning — internal,
  authorized roles only)
- 6 Marketplace legal documents

## Write paths and data sources (September 2026 gap closure)

An audit of "what can actually be done, not just seen" turned up three
classes of gap. All are now closed.

**Unreachable state machines.** Products could be created but no seller
action moved them out of `DRAFT`, so the moderation queue could never
receive anything and the catalogue could never hold a listing. Seller and
admin transitions now live in `lib/marketplace/product-policy.ts` — one
pure module, covered by `tests/product-policy.test.ts`, shared by both
sides so the two can never disagree. A seller can edit a draft, attach a
deliverable, submit, unpublish, archive and publish a new version; only an
admin can approve or publish.

**Entities with no write path.** Affiliate applications, affiliates,
affiliate payouts, partner programs, partner applications and partner
profiles were all read-only. `app/(admin)/admin/partner-actions.ts` adds
the decisions, and `components/admin/partner-panels.tsx` renders them.
Every action re-checks authorization, requires a reason and writes an
append-only audit event. Asset scan results can now be recorded from the
moderation queue, so an approval no longer bypasses the scan status the
schema already tracked.

**Screens that contradicted the live site.** The public-site tables (blog,
portfolio, services, team, reviews, site settings) plus admin activity,
billing, assigned support cases and saved reports had no
`lib/server/admin-queries.ts` spec, so the console showed "not connected to
a production data source yet" while the rows existed and the marketing site
rendered them. Specs added and verified against the production schema.

Feature flags now declare whether any code reads them. The console marks
the six unread flags as "Not built yet" and disables the toggle, so
flipping a switch is never mistaken for enabling a feature.

Screens that still show the "not connected" state do so truthfully: no
model backs them yet. That state is the honest answer, not a placeholder
to be filled with invented rows.

## Wishlist, sharing, AI assist and Social Publishing

**A public product route came first.** Products lived only behind sign-in, so
a shared link sent a recipient to a login redirect rather than the listing.
`/marketplace` and `/marketplace/products/[slug]` are crawlable, canonical, and
honour each seller's indexing preference; Open Graph and Twitter cards are
drawn from the listing so a shared link previews properly. Marketplace sits in
the top navigation after Solutions, and indexable listings join the sitemap.

**Wishlist** is one new table. A favourite grants nothing — it holds no price
and reserves no stock — so the page says so, and a product unpublished after
being saved is filtered out rather than linked into a dead end.

**AI SEO assist is suggest-then-accept.** The assistant returns copy into a
review panel; the seller applies it. Everything else on a listing is
seller-authored, and a meta description is a claim the seller is accountable
for, so a human puts it there. Throttled per seller, audited, and instructed
to describe only what the listing supports.

**Social Publishing** rendered a fixture array — invented posts with invented
engagement figures. The posts library now reads real workspace rows and the
composer writes them. No social channel is connected, so a post is drafted or
scheduled and never marked published; the page states that rather than
implying reach. Promoting a Marketplace product builds a draft from the
listing's image, copy and public link.

Feature flags: `favorites` and `sellerPromotion` now report as implemented.
Four flags remain unread by any code and are still marked "Not built yet".

## Browser tab presentation

Page titles each carried their own `— Amplivanta` while the root metadata
template appended `| Amplivanta`, so every tab read the brand twice. Titles now
carry only the page name; the homepage opts out of the template with an
absolute title. The tab icon was a dark green mark matching nothing else on
the site, and `/favicon.ico` returned 404 so browsers fell back to a generic
placeholder. The icon set is regenerated from the real brand mark in
`components/layout/LogoMark.tsx` as SVG, 32/192/512 PNG, a 180px apple-touch
icon and a multi-size `.ico`.
