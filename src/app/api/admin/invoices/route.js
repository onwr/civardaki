import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const SORT_FIELDS = ["issueDate", "dueDate", "amount", "status", "createdAt"];
const STATUSES = ["DRAFT", "ISSUED", "PAID", "CANCELLED"];
const TYPES = ["SUBSCRIPTION", "MANUAL", "OTHER"];

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
    const businessId = safeStr(searchParams.get("businessId"));
    const status = safeStr(searchParams.get("status"));
    const type = safeStr(searchParams.get("type"));
    const dateFrom = parseDate(searchParams.get("dateFrom"));
    const dateTo = parseDate(searchParams.get("dateTo"));
    const page = safeInt(searchParams.get("page"), 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, safeInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE));
    const sortBy = SORT_FIELDS.includes(safeStr(searchParams.get("sortBy"))) ? searchParams.get("sortBy") : "issueDate";
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
    if (businessId) conditions.push({ businessId });
    if (status && STATUSES.includes(status)) conditions.push({ status });
    if (type && TYPES.includes(type)) conditions.push({ type });
    if (dateFrom || dateTo) {
      const range = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        range.lte = end;
      }
      conditions.push({ issueDate: range });
    }

    const where = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };

    const orderBy =
      sortBy === "issueDate"
        ? { issueDate: sortOrder }
        : sortBy === "dueDate"
          ? { dueDate: sortOrder }
          : sortBy === "amount"
            ? { amount: sortOrder }
            : sortBy === "status"
              ? { status: sortOrder }
              : sortBy === "createdAt"
                ? { createdAt: sortOrder }
                : { issueDate: "desc" };

    const skip = (page - 1) * pageSize;

    const [items, total, totalCount, draftCount, issuedCount, paidCount, cancelledCount, totalAmountAgg] =
      await Promise.all([
        prisma.invoice.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          include: {
            business: { select: { id: true, name: true, slug: true } },
            subscriptionPayment: { select: { id: true, amount: true, paidAt: true } },
          },
        }),
        prisma.invoice.count({ where }),
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: "DRAFT" } }),
        prisma.invoice.count({ where: { status: "ISSUED" } }),
        prisma.invoice.count({ where: { status: "PAID" } }),
        prisma.invoice.count({ where: { status: "CANCELLED" } }),
        prisma.invoice.aggregate({
          where: { status: { in: ["ISSUED", "PAID"] } },
          _sum: { amount: true },
        }),
      ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const stats = {
      totalCount,
      draftCount,
      issuedCount,
      paidCount,
      cancelledCount,
      totalAmount: totalAmountAgg?._sum?.amount ?? 0,
    };

    return NextResponse.json({
      success: true,
      items,
      stats,
      pagination: { page, pageSize, total, totalPages },
    });
  } catch (e) {
    console.error("Admin invoices GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const businessId = safeStr(body.businessId);
    const invoiceNumber = safeStr(body.invoiceNumber);
    const type = TYPES.includes(body.type) ? body.type : "MANUAL";
    const amount = Number(body.amount);
    const currency = safeStr(body.currency) || "TRY";
    const issueDate = body.issueDate ? new Date(body.issueDate) : new Date();
    const dueDate = body.dueDate ? new Date(body.dueDate) : new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const description = body.description != null ? String(body.description).trim() : null;
    const subscriptionPaymentId = body.subscriptionPaymentId ? safeStr(body.subscriptionPaymentId) : null;

    if (!businessId) return NextResponse.json({ success: false, error: "İşletme seçiniz." }, { status: 400 });
    if (!invoiceNumber) return NextResponse.json({ success: false, error: "Fatura numarası gerekli." }, { status: 400 });
    if (Number.isNaN(amount) || amount <= 0) return NextResponse.json({ success: false, error: "Geçerli tutar giriniz." }, { status: 400 });
    if (Number.isNaN(issueDate.getTime())) return NextResponse.json({ success: false, error: "Geçersiz kesim tarihi." }, { status: 400 });
    if (Number.isNaN(dueDate.getTime())) return NextResponse.json({ success: false, error: "Geçersiz vade tarihi." }, { status: 400 });

    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true } });
    if (!business) return NextResponse.json({ success: false, error: "İşletme bulunamadı." }, { status: 404 });

    const existingNumber = await prisma.invoice.findUnique({ where: { invoiceNumber }, select: { id: true } });
    if (existingNumber) return NextResponse.json({ success: false, error: "Bu fatura numarası zaten kullanılıyor." }, { status: 409 });

    if (subscriptionPaymentId) {
      const pay = await prisma.subscription_payment.findFirst({
        where: { id: subscriptionPaymentId, businessId },
        select: { id: true },
      });
      if (!pay) return NextResponse.json({ success: false, error: "Ödeme kaydı bulunamadı veya işletmeye ait değil." }, { status: 400 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        businessId,
        subscriptionPaymentId: subscriptionPaymentId || undefined,
        invoiceNumber,
        type,
        status: "DRAFT",
        amount,
        currency,
        issueDate,
        dueDate,
        description: description || undefined,
      },
      include: {
        business: { select: { id: true, name: true, slug: true } },
        subscriptionPayment: { select: { id: true, amount: true, paidAt: true } },
      },
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (e) {
    console.error("Admin invoices POST error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
