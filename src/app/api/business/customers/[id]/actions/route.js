import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { customerCategory, CUSTOMER_ACTION_OPS } from "@/lib/customer-transaction";

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
    if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

    const body = await req.json();
    const actionType = String(body?.actionType || "");
    const amount = Number(body?.amount || 0);
    const accountId = body?.accountId ? String(body.accountId) : "";
    const description = String(body?.description || "").trim();
    const date = body?.date ? new Date(body.date) : new Date();

    if (!Object.values(CUSTOMER_ACTION_OPS).includes(actionType)) {
      return NextResponse.json({ error: "Geçersiz aksiyon türü." }, { status: 400 });
    }
    if (!accountId) {
      return NextResponse.json({ error: "Kasa/Hesap seçimi zorunludur." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Tutar zorunludur." }, { status: 400 });
    }

    const operation = String(body?.operation || "DEBIT");
    const txType = operation === "CREDIT" ? "INCOME" : "EXPENSE";

    const tx = await prisma.$transaction(async (db) => {
      const account = await db.cash_account.findFirst({
        where: { id: accountId, businessId: ctx.businessId },
        select: { id: true },
      });
      if (!account) throw new Error("Kasa/Hesap bulunamadı.");

      const created = await db.cash_transaction.create({
        data: {
          businessId: ctx.businessId,
          accountId,
          type: txType,
          amount,
          category: customerCategory(ctx.customerId, "ACTION", actionType),
          description: description || `${ctx.customer.name} / Bakiye Düzelt (${operation})`,
          date,
          notes: JSON.stringify({
            source: "customer-actions",
            customerId: ctx.customerId,
            actionType,
            operation,
          }),
        },
      });

      await db.cash_account.update({
        where: { id: accountId },
        data: { balance: txType === "EXPENSE" ? { decrement: amount } : { increment: amount } },
      });

      return created;
    });

    return NextResponse.json({ item: tx }, { status: 201 });
  } catch (error) {
    const message = error?.message || "Server error";
    console.error("Customer actions POST Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
