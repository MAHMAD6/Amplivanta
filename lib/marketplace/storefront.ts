/**
 * Public storefront taxonomy. The reference groups the catalogue by product
 * type (Templates, Images, …), which maps one-to-one onto
 * MarketplaceProductType, so these collections need no admin setup and never
 * show a category that cannot contain anything.
 */

export type StoreType = "TEMPLATE" | "IMAGE" | "VIDEO" | "GRAPHIC" | "DOCUMENT" | "TOOL_KIT";

export type StoreCollection = {
  slug: string;
  type: StoreType;
  name: string;
  singular: string;
  blurb: string;
  lead: string;
  icon: "template" | "image" | "video" | "graphic" | "playbook" | "tool";
};

export const STORE_COLLECTIONS: StoreCollection[] = [
  {
    slug: "templates", type: "TEMPLATE", name: "Templates", singular: "Template",
    blurb: "Marketing & design templates",
    lead: "Explore marketing and design templates available from Marketplace sellers.",
    icon: "template",
  },
  {
    slug: "images", type: "IMAGE", name: "Images", singular: "Image",
    blurb: "Photos, vectors & more",
    lead: "Explore photos, vectors and other images available from Marketplace sellers.",
    icon: "image",
  },
  {
    slug: "videos", type: "VIDEO", name: "Videos", singular: "Video",
    blurb: "Video clips & animations",
    lead: "Explore video clips and animations available from Marketplace sellers.",
    icon: "video",
  },
  {
    slug: "graphics", type: "GRAPHIC", name: "Graphics", singular: "Graphic",
    blurb: "Icons, illustrations & more",
    lead: "Explore icons, illustrations and other graphics available from Marketplace sellers.",
    icon: "graphic",
  },
  {
    slug: "playbooks", type: "DOCUMENT", name: "Playbooks", singular: "Playbook",
    blurb: "Guides, checklists & docs",
    lead: "Explore guides, checklists and documents available from Marketplace sellers.",
    icon: "playbook",
  },
  {
    slug: "tools-kits", type: "TOOL_KIT", name: "Tools & Kits", singular: "Tool & kit",
    blurb: "Resources & toolkits",
    lead: "Explore resources and toolkits available from Marketplace sellers.",
    icon: "tool",
  },
];

export const COLLECTION_BY_SLUG = new Map(STORE_COLLECTIONS.map((c) => [c.slug, c]));
export const COLLECTION_BY_TYPE = new Map(STORE_COLLECTIONS.map((c) => [c.type, c]));

/** The licence every listing ships with unless the operator configures another. */
export const STANDARD_LICENSE = "standard-v1";

export const LICENSE_FILTERS = [
  ["standard", "Standard Marketplace License"],
  ["other", "Other accepted license"],
] as const;

export const SORTS = [
  ["relevance", "Relevance"],
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
] as const;

export type StoreSort = (typeof SORTS)[number][0];

export const isStoreType = (v: string): v is StoreType =>
  STORE_COLLECTIONS.some((c) => c.type === v);

/** Next hands repeated query keys over as arrays; normalise to a list. */
export function paramList(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).filter(Boolean);
}

export const paramOne = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
