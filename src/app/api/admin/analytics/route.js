import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";
import { tr } from "date-fns/locale";
import { estimateMRR, getPlanPrice } from "@/lib/analytics/subscription-config";

function safeNum(val) {
  const n = Number(val);
  return Number.isNaN(n) ? 0 : n;
}

function safeArr(val) {
  return Array.isArray(val) ? val : [];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const now = new Date();
    const startCurrent = startOfDay(subDays(now, 29));
    const startPrevious = startOfDay(subDays(now, 59));
    const trendStart = startOfDay(subDays(now, 6));

    const [
      totalLeads,
      totalBusinesses,
      activeSubscriptions,
      closedLeadsCount,
      categoryStats,
      cityStats,
      statusStats,
      subPlans,
      countLeadsCurrent,
      countLeadsPrevious,
      countBusinessesCurrent,
      countBusinessesPrevious,
      countSubsCurrent,
      countSubsPrevious,
      leadsForTrend,
      businessesForTrend,
      subsForTrend,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.businesssubscription.count({ where: { status: "ACTIVE" } }),
      prisma.lead.count({ where: { status: "CLOSED" } }),
      prisma.lead.groupBy({
        by: ["category"],
        _count: { _all: true },
        where: { category: { not: null } },
      }),
      prisma.lead.groupBy({
        by: ["city"],
        _count: { _all: true },
        where: { city: { not: null } },
      }),
      prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.businesssubscription.groupBy({
        by: ["plan"],
        _count: { _all: true },
        where: { status: "ACTIVE" },
      }),
      prisma.lead.count({
        where: { createdAt: { gte: startCurrent, lt: now } },
      }),
      prisma.lead.count({
        where: { createdAt: { gte: startPrevious, lt: startCurrent } },
      }),
      prisma.business.count({
        where: { createdAt: { gte: startCurrent, lt: now } },
      }),
      prisma.business.count({
        where: { createdAt: { gte: startPrevious, lt: startCurrent } },
      }),
      prisma.businesssubscription.count({
        where: { status: "ACTIVE", startedAt: { gte: startCurrent, lt: now } },
      }),
      prisma.businesssubscription.count({
        where: { status: "ACTIVE", startedAt: { gte: startPrevious, lt: startCurrent } },
      }),
      prisma.lead.findMany({
        where: { createdAt: { gte: trendStart } },
        select: { createdAt: true },
      }),
      prisma.business.findMany({
        where: { createdAt: { gte: trendStart } },
        select: { createdAt: true },
      }),
      prisma.businesssubscription.findMany({
        where: { status: "ACTIVE", startedAt: { gte: trendStart } },
        select: { startedAt: true, plan: true },
      }),
    ]);

    const conversionRate =
      totalLeads > 0 ? (closedLeadsCount / totalLeads) * 100 : 0;

    const prev = (p, c) => (p > 0 ? ((c - p) / p) * 100 : c > 0 ? 100 : 0);
    const leadGrowthRate = prev(countLeadsPrevious, countLeadsCurrent);
    const businessGrowthRate = prev(countBusinessesPrevious, countBusinessesCurrent);
    const subscriptionGrowthRate = prev(countSubsPrevious, countSubsCurrent);

    const categoryPerformance = categoryStats.map((c) => ({
      name: c.category && String(c.category).trim() ? c.category : "Belirtilmemiş",
      count: safeNum(c._count._all),
    }));
    const cityDistribution = cityStats.map((c) => ({
      name: c.city && String(c.city).trim() ? c.city : "Belirtilmemiş",
      count: safeNum(c._count._all),
    }));
    const statuses = statusStats.map((s) => ({
      status: s.status,
      count: safeNum(s._count._all),
    }));
    const subscriptions = subPlans.map((s) => ({
      plan: s.plan,
      count: safeNum(s._count._all),
    }));

    const estimatedMRR = estimateMRR(subscriptions);

    const dayKeys = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      dayKeys.push(format(d, "yyyy-MM-dd"));
    }
    const leadsByDay = {};
    const businessesByDay = {};
    const revenueByDay = {};
    dayKeys.forEach((k) => {
      leadsByDay[k] = 0;
      businessesByDay[k] = 0;
      revenueByDay[k] = 0;
    });
    safeArr(leadsForTrend).forEach((r) => {
      const k = format(new Date(r.createdAt), "yyyy-MM-dd");
      if (leadsByDay[k] !== undefined) leadsByDay[k] += 1;
    });
    safeArr(businessesForTrend).forEach((r) => {
      const k = format(new Date(r.createdAt), "yyyy-MM-dd");
      if (businessesByDay[k] !== undefined) businessesByDay[k] += 1;
    });
    safeArr(subsForTrend).forEach((r) => {
      const k = format(new Date(r.startedAt), "yyyy-MM-dd");
      if (revenueByDay[k] !== undefined) revenueByDay[k] += getPlanPrice(r.plan);
    });

    const leadTrend = dayKeys.map((dateStr) => {
      const d = new Date(dateStr + "T12:00:00");
      return {
        date: dateStr,
        name: format(d, "d MMM", { locale: tr }),
        leads: leadsByDay[dateStr] ?? 0,
      };
    });
    const businessTrend = dayKeys.map((dateStr) => {
      const d = new Date(dateStr + "T12:00:00");
      return {
        date: dateStr,
        name: format(d, "d MMM", { locale: tr }),
        businesses: businessesByDay[dateStr] ?? 0,
      };
    });
    const revenueTrend = dayKeys.map((dateStr) => {
      const d = new Date(dateStr + "T12:00:00");
      return {
        date: dateStr,
        name: format(d, "d MMM", { locale: tr }),
        revenue: revenueByDay[dateStr] ?? 0,
      };
    });

    const stats = {
      totalLeads: safeNum(totalLeads),
      totalBusinesses: safeNum(totalBusinesses),
      activeSubscriptions: safeNum(activeSubscriptions),
      estimatedMRR: safeNum(estimatedMRR),
      conversionRate: safeNum(conversionRate),
      leadGrowthRate: safeNum(leadGrowthRate),
      businessGrowthRate: safeNum(businessGrowthRate),
      subscriptionGrowthRate: safeNum(subscriptionGrowthRate),
      categoryPerformance: safeArr(categoryPerformance),
      cityDistribution: safeArr(cityDistribution),
      categories: categoryPerformance,
      cities: cityDistribution,
      statuses: safeArr(statuses),
      subscriptions: safeArr(subscriptions),
      leadTrend: safeArr(leadTrend),
      businessTrend: safeArr(businessTrend),
      revenueTrend: safeArr(revenueTrend),
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("ADMIN ANALYTICS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "İstatistikler getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
