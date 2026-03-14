import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const SORT_FIELDS = ["expiresAt", "startedAt", "plan", "status", "createdAt"];
const STATUSES = ["TRIAL", "ACTIVE", "EXPIRED"];
const PLANS = ["BASIC", "PREMIUM"];

function safeInt(val, def) {
  const n = parseInt(String(val), 10);
  return Number.isNaN(n) ? def : Math.max(0, n);
}

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url || "", "http://localhost");
    const q = safeStr(searchParams.get("q"));
    const status = safeStr(searchParams.get("status"));
    const plan = safeStr(searchParams.get("plan"));
    const expiring = searchParams.get("expiring");
    const page = safeInt(searchParams.get("page"), 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, safeInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE));
    const sortBy = SORT_FIELDS.includes(safeStr(searchParams.get("sortBy"))) ? searchParams.get("sortBy") : "expiresAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const conditions = [];

    if (q) {
      conditions.push({
        business: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
      });
    }
    if (status && STATUSES.includes(status)) conditions.push({ status });
    if (plan && PLANS.includes(plan)) conditions.push({ plan });
    if (expiring === "30") {
      const now = new Date();
      const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      conditions.push({ expiresAt: { gte: now, lte: in30 } });
      conditions.push({ status: { in: ["TRIAL", "ACTIVE"] } });
    }

    const where = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };

    const orderBy =
      sortBy === "expiresAt"
        ? { expiresAt: sortOrder }
        : sortBy === "startedAt"
          ? { startedAt: sortOrder }
          : sortBy === "plan"
            ? { plan: sortOrder }
            : sortBy === "status"
              ? { status: sortOrder }
              : sortBy === "createdAt"
                ? { createdAt: sortOrder }
                : { expiresAt: "asc" };

    const skip = (page - 1) * pageSize;
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [items, total, totalSubscriptions, trialCount, activeCount, expiredCount, basicCount, premiumCount, expiringIn30Days] =
      await Promise.all([
        prisma.businesssubscription.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          include: {
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
          },
        }),
        prisma.businesssubscription.count({ where }),
        prisma.businesssubscription.count(),
        prisma.businesssubscription.count({ where: { status: "TRIAL" } }),
        prisma.businesssubscription.count({ where: { status: "ACTIVE" } }),
        prisma.businesssubscription.count({ where: { status: "EXPIRED" } }),
        prisma.businesssubscription.count({ where: { plan: "BASIC" } }),
        prisma.businesssubscription.count({ where: { plan: "PREMIUM" } }),
        prisma.businesssubscription.count({
          where: {
            status: { in: ["TRIAL", "ACTIVE"] },
            expiresAt: { gte: now, lte: in30 },
          },
        }),
      ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const stats = {
      totalSubscriptions,
      trialCount,
      activeCount,
      expiredCount,
      basicCount,
      premiumCount,
      expiringIn30Days,
    };

    const normalized = items.map((it) => {
      const { business, ...sub } = it;
      return { ...sub, business };
    });

    return NextResponse.json({
      success: true,
      items: normalized,
      stats,
      pagination: { page, pageSize, total, totalPages },
    });
  } catch (e) {
    console.error("Admin subscriptions GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
