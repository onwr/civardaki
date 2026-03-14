import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req, { params }) {
    try {
        const resolved = params != null && typeof params.then === "function" ? await params : (params || {});
        const slug = resolved?.slug?.toString?.()?.trim();
        if (!slug) return NextResponse.json({ message: "Bad request" }, { status: 400 });

        const business = await prisma.business.findUnique({
            where: { slug },
            select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                category: true,
                primaryCategoryId: true,
                primaryCategory: {
                    select: { id: true, name: true, slug: true },
                },
                phone: true,
                email: true,
                website: true,
                address: true,
                city: true,
                district: true,
                rating: true,
                reviewCount: true,
                isActive: true,
                isVerified: true,
                isOpen: true,
                reservationEnabled: true,
                latitude: true,
                longitude: true,
                createdAt: true,
                avgResponseMinutes: true,
                responseCount: true,
                services: true,
                workingHours: true,
                reservationSettings: {
                    select: {
                        timezone: true,
                        slotDurationMin: true,
                        minNoticeMinutes: true,
                        maxAdvanceDays: true,
                        availability: {
                            where: { isEnabled: true },
                            select: {
                                id: true,
                                dayOfWeek: true,
                                startTime: true,
                                endTime: true,
                            },
                            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
                        },
                        questions: {
                            where: { isActive: true },
                            select: {
                                id: true,
                                label: true,
                                type: true,
                                isRequired: true,
                                sortOrder: true,
                                options: {
                                    select: { id: true, label: true, sortOrder: true },
                                    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
                                },
                            },
                            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
                        },
                    },
                },
                media: {
                    select: { url: true, type: true },
                },
                _count: {
                    select: { lead: true }
                }
            },
        });

        if (!business || !business.isActive) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const { media, _count, primaryCategory, reservationSettings, ...rest } = business;
        return NextResponse.json({
            business: {
                ...rest,
                logoUrl: media?.find(i => i.type === "LOGO")?.url || null,
                coverUrl: media?.find(i => i.type === "COVER")?.url || null,
                gallery: media?.filter(i => i.type === "GALLERY")?.map(i => i.url) || [],
                recentLeadCount: _count?.lead ?? 0,
                primaryCategory: primaryCategory ? { id: primaryCategory.id, name: primaryCategory.name, slug: primaryCategory.slug } : null,
                reservationConfig: reservationSettings ? {
                    timezone: reservationSettings.timezone,
                    slotDurationMin: reservationSettings.slotDurationMin,
                    minNoticeMinutes: reservationSettings.minNoticeMinutes,
                    maxAdvanceDays: reservationSettings.maxAdvanceDays,
                    availability: reservationSettings.availability || [],
                    questions: reservationSettings.questions || [],
                } : null,
            },
        });
    } catch (e) {
        console.error("PUBLIC BUSINESS DETAIL ERROR:", e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
