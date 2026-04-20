import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { customerCategory, CUSTOMER_PAYMENT_METHODS } from "@/lib/customer-transaction";

async function getContext(params) {
  const session = await getServerSession(authOptions);
  const businessId = session?.user?.businessId;
  if (!businessId) return { error: "Unauthorized", status: 401 };

  const resolved = await params;
  const customerId = resolved?.id;
  if (!customerId) return { error: "Müşteri bulunamadı.", status: 400 };

  const customer = await prisma.business_customer.findFirst({
    where: { id: customerId, businessId },
    select: { id: true, name: true },
  });
  if (!customer) return { error: "Müşteri bulunamadı.", status: 404 };
  return { businessId, customerId, customer };
}

export async function POST(req, { params }) {
  try {
    const ctx = await getContext(params);
    if (ctx.error) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }

    const body = await req.json();
    const paymentMethod = String(body?.paymentMethod || "");
    const accountId = String(body?.accountId || "");
    const amount = Number(body?.amount || 0);
    const description = String(body?.description || "").trim();
    const date = body?.date ? new Date(body.date) : new Date();

    if (!CUSTOMER_PAYMENT_METHODS.includes(paymentMethod)) {
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

    const tx = await prisma.$transaction(async (db) => {
      const created = await db.cash_transaction.create({
        data: {
          businessId: ctx.businessId,
          accountId,
          type: "INCOME",
          amount,
          category: customerCategory(ctx.customerId, "PAYMENT", "CUSTOMER_COLLECTION"),
          description: description || `${ctx.customer.name} / Müşteriden Tahsilat (${paymentMethod})`,
          date,
          notes: JSON.stringify({
            source: "customer-payments",
            customerId: ctx.customerId,
            paymentMethod,
            operation: "CUSTOMER_COLLECTION",
          }),
        },
      });

      await db.cash_account.update({
        where: { id: accountId },
        data: { balance: { increment: amount } },
      });

      await db.business_customer.update({
        where: { id: ctx.customerId },
        data: { openBalance: { decrement: amount } },
      });

      return created;
    });

    return NextResponse.json({ item: tx }, { status: 201 });
  } catch (error) {
    console.error("Customer payments POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
