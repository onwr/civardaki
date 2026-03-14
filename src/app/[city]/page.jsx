import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BusinessCard } from "@/components/user/BusinessCard";
import { capitalizeWords, slugifyTR } from "@/lib/formatters";
import { ChevronRight, MapPin } from "lucide-react";

function mapBusinessForCard(item) {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
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

function sortByCountDesc(a, b) {
  return b.count - a.count;
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const cityLabel = capitalizeWords(city);
  return {
    title: `${cityLabel} işletmeleri | Civardaki`,
    description: `${cityLabel} bölgesindeki doğrulanmış işletmeleri kategori bazlı keşfedin.`,
    alternates: {
      canonical: `/${slugifyTR(city)}`,
    },
  };
}

export default async function CityPage({ params }) {
  const { city } = await params;
  const citySlug = slugifyTR(city);
  const cityLabel = capitalizeWords(citySlug);

  const rawBusinesses = await prisma.business.findMany({
    where: {
      isActive: true,
      isVerified: true,
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
    orderBy: [
      { rating: "desc" },
      { reviewCount: "desc" },
      { createdAt: "desc" },
    ],
    take: 600,
  });

  const cityBusinesses = rawBusinesses.filter(
    (item) => slugifyTR(item.city || "") === citySlug,
  );

  const businesses = cityBusinesses.slice(0, 24).map(mapBusinessForCard);

  const categoryMap = new Map();
  for (const item of cityBusinesses) {
    for (const bc of item.businesscategory || []) {
      if (!bc?.category?.id) continue;
      const current = categoryMap.get(bc.category.id) || {
        id: bc.category.id,
        name: bc.category.name,
        slug: bc.category.slug,
        count: 0,
      };
      current.count += 1;
      categoryMap.set(bc.category.id, current);
    }
  }

  const topCategories = Array.from(categoryMap.values())
    .filter((item) => item.slug)
    .sort(sortByCountDesc)
    .slice(0, 12);

  const districtMap = new Map();
  for (const item of cityBusinesses) {
    const district = (item.district || "").trim();
    if (!district) continue;
    districtMap.set(district, (districtMap.get(district) || 0) + 1);
  }

  const topDistricts = Array.from(districtMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort(sortByCountDesc)
    .slice(0, 12);

  return (
    <main className="min-h-screen  bg-slate-50/30 pb-20">
      <section className="bg-white border-b border-slate-100 pt-24 pb-14">
        <div className="mx-auto max-w-6xl px-6">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
            <Link href="/" className="hover:text-blue-600">
              Anasayfa
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/user/isletmeler" className="hover:text-blue-600">
              İşletmeler
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">{cityLabel}</span>
          </nav>

          <h1 className="text-4xl lg:text-6xl font-black text-slate-950 tracking-tighter italic uppercase leading-none">
            {cityLabel} İşletmeleri
          </h1>
          <p className="mt-5 text-lg text-slate-500 font-semibold max-w-3xl">
            {cityLabel} bölgesindeki doğrulanmış işletmeleri kategoriye göre
            filtreleyin, yakınınızdaki en iyi seçenekleri keşfedin.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 -mt-8 space-y-8">
        <section className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Popüler Kategoriler
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({topCategories.length})
            </span>
          </div>
          {topCategories.length === 0 ? (
            <p className="text-sm text-slate-500 font-semibold">
              Bu şehir için kategori verisi bulunamadı.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/${citySlug}/${category.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {category.name}
                  <span className="text-xs text-slate-400">
                    ({category.count})
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Yoğun İlçeler
            </span>
          </div>
          {topDistricts.length === 0 ? (
            <p className="text-sm text-slate-500 font-semibold">
              İlçe bazlı veri henüz bulunmuyor.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topDistricts.map((district) => (
                <span
                  key={district.name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  {district.name}
                  <span className="text-[11px] text-slate-400">
                    ({district.count})
                  </span>
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {cityBusinesses.length} İşletme Bulundu
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Canlı Veri
              </span>
            </div>
          </div>

          {businesses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-100">
              <h3 className="text-2xl font-black text-slate-300 uppercase italic">
                Henüz İşletme Bulunmuyor
              </h3>
              <p className="text-slate-400 font-bold mt-2">
                {cityLabel} bölgesine yeni işletmeler eklenmeye devam ediyor.
              </p>
              <Link
                href="/user/isletmeler"
                className="mt-8 inline-block px-8 py-3 bg-slate-950 text-white rounded-xl font-black text-xs tracking-widest uppercase hover:bg-blue-600 transition-all"
              >
                Tüm İşletmeleri Gör
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {businesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
