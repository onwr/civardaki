import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CategoryBreadcrumbs from "@/components/category/CategoryBreadcrumbs";
import CategoryHero from "@/components/category/CategoryHero";
import CategorySubcategories from "@/components/category/CategorySubcategories";
import CategoryBusinessExplorer from "@/components/category/CategoryBusinessExplorer";
import CategoryTrustBar from "@/components/category/CategoryTrustBar";
import { prisma } from "@/lib/prisma";
import { capitalizeWords } from "@/lib/formatters";
import { businessWhereForCategoryIds } from "@/lib/category-business-filter";
import { buildCollectionPage, buildBreadcrumbList } from "@/lib/jsonld";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

export const revalidate = 300;

async function countBusinessesForCategoryIds(categoryIds) {
    return prisma.business.count({
        where: businessWhereForCategoryIds(categoryIds),
    });
}

async function getCategoryData(slug) {
    const category = await prisma.category.findFirst({
        where: { slug, isActive: true },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            imageUrl: true,
            icon: true,
            color: true,
            parentId: true,
            parent: { select: { id: true, name: true, slug: true } },
            children: {
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    imageUrl: true,
                    icon: true,
                },
                orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
                take: 12,
            },
        },
    });
    if (!category) return null;

    const categoryIds = [category.id, ...category.children.map((item) => item.id)];
    const businessWhere = businessWhereForCategoryIds(categoryIds);

    const [businessCount, reviewAgg, childrenWithCounts] = await Promise.all([
        prisma.business.count({ where: businessWhere }),
        prisma.business.aggregate({
            where: { ...businessWhere, reviewCount: { gt: 0 } },
            _avg: { rating: true },
            _sum: { reviewCount: true },
        }),
        Promise.all(
            category.children.map(async (child) => ({
                ...child,
                displayName: capitalizeWords(child.name),
                businessCount: await countBusinessesForCategoryIds([child.id]),
            })),
        ),
    ]);

    const avgRating = reviewAgg._avg.rating
        ? Math.round(reviewAgg._avg.rating * 10) / 10
        : 0;
    const totalReviews = reviewAgg._sum.reviewCount || 0;

    return {
        ...category,
        displayName: capitalizeWords(category.name),
        parentDisplayName: category.parent
            ? capitalizeWords(category.parent.name)
            : null,
        count: businessCount,
        children: childrenWithCounts,
        categoryIds,
        stats: {
            businessCount,
            subcategoryCount: category.children.length,
            avgRating,
            totalReviews,
        },
    };
}

async function getCategoryBusinesses(categoryIds) {
    return prisma.business.findMany({
        where: businessWhereForCategoryIds(categoryIds),
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

    const resolvedSearchParams = await searchParams;
    const hasSearchParams =
        resolvedSearchParams && Object.keys(resolvedSearchParams).length > 0;
    const canonicalUrl = `${APP_URL}/kategori/${slug}`;
    const title = `${catData.displayName} Firmaları ve İşletmeleri | Civardaki`;
    const description = `${catData.displayName} kategorisinde ${catData.count}+ işletmeyi şehir ve ilçe filtreleriyle keşfedin. Yorumları inceleyin, hızlıca teklif alın.`;
    const ogImage = catData.imageUrl || `${APP_URL}/default-og-category.jpg`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        robots: {
            index: !hasSearchParams,
            follow: true,
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
        },
    };
}

export default async function CategoryLandingPage({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.category;
    if (!slug) notFound();

    const catData = await getCategoryData(slug);
    if (!catData) notFound();

    const businesses = await getCategoryBusinesses(catData.categoryIds);
    const jsonLd = buildCollectionPage(catData.displayName, slug, businesses);

    const breadcrumbItems = [
        { name: "Ana Sayfa", url: "/" },
        ...(catData.parent
            ? [
                  {
                      name: capitalizeWords(catData.parent.name),
                      url: `/kategori/${catData.parent.slug}`,
                  },
              ]
            : [{ name: "Kategoriler", url: "/#kategoriler" }]),
        { name: catData.displayName, url: `/kategori/${slug}` },
    ];
    const breadcrumbLd = buildBreadcrumbList(breadcrumbItems);

    return (
        <>
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

            <Header />

            <main className="min-h-screen bg-slate-50 pt-20">
                <CategoryBreadcrumbs
                    parent={
                        catData.parent
                            ? {
                                  name: catData.parentDisplayName,
                                  slug: catData.parent.slug,
                              }
                            : null
                    }
                    currentName={catData.displayName}
                />

                <CategoryHero
                    displayName={catData.displayName}
                    parentLabel={catData.parentDisplayName}
                    description={
                        catData.description ||
                        `${catData.displayName} kategorisinde en iyi işletmeleri keşfedin, menüleri inceleyin ve hızlıca teklif alın.`
                    }
                    imageUrl={catData.imageUrl}
                    icon={catData.icon}
                    color={catData.color}
                    stats={catData.stats}
                    categorySlug={slug}
                />

                {catData.children.length > 0 && (
                    <CategorySubcategories subcategories={catData.children} />
                )}

                <CategoryBusinessExplorer
                    categorySlug={slug}
                    categoryName={catData.displayName}
                    totalBusinessCount={catData.stats.businessCount}
                />

                <CategoryTrustBar />
            </main>

            <Footer />
        </>
    );
}
