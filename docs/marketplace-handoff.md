# Marketplace — approved integration handoff

Source: `Amplivanta_Marketplace_Connected_Dashboards_Developer_Handoff` plus the Seller
Marketplace, Marketplace Management, and Marketplace Legal packages.

**Marketplace** = downloadable marketing products.
**Partner Program** = business/solution partnerships.
**Affiliate Program** = referral/commission relationships.
These stay separate modules — do not collapse them.

## What was built (Phase 0 + catalogue/seller/order surface)

| Piece | Location |
| --- | --- |
| Module id, feature flags, permissions, role grants | `lib/marketplace/config.ts` |
| Access evaluation + nav visibility + route guard | `lib/server/marketplace-access.ts` |
| Data model (18 models, enums mirroring the state machines) | `prisma/schema.prisma` |
| Buyer + seller screens (17 routes) | `app/(app)/app/marketplace/**` |
| Marketplace UI primitives | `components/marketplace/ui.tsx` |
| Seller application / product / settings / withdrawal forms | `components/marketplace/forms.tsx` |
| Server actions (all authorized + audited) | `app/(app)/app/marketplace/actions.ts` |
| Super Admin Marketplace Management (8 screens) | `lib/super/registry.ts`, `lib/server/super-queries.ts` |
| Six Marketplace legal documents | `lib/marketplace-legal-docs.ts` → `/legal/<slug>` |

Super Admin totals moved from 194 to **202 destinations** (114 built, 88 deep-linked).

## Navigation

The User Dashboard shell was restructured once to the approved group order — GROWTH, CRM,
MARKETING, CREATIVE, SOCIAL, **MARKETPLACE**, ANALYTICS, WORKSPACE — rather than editing
pages one by one. The old "Partner Marketplace — Coming Soon" primary entry is gone.

Visibility is resolved server-side in the layout, never in the client:

- **Marketplace / Browse Products / My Purchases** — while the module is enabled
- **Sell on Amplivanta** — module enabled, `marketplace.seller_applications` on, and the
  user is not already an approved seller
- **Seller Dashboard** — approved sellers only

## Authorization

`guardMarketplace()` enforces the approved evaluation order: module kill switch → plan/
entitlement → org/workspace override → auth & tenancy → RBAC → ownership/eligibility →
feature flag. Every server action re-checks; UI visibility is never treated as
authorization. Seller-owned and buyer-owned reads are scoped by owner id. Sensitive writes
append a `PlatformAuditLog` row.

## Truth-first

No marketplace data is fabricated. Metrics with no connected source render `—` / "No data
yet"; an unreachable database renders "temporarily unavailable" — deliberately distinct
from an empty catalogue. While in this shell, three pre-existing fabrications were also
removed: the mock AI-credits balance, the mock workspace list, and the hard-coded
"Alex Johnson / Growth Manager" topbar identity now read from the real session.

## Deliberately not invented — launch decisions still required

The handoff lists these as decisions that must be confirmed, so they are **not** guessed at
in code. Each has an honest blocked state in the UI rather than a fake implementation:

1. **Payment architecture** — provider, and whether Amplivanta is merchant of record,
   payment facilitator or another role. *Checkout is disabled and says so.*
2. **Payout architecture** — provider, KYC, countries/currencies, schedule, minimums,
   reserves and fees. *Request Payout only unlocks when a provider is connected and an
   eligible balance is calculated from the ledger.*
3. **Commercial model** — commission/transaction fee, listing fees, sponsored placement
   pricing, tax and invoice treatment.
4. **Refund rules** — request windows, refundable categories, partial refunds, seller
   allocation.
5. **File operations** — supported types, max upload size, retention/versioning, malware
   scanning, signed-URL TTL. *Product file upload is disabled until storage and scanning
   are configured; products save as drafts.*
6. **Seller verification** — identity/business checks, age and geographic eligibility,
   prohibited jurisdictions.
7. **IP/DMCA** — whether Actjoval LLC registers a U.S. DMCA agent, and the notice workflow.
8. **Reviews / following / favorites** — V1 or later; each already has a feature flag.
9. **Legal publication** — counsel approval of all six documents. The supplied documents
   ship with **blank** Effective Date and Last Updated fields, so no date is published.

## Remaining follow-ups

- Cart/checkout write paths, order creation, entitlement activation and signed-download
  issuance are modelled but not implemented — they depend on decisions 1 and 5.
- Marketplace Management admin screens list real data; their row actions (approve seller,
  moderate product, issue refund, decide payout) still need individual authorized actions.
- Categories are modelled but there is no category admin CRUD yet.
- `marketplace` and its 14 flags are declared in code; an operator still has to switch the
  module on via Module Controls for any of it to appear.
- The approved target routes use names this codebase does not use (`/app/marketing-automation`,
  `/app/social-publishing`, `/app/growth-intelligence/*`, `/app/usage-credits`). The nav was
  restructured to the approved labels and order but each item points at the existing route;
  renaming ~100 live routes was out of scope for this pass.
