import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCompletion } from "@/lib/completion";
import { calculateQualityScore } from "@/lib/quality-score";
import { loadBusinessLeadCategories, buildBusinessLeadsWhere } from "@/lib/business-lead-visibility";
import { buildNavModulesList } from "@/lib/dashboard-nav-modules";

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

async function buildTopSummarySeries(prisma, businessId, dayWindows) {
    const rows = await Promise.all(
        dayWindows.map(({ start, end }) =>
            Promise.all([
                prisma.order.aggregate({
                    where: { businessId, status: { not: "CANCELLED" }, createdAt: { gte: start, lt: end } },
                    _sum: { total: true },
                }),
                prisma.business_sale.aggregate({
                    where: { businessId, saleDate: { gte: start, lt: end } },
                    _sum: { totalAmount: true },
                }),
                prisma.financial_transaction.aggregate({
                     where: { businessId, type: "EXPENSE", date: { gte: start, lt: end } },
                     _sum: { amount: true },
                }),
                prisma.cash_transaction.aggregate({
                     where: { businessId, type: "EXPENSE", category: { not: "ACCOUNT_MOVEMENT" }, date: { gte: start, lt: end } },
                     _sum: { amount: true },
                }),
                prisma.financial_transaction.aggregate({
                     where: { businessId, type: "INCOME", date: { gte: start, lt: end } },
                     _sum: { amount: true },
                }),
                prisma.cash_transaction.aggregate({
                     where: { businessId, type: "INCOME", category: { not: "ACCOUNT_MOVEMENT" }, date: { gte: start, lt: end } },
                     _sum: { amount: true },
                }),
            ])
        )
    );

    return dayWindows.map((w, idx) => {
         const [ord, sale, fExp, cExp, fInc, cInc] = rows[idx];
         return {
             label: w.label,
             date: w.dateKey,
             revenue: (Number(ord._sum.total) || 0) + (Number(sale._sum.totalAmount) || 0),
             expense: (Number(fExp._sum.amount) || 0) + (Number(cExp._sum.amount) || 0),
             collection: (Number(fInc._sum.amount) || 0) + (Number(cInc._sum.amount) || 0),
         };
    });
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

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
        deliveredTodayAgg,
        productsForStock,
        cashBalanceAgg,
        upcomingExpenseDue,
        upcomingLoanDue,
        debtTotalAgg,
        saleTodayAgg,
        saleWeekAgg,
        saleMonthAgg,
        saleCalendarMonthAgg,
        cExpenseTodayAgg,
        cExpenseMonthAgg,
        cExpenseCalendarMonthAgg,
        cIncomeTodayAgg,
        saleCountToday,
        saleCountMonth,
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
        // SPRINT 9F: Missed Leads (> 30 mins, NEW status; dağıtımlıda işletme bazlı NEW)
        prisma.lead.count({
            where: {
                AND: [leadVisNew, { createdAt: { lt: thirtyMinAgoLead } }],
            },
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
        prisma.financial_transaction.aggregate({
            where: { businessId, type: "EXPENSE", date: { gte: startOfToday } },
            _sum: { amount: true }
        }),
        prisma.financial_transaction.aggregate({
            where: { businessId, type: "EXPENSE", date: { gte: thirtyDaysAgo } },
            _sum: { amount: true }
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
        prisma.financial_transaction.aggregate({
            where: {
                businessId,
                type: "EXPENSE",
                date: { gte: startOfMonth },
            },
            _sum: { amount: true },
        }),
        // collectionToday = manual INCOME girişleri + bugün DELIVERED siparişler
        prisma.financial_transaction.aggregate({
            where: {
                businessId,
                type: "INCOME",
                date: { gte: startOfToday },
            },
            _sum: { amount: true },
        }),
        prisma.order.aggregate({
            where: { businessId, status: "DELIVERED", createdAt: { gte: startOfToday } },
            _sum: { total: true },
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
        // YENİ EKLENEN business_sale METRİKLERİ
        prisma.business_sale.aggregate({ where: { businessId, saleDate: { gte: startOfToday } }, _sum: { totalAmount: true } }),
        prisma.business_sale.aggregate({ where: { businessId, saleDate: { gte: sevenDaysAgo } }, _sum: { totalAmount: true } }),
        prisma.business_sale.aggregate({ where: { businessId, saleDate: { gte: thirtyDaysAgo } }, _sum: { totalAmount: true } }),
        prisma.business_sale.aggregate({ where: { businessId, saleDate: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
        prisma.cash_transaction.aggregate({ where: { businessId, type: "EXPENSE", category: { not: "ACCOUNT_MOVEMENT" }, date: { gte: startOfToday } }, _sum: { amount: true } }),
        prisma.cash_transaction.aggregate({ where: { businessId, type: "EXPENSE", category: { not: "ACCOUNT_MOVEMENT" }, date: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),
        prisma.cash_transaction.aggregate({ where: { businessId, type: "EXPENSE", category: { not: "ACCOUNT_MOVEMENT" }, date: { gte: startOfMonth } }, _sum: { amount: true } }),
        prisma.cash_transaction.aggregate({ where: { businessId, type: "INCOME", category: { not: "ACCOUNT_MOVEMENT" }, date: { gte: startOfToday } }, _sum: { amount: true } }),
        prisma.business_sale.count({ where: { businessId, saleDate: { gte: startOfToday } } }),
        prisma.business_sale.count({ where: { businessId, saleDate: { gte: thirtyDaysAgo } } })
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

    async function fetchTryRate(code) {
        try {
            const res = await fetch(`https://open.er-api.com/v6/latest/${code}`, {
                signal: AbortSignal.timeout(4000),
                cache: "no-store",
            });
            if (!res.ok) return null;
            const j = await res.json();
            if (j.result === "success" && j.rates?.TRY != null) return j.rates.TRY;
        } catch (_) {
            /* kurlar isteğe bağlı */
        }
        return null;
    }

    const [usdSettled, eurSettled] = await Promise.allSettled([
        fetchTryRate("USD"),
        fetchTryRate("EUR"),
    ]);
    if (usdSettled.status === "fulfilled" && usdSettled.value != null) {
        fxTryPerUsd = usdSettled.value;
    }
    if (eurSettled.status === "fulfilled" && eurSettled.value != null) {
        fxTryPerEur = eurSettled.value;
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

    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    const weekAheadEnd = new Date(startOfToday);
    weekAheadEnd.setDate(weekAheadEnd.getDate() + 7);
    const dayAfterToday = new Date(startOfToday);
    dayAfterToday.setDate(dayAfterToday.getDate() + 1);

    const [
        orderYearAgg,
        purchaseTodayAgg,
        purchaseWeekAgg,
        purchaseMonthAgg,
        purchaseYearAgg,
        customerCount,
        supplierCount,
        quoteOpenCount,
        quoteOpenSumAgg,
        calendarEventsWeekCount,
        fihristEntryCount,
        pendingLeaveRequestCount,
        saleYearAgg,
    ] = await Promise.all([
        prisma.order.aggregate({
            where: { businessId, status: { not: "CANCELLED" }, createdAt: { gte: startOfYear } },
            _sum: { total: true },
        }),
        prisma.business_purchase.aggregate({
            where: {
                businessId,
                isCancelled: false,
                purchaseDate: { gte: startOfToday, lt: dayAfterToday },
            },
            _sum: { totalAmount: true },
        }),
        prisma.business_purchase.aggregate({
            where: {
                businessId,
                isCancelled: false,
                purchaseDate: { gte: sevenDaysAgo },
            },
            _sum: { totalAmount: true },
        }),
        prisma.business_purchase.aggregate({
            where: {
                businessId,
                isCancelled: false,
                purchaseDate: { gte: startOfMonth },
            },
            _sum: { totalAmount: true },
        }),
        prisma.business_purchase.aggregate({
            where: {
                businessId,
                isCancelled: false,
                purchaseDate: { gte: startOfYear },
            },
            _sum: { totalAmount: true },
        }),
        prisma.business_customer.count({ where: { businessId } }),
        prisma.business_supplier.count({ where: { businessId } }),
        prisma.quote.count({
            where: { businessId, status: { in: ["DRAFT", "SENT"] } },
        }),
        prisma.quote.aggregate({
            where: { businessId, status: { in: ["DRAFT", "SENT"] } },
            _sum: { total: true },
        }),
        prisma.calendar_event.count({
            where: {
                businessId,
                startTime: { gte: startOfToday, lt: weekAheadEnd },
            },
        }),
        prisma.business_fihrist_entry.count({ where: { businessId } }),
        prisma.employee_leave_request.count({
            where: { businessId, status: "PENDING" },
        }),
        prisma.business_sale.aggregate({
            where: { businessId, saleDate: { gte: startOfYear } },
            _sum: { totalAmount: true },
        }),
    ]);

    const [
        planningActiveProjectCount,
        planningOpenTaskCount,
        businessNoteCount,
        supportTicketOpenCount,
        reviewPendingCount,
        neighborhoodPostCount,
        referralTotalCount,
        reservationConfirmedUpcomingCount,
    ] = await Promise.all([
        prisma.planning_project.count({ where: { businessId, status: "ACTIVE" } }),
        prisma.planning_task.count({
            where: { businessId, status: { in: ["TODO", "IN_PROGRESS"] } },
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
    const topSummarySeries = await buildTopSummarySeries(prisma, businessId, dayWindows);

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
        employeeCount,
        pendingLeaveRequestCount,
        customerCount,
        supplierCount,
        productCount,
        categoryCount,
        stockValue,
        revenueToday: Number(orderTodayAgg?._sum?.total ?? 0) + Number(saleTodayAgg?._sum?.totalAmount ?? 0),
        revenueWeek: Number(orderWeekAgg?._sum?.total ?? 0) + Number(saleWeekAgg?._sum?.totalAmount ?? 0),
        revenueCalendarMonth: Number(orderCalendarMonthAgg?._sum?.total ?? 0) + Number(saleCalendarMonthAgg?._sum?.totalAmount ?? 0),
        revenueYear: Number(orderYearAgg?._sum?.total ?? 0) + Number(saleYearAgg?._sum?.totalAmount ?? 0),
        purchaseTotalToday: Number(purchaseTodayAgg?._sum?.totalAmount ?? 0),
        purchaseTotalWeek: Number(purchaseWeekAgg?._sum?.totalAmount ?? 0),
        purchaseTotalCalendarMonth: Number(purchaseMonthAgg?._sum?.totalAmount ?? 0),
        purchaseTotalYear: Number(purchaseYearAgg?._sum?.totalAmount ?? 0),
        quoteOpenCount,
        quoteOpenSum: Number(quoteOpenSumAgg?._sum?.total ?? 0),
        assetsTotal: Number(cashBalanceAgg?._sum?.balance ?? 0),
        expenseCalendarMonth: Number(expenseCalendarMonthAgg?._sum?.amount ?? 0) + Number(cExpenseCalendarMonthAgg?._sum?.amount ?? 0),
        upcomingExpenseCount: (upcomingExpenseDue || []).length,
        upcomingLoanCount: (upcomingLoanDue || []).length,
        completionPercent,
        missingStepsCount: Array.isArray(missingSteps) ? missingSteps.length : 0,
        fihristEntryCount,
        calendarEventsWeekCount,
        planningActiveProjectCount,
        planningOpenTaskCount,
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
            revenueToday: Number(orderTodayAgg?._sum?.total ?? 0) + Number(saleTodayAgg?._sum?.totalAmount ?? 0),
            revenueWeek: Number(orderWeekAgg?._sum?.total ?? 0) + Number(saleWeekAgg?._sum?.totalAmount ?? 0),
            revenueMonth: Number(orderMonthAgg?._sum?.total ?? 0) + Number(saleMonthAgg?._sum?.totalAmount ?? 0),
            orderCountToday: (orderCountToday ?? 0) + (saleCountToday ?? 0),
            orderCountMonth: (orderCountMonth ?? 0) + (saleCountMonth ?? 0),
            pendingReservationCount: pendingReservationCount ?? 0,
            newReservationCountToday: newReservationCountToday ?? 0,
            expenseToday: Number(expenseTodayAgg?._sum?.amount ?? 0) + Number(cExpenseTodayAgg?._sum?.amount ?? 0),
            expenseMonth: Number(expenseMonthAgg?._sum?.amount ?? 0) + Number(cExpenseMonthAgg?._sum?.amount ?? 0),
            leadCountToday,
            leadCountNew,
            leadCountNewToday,
            reviewCount: business.reviewCount ?? 0,
            revenueCalendarMonth: Number(orderCalendarMonthAgg?._sum?.total ?? 0) + Number(saleCalendarMonthAgg?._sum?.totalAmount ?? 0),
            expenseCalendarMonth: Number(expenseCalendarMonthAgg?._sum?.amount ?? 0) + Number(cExpenseCalendarMonthAgg?._sum?.amount ?? 0),
            collectionToday: Number(incomeTodayAgg?._sum?.amount ?? 0) + Number(deliveredTodayAgg?._sum?.total ?? 0) + Number(cIncomeTodayAgg?._sum?.amount ?? 0),
            stockValue,
            assetsTotal: Number(cashBalanceAgg?._sum?.balance ?? 0),
            debtsTotal: Number(debtTotalAgg?._sum?.amount ?? 0),
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
            topSummarySeries,
            navModules,
            planningActiveProjectCount,
            planningOpenTaskCount,
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
