import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getBusinessId() {
  const session = await getServerSession(authOptions);
  return session?.user?.businessId || null;
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function applyBalanceDiff(tx, row, diff) {
  if (!diff) return;
  if (row.type === "INCOME") {
    await tx.cash_account.update({
      where: { id: row.accountId },
      data: { balance: { increment: diff } },
    });
    return;
  }
  if (row.type === "EXPENSE") {
    await tx.cash_account.update({
      where: { id: row.accountId },
      data: { balance: { decrement: diff } },
    });
    return;
  }
  if (row.type === "TRANSFER" && row.toAccountId) {
    await tx.cash_account.update({
      where: { id: row.accountId },
      data: { balance: { decrement: diff } },
    });
    await tx.cash_account.update({
      where: { id: row.toAccountId },
      data: { balance: { increment: diff } },
    });
  }
}

async function applyCustomerBalanceDiff(tx, row, diff, businessId) {
  if (!diff || !row.category?.startsWith("CUSTOMER:")) return;
  const parts = row.category.split(":");
  const customerId = parts[1];
  if (!customerId) return;
  
  if (row.type === "INCOME") {
    await tx.business_customer.updateMany({
      where: { id: customerId, businessId },
      data: { openBalance: { decrement: diff } },
    });
  } else if (row.type === "EXPENSE") {
    await tx.business_customer.updateMany({
      where: { id: customerId, businessId },
      data: { openBalance: { increment: diff } },
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const id = resolved?.id;
    if (!id) {
      return NextResponse.json({ error: "İşlem bulunamadı." }, { status: 400 });
    }

    const body = await req.json();
    const row = await prisma.cash_transaction.findFirst({
      where: { id, businessId },
    });
    if (!row) {
      return NextResponse.json({ error: "İşlem bulunamadı." }, { status: 404 });
    }

    const nextAmount = body?.amount !== undefined ? num(body.amount, row.amount) : row.amount;
    if (!(nextAmount > 0)) {
      return NextResponse.json({ error: "Tutar 0'dan büyük olmalı." }, { status: 400 });
    }

    const diff = nextAmount - num(row.amount, 0);
    const nextDescription =
      body?.description !== undefined ? (body.description ? String(body.description) : null) : row.description;
    const nextDate =
      body?.date !== undefined && body.date
        ? new Date(body.date)
        : row.date;

    const updated = await prisma.$transaction(async (tx) => {
      await applyBalanceDiff(tx, row, diff);
      await applyCustomerBalanceDiff(tx, row, diff, businessId);
      return tx.cash_transaction.update({
        where: { id },
        data: {
          amount: nextAmount,
          description: nextDescription,
          date: nextDate,
        },
      });
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Cash Transaction PATCH Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const businessId = await getBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const id = resolved?.id;
    if (!id) {
      return NextResponse.json({ error: "İşlem bulunamadı." }, { status: 400 });
    }

    const row = await prisma.cash_transaction.findFirst({
      where: { id, businessId },
    });
    if (!row) {
      return NextResponse.json({ error: "İşlem bulunamadı." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const amount = num(row.amount, 0);
      if (row.type === "INCOME") {
        await tx.cash_account.update({
          where: { id: row.accountId },
          data: { balance: { decrement: amount } },
        });
        if (row.category?.startsWith("CUSTOMER:")) {
          const customerId = row.category.split(":")[1];
          if (customerId) {
            await tx.business_customer.updateMany({
              where: { id: customerId, businessId },
              data: { openBalance: { increment: amount } },
            });
          }
        }
      } else if (row.type === "EXPENSE") {
        await tx.cash_account.update({
          where: { id: row.accountId },
          data: { balance: { increment: amount } },
        });
        if (row.category?.startsWith("CUSTOMER:")) {
          const customerId = row.category.split(":")[1];
          if (customerId) {
            await tx.business_customer.updateMany({
              where: { id: customerId, businessId },
              data: { openBalance: { decrement: amount } },
            });
          }
        }
      } else if (row.type === "TRANSFER" && row.toAccountId) {
        await tx.cash_account.update({
          where: { id: row.accountId },
          data: { balance: { increment: amount } },
        });
        await tx.cash_account.update({
          where: { id: row.toAccountId },
          data: { balance: { decrement: amount } },
        });
      }

      await tx.cash_transaction.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Cash Transaction DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

