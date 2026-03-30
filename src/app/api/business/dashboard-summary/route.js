import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCompletion } from "@/lib/completion";
import { calculateQualityScore } from "@/lib/quality-score";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "BUSINESS") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const businessId = session.user.businessId;
    if (!businessId) return NextResponse.json({ message: "Business not found" }, { status: 404 });

    const [business, productCount, categoryCount, mediaLogo, mediaCover] = await Promise.all([
        prisma.business.findUnique({
            where: { id: businessId },
            select: {
                id: true, name: true, slug: true,
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

    const counts = {
        productCount,
        categoryCount,
        hasLogo: !!mediaLogo,
        hasCover: !!mediaCover
    };

    // SPRINT 9B: Calculate actual funnel metrics for the last 30 days
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
        employeeCount,
        orderTodayAgg,
        orderWeekAgg,
        orderMonthAgg,
        expenseTodayAgg,
        expenseMonthAgg,
        leadCountToday,
        leadCountNew,
        leadCountNewToday,
        orderCountToday,
        orderCountMonth,
        pendingReservationCount,
        newReservationCountToday,
        orderCalendarMonthAgg,
        expenseCalendarMonthAgg,
        incomeTodayAgg,
        productsForStock,
        cashBalanceAgg,
        upcomingExpenseDue,
        upcomingLoanDue,
        debtTotalAgg,
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
                businessId,
                createdAt: { gte: thirtyDaysAgo }
            }
        }),
        // SPRINT 9F: Missed Leads (> 30 mins, NEW status)
        prisma.lead.count({
            where: {
                businessId,
                status: "NEW",
                createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) }
            }
        }),
        // SPRINT 9F: Competitor Benchmark (Avg Response in Category)
        business.category ? prisma.business.aggregate({
            where: { category: business.category, avgResponseMinutes: { gt: 0 } },
            _avg: { avgResponseMinutes: true }
        }) : Promise.resolve({ _avg: { avgResponseMinutes: null } }),

        // SPRINT 10A: Referral Stats
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
        prisma.employee.count({ where: { businessId, status: "ACTIVE" } }),
        prisma.order.aggregate({
            where: { businessId, createdAt: { gte: startOfToday } },
            _sum: { total: true },
            _count: { id: true }
        }),
        prisma.order.aggregate({
            where: { businessId, createdAt: { gte: sevenDaysAgo } },
            _sum: { total: true },
            _count: { id: true }
        }),
        prisma.order.aggregate({
            where: { businessId, createdAt: { gte: thirtyDaysAgo } },
            _sum: { total: true },
            _count: { id: true }
        }),
        prisma.financial_transaction.aggregate({
            where: { businessId, type: "EXPENSE", date: { gte: startOfToday } },
            _sum: { amount: true }
        }),
        prisma.financial_transaction.aggregate({
            where: { businessId, type: "EXPENSE", date: { gte: thirtyDaysAgo } },
            _sum: { amount: true }
        }),
        prisma.lead.count({ where: { businessId, createdAt: { gte: startOfToday } } }),
        prisma.lead.count({ where: { businessId, status: "NEW" } }),
        prisma.lead.count({ where: { businessId, status: "NEW", createdAt: { gte: startOfToday } } }),
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
            where: { businessId, createdAt: { gte: startOfMonth } },
            _sum: { total: true },
        }),
        prisma.financial_transaction.aggregate({
            where: {
                businessId,
                type: "EXPENSE",
                date: { gte: startOfMonth },
            },
            _sum: { amount: true },
        }),
        prisma.financial_transaction.aggregate({
            where: {
                businessId,
                type: "INCOME",
                date: { gte: startOfToday },
            },
            _sum: { amount: true },
        }),
        prisma.product.findMany({
            where: { businessId, isActive: true },
            select: { price: true, discountPrice: true, stock: true },
        }),
        prisma.cash_account.aggregate({
            where: { businessId },
            _sum: { balance: true },
        }),
        prisma.financial_transaction.findMany({
            where: {
                businessId,
                type: "EXPENSE",
                status: "PENDING",
                dueDate: { gt: new Date() },
            },
            select: { id: true, title: true, amount: true, dueDate: true },
            orderBy: { dueDate: "asc" },
            take: 5,
        }),
        prisma.financial_transaction.findMany({
            where: {
                businessId,
                type: "LOAN",
                OR: [
                    { dueDate: { gt: new Date() } },
                    { status: "PENDING" },
                ],
            },
            select: { id: true, title: true, amount: true, dueDate: true, totalAmount: true },
            orderBy: { dueDate: "asc" },
            take: 5,
        }),
        prisma.financial_transaction.aggregate({
            where: { businessId, type: "DEBT" },
            _sum: { amount: true },
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

    // Conversion rate: (Leads / Profile Views) * 100
    const conversionRate = views30Days > 0 ? ((leadCount30Days / views30Days) * 100).toFixed(1) : 0;

    let fxTryPerUsd = null;
    let fxTryPerEur = null;
    try {
        const [usdRes, eurRes] = await Promise.all([
            fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(4000) }),
            fetch("https://open.er-api.com/v6/latest/EUR", { signal: AbortSignal.timeout(4000) }),
        ]);
        if (usdRes.ok) {
            const ju = await usdRes.json();
            if (ju.result === "success" && ju.rates?.TRY) fxTryPerUsd = ju.rates.TRY;
        }
        if (eurRes.ok) {
            const je = await eurRes.json();
            if (je.result === "success" && je.rates?.TRY) fxTryPerEur = je.rates.TRY;
        }
    } catch (_) {
        /* kurlar isteğe bağlı */
    }

    const stockValue = (productsForStock || []).reduce((sum, p) => {
        const unit = p.discountPrice ?? p.price ?? 0;
        const qty = p.stock ?? 0;
        return sum + unit * qty;
    }, 0);

    const { completionPercent, missingSteps } = computeCompletion(business, counts);

    // SPRINT 9F/9G: Quality Score Calculation
    const qualityScoreData = calculateQualityScore({
        rating: business.ratingSum > 0 ? (business.ratingSum / business.responseCount) : 0, // Quick fallback if no raw rating returned
        reviewCount: business.reviewCount,
        avgResponseMinutes: business.avgResponseMinutes,
        responseCount: business.responseCount,
        conversionRate,
        completionPercent,
        views30Days
    });

    return NextResponse.json({
        business: {
            id: business.id,
            name: business.name,
            slug: business.slug,
            logoUrl: mediaLogo?.url || null,
            completion: completionPercent,
            missingSteps: missingSteps, // SPRINT 13B
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
            employeeCount: employeeCount ?? 0,
            revenueToday: orderTodayAgg?._sum?.total ?? 0,
            revenueWeek: orderWeekAgg?._sum?.total ?? 0,
            revenueMonth: orderMonthAgg?._sum?.total ?? 0,
            orderCountToday: orderCountToday ?? 0,
            orderCountMonth: orderCountMonth ?? 0,
            pendingReservationCount: pendingReservationCount ?? 0,
            newReservationCountToday: newReservationCountToday ?? 0,
            expenseToday: expenseTodayAgg?._sum?.amount ?? 0,
            expenseMonth: expenseMonthAgg?._sum?.amount ?? 0,
            leadCountToday,
            leadCountNew,
            leadCountNewToday,
            reviewCount: business.reviewCount ?? 0,
            revenueCalendarMonth: orderCalendarMonthAgg?._sum?.total ?? 0,
            expenseCalendarMonth: expenseCalendarMonthAgg?._sum?.amount ?? 0,
            collectionToday: incomeTodayAgg?._sum?.amount ?? 0,
            stockValue,
            assetsTotal: cashBalanceAgg?._sum?.balance ?? 0,
            debtsTotal: debtTotalAgg?._sum?.amount ?? 0,
            fxTryPerUsd,
            fxTryPerEur,
            upcomingExpenses: (upcomingExpenseDue || []).map((r) => ({
                id: r.id,
                title: r.title,
                amount: r.amount,
                dueDate: r.dueDate,
            })),
            upcomingLoans: (upcomingLoanDue || []).map((r) => ({
                id: r.id,
                title: r.title,
                amount: r.totalAmount ?? r.amount,
                dueDate: r.dueDate,
            })),
        },
        activity: [],
    });
}
