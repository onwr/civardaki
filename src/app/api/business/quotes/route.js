import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUS = new Set(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]);
const ALLOWED_PRIORITY = new Set(["LOW", "NORMAL", "HIGH"]);

function toText(value, max = 5000) {
  return String(value || "").trim().slice(0, max);
}

function toNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function clampProbability(value) {
  const n = Math.round(toNum(value, 0));
  return Math.max(0, Math.min(100, n));
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, idx) => {
      const title = toText(item?.title || item?.product || item?.name, 255);
      const quantity = Math.max(0, toNum(item?.quantity, 1));
      const unitPrice = Math.max(0, toNum(item?.unitPrice, 0));
      const discount = Math.max(0, Math.min(100, toNum(item?.discount, 0)));
      const gross = quantity * unitPrice;
      const lineTotal = Number((gross - gross * (discount / 100)).toFixed(2));
      return {
        title,
        isService: Boolean(item?.isService ?? item?.service ?? true),
        quantity,
        unitPrice,
        discount,
        lineTotal,
        description: toText(item?.description, 5000) || null,
        sortOrder: idx,
      };
    })
    .filter((item) => item.title);
}

function calculateTotals(items, taxRateRaw, taxRaw) {
  const grossSubtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * (item.discount / 100),
    0,
  );
  const netSubtotal = grossSubtotal - discountTotal;
  const taxRate = Math.max(0, toNum(taxRateRaw, 0));
  const taxAmount = Number.isFinite(Number(taxRaw))
    ? Math.max(0, toNum(taxRaw, 0))
    : Number((netSubtotal * (taxRate / 100)).toFixed(2));
  const total = Number((netSubtotal + taxAmount).toFixed(2));
  return {
    subtotal: Number(grossSubtotal.toFixed(2)),
    discount: Number(discountTotal.toFixed(2)),
    tax: Number(taxAmount.toFixed(2)),
    total,
  };
}

async function getBusinessSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["BUSINESS", "ADMIN"].includes(session.user.role) || !session.user.businessId) {
    return null;
  }
  return session;
}

async function generateQuoteNumber(businessId) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const count = await prisma.quote.count({
    where: { businessId, createdAt: { gte: start, lt: end } },
  });
  const serial = String(count + 1).padStart(3, "0");
  return `TEK-${now.getFullYear()}-${serial}`;
}

