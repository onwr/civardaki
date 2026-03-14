import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const SORT_FIELDS = ["paidAt", "createdAt", "amount", "status"];
const STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];

function safeInt(val, def) {
  const n = parseInt(String(val), 10);
  return Number.isNaN(n) ? def : Math.max(0, n);
}

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

function parseDate(val) {
  if (val == null || val === "") return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
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
    const provider = safeStr(searchParams.get("provider"));
    const dateFrom = parseDate(searchParams.get("dateFrom"));
    const dateTo = parseDate(searchParams.get("dateTo"));
    const page = safeInt(searchParams.get("page"), 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, safeInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE));
    const sortBy = SORT_FIELDS.includes(safeStr(searchParams.get("sortBy"))) ? searchParams.get("sortBy") : "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const conditions = [];

    if (q) {
      conditions.push({
        business: {
          OR: [
            { name: { contains: q } },
            { slug: { contains: q } },
          ],
        },
      });
    }
    if (status && STATUSES.includes(status)) conditions.push({ status });
    if (provider) conditions.push({ provider });
    if (dateFrom || dateTo) {
      const range = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        range.lte = end;
      }
      conditions.push({ createdAt: range });
    }

    const where = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };

    const orderBy =
      sortBy === "paidAt"
        ? { paidAt: sortOrder }
        : sortBy === "createdAt"
          ? { createdAt: sortOrder }
          : sortBy === "amount"
            ? { amount: sortOrder }
            : sortBy === "status"
              ? { status: sortOrder }
              : { createdAt: "desc" };

    const skip = (page - 1) * pageSize;

    const [items, total, totalCount, revenueAgg, pendingCount, completedCount, failedCount, refundedCount] =
      await Promise.all([
        prisma.subscription_payment.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          include: {
            business: {
              select: { id: true, name: true, slug: true },
            },
            subscription: {
              select: { id: true, plan: true, status: true, expiresAt: true },
            },
          },
        }),
        prisma.subscription_payment.count({ where }),
        prisma.subscription_payment.count(),
        prisma.subscription_payment.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.subscription_payment.count({ where: { status: "PENDING" } }),
        prisma.subscription_payment.count({ where: { status: "COMPLETED" } }),
        prisma.subscription_payment.count({ where: { status: "FAILED" } }),
        prisma.subscription_payment.count({ where: { status: "REFUNDED" } }),
      ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const stats = {
      totalCount,
      totalRevenue: revenueAgg?._sum?.amount ?? 0,
      pendingCount,
      completedCount,
      failedCount,
      refundedCount,
    };

    return NextResponse.json({
      success: true,
      items,
      stats,
      pagination: { page, pageSize, total, totalPages },
    });
  } catch (e) {
    console.error("Admin payments GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
