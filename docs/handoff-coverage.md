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

## Action feedback and responsive behaviour

**Every action result is a toast.** Write flows each carried their own inline
banner, so a result could land below the fold, inside a popover the reader had
already closed, or in a panel they had scrolled past. `lib/action-toast.ts`
reports the standard action result through sonner, which was already a
dependency and already mounted in the app and admin shells; the marketing and
auth shells now mount it too, because the public product page has write flows
of its own. Warnings are distinct from errors: AI copy produced without a
configured key, and a promotion draft assembled from the listing rather than
written, both warn instead of reporting plain success.

**Responsive.** A sweep found the public marketing pages already sound and two
classes of breakage on surfaces behind sign-in:

- 34 data tables rendered with no horizontal scroll container, so on a phone
  they widened the page and pushed everything else sideways. Each is now inside
  an `overflow-x-auto` box, with a minimum width where it has four or more
  columns so columns stay readable while scrolling rather than being crushed.
- Six screens build tables from CSS grid with fixed pixel tracks totalling
  640–690px. Those rows carry a matching minimum width and their card scrolls,
  preserving column alignment instead of collapsing it.
- The Share and Promote popovers carried fixed 268px and 340px widths; anchored
  to the right edge of a padded container on a 375px screen the Promote panel
  ran past the viewport. Both are capped to the available width.
- The wizard's product-URL field paired a long path prefix with its input,
  which cannot fit on a phone, so the pair stacks below the small breakpoint.

`grid-cols-2` and `grid-cols-3` without a breakpoint prefix appear in 48 places
and were deliberately left alone: at phone width a two-up row of short stat
tiles reads correctly, and changing them blind would regress layouts that are
working.

### Verifying the table fixes

Checking this in a browser proved unreliable: while the preview pane is
hidden the page is not laid out, so `getBoundingClientRect` returns zeros and
`scrollWidth === clientWidth` — every page looks perfect. Only readings taken
with real content present (`document.body.innerText.length` above a threshold)
and screenshots whose frame matched the emulated viewport were trusted.

The dependable check is structural: walk the JSX by indentation and confirm
each `<table>` or wide row has a scroll container among its own ancestors. A
whole-file grep cannot do this — a scroller elsewhere in the file will vouch
for a table it does not contain, which is how the first pass reported
Import/Export as clean while its Job History table was still clipped.

Three cards used `overflow-hidden`, which clips rather than scrolls, so
columns past the screen edge were unreachable rather than merely awkward.
Those now scroll.

Pages whose loaders read the database cannot be checked on a machine without
one: they render the error boundary locally. They were verified structurally
only.

## New public design (September 2026 handoff)

The approved handoff arrived as standalone HTML and screenshots. It was
rebuilt in Tailwind rather than ported — the delivered markup and CSS are a
reference, not source. A `site-*` colour family carries the public palette so
the marketing surface cannot disturb the app or admin tokens.

**Shell.** `components/marketing/site-shell.tsx` (header, footer) is mounted by
the marketing layout and derives the active nav item from the pathname.
`components/marketing/site-ui.tsx` holds the section vocabulary every page
composes. Social marks are non-linking glyphs until official profile URLs are
confirmed, per the handoff README.

**Content registries.** Platform, Solutions, Industries and Resources pages
render from `lib/site-*.ts`; the section indexes and homepage list from the
same registries, so a new entry appears everywhere without a second edit.

**Pricing.** `lib/site-pricing.ts` holds list prices and the two published
discounts; every displayed figure is derived and rounded to cents explicitly,
and `tests/site-pricing.test.ts` locks the reference's numbers. The annual
total is computed from the unrounded rate — the rounded monthly figure × 12
would bill 396.96 where the reference bills 396.90.

**Marketplace.** Content Creation disclosure (Human-created / AI-assisted /
Primarily AI-generated) is required on every new listing — enum, wizard field,
server check, and a badge on both product pages.

The public storefront follows the eight reference screens: home (search bar,
hero, six type tiles, info strip), Browse Products (Product Type / License /
Creation filters and sort), category collections, product detail (price card,
facts, wishlist / share / promote, section tabs), a public seller store,
Sell on Amplivanta, cart, and the checkout sign-in gate. Collections are the
six `MarketplaceProductType` values (`lib/marketplace/storefront.ts`), so none
needs admin setup or can show a category that holds nothing. Every filter is a
GET form, so results work before hydration and have shareable URLs. Buying,
carting and wishlisting send a signed-out visitor to sign in and back to the
in-app page; a signed-in visitor to `/marketplace/cart` or `/checkout` goes
straight to the real one. Only approved sellers have a public store.