export async function GET(req) {
  try {
    const session = await getBusinessSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const businessId = session.user.businessId;
    const { searchParams } = new URL(req.url);
    const q = toText(searchParams.get("q"), 120);
    const status = toText(searchParams.get("status"), 32).toUpperCase();
    const limitRaw = Number.parseInt(searchParams.get("limit") || "100", 10);
    const limit = Number.isNaN(limitRaw) ? 100 : Math.max(1, Math.min(250, limitRaw));

    const where = {
      businessId,
      ...(status && status !== "ALL" && ALLOWED_STATUS.has(status) ? { status } : {}),
      ...(q
        ? {
            OR: [
              { quoteNumber: { contains: q } },
              { customerName: { contains: q } },
              { customerCompany: { contains: q } },
              { customerEmail: { contains: q } },
              { notes: { contains: q } },
            ],
          }
        : {}),
    };

    const [quotes, totalQuotes, statusCounts, sumTotalAgg, acceptedTotalAgg, avgProbabilityAgg, pendingFollowUp] =
      await Promise.all([
        prisma.quote.findMany({
          where,
          include: { items: { orderBy: { sortOrder: "asc" } } },
          orderBy: { createdAt: "desc" },
          take: limit,
        }),
        prisma.quote.count({ where: { businessId } }),
        prisma.quote.groupBy({
          by: ["status"],
          where: { businessId },
          _count: { _all: true },
        }),
        prisma.quote.aggregate({
          where: { businessId },
          _sum: { total: true },
        }),
        prisma.quote.aggregate({
          where: { businessId, status: "ACCEPTED" },
          _sum: { total: true },
        }),
        prisma.quote.aggregate({
          where: { businessId },
          _avg: { probability: true },
        }),
        prisma.quote.count({
          where: {
            businessId,
            followUpDate: { lte: new Date() },
            status: { in: ["DRAFT", "SENT"] },
          },
        }),
      ]);

    const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count._all]));
    const acceptedQuotes = statusMap.ACCEPTED || 0;
    const sentQuotes = statusMap.SENT || 0;
    const rejectedQuotes = statusMap.REJECTED || 0;
    const expiredQuotes = statusMap.EXPIRED || 0;
    const totalValue = sumTotalAgg?._sum?.total || 0;
    const acceptedValue = acceptedTotalAgg?._sum?.total || 0;
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

    return NextResponse.json({
      success: true,
      quotes,
      metrics: {
        totalQuotes,
        sentQuotes,
        acceptedQuotes,
        rejectedQuotes,
        expiredQuotes,
        totalValue,
        acceptedValue,
        conversionRate,
        avgQuoteValue: totalQuotes > 0 ? totalValue / totalQuotes : 0,
        avgProbability: avgProbabilityAgg?._avg?.probability || 0,
        pendingFollowUp,
      },
    });
  } catch (error) {
    console.error("GET BUSINESS QUOTES ERROR:", error);
    return NextResponse.json({ error: "Teklifler alınırken bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getBusinessSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const businessId = session.user.businessId;

    const body = await req.json().catch(() => ({}));
    const customerName = toText(body.customerName, 255);
    const quoteDate = toDate(body.quoteDate);
    const validUntil = toDate(body.validUntil);
    const items = normalizeItems(body.items);

    if (!customerName) {
      return NextResponse.json({ error: "Müşteri adı zorunludur." }, { status: 400 });
    }
    if (!quoteDate || !validUntil) {
      return NextResponse.json({ error: "Teklif tarihi ve geçerlilik tarihi zorunludur." }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: "En az bir teklif kalemi eklemelisiniz." }, { status: 400 });
    }

    const statusRaw = toText(body.status, 32).toUpperCase();
    const priorityRaw = toText(body.priority, 32).toUpperCase();
    const status = ALLOWED_STATUS.has(statusRaw) ? statusRaw : "DRAFT";
    const priority = ALLOWED_PRIORITY.has(priorityRaw) ? priorityRaw : "NORMAL";

    const totals = calculateTotals(items, body.taxRate, body.tax);
    const requestedQuoteNumber = toText(body.quoteNumber, 64);
    const quoteNumber = requestedQuoteNumber || (await generateQuoteNumber(businessId));

    const created = await prisma.quote.create({
      data: {
        businessId,
        quoteNumber,
        customerName,
        customerCompany: toText(body.customerCompany, 255) || null,
        customerEmail: toText(body.customerEmail, 255) || null,
        customerPhone: toText(body.customerPhone, 50) || null,
        quoteDate,
        validUntil,
        sentDate: toDate(body.sentDate),
        acceptedDate: status === "ACCEPTED" ? toDate(body.acceptedDate) || new Date() : toDate(body.acceptedDate),
        followUpDate: toDate(body.followUpDate),
        expectedCloseDate: toDate(body.expectedCloseDate),
        status,
        priority,
        probability: clampProbability(body.probability),
        convertedToSale: Boolean(body.convertedToSale),
        template: toText(body.template, 100) || "Standard",
        termsAndConditions: toText(body.termsAndConditions, 5000) || null,
        notes: toText(body.notes, 5000) || null,
        tags: Array.isArray(body.tags) ? body.tags.slice(0, 20) : [],
        budget: Number.isFinite(Number(body.budget)) ? Math.max(0, toNum(body.budget, 0)) : null,
        timeline: toText(body.timeline, 120) || null,
        requirements: toText(body.requirements, 5000) || null,
        objections: toText(body.objections, 5000) || null,
        nextSteps: toText(body.nextSteps, 5000) || null,
        competitor: toText(body.competitor, 255) || null,
        decisionMaker: toText(body.decisionMaker, 255) || null,
        createdBy: toText(body.createdBy, 255) || null,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        exchangeRate: Number.isFinite(Number(body.exchangeRate)) ? Number(body.exchangeRate) : null,
        items: {
          create: items,
        },
      },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ success: true, quote: created }, { status: 201 });
  } catch (error) {
    console.error("POST BUSINESS QUOTES ERROR:", error);
    return NextResponse.json({ error: "Teklif oluşturulurken bir hata oluştu." }, { status: 500 });
  }
}
