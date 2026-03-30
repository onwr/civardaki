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
    const documentTypes = searchParams.get("documentType");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const includeCancelled = searchParams.get("includeCancelled") === "true";

    const where = { businessId };
    if (!includeCancelled) where.isCancelled = false;

    if (dateFrom || dateTo) {
      where.purchaseDate = {};
      if (dateFrom) where.purchaseDate.gte = new Date(dateFrom);
      if (dateTo) {
        const d = new Date(dateTo);
        d.setHours(23, 59, 59, 999);
        where.purchaseDate.lte = d;
      }
    }

    if (documentTypes) {
      const types = documentTypes.split(",").map((t) => t.trim()).filter(Boolean);
      if (types.length) where.documentType = { in: types };
    }

    const rows = await prisma.business_purchase.findMany({
      where,
      orderBy: { purchaseDate: "desc" },
      take: 500,
      include: {
        supplier: { select: { id: true, name: true } },
        cashAccount: { select: { id: true, name: true } },
      },
    });

    const purchases = rows.map((r) => ({
      id: r.id,
      documentType: r.documentType,
      supplierId: r.supplierId,
      supplierName: r.supplierName || r.supplier?.name,
      purchaseDate: r.purchaseDate.toISOString(),
      totalAmount: r.totalAmount,
      paymentAmount: r.paymentAmount,
      cashAccountId: r.cashAccountId,
      cashAccountName: r.cashAccount?.name,
      description: r.description,
      isCancelled: r.isCancelled,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ purchases });
  } catch (e) {
    console.error("Purchases GET:", e);
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

    const documentType = body.documentType || "ORDER";
    const purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : new Date();
    const totalAmount = toNum(body.totalAmount);
    const paymentAmount = toNum(body.paymentAmount);
    const cashAccountId = body.cashAccountId || null;
    const description = body.description || null;
    const supplierId = body.supplierId || null;
    const supplierName = body.supplierName || null;
    const items = Array.isArray(body.items) ? body.items : [];

    const created = await prisma.business_purchase.create({
      data: {
        businessId,
        documentType,
        supplierId,
        supplierName,
        purchaseDate,
        totalAmount,
        paymentAmount,
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

    return NextResponse.json({ purchase: created });
  } catch (e) {
    console.error("Purchases POST:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? e.message : "Kayıt başarısız" },
      { status: 500 }
    );
  }
}
