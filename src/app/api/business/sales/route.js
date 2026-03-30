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

    const created = await prisma.business_sale.create({
      data: {
        businessId,
        documentType,
        saleKind,
        customerId,
        customerName,
        saleDate,
        totalAmount,
        collectionAmount,
        cashAccountId,
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

    return NextResponse.json({ sale: created });
  } catch (e) {
    console.error("Sales POST:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? e.message : "Kayıt başarısız" },
      { status: 500 }
    );
  }
}
