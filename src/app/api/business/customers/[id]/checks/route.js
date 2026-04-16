import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { customerCategory, CUSTOMER_CHECK_OPS } from "@/lib/customer-transaction";

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
    const operation = String(body?.operation || "");
    const accountId = String(body?.accountId || "");
    const date = body?.date ? new Date(body.date) : new Date();
    const description = String(body?.description || "").trim();

    if (!Object.values(CUSTOMER_CHECK_OPS).includes(operation)) {
      return NextResponse.json({ error: "Geçersiz çek işlemi." }, { status: 400 });
    }

    const amount = Number(body?.amount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Tutar zorunludur." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (db) => {
      const created = await db.cash_check.create({
        data: {
          businessId: ctx.businessId,
          direction: "RECEIVED",
          status: "IN_PORTFOLIO",
          checkNumber: body?.checkNumber ? String(body.checkNumber) : null,
          amount,
          issueDate: body?.issueDate ? new Date(body.issueDate) : date,
          dueDate: body?.dueDate ? new Date(body.dueDate) : null,
          bankName: body?.bankName ? String(body.bankName) : null,
          drawerName: body?.drawerName ? String(body.drawerName) : null,
          payeeName: body?.payeeName ? String(body.payeeName) : null,
          notes: JSON.stringify({
            source: "customer-check",
            customerId: ctx.customerId,
            operation,
            description,
          }),
        },
      });

      if (accountId) {
        const account = await db.cash_account.findFirst({
          where: { id: accountId, businessId: ctx.businessId },
          select: { id: true },
        });
        if (!account) throw new Error("Kasa/Hesap bulunamadı.");

        await db.cash_transaction.create({
          data: {
            businessId: ctx.businessId,
            accountId,
            type: "INCOME",
            amount,
            category: customerCategory(ctx.customerId, "CHECK", operation),
            description: description || `${ctx.customer.name} / Müşteriden Alınan Çek`,
            date,
            notes: JSON.stringify({
              source: "customer-check",
              customerId: ctx.customerId,
              operation,
            }),
          },
        });

        await db.cash_account.update({
          where: { id: accountId },
          data: { balance: { increment: amount } },
        });
      }

      return created;
    });

    return NextResponse.json({ item: result }, { status: 201 });
  } catch (error) {
    const message = error?.message || "Server error";
    console.error("Customer checks POST Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
