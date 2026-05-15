import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDistance, formatDistance } from "@/lib/geo";
import {
    filterBusinessesByLocation,
    sortByNearbyRelevance,
} from "@/lib/location-match";

export const revalidate = 30;

function toStr(v) {
    return (v ?? "").toString().trim();
}

function pickMediaUrls(media) {
    const list = Array.isArray(media) ? media : [];
    const cover = list.find((m) => m.type === "COVER")?.url || null;
    const logo = list.find((m) => m.type === "LOGO")?.url || null;
    return { coverUrl: cover || logo, logoUrl: logo || cover };
}

function mapBusinessRow(b, userLat, userLng) {
    const distance =
        userLat && userLng && b.latitude && b.longitude
            ? calculateDistance(userLat, userLng, b.latitude, b.longitude)
            : null;

    const { coverUrl, logoUrl } = pickMediaUrls(b.media);

    return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        services: b.services,
        city: b.city,
        district: b.district,
        category: b.category,
        latitude: b.latitude,
        longitude: b.longitude,
        rating: b.rating,
        reviewCount: b.reviewCount,
        avgResponseMinutes: b.avgResponseMinutes,
        isVerified: b.isVerified,
        isOpen: b.isOpen !== false,
        distance,
        distanceText: distance != null ? formatDistance(distance) : null,
        monthlyLeadCount: b._count?.lead || 0,
        reviewsCount: b._count?.review || 0,
        productsCount: b._count?.product || 0,
        coverUrl,
        logoUrl,
        createdAt: b.createdAt,
    };
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const q = toStr(searchParams.get("q"));
    const city = toStr(searchParams.get("city"));
    const district = toStr(searchParams.get("district"));
    const category = toStr(searchParams.get("category"));
    const sort = toStr(searchParams.get("sort")) || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(24, Math.max(6, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    const userLat = parseFloat(searchParams.get("lat"));
    const userLng = parseFloat(searchParams.get("lng"));
    const hasCoords =
        Number.isFinite(userLat) && Number.isFinite(userLng);

    const statusFilter = toStr(searchParams.get("status"));
    const isOpenOnly = statusFilter === "open";
    const minRatingParam = searchParams.get("minRating");
    const minRating =
        minRatingParam != null && minRatingParam !== ""
            ? Math.min(5, Math.max(0, parseFloat(minRatingParam)))
            : null;

    const useLocationFilter = Boolean(city || district);
    const isNearbySort = sort === "nearby";
    const isDistanceSort = sort === "distance" || (isNearbySort && hasCoords);
    const needsPostProcess = useLocationFilter || isNearbySort || isDistanceSort;

    const orderBy =
        sort === "popular"
            ? [
                  { rating: "desc" },
                  { ratingSum: "desc" },
                  { responseCount: "desc" },
                  { createdAt: "desc" },
              ]
            : [{ createdAt: "desc" }];

    try {
        let categoryFilter = {};
        if (category) {
            const matchedCategories = await prisma.category.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { id: category },
                        { slug: { equals: category } },
                        { name: { equals: category } },
                    ],
                },
                select: { id: true, name: true },
                take: 10,
            });

            const categoryNames = Array.from(
                new Set([
                    category,
                    ...matchedCategories.map((item) => item.name).filter(Boolean),
                ]),
            );
            const categoryIds = matchedCategories.map((item) => item.id).filter(Boolean);

            const legacyCategoryClauses = categoryNames.map((name) => ({
                category: name,
            }));
            const relationClauses = categoryIds.length
                ? [
                      { primaryCategoryId: { in: categoryIds } },
                      {
                          businesscategory: {
                              some: { categoryId: { in: categoryIds } },
                          },
                      },
                  ]
                : [];

            categoryFilter =
                legacyCategoryClauses.length || relationClauses.length
                    ? { OR: [...legacyCategoryClauses, ...relationClauses] }
                    : { category };
        }

        const andConditions = [];
        if (categoryFilter && Object.keys(categoryFilter).length) {
            andConditions.push(categoryFilter);
        }
        if (q) {
            andConditions.push({
                OR: [
                    { name: { contains: q } },
                    { description: { contains: q } },
                ],
            });
        }

        const where = {
            isActive: true,
            ...(!useLocationFilter && city ? { city } : {}),
            ...(!useLocationFilter && district ? { district } : {}),
            ...(isOpenOnly ? { isOpen: true } : {}),
            ...(minRating != null && !Number.isNaN(minRating)
                ? { rating: { gte: minRating } }
                : {}),
            ...(andConditions.length ? { AND: andConditions } : {}),
        };

        const fetchTake = needsPostProcess ? 100 : limit;
        const fetchSkip = needsPostProcess ? 0 : skip;

        const items = await prisma.business.findMany({
            where,
            orderBy,
            skip: fetchSkip,
            take: fetchTake,
            select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                services: true,
                city: true,
                district: true,
                category: true,
                latitude: true,
                longitude: true,
                rating: true,
                reviewCount: true,
                avgResponseMinutes: true,
                isVerified: true,
                isOpen: true,
                createdAt: true,
                _count: {
                    select: {
                        lead: true,
                        review: true,
                        product: true,
                    },
                },
                media: {
                    where: { type: { in: ["COVER", "LOGO"] } },
                    select: { url: true, type: true },
                    take: 4,
                },
            },
        });

        let processedItems = items.map((b) =>
            mapBusinessRow(b, hasCoords ? userLat : null, hasCoords ? userLng : null),
        );

        if (useLocationFilter) {
            processedItems = filterBusinessesByLocation(
                processedItems,
                city,
                district,
            );
        }

        if (isDistanceSort && hasCoords) {
            processedItems.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        } else if (isNearbySort) {
            processedItems = sortByNearbyRelevance(processedItems, city, district);
        }

        const total = needsPostProcess
            ? processedItems.length
            : await prisma.business.count({ where });

        if (needsPostProcess) {
            processedItems = processedItems.slice(skip, skip + limit);
        }

        return NextResponse.json(
            {
                items: processedItems,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.max(1, Math.ceil(total / limit)),
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error fetching businesses:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch businesses",
                message: error.message,
            },
            { status: 500 },
        );
    }
}
