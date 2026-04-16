import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supplierCategory, SUPPLIER_ACTION_OPS } from "@/lib/supplier-transaction";

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
    if (ctx.error) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

    const body = await req.json();
    const actionType = String(body?.actionType || "");
    const amount = Number(body?.amount || 0);
    const accountId = body?.accountId ? String(body.accountId) : "";
    const targetSupplierId = body?.targetSupplierId ? String(body.targetSupplierId) : "";
    const description = String(body?.description || "").trim();
    const date = body?.date ? new Date(body.date) : new Date();
    const dueDate = body?.dueDate ? new Date(body.dueDate) : null;
    const projectName = body?.projectName ? String(body.projectName) : null;

    if (!Object.values(SUPPLIER_ACTION_OPS).includes(actionType)) {
      return NextResponse.json({ error: "Geçersiz aksiyon türü." }, { status: 400 });
    }

    const tx = await prisma.$transaction(async (db) => {
      if (!accountId) throw new Error("Kasa/Hesap seçimi zorunludur.");
      const account = await db.cash_account.findFirst({
        where: { id: accountId, businessId: ctx.businessId },
        select: { id: true },
      });
      if (!account) throw new Error("Kasa/Hesap bulunamadı.");

      if (actionType === SUPPLIER_ACTION_OPS.BALANCE_ADJUST || actionType === SUPPLIER_ACTION_OPS.DEBIT_CREDIT_SLIP) {
        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error("Tutar zorunludur.");
        }
        const operation = String(body?.operation || "DEBIT");
        const txType = operation === "CREDIT" ? "INCOME" : "EXPENSE";
        const created = await db.cash_transaction.create({
          data: {
            businessId: ctx.businessId,
            accountId,
            type: txType,
            amount,
            category: supplierCategory(ctx.supplierId, "ACTION", actionType),
            description:
              description ||
              `${ctx.supplier.name} / ${actionType === SUPPLIER_ACTION_OPS.BALANCE_ADJUST ? "Bakiye Düzelt" : "Borç-Alacak Fişi"} (${operation})`,
            date,
            dueDate,
            projectName,
            notes: JSON.stringify({ source: "supplier-actions", supplierId: ctx.supplierId, actionType, operation }),
          },
        });
        await db.cash_account.update({
          where: { id: accountId },
          data: { balance: txType === "EXPENSE" ? { decrement: amount } : { increment: amount } },
        });
        return created;
      }

      if (actionType === SUPPLIER_ACTION_OPS.CURRENT_TRANSFER) {
        if (!targetSupplierId || !Number.isFinite(amount) || amount <= 0) {
          throw new Error("Seçilen diğer cari ve tutar zorunludur.");
        }
        const targetSupplier = await db.business_supplier.findFirst({
          where: { id: targetSupplierId, businessId: ctx.businessId },
          select: { id: true, name: true },
        });
        if (!targetSupplier) throw new Error("Seçilen diğer cari bulunamadı.");

        const operation = String(body?.operation || "CREDIT");
        const mainType = operation === "CREDIT" ? "INCOME" : "EXPENSE";
        const otherType = operation === "CREDIT" ? "EXPENSE" : "INCOME";

        const mainTx = await db.cash_transaction.create({
          data: {
            businessId: ctx.businessId,
            accountId,
            type: mainType,
            amount,
            category: supplierCategory(ctx.supplierId, "ACTION", actionType),
            description: description || `${ctx.supplier.name} / Cari Virman`,
            date,
            dueDate,
            notes: JSON.stringify({ source: "supplier-actions", supplierId: ctx.supplierId, actionType, operation, targetSupplierId }),
          },
        });

        await db.cash_transaction.create({
          data: {
            businessId: ctx.businessId,
            accountId,
            type: otherType,
            amount,
            category: supplierCategory(targetSupplier.id, "ACTION", actionType),
            description: description || `${targetSupplier.name} / Cari Virman`,
            date,
            dueDate,
            notes: JSON.stringify({ source: "supplier-actions", supplierId: targetSupplier.id, actionType, operation, targetSupplierId: ctx.supplierId }),
          },
        });

        if (mainType === "EXPENSE") {
          await db.cash_account.update({ where: { id: accountId }, data: { balance: { decrement: amount } } });
        } else {
          await db.cash_account.update({ where: { id: accountId }, data: { balance: { increment: amount } } });
        }
        return mainTx;
      }

      throw new Error("Aksiyon desteklenmiyor.");
    });

    return NextResponse.json({ item: tx }, { status: 201 });
  } catch (error) {
    const message = error?.message || "Server error";
    console.error("Supplier actions POST Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

