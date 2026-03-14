import { notFound } from "next/navigation";
import BusinessListClient from "@/components/home/BusinessListClient";
import PopularBusinesses from "@/components/category/PopularBusinesses";
import { prisma } from "@/lib/prisma";
import { slugifyTR, capitalizeWords } from "@/lib/formatters";
import { buildCollectionPage, buildBreadcrumbList } from "@/lib/jsonld";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

async function getCategoryData(slug) {
    const stats = await prisma.business.groupBy({
        by: ["category"],
        where: { isActive: true },
        _count: { _all: true },
    });

    const match = stats.find(st => st.category && slugifyTR(st.category.trim()) === slug);
    if (!match) return null;

    return {
        raw: match.category.trim(),
        displayName: capitalizeWords(match.category.trim()),
        count: match._count._all
    };
}

async function getCategoryBusinesses(categoryRaw) {
    return prisma.business.findMany({
        where: { isActive: true, category: categoryRaw },
        select: { name: true, slug: true },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
}

export async function generateMetadata({ params, searchParams }) {
    const slug = params?.category;
    if (!slug) return { title: "Kategori Bulunamadı" };

    const catData = await getCategoryData(slug);
    if (!catData) return { title: "Kategori Bulunamadı" };

    const hasSearchParams = searchParams && Object.keys(searchParams).length > 0;
    const canonicalUrl = `${APP_URL}/kategori/${slug}`;
    const title = `${catData.displayName} Firmaları ve İşletmeleri | Civardaki`;
    const description = `En iyi ${catData.displayName} işletmeleri, yorumları ve iletişim bilgileri Civardaki'nde. Hemen fiyat/randevu talebi oluşturun.`;
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
    const slug = params?.category;
    if (!slug) notFound();

    const catData = await getCategoryData(slug);
    if (!catData) notFound();

    // Fetch businesses for JSON-LD
    const businesses = await getCategoryBusinesses(catData.raw);

    // JSON-LD: CollectionPage
    const jsonLd = buildCollectionPage(catData.displayName, `${APP_URL}/kategori/${slug}`, businesses);

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
                        Kategori Filtresi
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black capitalize tracking-tight">{catData.displayName} İşletmeleri</h1>
                    <p className="mt-4 text-slate-300 font-semibold max-w-2xl mx-auto">
                        {catData.displayName} kategorisindeki en iyi ve güncel sonuçlar sizin için filtrelendi. Taleplerinizi doğrudan işletmelere iletebilirsiniz.
                    </p>
                </div>
            </div>

            <BusinessListClient initialSearch={catData.displayName} initialCategory={catData.raw} />

            {/* SPRINT 9H: Internal Linking Engine (Popular Category Businesses) */}
            <PopularBusinesses categoryRaw={catData.raw} categoryDisplayName={catData.displayName} />
        </div>
    );
}
