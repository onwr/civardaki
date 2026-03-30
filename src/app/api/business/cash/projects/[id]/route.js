import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function assertOwn(businessId, id) {
  return prisma.cash_project.findFirst({ where: { id, businessId } });
}

export async function GET(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const row = await assertOwn(session.user.businessId, id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const businessId = session.user.businessId;

    const [expenseRows, purchaseRows, saleRows, cariRows] = await Promise.all([
      prisma.cash_transaction.findMany({
        where: { businessId, projectId: id, type: "EXPENSE" },
        orderBy: { date: "desc" },
        take: 100,
        include: { account: { select: { name: true } } },
      }),
      prisma.business_purchase.findMany({
        where: { businessId, projectId: id, isCancelled: false },
        orderBy: { purchaseDate: "desc" },
        take: 100,
        include: { supplier: { select: { name: true } } },
      }),
      prisma.business_sale.findMany({
        where: { businessId, projectId: id },
        orderBy: { saleDate: "desc" },
        take: 100,
        include: { customer: { select: { name: true } } },
      }),
      prisma.cash_transaction.findMany({
        where: {
          businessId,
          projectId: id,
          type: { not: "EXPENSE" },
        },
        orderBy: { date: "desc" },
        take: 100,
        include: { account: { select: { name: true } } },
      }),
    ]);

    const expenseTotal = expenseRows.reduce((s, r) => s + Number(r.amount || 0), 0);
    const paidExpenseTotal = expenseRows
      .filter((r) => r.expensePaymentStatus === "PAID" || r.expensePaymentStatus == null)
      .reduce((s, r) => s + Number(r.amount || 0), 0);

    const purchaseTotal = purchaseRows.reduce((s, r) => s + Number(r.totalAmount || 0), 0);
    const purchasePaidTotal = purchaseRows.reduce((s, r) => s + Number(r.paymentAmount || 0), 0);

    const saleTotal = saleRows.reduce((s, r) => s + Number(r.totalAmount || 0), 0);

    const paymentsTotal = paidExpenseTotal + purchasePaidTotal;

    return NextResponse.json({
      project: {
        id: row.id,
        name: row.name,
        description: row.description,
        notes: row.notes,
        status: row.status,
        parentId: row.parentId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      summary: {
        expensesCount: expenseRows.length,
        expensesTotal,
        purchasesCount: purchaseRows.length,
        purchasesTotal,
        salesCount: saleRows.length,
        salesTotal,
        paymentsTotal,
      },
      expenses: expenseRows.map((r) => ({
        id: r.id,
        date: r.date,
        amount: r.amount,
        category: r.category,
        description: r.description,
        accountName: r.account?.name,
        expensePaymentStatus: r.expensePaymentStatus,
      })),
      purchases: purchaseRows.map((r) => ({
        id: r.id,
        purchaseDate: r.purchaseDate,
        totalAmount: r.totalAmount,
        paymentAmount: r.paymentAmount,
        supplierName: r.supplierName || r.supplier?.name,
        description: r.description,
      })),
      sales: saleRows.map((r) => ({
        id: r.id,
        saleDate: r.saleDate,
        totalAmount: r.totalAmount,
        collectionAmount: r.collectionAmount,
        customerName: r.customerName || r.customer?.name,
        description: r.description,
      })),
      cariMovements: cariRows.map((r) => ({
        id: r.id,
        date: r.date,
        type: r.type,
        amount: r.amount,
        category: r.category,
        description: r.description,
        accountName: r.account?.name,
      })),
    });
  } catch (e) {
    console.error("cash projects [id] GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const { id } = await params;
    const existing = await assertOwn(businessId, id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const data = {};

    if (body.name !== undefined) {
      const n = String(body.name).trim();
      if (!n) return NextResponse.json({ error: "Ad boş olamaz" }, { status: 400 });
      data.name = n;
    }
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
    if (body.status !== undefined) {
      if (!["ACTIVE", "ARCHIVED"].includes(body.status)) {
        return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
      }
      data.status = body.status;
    }

    if (body.parentId !== undefined) {
      if (body.parentId === null || body.parentId === "") {
        data.parentId = null;
      } else {
        if (body.parentId === id) {
          return NextResponse.json({ error: "Proje kendi üst projesi olamaz" }, { status: 400 });
        }
        const parent = await prisma.cash_project.findFirst({
          where: { id: body.parentId, businessId },
        });
        if (!parent) return NextResponse.json({ error: "Üst proje bulunamadı" }, { status: 400 });
        data.parentId = parent.id;
      }
    }

    const updated = await prisma.cash_project.update({ where: { id }, data });
    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      notes: updated.notes,
      status: updated.status,
      parentId: updated.parentId,
    });
  } catch (e) {
    console.error("cash projects [id] PATCH:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const existing = await assertOwn(session.user.businessId, id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Alt projeler DB cascade ile silinir; işlem/stok FK'leri SetNull
    await prisma.cash_project.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("cash projects [id] DELETE:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
