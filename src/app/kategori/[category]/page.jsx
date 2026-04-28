import { notFound } from "next/navigation";
import Link from "next/link";
import BusinessListClient from "@/components/home/BusinessListClient";
import PopularBusinesses from "@/components/category/PopularBusinesses";
import { prisma } from "@/lib/prisma";
import { capitalizeWords, slugifyTR } from "@/lib/formatters";
import { buildCollectionPage, buildBreadcrumbList } from "@/lib/jsonld";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

export const revalidate = 300;

async function getCategoryData(slug) {
    const category = await prisma.category.findFirst({
        where: { slug, isActive: true },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
            parent: { select: { id: true, name: true, slug: true } },
            children: {
                where: { isActive: true },
                select: { id: true, name: true, slug: true, description: true },
                orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
                take: 12,
            },
        },
    });
    if (!category) return null;

    const categoryIds = [category.id, ...category.children.map((item) => item.id)];
    const [businessCount, popularCitiesRaw] = await Promise.all([
        prisma.business.count({
            where: {
                isActive: true,
                OR: [
                    { primaryCategoryId: { in: categoryIds } },
                    { businesscategory: { some: { categoryId: { in: categoryIds } } } },
                ],
            },
        }),
        prisma.business.findMany({
            where: {
                isActive: true,
                city: { not: null },
                OR: [
                    { primaryCategoryId: { in: categoryIds } },
                    { businesscategory: { some: { categoryId: { in: categoryIds } } } },
                ],
            },
            select: { city: true },
            take: 800,
        }),
    ]);

    const cityMap = new Map();
    for (const row of popularCitiesRaw) {
        const city = (row.city || "").trim();
        if (!city) continue;
        const citySlug = slugifyTR(city);
        const current = cityMap.get(citySlug) || {
            slug: citySlug,
            name: capitalizeWords(city),
            count: 0,
        };
        current.count += 1;
        cityMap.set(citySlug, current);
    }
    const topCities = Array.from(cityMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
        ...category,
        displayName: capitalizeWords(category.name),
        count: businessCount,
        topCities,
        categoryIds,
    };
}

async function getCategoryBusinesses(categoryIds) {
    return prisma.business.findMany({
        where: {
            isActive: true,
            OR: [
                { primaryCategoryId: { in: categoryIds } },
                { businesscategory: { some: { categoryId: { in: categoryIds } } } },
            ],
        },
        select: { name: true, slug: true },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        take: 100,
    });
}

export async function generateMetadata({ params, searchParams }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.category;
    if (!slug) return { title: "Kategori Bulunamadı" };

    const catData = await getCategoryData(slug);
    if (!catData) return { title: "Kategori Bulunamadı" };

    const hasSearchParams = searchParams && Object.keys(searchParams).length > 0;
    const canonicalUrl = `${APP_URL}/kategori/${slug}`;
    const title = `${catData.displayName} Firmaları ve İşletmeleri | Civardaki`;
    const description = `${catData.displayName} kategorisinde ${catData.count}+ işletmeyi şehir ve ilçe filtreleriyle keşfedin. Yorumları inceleyin, hızlıca teklif alın.`;
    const ogImage = `${APP_URL}/default-og-category.jpg`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        robots: {
            index: !hasSearchParams, // 9H: noindex if there are query parameters
            follow: true
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: "Civardaki",
            images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
            locale: "tr_TR",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage],
        }
    };
}

export default async function CategoryLandingPage({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.category;
    if (!slug) notFound();

    const catData = await getCategoryData(slug);
    if (!catData) notFound();

    // Fetch businesses for JSON-LD
    const businesses = await getCategoryBusinesses(catData.categoryIds);

    // JSON-LD: CollectionPage
    const jsonLd = buildCollectionPage(catData.displayName, slug, businesses);

    // JSON-LD: BreadcrumbList
    const breadcrumbItems = [
        { name: "Anasayfa", url: "/" },
        { name: "Kategoriler", url: "/#kategoriler" },
        { name: catData.displayName, url: `/kategori/${slug}` }
    ];
    const breadcrumbLd = buildBreadcrumbList(breadcrumbItems);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* JSON-LD Widgets */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {breadcrumbLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
                />
            )}

            <div className="bg-slate-950 text-white pt-20 pb-20">
                <div className="mx-auto max-w-6xl px-6 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold tracking-widest uppercase mb-6">
                        Kategori Filtresi (ABİ SAYFA GENELİ ELDEN GEÇECEK BOŞ KALMASIN DİYE BÖYLE EKLEDİM)
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black capitalize tracking-tight">{catData.displayName} İşletmeleri</h1>
                    <p className="mt-4 text-slate-300 font-semibold max-w-2xl mx-auto">
                        {catData.displayName} kategorisinde {catData.count} aktif işletmeyi tek sayfada filtreleyin, karşılaştırın ve doğrudan iletişime geçin.
                    </p>
                </div>
            </div>

            <section className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Toplam İşletme</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{catData.count}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Alt Kategori</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{catData.children.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Popüler Şehir</p>
                        <p className="mt-2 text-2xl font-black text-slate-900">{catData.topCities[0]?.name || "-"}</p>
                    </div>
                </div>

                {(catData.description || catData.children.length > 0) && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                        {catData.description && (
                            <p className="text-slate-700 font-medium leading-relaxed">{catData.description}</p>
                        )}
                        {catData.children.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {catData.children.map((child) => (
                                    <Link
                                        key={child.id}
                                        href={`/kategori/${child.slug}`}
                                        className="px-3 py-2 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                    >
                                        {child.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {catData.topCities.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                            Şehre Göre Hızlı Keşif
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {catData.topCities.map((city) => (
                                <Link
                                    key={city.slug}
                                    href={`/${city.slug}/${catData.slug}`}
                                    className="px-3 py-2 rounded-full text-xs font-bold border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors"
                                >
                                    {city.name} ({city.count})
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <BusinessListClient initialCategory={catData.slug} />

            {/* SPRINT 9H: Internal Linking Engine (Popular Category Businesses) */}
            <PopularBusinesses categoryId={catData.id} categoryDisplayName={catData.displayName} />
        </div>
    );
}
