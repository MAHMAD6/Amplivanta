/**
 * Creates (or refreshes) one clearly-labelled demo Marketplace listing so the
 * public catalogue and product page can be seen working end to end.
 *
 * Everything it writes is prefixed `demo-` and owned by a single demo seller,
 * so `node scripts/demo-marketplace-listing.js --remove` takes all of it back
 * out again. The demo seller's User row stores a non-bcrypt password value, so
 * `bcrypt.compare` can never match and nobody can sign in as it.
 *
 *   node scripts/demo-marketplace-listing.js            # create or refresh
 *   node scripts/demo-marketplace-listing.js --remove   # delete it all
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://amplivanta.com";
const IMG = `${SITE}/demo/marketplace`;

const DEMO_EMAIL = "demo-seller@amplivanta.example";
const SELLER_SLUG = "demo-studio";
const CATEGORY_SLUG = "demo-social-media";
const PRODUCT_SLUG = "demo-social-media-growth-kit";

async function remove() {
  const product = await prisma.marketplaceProduct.findUnique({ where: { slug: PRODUCT_SLUG } });
  if (product) {
    // Versions, assets, favourites and reviews cascade from the product.
    await prisma.marketplaceProduct.delete({ where: { id: product.id } });
    console.log("deleted product", PRODUCT_SLUG);
  }
  const seller = await prisma.marketplaceSeller.findUnique({ where: { slug: SELLER_SLUG } });
  if (seller) {
    await prisma.marketplaceSeller.delete({ where: { id: seller.id } });
    console.log("deleted seller", SELLER_SLUG);
  }
  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (user) {
    await prisma.user.delete({ where: { id: user.id } });
    console.log("deleted user", DEMO_EMAIL);
  }
  const category = await prisma.marketplaceCategory.findUnique({ where: { slug: CATEGORY_SLUG } });
  if (category) {
    await prisma.marketplaceCategory.delete({ where: { id: category.id } });
    console.log("deleted category", CATEGORY_SLUG);
  }
  console.log("demo listing removed");
}

async function create() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Demo Studio" },
    create: {
      email: DEMO_EMAIL,
      name: "Demo Studio",
      // Not a bcrypt hash: bcrypt.compare can never match, so this account
      // cannot be signed into. It exists only to own the demo seller record.
      password: "demo-account-no-login",
      role: "EDITOR",
    },
  });

  const seller = await prisma.marketplaceSeller.upsert({
    where: { slug: SELLER_SLUG },
    update: { status: "APPROVED" },
    create: {
      userId: user.id,
      storeName: "Demo Studio",
      slug: SELLER_SLUG,
      headline: "Demo seller account",
      bio: "This is a demonstration storefront used to show how a Marketplace listing appears. It is not a real seller and nothing here is for sale.",
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });

  const category = await prisma.marketplaceCategory.upsert({
    where: { slug: CATEGORY_SLUG },
    update: {},
    create: {
      slug: CATEGORY_SLUG,
      name: "Social Media",
      description: "Demonstration category.",
      order: 99,
      isActive: true,
    },
  });

  const data = {
    sellerId: seller.id,
    categoryId: category.id,
    title: "Social Media Growth Kit (Demo)",
    summary: "Done-for-you templates to elevate your brand — demonstration listing.",
    description:
      "This is a demonstration listing. It exists to show how a Marketplace product page renders: " +
      "gallery, specification table, tabs, related products and the sharing controls.\n\n" +
      "A real listing would describe what the buyer receives, how to use it, and what is included. " +
      "Nothing here is for sale and no files are delivered.",
    type: "TOOL_KIT",
    status: "PUBLISHED",
    publishedAt: new Date(),
    tags: ["demo", "social media", "templates", "branding"],
    coverImage: `${IMG}/social-media-growth-kit-cover.png`,
    coverImageAlt: "Demo product cover reading Social Media Growth Kit",
    galleryImages: [
      `${IMG}/social-media-growth-kit-templates.png`,
      `${IMG}/social-media-growth-kit-captions.png`,
      `${IMG}/social-media-growth-kit-guide.png`,
    ],
    galleryImageAlts: [
      "Panel describing 40 editable templates",
      "Panel describing 120 written captions",
      "Panel describing a 34-page strategy guide",
    ],
    language: "English",
    // The demo copy and images were machine-generated, so declare it honestly.
    contentCreation: "PRIMARILY_AI_GENERATED",
    highlights: [
      "40 editable social templates",
      "120 caption prompts",
      "34-page strategy guide",
      "Brand colour and font presets",
    ],
    perfectFor: [
      "Small businesses",
      "Content creators",
      "Marketing teams",
      "Social media managers",
    ],
    seoTitle: "Social Media Growth Kit (Demo)",
    metaDescription:
      "A demonstration Marketplace listing showing how an Amplivanta product page renders. Not a real product.",
    primaryKeyword: "social media template kit",
    keywords: ["social media templates", "content calendar", "caption prompts", "brand kit"],
    allowIndexing: false, // a demo listing should not be indexed by search engines
  };

  const existing = await prisma.marketplaceProduct.findUnique({ where: { slug: PRODUCT_SLUG } });
  const product = existing
    ? await prisma.marketplaceProduct.update({ where: { slug: PRODUCT_SLUG }, data })
    : await prisma.marketplaceProduct.create({ data: { ...data, slug: PRODUCT_SLUG } });

  const version = await prisma.marketplaceProductVersion.upsert({
    where: { productId_version: { productId: product.id, version: 1 } },
    update: { priceCents: 4900, status: "PUBLISHED" },
    create: {
      productId: product.id,
      version: 1,
      priceCents: 4900,
      currency: "USD",
      licenseVersion: "standard-v1",
      status: "PUBLISHED",
      changelog: "Initial demonstration version.",
    },
  });

  const assets = [
    { fileName: "social-templates.zip", sizeBytes: 18_400_000, mimeType: "application/zip" },
    { fileName: "caption-prompts.pdf", sizeBytes: 1_240_000, mimeType: "application/pdf" },
    { fileName: "strategy-guide.pdf", sizeBytes: 3_600_000, mimeType: "application/pdf" },
  ];
  for (const a of assets) {
    const found = await prisma.marketplaceProductAsset.findFirst({
      where: { versionId: version.id, fileName: a.fileName },
    });
    if (!found) {
      await prisma.marketplaceProductAsset.create({
        data: {
          versionId: version.id,
          kind: "deliverable",
          // No storage provider is configured, so this key resolves to nothing
          // and no download can be issued. The row exists so the listing can
          // show real file names and sizes.
          storageKey: `demo/${a.fileName}`,
          scanStatus: "CLEAN",
          ...a,
        },
      });
    }
  }

  console.log("demo listing ready");
  console.log("  public:  " + SITE + "/marketplace/products/" + PRODUCT_SLUG);
  console.log("  in-app:  " + SITE + "/app/marketplace/products/" + PRODUCT_SLUG);
}

(async () => {
  try {
    if (process.argv.includes("--remove")) await remove();
    else await create();
  } catch (e) {
    console.error("failed:", e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
