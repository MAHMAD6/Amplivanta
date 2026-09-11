import Link from "next/link";
import {
  BookOpen,
  FileText,
  Image as ImageIcon,
  PlaySquare,
  Search,
  ShoppingCart,
  Sparkles,
  Wrench,
} from "lucide-react";
import { STORE_COLLECTIONS, type StoreCollection } from "@/lib/marketplace/storefront";
import type { PublicProductCard } from "@/lib/server/public-marketplace";
import { cn } from "@/lib/utils";

/** Shared pieces of the public Marketplace storefront (reference 01–08). */

const ICONS: Record<StoreCollection["icon"], React.ComponentType<{ className?: string }>> = {
  template: FileText,
  image: ImageIcon,
  video: PlaySquare,
  graphic: Sparkles,
  playbook: BookOpen,
  tool: Wrench,
};

export function CollectionIcon({ icon, className }: { icon: StoreCollection["icon"]; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon aria-hidden className={className} />;
}

export function IconTile({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4F1FF] text-site-purple",
        className,
      )}
    >
      {children}
    </span>
  );
}

export const storeSelect =
  "h-[52px] w-full rounded-xl border border-[#DCE2EF] bg-white px-4 text-[13.5px] font-semibold text-site-ink focus:border-site-purple focus:outline-none";

/**
 * Search row: query, type, submit and cart. A plain GET form, so it works
 * before hydration and every result page has a shareable URL.
 */
export function StoreSearchBar({
  action = "/marketplace/products",
  placeholder = "Search templates, images, videos, playbooks, tools, and more...",
  q = "",
  type = "",
  showType = true,
}: {
  action?: string;
  placeholder?: string;
  q?: string;
  type?: string;
  showType?: boolean;
}) {
  return (
    <form
      action={action}
      method="get"
      role="search"
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_52px] gap-2.5 sm:gap-4",
        showType
          ? "md:grid-cols-[minmax(0,1fr)_216px_60px_auto]"
          : "md:grid-cols-[minmax(0,1fr)_60px_auto]",
      )}
    >
      <label className="relative min-w-0">
        <span className="sr-only">Search the Marketplace</span>
        <span className="pointer-events-none absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-[#F4F1FF] text-site-purple">
          <Search aria-hidden className="h-[18px] w-[18px]" />
        </span>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          className="h-[52px] w-full rounded-xl border border-[#DCE2EF] bg-white pl-[60px] pr-4 text-[13.5px] text-site-ink placeholder:text-[#8A94A8] focus:border-site-purple focus:outline-none"
        />
      </label>
      {showType && (
        <label className="order-3 col-span-2 md:order-none md:col-span-1">
          <span className="sr-only">Category</span>
          <select name="type" defaultValue={type} className={storeSelect}>
            <option value="">All Categories</option>
            {STORE_COLLECTIONS.map((c) => (
              <option key={c.type} value={c.type}>{c.name}</option>
            ))}
          </select>
        </label>
      )}
      <button
        type="submit"
        aria-label="Search"
        className="flex h-[52px] items-center justify-center rounded-xl bg-gradient-to-r from-site-blue to-site-purple-2 text-white transition hover:brightness-110"
      >
        <Search aria-hidden className="h-5 w-5" />
      </button>
      <Link
        href="/marketplace/cart"
        className="hidden items-center gap-2.5 px-2 text-[13px] font-bold text-site-ink hover:text-site-purple md:flex"
      >
        <IconTile className="h-10 w-10">
          <ShoppingCart aria-hidden className="h-5 w-5" />
        </IconTile>
        Cart
      </Link>
    </form>
  );
}

export function StoreHead({
  crumbs,
  title,
  lead,
  aside,
}: {
  crumbs: string[];
  title: string;
  lead?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex items-start justify-between gap-6">
      <div>
        <nav aria-label="Breadcrumb" className="mb-5 text-[12.5px] text-site-muted">
          {crumbs.join(" / ")}
        </nav>
        <h1 className="m-0 text-[30px] font-extrabold leading-tight tracking-[-0.8px] text-site-ink sm:text-[38px]">
          {title}
        </h1>
        {lead && <p className="m-0 mt-1.5 text-[15px] text-site-muted sm:text-[16px]">{lead}</p>}
      </div>
      {aside}
    </div>
  );
}

