import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n;
}

function getPeriodParts(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const key = `${year}-${String(month).padStart(2, "0")}`;
  const period = d.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  return { key, period, month, year };
}

function getPlatform(value) {
  const text = String(value || "").trim();
  return text || "Civardaki";
}

function parsePeriodKey(value) {
  const key = String(value || "").trim();
  if (!/^\d{4}-\d{2}$/.test(key)) return null;
  const [yearText, monthText] = key.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
  return { key, year, month };
}

function getPeriodRange(periodKey) {
  const parsed = parsePeriodKey(periodKey);
  if (!parsed) return null;
  const start = new Date(parsed.year, parsed.month - 1, 1);
  const end = new Date(parsed.year, parsed.month, 1);
  return { start, end };
}

function aggregateReconciliations(orders, filters = {}) {
  const { platformFilter = "", periodKeyFilter = "" } = filters;
  const normalizedPlatformFilter =
    platformFilter && platformFilter !== "ALL" ? getPlatform(platformFilter).toLowerCase() : "";
  const grouped = new Map();

  for (const order of orders) {
    const platform = getPlatform(order.deliveryType);
    const periodParts = getPeriodParts(order.createdAt);
    if (!periodParts) continue;

    if (normalizedPlatformFilter && platform.toLowerCase() !== normalizedPlatformFilter) {
      continue;
    }
    if (periodKeyFilter && periodParts.key !== periodKeyFilter) {
      continue;
    }

    const mapKey = `${platform}__${periodParts.key}`;
    const amount = toAmount(order.total);
    const commission = 0;
    const net = amount - commission;
    const isPaid = String(order.status || "").toUpperCase() === "DELIVERED";

    if (!grouped.has(mapKey)) {
      grouped.set(mapKey, {
        id: mapKey,
        platform,
        period: periodParts.period,
        periodKey: periodParts.key,
        _periodYear: periodParts.year,
        _periodMonth: periodParts.month,
        totalSales: 0,
        totalCommission: 0,
        netAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        ordersCount: 0,
        status: "RECONCILED",
        reconciliationDate: null,
      });
    }

    const bucket = grouped.get(mapKey);
    bucket.totalSales += amount;
    bucket.totalCommission += commission;
    bucket.netAmount += net;
    bucket.ordersCount += 1;
    if (isPaid) {
      bucket.paidAmount += net;
    } else {
      bucket.pendingAmount += net;
      bucket.status = "PENDING";
    }
  }

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      totalSales: Number(item.totalSales.toFixed(2)),
      totalCommission: Number(item.totalCommission.toFixed(2)),
      netAmount: Number(item.netAmount.toFixed(2)),
      paidAmount: Number(item.paidAmount.toFixed(2)),
      pendingAmount: Number(item.pendingAmount.toFixed(2)),
      reconciliationDate: item.status === "RECONCILED" ? new Date().toISOString() : null,
    }))
    .sort((a, b) => {
      if (a._periodYear !== b._periodYear) return b._periodYear - a._periodYear;
      if (a._periodMonth !== b._periodMonth) return b._periodMonth - a._periodMonth;
      return a.platform.localeCompare(b.platform, "tr");
    })
    .map(({ _periodYear, _periodMonth, ...rest }) => rest);
}

async function getOrdersForBusiness(businessId, periodKey) {
  const where = { businessId };
  if (periodKey) {
    const range = getPeriodRange(periodKey);
    if (range) {
      where.createdAt = {
        gte: range.start,
        lt: range.end,
      };
    }
  }

  return prisma.order.findMany({
    where,
    select: {
      id: true,
      total: true,
      deliveryType: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;

    const { searchParams } = new URL(request.url);
    const platform = String(searchParams.get("platform") || "").trim();
    const period = String(searchParams.get("period") || "").trim();
    const periodKey = period ? parsePeriodKey(period)?.key || "" : "";

    const orders = await getOrdersForBusiness(businessId, periodKey);
    const reconciliations = aggregateReconciliations(orders, {
      platformFilter: platform,
      periodKeyFilter: periodKey,
    });

    return NextResponse.json({ reconciliations });
  } catch (error) {
    console.error("Ecommerce reconciliation GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;

    const body = await request.json().catch(() => ({}));
    const period = String(body?.period || "").trim();
    const platform = String(body?.platform || "ALL").trim() || "ALL";

    const periodParsed = parsePeriodKey(period);
    if (!periodParsed) {
      return NextResponse.json(
        { error: "Geçerli bir dönem seçmelisiniz. (YYYY-MM)" },
        { status: 400 }
      );
    }

    const orders = await getOrdersForBusiness(businessId, periodParsed.key);
    const reconciliations = aggregateReconciliations(orders, {
      platformFilter: platform,
      periodKeyFilter: periodParsed.key,
    });

    if (!reconciliations.length) {
      return NextResponse.json(
        { error: "Seçilen dönem/platform için sipariş bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Mutabakat raporu başarıyla oluşturuldu.",
      generatedAt: new Date().toISOString(),
      reconciliations,
    });
  } catch (error) {
    console.error("Ecommerce reconciliation POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

