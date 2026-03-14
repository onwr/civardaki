import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    neighborhood_post_status,
} from "@prisma/client";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const tab = searchParams.get("tab");
        const category = searchParams.get("category");
        const search = searchParams.get("search") || "";
        const city = (searchParams.get("city") || "").trim();
        const district = (searchParams.get("district") || "").trim();
        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 10);

        const where = {
            status: neighborhood_post_status.PUBLISHED,
        };

        if (tab) {
            where.tab = tab;
        }

        if (tab === "MARKETPLACE" && category && category !== "ALL") {
            where.marketplaceCategory = category;
        }
        if (city) where.city = city;
        if (district) where.district = district;

        if (search.trim()) {
            where.OR = [
                { title: { contains: search.trim() } },
                { content: { contains: search.trim() } },
                { description: { contains: search.trim() } },
                { location: { contains: search.trim() } },
            ];
        }

        const [items, total] = await Promise.all([
            prisma.neighborhood_post.findMany({
                where,
                orderBy: [
                    { isPinned: "desc" },
                    { createdAt: "desc" },
                ],
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    images: {
                        orderBy: { sortOrder: "asc" },
                    },
                    attributes: {
                        orderBy: { sortOrder: "asc" },
                    },
                    authorUser: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    authorBusiness: {
                        select: {
                            id: true,
                            name: true,
                            isVerified: true,
                        },
                    },
                    _count: {
                        select: {
                            comments: true,
                            likes: true,
                        },
                    },
                },
            }),
            prisma.neighborhood_post.count({ where }),
        ]);

        const data = items.map((post) => ({
            id: post.id,
            slug: post.slug,
            tab: post.tab,
            type: post.type,
            category: post.marketplaceCategory,
            title: post.title,
            content: post.content,
            description: post.description,
            price: post.price,
            currency: post.currency,
            location: post.location,
            city: post.city,
            district: post.district,
            eventStartAt: post.eventStartAt,
            eventEndAt: post.eventEndAt,
            eventLocation: post.eventLocation,
            time: post.createdAt,
            images: post.images.map((img) => img.url),
            attributes: post.attributes,
            stats: {
                likes: post._count.likes,
                comments: post._count.comments,
                shares: post.shareCount,
            },
            author: post.authorBusiness?.name || post.authorUser?.name || "Bilinmiyor",
            avatar:
                (post.authorBusiness?.name || post.authorUser?.name || "NA")
                    .slice(0, 2)
                    .toUpperCase(),
            role: post.authorBusiness ? "business" : "user",
            badge: post.authorBusiness ? "Esnaf" : "Mahalleli",
            rating: post.authorBusiness?.isVerified ? 5 : null,
            isVerified: !!post.authorBusiness?.isVerified,
        }));

        return NextResponse.json({
            success: true,
            items: data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("GET /api/neighborhood/posts error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Gönderiler alınamadı.",
            },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Oturum açmanız gerekiyor.",
                },
                { status: 401 }
            );
        }

        const body = await req.json();

        const {
            title,
            content,
            description,
            tab,
            type,
            marketplaceCategory,
            price,
            currency,
            location,
            city,
            district,
            eventStartAt,
            eventEndAt,
            eventLocation,
            images = [],
            attributes = [],
            authorBusinessId,
            contactPhone,
            contactWhatsapp,
        } = body;

        if (!title || !tab || !type) {
            return NextResponse.json(
                {
                    success: false,
                    message: "title, tab ve type zorunludur.",
                },
                { status: 400 }
            );
        }

        const slugBase = title
            .toLowerCase()
            .replaceAll("ı", "i")
            .replaceAll("ğ", "g")
            .replaceAll("ü", "u")
            .replaceAll("ş", "s")
            .replaceAll("ö", "o")
            .replaceAll("ç", "c")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        const slug = `${slugBase}-${Date.now()}`;

        const created = await prisma.neighborhood_post.create({
            data: {
                slug,
                title,
                content,
                description,
                tab,
                type,
                marketplaceCategory,
                price,
                currency,
                location,
                city,
                district,
                eventStartAt: eventStartAt ? new Date(eventStartAt) : null,
                eventEndAt: eventEndAt ? new Date(eventEndAt) : null,
                eventLocation,
                authorUserId: session.user.id,
                authorBusinessId: authorBusinessId || null,
                contactPhone,
                contactWhatsapp,
                images: {
                    create: images.map((url, index) => ({
                        url,
                        sortOrder: index,
                    })),
                },
                attributes: {
                    create: attributes.map((item, index) => ({
                        label: item.label,
                        value: item.value,
                        sortOrder: index,
                    })),
                },
            },
            include: {
                images: true,
                attributes: true,
            },
        });

        return NextResponse.json({
            success: true,
            item: created,
        });
    } catch (error) {
        console.error("POST /api/neighborhood/posts error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Gönderi oluşturulamadı.",
            },
            { status: 500 }
        );
    }
}

