import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDistance } from "@/lib/geo";

export const revalidate = 30; // ISR cache for 30s

function toStr(v) {
    return (v ?? "").toString().trim();
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

    // User coordinates for distance calculation
    const userLat = parseFloat(searchParams.get("lat"));
    const userLng = parseFloat(searchParams.get("lng"));

    // Optional filters from query
    const statusFilter = toStr(searchParams.get("status"));
    const isOpenOnly = statusFilter === "open";
    const minRatingParam = searchParams.get("minRating");
    const minRating = minRatingParam != null && minRatingParam !== "" ? Math.min(5, Math.max(0, parseFloat(minRatingParam))) : null;

    // Sorting logic
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
                new Set([category, ...matchedCategories.map((item) => item.name).filter(Boolean)])
            );
            const categoryIds = matchedCategories.map((item) => item.id).filter(Boolean);

            const legacyCategoryClauses = categoryNames.map((name) => ({ category: name }));
            const relationClauses = categoryIds.length
                ? [
                      { primaryCategoryId: { in: categoryIds } },
                      { businesscategory: { some: { categoryId: { in: categoryIds } } } },
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
            ...(city ? { city } : {}),
            ...(district ? { district } : {}),
            ...(isOpenOnly ? { isOpen: true } : {}),
            ...(minRating != null && !Number.isNaN(minRating) ? { rating: { gte: minRating } } : {}),
            ...(andConditions.length ? { AND: andConditions } : {}),
        };

        const [items, total] = await Promise.all([
            prisma.business.findMany({
                where,
                orderBy,
                skip: sort === "distance" ? 0 : skip,
                take: sort === "distance" ? 100 : limit,
                select: {
                    id: true,
                    slug: true,
                    name: true,
                    description: true,
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

                    // Count relations correctly - use singular names
                    _count: {
                        select: {
                            lead: true, // Changed from 'leads' to 'lead' (singular)
                            review: true,
                            product: true,
                        },
                    },

                    // Get media/images
                    media: {
                        where: { type: "LOGO" },
                        select: { url: true },
                        take: 1,
                    },
                },
            }),
            prisma.business.count({ where }),
        ]);

        // Calculate distance and transform
        let processedItems = items.map((b) => {
            const distance =
                userLat && userLng && b.latitude && b.longitude
                    ? calculateDistance(userLat, userLng, b.latitude, b.longitude)
                    : null;

            return {
                id: b.id,
                slug: b.slug,
                name: b.name,
                description: b.description,
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
                monthlyLeadCount: b._count?.lead || 0,
                reviewsCount: b._count?.review || 0,
                productsCount: b._count?.product || 0,
                logoUrl: b.media?.[0]?.url || null,
                createdAt: b.createdAt,
            };
        });

        // Haversine sorting if requested
        if (sort === "distance" && userLat && userLng) {
            processedItems.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });

            // Manual pagination after app-side sorting
            processedItems = processedItems.slice(skip, skip + limit);
        }

        return NextResponse.json(
            {
                items: processedItems,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching businesses:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch businesses",
                message: error.message,
            },
            { status: 500 }
        );
    }
}