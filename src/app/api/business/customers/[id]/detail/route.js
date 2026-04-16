import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseCustomerCategory } from "@/lib/customer-transaction";

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
    const customerId = resolved?.id;
    if (!customerId) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 400 });
    }

    const customer = await prisma.business_customer.findFirst({
      where: { id: customerId, businessId },
    });
    if (!customer) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    const [documentsCount, sales, cashMovements, checks, notes] = await Promise.all([
      prisma.customer_document.count({ where: { businessId, customerId } }),
      prisma.business_sale.findMany({
        where: { businessId, customerId },
        orderBy: { saleDate: "desc" },
        take: 50,
        include: {
          items: { select: { id: true, name: true, quantity: true, total: true } },
          cashAccount: { select: { id: true, name: true } },
        },
      }),
      prisma.cash_transaction.findMany({
        where: {
          businessId,
          category: { startsWith: `CUSTOMER:${customerId}:` },
        },
        orderBy: { date: "desc" },
        take: 50,
        include: {
          account: { select: { id: true, name: true } },
        },
      }),
      prisma.cash_check.findMany({
        where: {
          businessId,
          notes: { contains: `"customerId":"${customerId}"` },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.cash_promissory_note.findMany({
        where: {
          businessId,
          notes: { contains: `"customerId":"${customerId}"` },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const totals = sales.reduce(
      (acc, row) => {
        acc.totalSales += Number(row.totalAmount) || 0;
        acc.totalCollection += Number(row.collectionAmount) || 0;
        return acc;
      },
      { totalSales: 0, totalCollection: 0 }
    );

    return NextResponse.json(
      {
        customer: {
          ...customer,
          openBalance: Number(customer.openBalance),
          checkNoteBalance: Number(customer.checkNoteBalance),
          riskLimit: Number(customer.riskLimit),
          openingBalance: Number(customer.openingBalance),
        },
        summary: {
          documentsCount,
          totalSales: totals.totalSales,
          totalCollection: totals.totalCollection,
          currentBalance: Number(customer.openBalance) || 0,
          movementCount: cashMovements.length,
          checkCount: checks.length,
          noteCount: notes.length,
        },
        cashMovements: cashMovements.map((row) => {
          const parsed = parseCustomerCategory(row.category);
          return {
            id: row.id,
            type: row.type,
            amount: Number(row.amount) || 0,
            category: row.category,
            operation: parsed?.operation || null,
            kind: parsed?.kind || null,
            accountName: row.account?.name || null,
            description: row.description,
            date: toIso(row.date),
            createdAt: toIso(row.createdAt),
          };
        }),
        checks: checks.map((row) => ({
          id: row.id,
          direction: row.direction,
          status: row.status,
          amount: Number(row.amount) || 0,
          checkNumber: row.checkNumber,
          bankName: row.bankName,
          issueDate: toIso(row.issueDate),
          dueDate: toIso(row.dueDate),
          createdAt: toIso(row.createdAt),
        })),
        notes: notes.map((row) => ({
          id: row.id,
          direction: row.direction,
          status: row.status,
          amount: Number(row.amount) || 0,
          noteNumber: row.noteNumber,
          issueDate: toIso(row.issueDate),
          dueDate: toIso(row.dueDate),
          createdAt: toIso(row.createdAt),
        })),
        sales: sales.map((row) => ({
          id: row.id,
          saleDate: toIso(row.saleDate),
          totalAmount: row.totalAmount,
          collectionAmount: row.collectionAmount,
          cashAccountName: row.cashAccount?.name || null,
          description: row.description,
          items: row.items,
          createdAt: toIso(row.createdAt),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Customer detail GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

