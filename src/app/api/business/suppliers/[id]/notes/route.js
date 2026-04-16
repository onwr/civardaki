import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { supplierCategory, SUPPLIER_NOTE_OPS } from "@/lib/supplier-transaction";

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
    const operation = String(body?.operation || "");
    const accountId = String(body?.accountId || "");
    const amount = Number(body?.amount || 0);
    const description = String(body?.description || "").trim();
    const date = body?.date ? new Date(body.date) : new Date();

    if (!Object.values(SUPPLIER_NOTE_OPS).includes(operation)) {
      return NextResponse.json({ error: "Geçersiz senet işlemi." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Tutar zorunludur." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (db) => {
      const note = await db.cash_promissory_note.create({
        data: {
          businessId: ctx.businessId,
          direction: operation === SUPPLIER_NOTE_OPS.GIVEN ? "ISSUED" : "RECEIVED",
          status: "IN_PORTFOLIO",
          noteNumber: body?.noteNumber ? String(body.noteNumber) : null,
          amount,
          issueDate: body?.issueDate ? new Date(body.issueDate) : date,
          dueDate: body?.dueDate ? new Date(body.dueDate) : null,
          drawerName: body?.drawerName ? String(body.drawerName) : null,
          payeeName: operation === SUPPLIER_NOTE_OPS.GIVEN ? ctx.supplier.name : (body?.payeeName ? String(body.payeeName) : null),
          notes: JSON.stringify({
            source: "supplier-note",
            supplierId: ctx.supplierId,
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

        const txType = operation === SUPPLIER_NOTE_OPS.GIVEN ? "EXPENSE" : "INCOME";
        await db.cash_transaction.create({
          data: {
            businessId: ctx.businessId,
            accountId,
            type: txType,
            amount,
            category: supplierCategory(ctx.supplierId, "NOTE", operation),
            description:
              description ||
              `${ctx.supplier.name} / ${operation === SUPPLIER_NOTE_OPS.GIVEN ? "Tedarikçiye Verilen Senet" : "Tedarikçiden Alınan Senet"}`,
            date,
            notes: JSON.stringify({
              source: "supplier-note",
              supplierId: ctx.supplierId,
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
      }

      return note;
    });

    return NextResponse.json({ item: result }, { status: 201 });
  } catch (error) {
    const message = error?.message || "Server error";
    console.error("Supplier notes POST Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

