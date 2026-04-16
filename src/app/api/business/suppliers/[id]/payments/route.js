import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supplierCategory, SUPPLIER_PAYMENT_METHODS } from "@/lib/supplier-transaction";

async function getContext(params) {
  const session = await getServerSession(authOptions);
  const businessId = session?.user?.businessId;
  if (!businessId) return { error: "Unauthorized", status: 401 };

  const resolved = await params;
  const supplierId = resolved?.id;
  if (!supplierId) return { error: "Tedarikçi bulunamadı.", status: 400 };

  const supplier = await prisma.business_supplier.findFirst({
    where: { id: supplierId, businessId },
    select: { id: true, name: true },
  });
  if (!supplier) return { error: "Tedarikçi bulunamadı.", status: 404 };
  return { businessId, supplierId, supplier };
}

export async function POST(req, { params }) {
  try {
    const ctx = await getContext(params);
    if (ctx.error) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }

    const body = await req.json();
    const operation = String(body?.operation || "");
    const paymentMethod = String(body?.paymentMethod || "");
    const accountId = String(body?.accountId || "");
    const amount = Number(body?.amount || 0);
    const description = String(body?.description || "").trim();
    const date = body?.date ? new Date(body.date) : new Date();

    if (!["SUPPLIER_PAYMENT", "SUPPLIER_COLLECTION"].includes(operation)) {
      return NextResponse.json({ error: "Geçersiz işlem türü." }, { status: 400 });
    }
    if (!SUPPLIER_PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json({ error: "Geçersiz ödeme yöntemi." }, { status: 400 });
    }
    if (!accountId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Hesap ve tutar zorunludur." }, { status: 400 });
    }

    const account = await prisma.cash_account.findFirst({
      where: { id: accountId, businessId: ctx.businessId },
      select: { id: true },
    });
    if (!account) {
      return NextResponse.json({ error: "Kasa/Hesap bulunamadı." }, { status: 404 });
    }

    const txType = operation === "SUPPLIER_PAYMENT" ? "EXPENSE" : "INCOME";
    const tx = await prisma.$transaction(async (db) => {
      const created = await db.cash_transaction.create({
        data: {
          businessId: ctx.businessId,
          accountId,
          type: txType,
          amount,
          category: supplierCategory(ctx.supplierId, "PAYMENT", operation),
          description:
            description ||
            `${ctx.supplier.name} / ${operation === "SUPPLIER_PAYMENT" ? "Tedarikçiye Ödeme" : "Tedarikçiden Tahsilat"} (${paymentMethod})`,
          date,
          notes: JSON.stringify({
            source: "supplier-payments",
            supplierId: ctx.supplierId,
            paymentMethod,
            operation,
          }),
        },
      });

      await db.cash_account.update({
        where: { id: accountId },
        data: {
          balance: txType === "EXPENSE" ? { decrement: amount } : { increment: amount },
        },
      });
      return created;
    });

    return NextResponse.json({ item: tx }, { status: 201 });
  } catch (error) {
    console.error("Supplier payments POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