export function ProductTile({ p }: { p: PublicProductCard }) {
  return (
    <Link
      href={`/marketplace/products/${p.slug}`}
      className="group flex flex-col rounded-2xl border border-site-line bg-white p-3 transition hover:border-site-purple/40 hover:shadow-[0_10px_24px_rgba(20,30,70,0.07)]"
    >
      {p.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.coverImage}
          alt={p.coverImageAlt ?? ""}
          className="aspect-[16/7] w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex aspect-[16/7] w-full items-center justify-center rounded-xl bg-[#F7F6FD]">
          <IconTile className="h-10 w-10 bg-white/70">
            <ImageIcon aria-hidden className="h-5 w-5" />
          </IconTile>
        </div>
      )}
      <div className="px-1 pb-1 pt-4">
        <h3 className="m-0 line-clamp-2 text-[14.5px] font-bold text-site-ink group-hover:text-site-purple">
          {p.title}
        </h3>
        <p className="m-0 mt-1 text-[12.5px] text-site-muted">{p.sellerName}</p>
        <p className="m-0 mt-2 text-[12.5px] font-bold text-site-purple">{p.priceLabel}</p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products, cols = 3 }: { products: PublicProductCard[]; cols?: 3 | 4 }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        cols === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {products.map((p) => (
        <ProductTile key={p.id} p={p} />
      ))}
    </div>
  );
}

/** Empty catalogue: distinguishes "nothing published", "nothing matches" and "unreachable". */
export function CatalogueEmpty({
  connected,
  filtering,
  clearHref,
}: {
  connected: boolean;
  filtering: boolean;
  clearHref: string;
}) {
  const [title, body] = !connected
    ? ["Marketplace unavailable", "The catalogue could not be loaded right now. Please try again shortly."]
    : filtering
      ? ["No matching products", "Nothing published matches these filters. Try a different search or clear the filters."]
      : ["No published products yet", "Products appear here once a seller's listing passes the applicable review steps."];
  return (
    <div className="rounded-2xl border border-dashed border-[#D9DFEC] bg-[#FBFCFF] px-6 py-14 text-center">
      <IconTile className="mx-auto">
        <ImageIcon aria-hidden className="h-5 w-5" />
      </IconTile>
      <h3 className="m-0 mt-3 text-[16px] font-extrabold text-site-ink">{title}</h3>
      <p className="mx-auto m-0 mt-1.5 max-w-md text-[13px] leading-relaxed text-site-muted">{body}</p>
      {connected && filtering && (
        <Link href={clearHref} className="mt-4 inline-block text-[13px] font-bold text-site-purple hover:underline">
          Clear filters
        </Link>
      )}
    </div>
  );
}

export function StoreFootnote({ children }: { children: React.ReactNode }) {
  return <p className="m-0 mt-6 text-[12.5px] text-site-muted">{children}</p>;
}

/** Order summary card used by Cart and Checkout; values stay "—" until a real order exists. */
export function OrderSummary({
  rows,
  footnote,
  action,
}: {
  rows: string[];
  footnote: string;
  action?: React.ReactNode;
}) {
  return (
    <aside className="h-fit rounded-2xl border border-site-line bg-[#FBFBFE] p-6 sm:p-8">
      <h2 className="m-0 mb-6 text-[18px] font-extrabold text-site-ink">Order Summary</h2>
      <dl className="m-0 space-y-5">
        {rows.map((r) => (
          <div key={r} className="flex justify-between text-[12.5px] text-site-muted">
            <dt>{r}</dt>
            <dd className="m-0">—</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex justify-between border-t border-site-line pt-6 text-[14px] font-extrabold text-site-ink">
        <span>Total</span>
        <span>—</span>
      </div>
      {action && <div className="mt-8">{action}</div>}
      <p className="m-0 mt-5 text-[11.5px] leading-relaxed text-site-muted">{footnote}</p>
    </aside>
  );
}
