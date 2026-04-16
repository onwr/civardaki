import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supplierCategory, SUPPLIER_CHECK_OPS } from "@/lib/supplier-transaction";

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

export async function GET(_req, { params }) {
  try {
    const ctx = await getContext(params);
    if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

    const portfolioChecks = await prisma.cash_check.findMany({
      where: {
        businessId: ctx.businessId,
        direction: "RECEIVED",
        status: "IN_PORTFOLIO",
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ portfolioChecks }, { status: 200 });
  } catch (error) {
    console.error("Supplier checks GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const ctx = await getContext(params);
    if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

    const body = await req.json();
    const operation = String(body?.operation || "");
    const mode = String(body?.mode || "NEW");
    const accountId = String(body?.accountId || "");
    const date = body?.date ? new Date(body.date) : new Date();
    const description = String(body?.description || "").trim();

    if (!Object.values(SUPPLIER_CHECK_OPS).includes(operation)) {
      return NextResponse.json({ error: "Geçersiz çek işlemi." }, { status: 400 });
    }

    let totalAmount = 0;
    let createdChecks = [];

    const result = await prisma.$transaction(async (db) => {
      if (operation === SUPPLIER_CHECK_OPS.GIVEN && mode === "PORTFOLIO") {
        const selectedIds = Array.isArray(body?.portfolioCheckIds)
          ? body.portfolioCheckIds.map((x) => String(x))
          : [];
        if (selectedIds.length === 0) {
          throw new Error("Portföyden en az bir çek seçin.");
        }

        const checks = await db.cash_check.findMany({
          where: {
            id: { in: selectedIds },
            businessId: ctx.businessId,
            direction: "RECEIVED",
            status: "IN_PORTFOLIO",
          },
        });
        if (checks.length === 0) throw new Error("Seçilen çekler bulunamadı.");
        totalAmount = checks.reduce((s, c) => s + (Number(c.amount) || 0), 0);

        await db.cash_check.updateMany({
          where: { id: { in: checks.map((c) => c.id) } },
          data: {
            status: "GIVEN_TO_SUPPLIER",
            payeeName: ctx.supplier.name,
            notes: JSON.stringify({
              source: "supplier-check",
              supplierId: ctx.supplierId,
              operation,
            }),
          },
        });
      } else {
        const amount = Number(body?.amount || 0);
        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error("Tutar zorunludur.");
        }
        totalAmount = amount;
        const created = await db.cash_check.create({
          data: {
            businessId: ctx.businessId,
            direction: operation === SUPPLIER_CHECK_OPS.GIVEN ? "ISSUED" : "RECEIVED",
            status: operation === SUPPLIER_CHECK_OPS.GIVEN ? "GIVEN_TO_SUPPLIER" : "IN_PORTFOLIO",
            checkNumber: body?.checkNumber ? String(body.checkNumber) : null,
            amount,
            issueDate: body?.issueDate ? new Date(body.issueDate) : date,
            dueDate: body?.dueDate ? new Date(body.dueDate) : null,
            bankName: body?.bankName ? String(body.bankName) : null,
            drawerName: body?.drawerName ? String(body.drawerName) : null,
            payeeName: operation === SUPPLIER_CHECK_OPS.GIVEN ? ctx.supplier.name : (body?.payeeName ? String(body.payeeName) : null),
            notes: JSON.stringify({
              source: "supplier-check",
              supplierId: ctx.supplierId,
              operation,
              description,
            }),
          },
        });
        createdChecks = [created];
      }

      if (accountId && totalAmount > 0) {
        const account = await db.cash_account.findFirst({
          where: { id: accountId, businessId: ctx.businessId },
          select: { id: true },
        });
        if (!account) throw new Error("Kasa/Hesap bulunamadı.");

        const txType = operation === SUPPLIER_CHECK_OPS.GIVEN ? "EXPENSE" : "INCOME";
        await db.cash_transaction.create({
          data: {
            businessId: ctx.businessId,
            accountId,
            type: txType,
            amount: totalAmount,
            category: supplierCategory(ctx.supplierId, "CHECK", operation),
            description:
              description ||
              `${ctx.supplier.name} / ${operation === SUPPLIER_CHECK_OPS.GIVEN ? "Tedarikçiye Verilen Çek" : "Tedarikçiden Alınan Çek"}`,
            date,
            notes: JSON.stringify({
              source: "supplier-check",
              supplierId: ctx.supplierId,
              operation,
              mode,
            }),
          },
        });
        await db.cash_account.update({
          where: { id: accountId },
          data: {
            balance: txType === "EXPENSE" ? { decrement: totalAmount } : { increment: totalAmount },
          },
        });
      }

      return { totalAmount };
    });

    return NextResponse.json(
      { ok: true, totalAmount: result.totalAmount, createdChecks },
      { status: 201 }
    );
  } catch (error) {
    const message = error?.message || "Server error";
    console.error("Supplier checks POST Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

