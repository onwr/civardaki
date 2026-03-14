import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BusinessCard } from "@/components/user/BusinessCard";
import { generateSEOContent } from "@/lib/seo-utils";
import { capitalizeWords, slugifyTR } from "@/lib/formatters";

function mapBusinessForCard(item) {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description || "",
    category:
      item.businesscategory?.find((bc) => bc.isPrimary)?.category?.name ||
      item.businesscategory?.[0]?.category?.name ||
      item.category ||
      "Genel",
    city: item.city,
    district: item.district,
    rating: item.rating ?? 0,
    reviewCount: item.reviewCount ?? 0,
    avgResponseMinutes: item.avgResponseMinutes ?? 0,
    isOpen: item.isOpen !== false,
    logo: item.media?.[0]?.url || null,
    banner: item.media?.[0]?.url || null,
  };
}

function byCountDesc(a, b) {
  return b.count - a.count;
}

export async function generateMetadata({ params }) {
  const { city, category } = await params;
  const citySlug = slugifyTR(city);
  const categorySlug = slugifyTR(category);
  const content = generateSEOContent(citySlug, categorySlug);

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: `/${citySlug}/${categorySlug}`,
    },
  };
}

export default async function CityCategoryPage({ params }) {
  const { city, category } = await params;
  const citySlug = slugifyTR(city);
  const categorySlug = slugifyTR(category);

  const categoryData = await prisma.category.findFirst({
    where: { slug: categorySlug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      children: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true, parentId: true },
        take: 8,
      },
    },
  });

  if (!categoryData) notFound();

  let variationCategories = [];
  if (categoryData.children.length > 0) {
    variationCategories = categoryData.children;
  } else {
    variationCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: categoryData.parentId ?? null,
      },
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 8,
    });
  }

  const categoryIds = [categoryData.id, ...categoryData.children.map((item) => item.id)];

  const rawBusinesses = await prisma.business.findMany({
    where: {
      isActive: true,
      isVerified: true,
      businesscategory: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
    },
    include: {
      businesscategory: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
      media: { where: { type: "LOGO" }, take: 1, select: { url: true } },
    },
    orderBy: [{ rating: "desc" }, { avgResponseMinutes: "asc" }, { createdAt: "desc" }],
    take: 600,
  });

  const cityBusinesses = rawBusinesses.filter(
    (item) => slugifyTR(item.city || "") === citySlug
  );
  const businesses = cityBusinesses.slice(0, 24).map(mapBusinessForCard);

  const districtMap = new Map();
  for (const item of cityBusinesses) {
    const district = (item.district || "").trim();
    if (!district) continue;
    districtMap.set(district, (districtMap.get(district) || 0) + 1);
  }
  const topDistricts = Array.from(districtMap.entries())
    .map(([name, count]) => ({ name, count, slug: slugifyTR(name) }))
    .sort(byCountDesc)
    .slice(0, 12);

  const categoryCitiesRaw = await prisma.business.findMany({
    where: {
      isActive: true,
      isVerified: true,
      city: { not: null },
      businesscategory: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
    },
    select: { city: true },
    take: 600,
  });

  const cityCountMap = new Map();
  for (const row of categoryCitiesRaw) {
    const value = (row.city || "").trim();
    if (!value) continue;
    const key = slugifyTR(value);
    const current = cityCountMap.get(key) || {
      slug: key,
      name: capitalizeWords(value),
      count: 0,
    };
    current.count += 1;
    cityCountMap.set(key, current);
  }
  const popularCities = Array.from(cityCountMap.values())
    .filter((item) => item.slug && item.slug !== citySlug)
    .sort(byCountDesc)
    .slice(0, 8);

  const cityLabel = capitalizeWords(citySlug);
  const categoryLabel = categoryData.name || capitalizeWords(categorySlug);
  const content = generateSEOContent(citySlug, categorySlug);

  return (
    <main className="min-h-screen bg-slate-50/30 pb-20">
      <section className="bg-white border-b border-slate-100 pt-24 pb-14">
        <div className="mx-auto max-w-6xl px-6">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600">
              Anasayfa
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/user/isletmeler" className="hover:text-blue-600">
              İşletmeler
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${citySlug}`} className="hover:text-blue-600">
              {cityLabel}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">{categoryLabel}</span>
          </nav>

          <h1 className="text-4xl lg:text-6xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
            {cityLabel} {categoryLabel}
          </h1>
          <p className="mt-5 text-lg text-slate-500 font-semibold max-w-3xl leading-relaxed">
            {cityLabel} bölgesindeki doğrulanmış {categoryLabel.toLowerCase()} işletmelerini canlı verilerle
            keşfedin.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 -mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {cityBusinesses.length} İşletme Bulundu
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Canlı Veri</span>
            </div>
          </div>

          {businesses.length === 0 ? (
            <div className="bg-white rounded-2xl p-14 text-center border-2 border-dashed border-slate-100">
              <h3 className="text-2xl font-black text-slate-300 uppercase italic">Henüz Sonuç Bulunmuyor</h3>
              <p className="text-slate-400 font-bold mt-2">
                {cityLabel} için {categoryLabel.toLowerCase()} sonuçları yakında listelenecek.
              </p>
              <Link
                href={`/${citySlug}`}
                className="mt-8 inline-block px-8 py-3 bg-slate-950 text-white rounded-xl font-black text-xs tracking-widest uppercase hover:bg-blue-600 transition-all"
              >
                Şehir Sayfasına Dön
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {businesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950 italic uppercase tracking-tight">
              {cityLabel} {categoryLabel} Rehberi
            </h2>
            <div className="mt-5 text-slate-600 font-semibold leading-relaxed space-y-4">
              <p>{content.mainContent}</p>
              <h3 className="text-lg font-black text-slate-900 mt-6 uppercase tracking-tighter">
                Sıkça Sorulan Sorular
              </h3>
              <div className="space-y-3">
                {content.faq.map((item, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <h4 className="font-black text-slate-900">{item.q}</h4>
                    <p className="mt-2 text-sm text-slate-500">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">
                Benzer Kategoriler
              </h4>
              <div className="space-y-2">
                {variationCategories
                  .filter((item) => item.slug)
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={`/${citySlug}/${item.slug}`}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        item.slug === categorySlug
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-300"
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-tight">{item.name}</span>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </Link>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                İlçeye Göre İncele
              </h4>
              {topDistricts.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold">İlçe verisi henüz oluşmadı.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topDistricts.map((district) => (
                    <Link
                      key={district.slug}
                      href={`/${citySlug}/${categorySlug}/${district.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all"
                    >
                      <MapPin className="w-3 h-3" />
                      {district.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {popularCities.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Diğer Şehirler
                </h4>
                <div className="flex flex-wrap gap-2">
                  {popularCities.map((cityItem) => (
                    <Link
                      key={cityItem.slug}
                      href={`/${cityItem.slug}/${categorySlug}`}
                      className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all uppercase"
                    >
                      {cityItem.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: businesses.map((biz, idx) => ({
              "@type": "ListItem",
              position: idx + 1,
              item: {
                "@type": "LocalBusiness",
                name: biz.name,
                url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/isletme/${biz.slug}`,
                description: biz.description || "",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: biz.city,
                  addressRegion: biz.district,
                },
              },
            })),
          }),
        }}
      />
    </main>
  );
}
