import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
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
  const { city, category, district } = await params;
  const citySlug = slugifyTR(city);
  const categorySlug = slugifyTR(category);
  const districtSlug = slugifyTR(district);
  const content = generateSEOContent(citySlug, categorySlug, districtSlug);

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: `/${citySlug}/${categorySlug}/${districtSlug}`,
    },
  };
}

export default async function DistrictCategoryPage({ params }) {
  const { city, category, district } = await params;
  const citySlug = slugifyTR(city);
  const categorySlug = slugifyTR(category);
  const districtSlug = slugifyTR(district);

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
      where: { isActive: true, parentId: categoryData.parentId ?? null },
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
    take: 800,
  });

  const cityBusinesses = rawBusinesses.filter(
    (item) => slugifyTR(item.city || "") === citySlug
  );
  const districtBusinesses = cityBusinesses.filter(
    (item) => slugifyTR(item.district || "") === districtSlug
  );
  const businesses = districtBusinesses.slice(0, 24).map(mapBusinessForCard);

  const districtMap = new Map();
  for (const item of cityBusinesses) {
    const districtName = (item.district || "").trim();
    if (!districtName) continue;
    const key = slugifyTR(districtName);
    const current = districtMap.get(key) || {
      slug: key,
      name: districtName,
      count: 0,
    };
    current.count += 1;
    districtMap.set(key, current);
  }
  const cityDistricts = Array.from(districtMap.values())
    .sort(byCountDesc)
    .slice(0, 12);

  const hasResults = businesses.length > 0;
  const cityLabel = capitalizeWords(citySlug);
  const districtLabel = capitalizeWords(districtSlug);
  const categoryLabel = categoryData.name || capitalizeWords(categorySlug);
  const content = generateSEOContent(citySlug, categorySlug, districtSlug);

  return (
    <main className="min-h-screen bg-slate-50/30 pb-20">
      {!hasResults && <meta name="robots" content="noindex, follow" />}

      <section className="bg-white border-b border-slate-100 pt-24 pb-14">
        <div className="mx-auto max-w-6xl px-6">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600">
              Anasayfa
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${citySlug}`} className="hover:text-blue-600">
              {cityLabel}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${citySlug}/${categorySlug}`} className="hover:text-blue-600">
              {categoryLabel}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">{districtLabel}</span>
          </nav>

          <h1 className="text-4xl lg:text-6xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
            {cityLabel} {districtLabel} {categoryLabel}
          </h1>
          <p className="mt-5 text-lg text-slate-500 font-semibold max-w-3xl">
            {districtLabel} bölgesindeki doğrulanmış {categoryLabel.toLowerCase()} işletmelerini
            keşfedin ve size en uygun seçeneği bulun.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 -mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {businesses.length} İşletme Bulundu
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Canlı Veri</span>
            </div>
          </div>

          {!hasResults ? (
            <div className="bg-white rounded-2xl p-14 text-center border-2 border-dashed border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Search className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-black text-slate-300 uppercase italic">Arama Sonucu Yok</h3>
              <p className="text-slate-400 font-bold mt-2 max-w-sm mx-auto">
                {districtLabel} bölgesinde şu an kayıtlı işletme bulunmuyor.
              </p>
              <Link
                href={`/${citySlug}/${categorySlug}`}
                className="mt-8 inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs tracking-widest uppercase hover:bg-slate-950 transition-all"
              >
                {cityLabel} Genelini Gör
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
              {cityLabel} {districtLabel} {categoryLabel} Rehberi
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
                      href={`/${citySlug}/${item.slug}/${districtSlug}`}
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
                {cityLabel} Diğer İlçeler
              </h4>
              {cityDistricts.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold">Diğer ilçe verisi bulunamadı.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {cityDistricts.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/${citySlug}/${categorySlug}/${item.slug}`}
                      className={`px-3 py-2 rounded-lg text-[10px] font-black border text-center transition-all uppercase ${
                        item.slug === districtSlug
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-500 hover:text-blue-600"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${cityLabel} ${districtLabel} ${categoryLabel} Firmaları`,
            description: content.description,
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
