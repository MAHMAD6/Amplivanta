import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Package } from "lucide-react";
import { MpButton, MpCard, MpEmpty, MpHeader, MpNote } from "@/components/marketplace/ui";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { loadFavorites } from "@/app/(app)/app/marketplace/actions";

export const metadata: Metadata = { title: "Wishlist" };

export default async function FavoritesPage() {
  const { enabled, connected, items } = await loadFavorites();

  return (
    <>
      <MpHeader
        title="Wishlist"
        description="Products you have saved for later."
        breadcrumb={[
          { label: "Marketplace", href: "/app/marketplace" },
          { label: "Wishlist" },
        ]}
      />

      {!enabled ? (
        <MpCard>
          <MpEmpty
            icon={Heart}
            title="Wishlists are turned off"
            description="An operator has disabled the wishlist feature for this platform."
            action={<MpButton href="/app/marketplace/products">Browse products</MpButton>}
          />
        </MpCard>
      ) : !connected ? (
        <MpCard>
          <MpEmpty
            icon={Package}
            title="Wishlist unavailable"
            description="The platform database could not be reached, so your saved products cannot be listed right now."
          />
        </MpCard>
      ) : items.length === 0 ? (
        <MpCard>
          <MpEmpty
            icon={Heart}
            title="Nothing saved yet"
            description="Save a product from its listing page and it will appear here."
            action={<MpButton href="/app/marketplace/products" variant="primary">Browse products</MpButton>}
          />
        </MpCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <MpCard key={p.id} className="flex flex-col p-5">
              <Link href={`/app/marketplace/products/${p.slug}`} className="group">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt="" className="aspect-[16/10] w-full rounded-xl border border-line object-cover" />
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-bg-soft">
                    <Package aria-hidden className="h-6 w-6 text-ink-muted" />
                  </div>
                )}
                <div className="mt-3.5 text-[11px] font-bold uppercase tracking-wider text-royal-blue">
                  {p.categoryName ?? "Marketplace"}
                </div>
                <h2 className="mt-1 text-[15px] font-bold leading-snug text-deep-navy group-hover:text-royal-blue">
                  {p.title}
                </h2>
              </Link>
              {p.summary && (
                <p className="mt-1.5 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-ink-soft">{p.summary}</p>
              )}
              <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[12px] text-ink-muted">{p.sellerName}</span>
                <span className="text-[14px] font-extrabold text-deep-navy">{p.priceLabel}</span>
              </div>
              <div className="mt-3.5">
                <FavoriteButton productId={p.productId} initialSaved />
              </div>
            </MpCard>
          ))}
        </div>
      )}

      <MpNote title="What a wishlist is">
        Saving a product is a private bookmark. It reserves nothing, holds no price, and grants no
        access — purchase is still the only thing that creates an entitlement.
      </MpNote>
    </>
  );
}
