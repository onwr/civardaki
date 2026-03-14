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
  if (!value) return null;
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
  if (!session?.user || session.user.role !== "BUSINESS" || !session.user.businessId) {
    return null;
  }
  return session;
}

async function getOwnedQuote(quoteId, businessId) {
  return prisma.quote.findFirst({
    where: { id: quoteId, businessId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function GET(req, context) {
  try {
    const session = await getBusinessSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const businessId = session.user.businessId;

    const { id } = await context.params;
    const quoteId = toText(id, 64);
    if (!quoteId) return NextResponse.json({ error: "Geçersiz teklif id." }, { status: 400 });

    const quote = await getOwnedQuote(quoteId, businessId);
    if (!quote) return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error("GET BUSINESS QUOTE DETAIL ERROR:", error);
    return NextResponse.json({ error: "Teklif detayı alınırken bir hata oluştu." }, { status: 500 });
  }
}

export async function PATCH(req, context) {
  try {
    const session = await getBusinessSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const businessId = session.user.businessId;

    const { id } = await context.params;
    const quoteId = toText(id, 64);
    if (!quoteId) return NextResponse.json({ error: "Geçersiz teklif id." }, { status: 400 });

    const current = await getOwnedQuote(quoteId, businessId);
    if (!current) return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const statusRaw = toText(body.status, 32).toUpperCase();
    const priorityRaw = toText(body.priority, 32).toUpperCase();
    const status = statusRaw ? (ALLOWED_STATUS.has(statusRaw) ? statusRaw : null) : undefined;
    const priority = priorityRaw ? (ALLOWED_PRIORITY.has(priorityRaw) ? priorityRaw : null) : undefined;

    if (status === null) {
      return NextResponse.json({ error: "Geçersiz teklif durumu." }, { status: 400 });
    }
    if (priority === null) {
      return NextResponse.json({ error: "Geçersiz öncelik değeri." }, { status: 400 });
    }

    const hasItemsUpdate = Array.isArray(body.items);
    const normalizedItems = hasItemsUpdate ? normalizeItems(body.items) : [];
    if (hasItemsUpdate && normalizedItems.length === 0) {
      return NextResponse.json({ error: "En az bir teklif kalemi gereklidir." }, { status: 400 });
    }

    const totals = hasItemsUpdate
      ? calculateTotals(normalizedItems, body.taxRate, body.tax)
      : {
          subtotal: Number.isFinite(Number(body.subtotal)) ? Math.max(0, toNum(body.subtotal, 0)) : undefined,
          discount: Number.isFinite(Number(body.discount)) ? Math.max(0, toNum(body.discount, 0)) : undefined,
          tax: Number.isFinite(Number(body.tax)) ? Math.max(0, toNum(body.tax, 0)) : undefined,
          total: Number.isFinite(Number(body.total)) ? Math.max(0, toNum(body.total, 0)) : undefined,
        };

    const data = {
      ...(body.quoteNumber !== undefined ? { quoteNumber: toText(body.quoteNumber, 64) || current.quoteNumber } : {}),
      ...(body.customerName !== undefined ? { customerName: toText(body.customerName, 255) || current.customerName } : {}),
      ...(body.customerCompany !== undefined ? { customerCompany: toText(body.customerCompany, 255) || null } : {}),
      ...(body.customerEmail !== undefined ? { customerEmail: toText(body.customerEmail, 255) || null } : {}),
      ...(body.customerPhone !== undefined ? { customerPhone: toText(body.customerPhone, 50) || null } : {}),
      ...(body.quoteDate !== undefined ? { quoteDate: toDate(body.quoteDate) || current.quoteDate } : {}),
      ...(body.validUntil !== undefined ? { validUntil: toDate(body.validUntil) || current.validUntil } : {}),
      ...(body.sentDate !== undefined ? { sentDate: toDate(body.sentDate) } : {}),
      ...(body.followUpDate !== undefined ? { followUpDate: toDate(body.followUpDate) } : {}),
      ...(body.expectedCloseDate !== undefined ? { expectedCloseDate: toDate(body.expectedCloseDate) } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(body.probability !== undefined ? { probability: clampProbability(body.probability) } : {}),
      ...(body.convertedToSale !== undefined ? { convertedToSale: Boolean(body.convertedToSale) } : {}),
      ...(body.template !== undefined ? { template: toText(body.template, 100) || "Standard" } : {}),
      ...(body.termsAndConditions !== undefined ? { termsAndConditions: toText(body.termsAndConditions, 5000) || null } : {}),
      ...(body.notes !== undefined ? { notes: toText(body.notes, 5000) || null } : {}),
      ...(body.tags !== undefined ? { tags: Array.isArray(body.tags) ? body.tags.slice(0, 20) : [] } : {}),
      ...(body.budget !== undefined
        ? { budget: Number.isFinite(Number(body.budget)) ? Math.max(0, toNum(body.budget, 0)) : null }
        : {}),
      ...(body.timeline !== undefined ? { timeline: toText(body.timeline, 120) || null } : {}),
      ...(body.requirements !== undefined ? { requirements: toText(body.requirements, 5000) || null } : {}),
      ...(body.objections !== undefined ? { objections: toText(body.objections, 5000) || null } : {}),
      ...(body.nextSteps !== undefined ? { nextSteps: toText(body.nextSteps, 5000) || null } : {}),
      ...(body.competitor !== undefined ? { competitor: toText(body.competitor, 255) || null } : {}),
      ...(body.decisionMaker !== undefined ? { decisionMaker: toText(body.decisionMaker, 255) || null } : {}),
      ...(body.createdBy !== undefined ? { createdBy: toText(body.createdBy, 255) || null } : {}),
      ...(totals.subtotal !== undefined ? { subtotal: totals.subtotal } : {}),
      ...(totals.discount !== undefined ? { discount: totals.discount } : {}),
      ...(totals.tax !== undefined ? { tax: totals.tax } : {}),
      ...(totals.total !== undefined ? { total: totals.total } : {}),
    };

    if (status === "ACCEPTED" && !current.acceptedDate) {
      data.acceptedDate = new Date();
    }
    if (body.acceptedDate !== undefined) {
      data.acceptedDate = toDate(body.acceptedDate);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const quote = await tx.quote.update({
        where: { id: quoteId },
        data,
      });

      if (hasItemsUpdate) {
        await tx.quote_item.deleteMany({ where: { quoteId } });
        await tx.quote_item.createMany({ data: normalizedItems.map((item) => ({ ...item, quoteId })) });
      }

      return tx.quote.findUnique({
        where: { id: quote.id },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      });
    });

    return NextResponse.json({ success: true, quote: updated });
  } catch (error) {
    console.error("PATCH BUSINESS QUOTE ERROR:", error);
    return NextResponse.json({ error: "Teklif güncellenirken bir hata oluştu." }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const session = await getBusinessSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const businessId = session.user.businessId;

    const { id } = await context.params;
    const quoteId = toText(id, 64);
    if (!quoteId) return NextResponse.json({ error: "Geçersiz teklif id." }, { status: 400 });

    const existing = await prisma.quote.findFirst({
      where: { id: quoteId, businessId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Teklif bulunamadı." }, { status: 404 });

    await prisma.quote.delete({ where: { id: quoteId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE BUSINESS QUOTE ERROR:", error);
    return NextResponse.json({ error: "Teklif silinirken bir hata oluştu." }, { status: 500 });
  }
}
