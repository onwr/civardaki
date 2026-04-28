import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildBreadcrumbList } from "@/lib/jsonld";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

export const revalidate = 300;

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      icon: true,
      children: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true },
        take: 8,
      },
      _count: {
        select: { businesscategory: true },
      },
    },
  });

  return categories.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description || null,
    imageUrl: item.imageUrl || null,
    icon: item.icon || null,
    count: item._count.businesscategory,
    children: item.children || [],
  }));
}

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const hasSearchParams =
    resolvedSearchParams && Object.keys(resolvedSearchParams).length > 0;
  const canonicalUrl = `${APP_URL}/kategoriler`;

  return {
    title: "Kategoriler | Civardaki",
    description:
      "Civardaki kategorilerini keşfedin, ihtiyacınıza uygun hizmet alanını seçin ve ilgili kategori detay sayfasından işletmeleri inceleyin.",
    alternates: { canonical: canonicalUrl },
    robots: {
      index: !hasSearchParams,
      follow: true,
    },
    openGraph: {
      title: "Kategoriler | Civardaki",
      description:
        "Popüler hizmet kategorilerini keşfedin ve kategoriye özel işletme listelerine hızlıca ulaşın.",
      url: canonicalUrl,
      siteName: "Civardaki",
      images: [
        {
          url: `${APP_URL}/default-og-category.jpg`,
          width: 1200,
          height: 630,
          alt: "Civardaki Kategoriler",
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Kategoriler | Civardaki",
      description:
        "Popüler hizmet kategorilerini keşfedin ve kategoriye özel işletme listelerine hızlıca ulaşın.",
      images: [`${APP_URL}/default-og-category.jpg`],
    },
  };
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  const breadcrumbLd = buildBreadcrumbList([
    { name: "Anasayfa", url: "/" },
    { name: "Kategoriler", url: "/kategoriler" },
  ]);

  const categoriesJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Civardaki Kategoriler",
    url: `${APP_URL}/kategoriler`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categories.length,
      itemListElement: categories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: category.name,
        url: `${APP_URL}/kategori/${category.slug}`,
      })),
    },
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoriesJsonLd) }}
      />
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}

      <section className="bg-slate-950 text-white pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold tracking-widest uppercase mb-6">
            Tüm Kategoriler
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Hizmet Kategorileri
          </h1>
          <p className="mt-4 text-slate-300 font-semibold max-w-3xl mx-auto">
            İhtiyacınıza uygun kategoriyi seçin, kategori detay sayfasında
            işletmeleri şehir ve filtre bazlı inceleyin.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {categories.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-black text-slate-900">
              Henüz kategori bulunamadı
            </h2>
            <p className="mt-2 text-slate-500 font-semibold">
              Kategoriler eklendiğinde burada listelenecek.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {categories.map((category) => (
              <article
                key={category.id}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/kategori/${category.slug}`} className="block p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-black text-slate-900 line-clamp-2">
                      {category.name}
                    </h2>
                    <span className="shrink-0 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-bold">
                      {category.count} işletme
                    </span>
                  </div>

                  {category.description && (
                    <p className="mt-3 text-sm text-slate-600 font-medium line-clamp-3">
                      {category.description}
                    </p>
                  )}

                  {category.children.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {category.children.map((child) => (
                        <span
                          key={child.id}
                          className="rounded-full bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1"
                        >
                          {child.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-5 text-sm font-extrabold text-[#004aad]">
                    Kategoriye Git →
                  </p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
