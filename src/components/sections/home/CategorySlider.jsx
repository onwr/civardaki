// Server Component

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategorySliderTrack from "./CategorySliderTrack";

export const revalidate = 300;

async function getCategories() {
  try {
    const rows = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: { select: { businesscategory: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      imageUrl: r.imageUrl,
      count: r._count.businesscategory,
    }));
  } catch {
    return [];
  }
}

export default async function CategorySlider() {
  const categories = await getCategories();
  if (!categories.length) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 mb-10 flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Popüler Kategoriler
          </h2>
          <p className="text-slate-500 mt-2">
            İhtiyacına uygun hizmeti kolayca bul
          </p>
        </div>

        <Link
          href="/kategoriler"
          className="text-[#004aad] font-semibold hover:underline"
        >
          Tümünü Gör →
        </Link>
      </div>

      <CategorySliderTrack categories={categories} />
    </section>
  );
}