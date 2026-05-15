import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCompletion } from "@/lib/completion";
import { calculateQualityScore } from "@/lib/quality-score";
import { loadBusinessLeadCategories, buildBusinessLeadsWhere } from "@/lib/business-lead-visibility";
import { buildNavModulesList } from "@/lib/dashboard-nav-modules";
import { canCallBusinessApi } from "@/lib/session-business-access";

const SHORT_WEEKDAYS_TR = ["Pzr", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

/** Son 7 gün (bugün dahil), yerel gece yarısı sınırları. */
function getLast7LocalDayWindows() {
    const windows = [];
    for (let i = 6; i >= 0; i--) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - i);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        windows.push({
            start,
            end,
            label: SHORT_WEEKDAYS_TR[start.getDay()],
            dateKey: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`,
        });
    }
    return windows;
}

/** Platform siparişleri + günlük talep sayısı (muhasebe hareketi yok). */
async function buildTopSummarySeries(prismaClient, businessId, dayWindows, leadVisAll) {
    const rows = await Promise.all(
        dayWindows.map(({ start, end }) =>
            Promise.all([
                prismaClient.order.aggregate({
                    where: { businessId, status: { not: "CANCELLED" }, createdAt: { gte: start, lt: end } },
                    _sum: { total: true },
                }),
                prismaClient.lead.count({
                    where: { AND: [leadVisAll, { createdAt: { gte: start, lt: end } }] },
                }),
            ]),
        ),
    );

    return dayWindows.map((w, idx) => {
        const [ord, leadsDay] = rows[idx];
        return {
            label: w.label,
            date: w.dateKey,
            revenue: Number(ord._sum.total) || 0,
            leads: leadsDay,
        };
    });
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!canCallBusinessApi(session.user)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const businessId = session.user.businessId;
    if (!businessId) return NextResponse.json({ message: "Business not found" }, { status: 404 });

    const [business, productCount, categoryCount, mediaLogo, mediaCover] = await Promise.all([
        prisma.business.findUnique({
            where: { id: businessId },
            select: {
                id: true, name: true, slug: true, type: true,
                description: true, category: true,
                phone: true, email: true, website: true,
                address: true, city: true, district: true,
                latitude: true, longitude: true,
                avgResponseMinutes: true, responseCount: true, reviewCount: true, ratingSum: true,
                referralCode: true,
                businesssubscription: true,
            },
        }),
        prisma.product.count({ where: { businessId, isActive: true } }),
        prisma.productcategory.count({ where: { businessId } }),
        prisma.media.findFirst({ where: { businessId, type: "LOGO" }, select: { url: true } }),
        prisma.media.findFirst({ where: { businessId, type: "COVER" }, select: { url: true } }),
    ]);

    if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

    const { categoryIds, legacyCategory } = await loadBusinessLeadCategories(prisma, businessId);
    const leadVisAll = buildBusinessLeadsWhere({
        businessId,
        categoryIds,
        legacyCategory,
        status: null,
        q: null,
    });
    const leadVisNew = buildBusinessLeadsWhere({
        businessId,
        categoryIds,
        legacyCategory,
        status: "NEW",
        q: null,
    });
    const thirtyMinAgoLead = new Date(Date.now() - 30 * 60 * 1000);

    const counts = {
        productCount,
        categoryCount,
        hasLogo: !!mediaLogo,
        hasCover: !!mediaCover
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
        events,
        leadCount30Days,
        missedLeadCount,
        categoryAvgAgg,
        referralRecords,
        orderTodayAgg,
        orderWeekAgg,
        orderMonthAgg,
        leadCountToday,
        leadCountNew,
        leadCountNewToday,
        orderCountToday,
        orderCountMonth,
        pendingReservationCount,
        newReservationCountToday,
        orderCalendarMonthAgg,
    ] = await Promise.all([
        prisma.businessevent.groupBy({
            by: ['type'],
            where: {
                businessId,
                createdAt: { gte: thirtyDaysAgo }
            },
            _count: { type: true }
        }),
        prisma.lead.count({
            where: {
                AND: [leadVisAll, { createdAt: { gte: thirtyDaysAgo } }],
            },
        }),
        prisma.lead.count({
            where: {
                AND: [leadVisNew, { createdAt: { lt: thirtyMinAgoLead } }],
            },
        }),
        business.category ? prisma.business.aggregate({
            where: { category: business.category, avgResponseMinutes: { gt: 0 } },
            _avg: { avgResponseMinutes: true }
        }) : Promise.resolve({ _avg: { avgResponseMinutes: null } }),

        prisma.referral.findMany({
            where: { referrerId: businessId },
            select: {
                id: true,
                invitedBizId: true,
                invitedEmail: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        }),
        prisma.order.aggregate({
            where: { businessId, status: { not: "CANCELLED" }, createdAt: { gte: startOfToday } },
            _sum: { total: true },
            _count: { id: true }
        }),
        prisma.order.aggregate({
            where: { businessId, status: { not: "CANCELLED" }, createdAt: { gte: sevenDaysAgo } },
            _sum: { total: true },
            _count: { id: true }
        }),
        prisma.order.aggregate({
            where: { businessId, status: { not: "CANCELLED" }, createdAt: { gte: thirtyDaysAgo } },
            _sum: { total: true },
            _count: { id: true }
        }),
        prisma.lead.count({
            where: { AND: [leadVisAll, { createdAt: { gte: startOfToday } }] },
        }),
        prisma.lead.count({ where: { AND: [leadVisNew] } }),
        prisma.lead.count({
            where: { AND: [leadVisNew, { createdAt: { gte: startOfToday } }] },
        }),
        prisma.order.count({ where: { businessId, createdAt: { gte: startOfToday } } }),
        prisma.order.count({ where: { businessId, createdAt: { gte: thirtyDaysAgo } } }),
        prisma.reservation.count({
            where: {
                businessId,
                status: "PENDING",
            },
        }),
        prisma.reservation.count({
            where: {
                businessId,
                createdAt: { gte: startOfToday },
                status: "PENDING",
            },
        }),
        prisma.order.aggregate({
            where: { businessId, status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } },
            _sum: { total: true },
        }),
    ]);

    let views30Days = 0;
    let productClicks30Days = 0;
    let waClicks30Days = 0;
    let phoneClicks30Days = 0;

    events.forEach(e => {
        if (e.type === "VIEW_PROFILE") views30Days = e._count.type;
        if (e.type === "VIEW_PRODUCT") productClicks30Days = e._count.type;
        if (e.type === "CLICK_WHATSAPP") waClicks30Days = e._count.type;
        if (e.type === "CLICK_PHONE") phoneClicks30Days = e._count.type;
    });

    const referralStats = {
        totalInvited: referralRecords?.length || 0,
        totalActive: referralRecords?.filter(r => r.invitedBizId).length || 0,
    };

    const invitedBizIds = (referralRecords || [])
        .map((r) => r.invitedBizId)
        .filter(Boolean);
    const invitedBusinesses = invitedBizIds.length
        ? await prisma.business.findMany({
              where: { id: { in: invitedBizIds } },
              select: { id: true, name: true, slug: true, isActive: true, isVerified: true },
          })
        : [];
    const invitedBusinessMap = new Map(invitedBusinesses.map((b) => [b.id, b]));
    const referralHistory = (referralRecords || []).map((r) => {
        const invited = r.invitedBizId ? invitedBusinessMap.get(r.invitedBizId) : null;
        const status = invited ? (invited.isVerified ? "ACTIVE" : "PENDING") : "PENDING";
        return {
            id: r.id,
            createdAt: r.createdAt,
            invitedBizId: r.invitedBizId || null,
            invitedBizName: invited?.name || r.invitedEmail || "Bekleyen davet",
            invitedBizSlug: invited?.slug || null,
            invitedEmail: r.invitedEmail || null,
            status,
            reward: status === "ACTIVE" ? "1 Ay Hediye" : null,
        };
    });

    const conversionRate = views30Days > 0 ? ((leadCount30Days / views30Days) * 100).toFixed(1) : 0;

    const { completionPercent, missingSteps } = computeCompletion(business, counts);

    const qualityScoreData = calculateQualityScore({
        rating: business.ratingSum > 0 ? (business.ratingSum / business.responseCount) : 0,
        reviewCount: business.reviewCount,
        avgResponseMinutes: business.avgResponseMinutes,
        responseCount: business.responseCount,
        conversionRate,
        completionPercent,
        views30Days
    });

    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    const weekAheadEnd = new Date(startOfToday);
    weekAheadEnd.setDate(weekAheadEnd.getDate() + 7);

    const [
        orderYearAgg,
        calendarEventsWeekCount,
        businessNoteCount,
        supportTicketOpenCount,
        reviewPendingCount,
        neighborhoodPostCount,
        referralTotalCount,
        reservationConfirmedUpcomingCount,
    ] = await Promise.all([
        prisma.order.aggregate({
            where: { businessId, status: { not: "CANCELLED" }, createdAt: { gte: startOfYear } },
            _sum: { total: true },
        }),
        prisma.calendar_event.count({
            where: {
                businessId,
                startTime: { gte: startOfToday, lt: weekAheadEnd },
            },
        }),
        prisma.business_note.count({
            where: { businessId, archivedAt: null },
        }),
        prisma.support_ticket.count({
            where: {
                businessId,
                status: { in: ["OPEN", "IN_PROGRESS", "WAITING_REPLY"] },
            },
        }),
        prisma.review.count({ where: { businessId, isApproved: false } }),
        prisma.neighborhood_post.count({
            where: { authorBusinessId: businessId, status: { not: "DELETED" } },
        }),
        prisma.referral.count({ where: { referrerId: businessId } }),
        prisma.reservation.count({
            where: {
                businessId,
                status: "CONFIRMED",
                startAt: { gte: startOfToday },
            },
        }),
    ]);

    const dayWindows = getLast7LocalDayWindows();
    const topSummarySeries = await buildTopSummarySeries(prisma, businessId, dayWindows, leadVisAll);

    const revenueToday = Number(orderTodayAgg?._sum?.total ?? 0);
    const revenueWeek = Number(orderWeekAgg?._sum?.total ?? 0);
    const revenueMonth = Number(orderMonthAgg?._sum?.total ?? 0);
    const revenueCalendarMonth = Number(orderCalendarMonthAgg?._sum?.total ?? 0);
    const revenueYear = Number(orderYearAgg?._sum?.total ?? 0);

    const navModules = buildNavModulesList(business.type, {
        views30Days,
        productClicks30Days,
        waClicks30Days,
        phoneClicks30Days,
        leadCount30Days,
        leadCountNew,
        pendingReservationCount,
        orderCountToday,
        orderCountMonth,
        productCount,
        categoryCount,
        revenueToday,
        revenueWeek,
        revenueCalendarMonth,
        revenueYear,
        completionPercent,
        missingStepsCount: Array.isArray(missingSteps) ? missingSteps.length : 0,
        calendarEventsWeekCount,
        businessNoteCount,
        supportTicketOpenCount,
        reviewPendingCount,
        neighborhoodPostCount,
        referralTotalCount,
        reservationConfirmedUpcomingCount,
    });

    return NextResponse.json({
        business: {
            id: business.id,
            name: business.name,
            slug: business.slug,
            businessType: business.type,
            logoUrl: mediaLogo?.url || null,
            completion: completionPercent,
            missingSteps: missingSteps,
            referralCode: business.referralCode,
            contact: {
                phone: business.phone,
                email: business.email,
                address: business.address,
                city: business.city,
                district: business.district,
            },
            latitude: business.latitude ?? null,
            longitude: business.longitude ?? null,
            subscription: business.businesssubscription ? {
                status: business.businesssubscription.status,
                plan: business.businesssubscription.plan,
                expiresAt: business.businesssubscription.expiresAt
            } : null
        },
        metrics: {
            views30Days,
            productClicks30Days,
            waClicks30Days,
            phoneClicks30Days,
            leadCount30Days,
            conversionRate,
            productCount,
            categoryCount,
            avgResponseMinutes: business.avgResponseMinutes,
            responseCount: business.responseCount,
            missedLeadCount,
            categoryAvgResponse: categoryAvgAgg?._avg?.avgResponseMinutes || null,
            qualityScore: qualityScoreData,
            referralStats,
            referralHistory,
            revenueToday,
            revenueWeek,
            revenueMonth,
            revenueYear,
            orderCountToday: orderCountToday ?? 0,
            orderCountMonth: orderCountMonth ?? 0,
            pendingReservationCount: pendingReservationCount ?? 0,
            newReservationCountToday: newReservationCountToday ?? 0,
            leadCountToday,
            leadCountNew,
            leadCountNewToday,
            reviewCount: business.reviewCount ?? 0,
            revenueCalendarMonth,
            topSummarySeries,
            navModules,
            businessNoteCount,
            supportTicketOpenCount,
            reviewPendingCount,
            neighborhoodPostCount,
            referralTotalCount,
            reservationConfirmedUpcomingCount,
        },
        activity: [],
    });
}
