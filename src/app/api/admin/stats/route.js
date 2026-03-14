import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRangeMeta, buildSeriesBuckets, differenceInDays } from "@/lib/admin-stats/range-utils";

const RANGES = ["7d", "30d", "1y"];

function safeNum(val) {
  const n = Number(val);
  return Number.isNaN(n) ? 0 : n;
}

function safeArr(val) {
  return Array.isArray(val) ? val : [];
}

function growthRate(current, previous) {
  if (previous > 0) return ((current - previous) / previous) * 100;
  return current > 0 ? 100 : 0;
}

export async function GET(request) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url || "", "http://localhost");
    const rangeParam = searchParams.get("range");
    const range = RANGES.includes(rangeParam) ? rangeParam : "30d";

    const meta = getRangeMeta(range);
    const buckets = buildSeriesBuckets(range);
    const { startDate, endDate, previousStart, previousEnd } = meta;

    const [
      totalUsers,
      totalBusinesses,
      activeSubscriptions,
      revenueAgg,
      countUsersCurrent,
      countUsersPrevious,
      countBusinessesCurrent,
      countBusinessesPrevious,
      revenueCurrent,
      revenuePrevious,
      countSubsCurrent,
      countSubsPrevious,
      categoryGroups,
      firstUser,
      firstBusiness,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.businesssubscription.count({ where: { status: "ACTIVE" } }),
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { total: true },
      }),
      prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: previousStart, lt: previousEnd } },
      }),
      prisma.business.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.business.count({
        where: { createdAt: { gte: previousStart, lt: previousEnd } },
      }),
      prisma.order.aggregate({
        where: { status: "DELIVERED", createdAt: { gte: startDate, lte: endDate } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { status: "DELIVERED", createdAt: { gte: previousStart, lt: previousEnd } },
        _sum: { total: true },
      }),
      prisma.businesssubscription.count({
        where: { status: "ACTIVE", startedAt: { gte: startDate, lte: endDate } },
      }),
      prisma.businesssubscription.count({
        where: { status: "ACTIVE", startedAt: { gte: previousStart, lt: previousEnd } },
      }),
      prisma.business.groupBy({
        by: ["primaryCategoryId"],
        _count: { _all: true },
      }),
      prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
      prisma.business.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    ]);

    const totalRevenue = revenueAgg?._sum?.total ?? 0;
    const revCur = revenueCurrent?._sum?.total ?? 0;
    const revPrev = revenuePrevious?._sum?.total ?? 0;

    const userGrowthRate = growthRate(countUsersCurrent, countUsersPrevious);
    const businessGrowthRate = growthRate(countBusinessesCurrent, countBusinessesPrevious);
    const revenueGrowthRate = growthRate(revCur, revPrev);
    const subscriptionGrowthRate = growthRate(countSubsCurrent, countSubsPrevious);

    const bucketPromises = buckets.map(async (b) => {
      const [u, bz, rev] = await Promise.all([
        prisma.user.count({
          where: { createdAt: { gte: b.start, lt: b.end } },
        }),
        prisma.business.count({
          where: { createdAt: { gte: b.start, lt: b.end } },
        }),
        prisma.order.aggregate({
          where: { status: "DELIVERED", createdAt: { gte: b.start, lt: b.end } },
          _sum: { total: true },
        }),
      ]);
      return {
        name: b.name,
        users: u,
        business: bz,
        revenue: rev?._sum?.total ?? 0,
      };
    });
    const growthSeries = await Promise.all(bucketPromises);

    const categoryIds = categoryGroups
      .map((g) => g.primaryCategoryId)
      .filter(Boolean);
    const categories =
      categoryIds.length > 0
        ? await prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
          })
        : [];
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    const totalBiz = totalBusinesses || 1;
    const categoryDistribution = categoryGroups.map((g) => {
      const name =
        g.primaryCategoryId == null
          ? "Belirtilmemiş"
          : categoryMap[g.primaryCategoryId] || "Diğer";
      const value = safeNum(g._count._all);
      const percent = (value / totalBiz) * 100;
      return { name, value, percent };
    });

    const oldest =
      firstUser?.createdAt && firstBusiness?.createdAt
        ? new Date(
            Math.min(
              new Date(firstUser.createdAt).getTime(),
              new Date(firstBusiness.createdAt).getTime()
            )
          )
        : firstUser?.createdAt
          ? new Date(firstUser.createdAt)
          : firstBusiness?.createdAt
            ? new Date(firstBusiness.createdAt)
            : new Date();
    const consecutiveDays = Math.max(
      0,
      differenceInDays(new Date(), oldest)
    );

    const apiLatencyMs = Date.now() - startTime;
    const systemHealth = {
      uptimePercent: Number(process.env.ADMIN_STATS_UPTIME_PERCENT) || 99.99,
      apiLatencyMs: process.env.ADMIN_STATS_API_LATENCY_MS
        ? Number(process.env.ADMIN_STATS_API_LATENCY_MS)
        : apiLatencyMs,
      consecutiveDays,
    };

    const stats = {
      range,
      summary: {
        totalUsers: safeNum(totalUsers),
        totalBusinesses: safeNum(totalBusinesses),
        totalRevenue: safeNum(totalRevenue),
        activeSubscriptions: safeNum(activeSubscriptions),
        userGrowthRate: safeNum(userGrowthRate),
        businessGrowthRate: safeNum(businessGrowthRate),
        revenueGrowthRate: safeNum(revenueGrowthRate),
        subscriptionGrowthRate: safeNum(subscriptionGrowthRate),
      },
      growthSeries: safeArr(growthSeries),
      categoryDistribution: safeArr(categoryDistribution),
      systemHealth,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "İstatistikler getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
