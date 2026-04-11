import { prisma } from "@/lib/prisma";

/**
 * Public katalog — GET /api/public/businesses/[slug]/catalog ile aynı JSON gövdesi.
 * @param {string} slug
 * @returns {Promise<{ business: object, categories: array, uncategorized: array } | null>}
 */
export async function getPublicBusinessCatalogBySlug(slug) {
  const s = slug != null ? String(slug).trim() : "";
  if (!s) return null;

  const business = await prisma.business.findUnique({
    where: { slug: s, isActive: true },
    select: { id: true, name: true, slug: true },
  });

  if (!business) return null;

  const categories = await prisma.productcategory.findMany({
    where: { businessId: business.id },
    orderBy: { order: "asc" },
    include: {
      product: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: { productvariant: { orderBy: { order: "asc" } } },
      },
    },
  });

  const uncategorized = await prisma.product.findMany({
    where: { businessId: business.id, categoryId: null, isActive: true },
    orderBy: { order: "asc" },
    include: { productvariant: { orderBy: { order: "asc" } } },
  });

  return {
    business,
    categories: categories.map((c) => ({ ...c, products: c.product })),
    uncategorized,
  };
}
