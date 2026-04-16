import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseSupplierCategory } from "@/lib/supplier-transaction";

function toIso(v) {
  return v ? new Date(v).toISOString() : null;
}

export async function GET(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const supplierId = resolved?.id;
    if (!supplierId) {
      return NextResponse.json({ error: "Tedarikçi bulunamadı." }, { status: 400 });
    }

    const supplier = await prisma.business_supplier.findFirst({
      where: { id: supplierId, businessId },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!supplier) {
      return NextResponse.json({ error: "Tedarikçi bulunamadı." }, { status: 404 });
    }

    const [documentsCount, purchases, cashMovements, checks, notes] = await Promise.all([
      prisma.supplier_document.count({ where: { businessId, supplierId } }),
      prisma.business_purchase.findMany({
        where: { businessId, supplierId, isCancelled: false },
        orderBy: { purchaseDate: "desc" },
        take: 30,
        include: {
          items: { select: { id: true, name: true, quantity: true, unitPrice: true, total: true } },
          cashAccount: { select: { id: true, name: true } },
        },
      }),
      prisma.cash_transaction.findMany({
        where: { businessId, category: { startsWith: `SUPPLIER:${supplierId}:` } },
        orderBy: { date: "desc" },
        take: 50,
        include: {
          account: { select: { id: true, name: true } },
          toAccount: { select: { id: true, name: true } },
        },
      }),
      prisma.cash_check.findMany({
        where: {
          businessId,
          notes: { contains: `"supplierId":"${supplierId}"` },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.cash_promissory_note.findMany({
        where: {
          businessId,
          notes: { contains: `"supplierId":"${supplierId}"` },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const totals = purchases.reduce(
      (acc, row) => {
        acc.totalPurchase += Number(row.totalAmount) || 0;
        acc.totalPurchasePayment += Number(row.paymentAmount) || 0;
        return acc;
      },
      { totalPurchase: 0, totalPurchasePayment: 0 }
    );
    const cashTotals = cashMovements.reduce(
      (acc, row) => {
        if (row.type === "EXPENSE") acc.totalPayment += Number(row.amount) || 0;
        if (row.type === "INCOME") acc.totalCollection += Number(row.amount) || 0;
        return acc;
      },
      { totalPayment: 0, totalCollection: 0 }
    );

    const movementStats = {
      paymentCount: cashMovements.filter((m) => m.type === "EXPENSE").length,
      collectionCount: cashMovements.filter((m) => m.type === "INCOME").length,
      checkCount: checks.length,
      noteCount: notes.length,
      purchaseCount: purchases.length,
    };

    const timeline = [
      ...cashMovements.map((row) => ({
        id: `tx_${row.id}`,
        itemType: "CASH",
        date: toIso(row.date),
        amount: row.amount,
        title: row.type === "INCOME" ? "Tahsilat" : row.type === "EXPENSE" ? "Ödeme" : "Virman",
        description: row.description || null,
      })),
      ...checks.map((row) => ({
        id: `chk_${row.id}`,
        itemType: "CHECK",
        date: toIso(row.issueDate || row.createdAt),
        amount: row.amount,
        title: row.direction === "ISSUED" ? "Verilen Çek" : "Alınan Çek",
        description: row.checkNumber || null,
      })),
      ...notes.map((row) => ({
        id: `note_${row.id}`,
        itemType: "NOTE",
        date: toIso(row.issueDate || row.createdAt),
        amount: row.amount,
        title: row.direction === "ISSUED" ? "Verilen Senet" : "Alınan Senet",
        description: row.noteNumber || null,
      })),
      ...purchases.map((row) => ({
        id: `pur_${row.id}`,
        itemType: "PURCHASE",
        date: toIso(row.purchaseDate),
        amount: row.totalAmount,
        title: "Alış",
        description: row.description || null,
      })),
    ]
      .filter((x) => !!x.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100);

    return NextResponse.json(
      {
        supplier: {
          ...supplier,
          openingBalance: Number(supplier.openingBalance),
          categoryName: supplier.category?.name || null,
        },
        summary: {
          openingBalance: Number(supplier.openingBalance) || 0,
          documentsCount,
          totalPurchase: totals.totalPurchase,
          totalPurchasePayment: totals.totalPurchasePayment,
          totalPayment: cashTotals.totalPayment,
          totalCollection: cashTotals.totalCollection,
          movementStats,
          currentBalance:
            (Number(supplier.openingBalance) || 0) +
            totals.totalPurchase -
            totals.totalPurchasePayment -
            cashTotals.totalPayment +
            cashTotals.totalCollection,
        },
        purchases: purchases.map((row) => ({
          id: row.id,
          documentType: row.documentType,
          purchaseDate: toIso(row.purchaseDate),
          totalAmount: row.totalAmount,
          paymentAmount: row.paymentAmount,
          cashAccountId: row.cashAccountId,
          cashAccountName: row.cashAccount?.name || null,
          description: row.description,
          createdAt: toIso(row.createdAt),
          items: row.items,
        })),
        cashMovements: cashMovements.map((row) => ({
          id: row.id,
          type: row.type,
          amount: row.amount,
          date: toIso(row.date),
          description: row.description,
          supplierMeta: parseSupplierCategory(row.category),
          accountId: row.accountId,
          accountName: row.account?.name || null,
          toAccountId: row.toAccountId,
          toAccountName: row.toAccount?.name || null,
        })),
        checks: checks.map((row) => ({
          id: row.id,
          direction: row.direction,
          status: row.status,
          checkNumber: row.checkNumber,
          amount: row.amount,
          issueDate: toIso(row.issueDate),
          dueDate: toIso(row.dueDate),
          bankName: row.bankName,
          drawerName: row.drawerName,
          payeeName: row.payeeName,
        })),
        notes: notes.map((row) => ({
          id: row.id,
          direction: row.direction,
          status: row.status,
          noteNumber: row.noteNumber,
          amount: row.amount,
          issueDate: toIso(row.issueDate),
          dueDate: toIso(row.dueDate),
          drawerName: row.drawerName,
          payeeName: row.payeeName,
        })),
        timeline,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Supplier detail GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
