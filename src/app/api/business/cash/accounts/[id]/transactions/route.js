import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const accountId = resolved?.id;
    if (!accountId) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 400 });
    }

    const businessId = session.user.businessId;
    const account = await prisma.cash_account.findFirst({
      where: { id: accountId, businessId },
    });

    if (!account) {
      return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    }

    const limitParam = Number(new URL(req.url).searchParams.get("limit") || 200);
    const take = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(500, Math.trunc(limitParam)))
      : 200;

    const [cashTransactions, sales, purchases] = await Promise.all([
      prisma.cash_transaction.findMany({
        where: {
          businessId,
          OR: [{ accountId }, { toAccountId: accountId }],
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take,
        include: {
          account: true,
          toAccount: true,
        },
      }),
      prisma.business_sale.findMany({
        where: { businessId, cashAccountId: accountId },
        orderBy: [{ saleDate: "desc" }, { createdAt: "desc" }],
        take,
        select: {
          id: true,
          saleDate: true,
          customerName: true,
          description: true,
          collectionAmount: true,
          totalAmount: true,
        },
      }),
      prisma.business_purchase.findMany({
        where: { businessId, cashAccountId: accountId },
        orderBy: [{ purchaseDate: "desc" }, { createdAt: "desc" }],
        take,
        select: {
          id: true,
          purchaseDate: true,
          supplierName: true,
          description: true,
          paymentAmount: true,
          totalAmount: true,
          isCancelled: true,
        },
      }),
    ]);

    const saleAsTx = sales
      .map((row) => {
        const amount = Number(row.collectionAmount ?? row.totalAmount ?? 0);
        if (!(amount > 0)) return null;
        return {
          id: `sale-${row.id}`,
          date: row.saleDate,
          type: "INCOME",
          amount,
          description:
            row.description ||
            `Satış tahsilatı${row.customerName ? ` - ${row.customerName}` : ""}`,
          accountId,
          toAccountId: null,
          source: "business_sale",
        };
      })
      .filter(Boolean);

    const purchaseAsTx = purchases
      .filter((row) => !row.isCancelled)
      .map((row) => {
        const amount = Number(row.paymentAmount ?? row.totalAmount ?? 0);
        if (!(amount > 0)) return null;
        return {
          id: `purchase-${row.id}`,
          date: row.purchaseDate,
          type: "EXPENSE",
          amount,
          description:
            row.description ||
            `Alış ödemesi${row.supplierName ? ` - ${row.supplierName}` : ""}`,
          accountId,
          toAccountId: null,
          source: "business_purchase",
        };
      })
      .filter(Boolean);

    const ownCashTransactions = cashTransactions.map((row) => ({
      ...row,
      source: "cash_transaction",
    }));

    const transactions = [...ownCashTransactions, ...saleAsTx, ...purchaseAsTx]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, take);

    return NextResponse.json({ account, transactions }, { status: 200 });
  } catch (error) {
    console.error("Account transactions GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

