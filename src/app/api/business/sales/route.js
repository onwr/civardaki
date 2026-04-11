import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const { searchParams } = new URL(request.url);
    const documentTypes = searchParams.get("documentType"); // comma-separated ORDER,WAYBILL,...
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where = { businessId };

    if (dateFrom || dateTo) {
      where.saleDate = {};
      if (dateFrom) where.saleDate.gte = new Date(dateFrom);
      if (dateTo) {
        const d = new Date(dateTo);
        d.setHours(23, 59, 59, 999);
        where.saleDate.lte = d;
      }
    }

    if (documentTypes) {
      const types = documentTypes.split(",").map((t) => t.trim()).filter(Boolean);
      if (types.length) where.documentType = { in: types };
    }

    const rows = await prisma.business_sale.findMany({
      where,
      orderBy: { saleDate: "desc" },
      take: 500,
      include: {
        customer: { select: { id: true, name: true } },
        cashAccount: { select: { id: true, name: true } },
      },
    });

    const sales = rows.map((r) => ({
      id: r.id,
      documentType: r.documentType,
      saleKind: r.saleKind,
      customerId: r.customerId,
      customerName: r.customerName || r.customer?.name,
      saleDate: r.saleDate.toISOString(),
      totalAmount: r.totalAmount,
      collectionAmount: r.collectionAmount,
      cashAccountId: r.cashAccountId,
      cashAccountName: r.cashAccount?.name,
      description: r.description,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ sales });
  } catch (e) {
    console.error("Sales GET:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? e.message : "Sunucu hatası" },
      { status: 500 }
    );
  }
}

const AMOUNT_EPS = 0.051;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const body = await request.json();

    const saleKind = body.saleKind || "RETAIL";
    const documentType = body.documentType || "ORDER";
    const saleDate = body.saleDate ? new Date(body.saleDate) : new Date();
    const totalAmount = toNum(body.totalAmount);
    const collectionAmount = toNum(body.collectionAmount);
    const cashAccountId = body.cashAccountId || null;
    const description = body.description || null;
    const customerId = body.customerId || null;
    const customerName = body.customerName || null;
    const items = Array.isArray(body.items) ? body.items : [];

    const linesTotal = items.reduce((sum, it) => sum + toNum(it.total), 0);

    if (items.length > 0) {
      if (Math.abs(linesTotal - totalAmount) > AMOUNT_EPS) {
        return NextResponse.json(
          {
            error: `Satır toplamı (${linesTotal.toFixed(2)} ₺) ile genel tutar (${totalAmount.toFixed(2)} ₺) uyuşmuyor.`,
          },
          { status: 400 }
        );
      }
    }

    const saleTotal = items.length > 0 ? linesTotal : totalAmount;

    if (collectionAmount > saleTotal + AMOUNT_EPS) {
      return NextResponse.json(
        { error: "Tahsilat tutarı satış toplamını aşamaz." },
        { status: 400 }
      );
    }

    if (collectionAmount > 0 && !cashAccountId) {
      return NextResponse.json(
        { error: "Tahsilat için kasa hesabı seçin." },
        { status: 400 }
      );
    }

    const remaining = Math.max(0, saleTotal - collectionAmount);

    if (collectionAmount > 0) {
      const acc = await prisma.cash_account.findFirst({
        where: { id: cashAccountId, businessId },
        select: { id: true },
      });
      if (!acc) {
        return NextResponse.json(
          { error: "Seçilen kasa hesabı bulunamadı veya bu işletmeye ait değil." },
          { status: 400 }
        );
      }
    }

    if (customerId) {
      const cust = await prisma.business_customer.findFirst({
        where: { id: customerId, businessId },
        select: { id: true },
      });
      if (!cust) {
        return NextResponse.json(
          { error: "Müşteri bulunamadı veya bu işletmeye ait değil." },
          { status: 400 }
        );
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const sale = await tx.business_sale.create({
        data: {
          businessId,
          documentType,
          saleKind,
          customerId,
          customerName,
          saleDate,
          totalAmount: saleTotal,
          collectionAmount,
          cashAccountId: collectionAmount > 0 ? cashAccountId : null,
          description,
          items: {
            create: items.map((it) => ({
              productId: it.productId || null,
              name: (it.name || "").slice(0, 500),
              quantity: toNum(it.quantity) || 1,
              unitPrice: toNum(it.unitPrice),
              total: toNum(it.total),
            })),
          },
        },
        include: {
          items: true,
        },
      });

      if (collectionAmount > 0) {
        await tx.cash_transaction.create({
          data: {
            id: crypto.randomUUID(),
            businessId,
            accountId: cashAccountId,
            type: "INCOME",
            amount: collectionAmount,
            category: "Satış",
            description: `Satış kaydı · ${sale.id}`,
            date: saleDate,
          },
        });
        await tx.cash_account.update({
          where: { id: cashAccountId },
          data: { balance: { increment: collectionAmount } },
        });
      }

      if (customerId && remaining > AMOUNT_EPS) {
        await tx.business_customer.updateMany({
          where: { id: customerId, businessId },
          data: { openBalance: { increment: remaining } },
        });
      }

      return sale;
    });

    return NextResponse.json({ sale: created });
  } catch (e) {
    console.error("Sales POST:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? e.message : "Kayıt başarısız" },
      { status: 500 }
    );
  }
}