**Resources.** Blog renders real posts. Videos, webinars, templates and Help
Center read deliberately empty registries in `lib/site-resource-items.ts`; the
reference forbids sample content and there is no public content source yet.
Each index has the reference's library panel — hero search, topic cards that
filter it, search / topic / sort controls, quick-filter chips on webinars and
Help Center, and a no-results state distinct from "nothing published". The
unfiltered listing is the Suspense fallback, so it is in the server HTML.

**Header.** Matches the locked master header: Platform, Solutions,
Marketplace, Resources, Pricing, Company, Help. Industries is not in it; those
pages remain reachable from the homepage and sitemap.

**Button classes live in `components/marketing/site-buttons.ts`.** They were
exported from `site-shell.tsx`, which is `"use client"`. A server component
importing a constant from a client module receives a client reference, not
the string, so every server page rendered its buttons unstyled. Typecheck and
build both pass in that state; the symptom is `Attempted to call btnPrimary()`
inside a `class` attribute in the HTML. Keep shared constants out of client
modules.

**Usage & Credits** (`/app/usage-credits`) follows the reference layout.
`loadUsageOverview()` reads the real billing period and any numeric limits in
the plan's `limits` JSON. There is no metering pipeline, so usage values are
null and render as "Not available yet" rather than estimates; wire sources in
that loader when they exist.

**Not yet compared screen by screen:** the in-app Marketplace buyer (3), seller
(11) and Super Admin (8) screens from the final polished set. Those routes were
built from the earlier Marketplace package and exist; this pass did not diff
them against the updated screenshots.

**404s.** The root `app/loading.tsx` is gone: its Suspense boundary made
unknown slugs stream HTTP 200 with the not-found page. With it removed,
`notFound()` returns a real 404 on every dynamic public route. Do not
reintroduce a root loading boundary over the public site. (`dynamicParams =
false` was tried as well and dropped: it is redundant once the boundary is
gone, and Next logs a NoFallbackError stack trace for every refused slug.)

## External providers (External API Master Revision)

The code for each V1 provider is in place and stays off until its
credentials are set; nothing is shown as available before then. Variables
are documented in `.env.example`.

| Provider | Switch on with | What it does |
| --- | --- | --- |
| Stripe subscriptions | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, plan price IDs | Existing Checkout; the webhook now dedupes every event in `ProviderEvent` |
| Stripe one-time credits | the above + `CREDIT_PACKS` (JSON) | `POST /api/billing/credits/checkout`; webhook verifies amount and currency, then posts to the credit ledger once |
| Credit wallet / ledger | always on | `CreditWallet` (plan and purchased buckets) and append-only `CreditLedgerEntry`; plan credits are consumed first; unique source keys make grants idempotent |
| Marketplace payments | Stripe keys + Marketplace setting `payment.provider = {"provider":"stripe"}` | Paid orders go to Stripe Checkout from the order's own snapshot; full refunds are submitted to Stripe |
| Stripe Connect | `STRIPE_CONNECT_ENABLED=true` | Express onboarding from seller settings; `account.updated` is audited. Phase 2 — keep off until payout reconciliation and dispute policy are approved |
| IONOS storage | `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` (R2 vars still work) | Presigned uploads; Marketplace downloads are presigned and expire |
| Amazon SES | `EMAIL_PROVIDER=ses`, `SES_REGION`, `SES_SMTP_USER/PASS`, `SES_CONFIGURATION_SET`, `SES_SNS_TOPIC_ARNS` | Sends through the SES SMTP interface; `/api/webhooks/ses` verifies SNS signatures and suppresses hard bounces and complaints |
| Google / Microsoft sign-in | `AUTH_GOOGLE_*`, `AUTH_MICROSOFT_ENTRA_ID_*` | Buttons appear on the login page; links an existing account by verified email, then matches by provider subject (`UserIdentity`). Never creates an account on its own |
| Microsoft integration OAuth | `MICROSOFT_CLIENT_ID/SECRET`, `MICROSOFT_TENANT` | Connected-data OAuth alongside Google and HubSpot; tokens encrypted at rest |
| Cloudflare Turnstile | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Widget on signup, contact and affiliate forms; server verification fails closed |

**Fixed along the way.** `/api/billing/checkout` activated any paid plan free
in production when Stripe was unconfigured; that shortcut is now
development-only. Marketplace `issueSignedUrl` returned a permanent
base-URL link; it now presigns. The contact and affiliate forms sent field
names the API rejects, so every submission failed validation.

**Not built:** OpenAI, fal.ai, Google Analytics/Ads, Meta Marketing, Cloudflare
DNS/WAF automation and the Phase 1.1+ connectors. These are growth-data and AI
workstreams beyond payments, email, storage and identity.
