// Server Component — "use client" YOK
// Prisma ile doğrudan veritabanından kategorileri çeker,
// animasyonu ise CategorySliderTrack (client) bileşenine bırakır.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategorySliderTrack from "./CategorySliderTrack";

// 5 dakika ISR cache — üretimde gereksiz DB yükü olmaz
export const revalidate = 300;

async function getCategories() {
  try {
    const rows = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        description: true,
        imageUrl: true,
        _count: { select: { businesscategory: true } },
      },
    });

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      icon: r.icon,
      color: r.color,
      description: r.description ?? null,
      imageUrl: r.imageUrl ?? null,
      count: r._count.businesscategory,
    }));
  } catch (e) {
    console.error("CategorySlider DB error:", e);
    return [];
  }
}

export default async function CategorySlider() {
  const categories = await getCategories();

  // Hiç kategori yoksa section'ı gösterme
  if (!categories.length) return null;

  return (
    <section className="py-8 bg-white overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-4 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Popüler Kategoriler
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            İhtiyacınıza uygun hizmet kategorisini seçin
          </p>
        </div>
        <Link
          href="/kategoriler"
          className="text-[#004aad] font-semibold text-sm hover:underline underline-offset-2 shrink-0"
        >
          Tümünü Gör →
        </Link>
      </div>

      {/* Animated track (client component) */}
      <CategorySliderTrack categories={categories} />
    </section>
  );
}
