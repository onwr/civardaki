import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, subDays, startOfYear } from "date-fns";

function rangeToDates(range) {
  const now = new Date();
  const end = now;
  let start;
  switch (range) {
    case "week":
      start = subDays(startOfDay(now), 6);
      break;
    case "month":
      start = subDays(startOfDay(now), 29);
      break;
    case "year":
      start = startOfYear(now);
      break;
    case "3months":
    default:
      start = subDays(startOfDay(now), 89);
      break;
  }
  return { start, end };
}

/** Legacy kayıtlar (expensePaymentStatus null) ödenmiş kabul */
function matchesStatusFilter(row, tab) {
  const status = row.expensePaymentStatus;
  const isLegacyPaid = status == null;
  const isPaid = status === "PAID" || isLegacyPaid;
  const isPending = status === "PENDING";
  const today = startOfDay(new Date());
  const due = row.dueDate ? startOfDay(new Date(row.dueDate)) : null;
  const isOverdue = isPending && due != null && due < today;

  if (tab === "paid") return isPaid;
  if (tab === "pending") return isPending && !isOverdue;
  if (tab === "overdue") return isOverdue;
  return true;
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    const { searchParams } = new URL(req.url || "", "http://localhost");
    const tab = searchParams.get("tab") || "all"; // paid | pending | overdue | all
    const range = searchParams.get("range") || "3months";
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const { start, end } = rangeToDates(range);
    const endDay = new Date(end);
    endDay.setHours(23, 59, 59, 999);

    const rows = await prisma.cash_transaction.findMany({
      where: {
        businessId,
        type: "EXPENSE",
        date: { gte: start, lte: endDay },
      },
      orderBy: { date: "desc" },
      take: 500,
      include: {
        account: true,
      },
    });

    let filtered = rows.filter((r) => matchesStatusFilter(r, tab));

    if (q.length >= 3) {
      filtered = filtered.filter((r) => {
        const hay = [r.category, r.description, r.notes, r.projectName, r.receiptNo, r.account?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    const sep = " › ";
    const expenses = filtered.map((r) => {
      const parts = (r.category || "").split(sep);
      const categoryTitle = parts.length > 1 ? parts[0] : null;
      const expenseItemName = parts.length > 1 ? parts.slice(1).join(sep) : parts[0] || null;
      return {
        id: r.id,
        date: r.date,
        dueDate: r.dueDate,
        paymentDate: r.paymentDate,
        projectName: r.projectName,
        category: r.category,
        expenseItemId: r.expenseItemId,
        expenseItemName,
        categoryTitle,
        accountName: r.account?.name,
        accountId: r.accountId,
        amount: r.amount,
        paymentStatus: r.expensePaymentStatus ?? "PAID",
        receiptNo: r.receiptNo,
        description: r.description,
        notes: r.notes,
        vatRate: r.vatRate,
        recurring: r.recurring,
      };
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("expenses GET:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    const body = await req.json();
    const {
      accountId,
      amount,
      category: categoryText,
      description,
      date: dateStr,
      expenseItemId,
      paymentStatus: ps,
      paymentDate: payDateStr,
      dueDate: dueDateStr,
      receiptNo,
      vatRate,
      projectName,
      notes,
      recurring,
    } = body;

    if (!accountId || amount == null || amount === "") {
      return NextResponse.json({ error: "Hesap ve tutar gerekli" }, { status: 400 });
    }

    const paymentStatus = ps === "PENDING" ? "PENDING" : "PAID";
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || amt < 0) {
      return NextResponse.json({ error: "Geçersiz tutar" }, { status: 400 });
    }

    let category = (categoryText || "Masraf").toString().trim();
    let itemId = expenseItemId || null;

    if (itemId) {
      const item = await prisma.expense_item.findFirst({
        where: { id: itemId, businessId },
        include: { category: true },
      });
      if (item) {
        category = `${item.category.name} › ${item.name}`;
      } else {
        itemId = null;
      }
    }

    const acct = await prisma.cash_account.findFirst({
      where: { id: accountId, businessId },
    });
    if (!acct) {
      return NextResponse.json({ error: "Hesap bulunamadı" }, { status: 400 });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const txRow = await tx.cash_transaction.create({
        data: {
          id: crypto.randomUUID(),
          businessId,
          accountId,
          type: "EXPENSE",
          amount: amt,
          category,
          description: description || null,
          date: dateStr ? new Date(dateStr) : new Date(),
          expensePaymentStatus: paymentStatus,
          dueDate: dueDateStr ? new Date(dueDateStr) : null,
          paymentDate: payDateStr ? new Date(payDateStr) : null,
          receiptNo: receiptNo?.trim() || null,
          vatRate: vatRate != null && vatRate !== "" ? parseFloat(vatRate) : null,
          projectName: projectName?.trim() || null,
          notes: notes?.trim() || null,
          recurring: Boolean(recurring),
          expenseItemId: itemId,
        },
      });

      if (paymentStatus === "PAID") {
        await tx.cash_account.update({
          where: { id: accountId },
          data: { balance: { decrement: amt } },
        });
      }

      return txRow;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("expenses POST:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
