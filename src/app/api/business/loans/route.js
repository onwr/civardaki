import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, subDays, startOfYear } from "date-fns";

const SCHEDULES = ["MONTHLY", "WEEKLY", "BIWEEKLY", "QUARTERLY", "YEARLY"];

function rangeToDates(range) {
  const now = new Date();
  const endDay = new Date(now);
  endDay.setHours(23, 59, 59, 999);
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
  return { start, end: endDay };
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    const { searchParams } = new URL(req.url || "", "http://localhost");
    const tab = searchParams.get("tab") || "active";
    const range = searchParams.get("range") || "all";
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const where = { businessId };

    if (tab === "active") where.isClosed = false;
    else if (tab === "closed") where.isClosed = true;

    if (range !== "all") {
      const { start, end } = rangeToDates(range);
      where.nextInstallmentDate = { gte: start, lte: end };
    }

    const rows = await prisma.business_loan.findMany({
      where,
      orderBy: [{ nextInstallmentDate: "asc" }, { createdAt: "desc" }],
      take: 500,
      include: { cashAccount: { select: { id: true, name: true } } },
    });

    let filtered = rows;
    if (q.length >= 3) {
      filtered = rows.filter((r) => {
        const hay = [r.name, r.notes, r.cashAccount?.name].filter(Boolean).join(" ").toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({
      loans: filtered.map((r) => ({
        id: r.id,
        name: r.name,
        remainingDebt: r.remainingDebt,
        remainingInstallments: r.remainingInstallments,
        nextInstallmentDate: r.nextInstallmentDate,
        paymentSchedule: r.paymentSchedule,
        cashAccountId: r.cashAccountId,
        accountName: r.cashAccount?.name,
        notes: r.notes,
        isClosed: r.isClosed,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    console.error("loans GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    const body = await req.json();
    const name = (body.name || "").trim();
    const remainingDebt = parseFloat(body.remainingDebt);
    const remainingInstallments = parseInt(body.remainingInstallments, 10);
    const nextInstallmentDate = body.nextInstallmentDate
      ? new Date(body.nextInstallmentDate)
      : null;
    const paymentSchedule = SCHEDULES.includes(body.paymentSchedule)
      ? body.paymentSchedule
      : "MONTHLY";
    const cashAccountId = body.cashAccountId;
    const notes = body.notes?.trim() || null;

    if (!name) {
      return NextResponse.json({ error: "Kredi adı gerekli" }, { status: 400 });
    }
    if (Number.isNaN(remainingDebt) || remainingDebt < 0) {
      return NextResponse.json({ error: "Geçerli kalan borç girin" }, { status: 400 });
    }
    if (
      Number.isNaN(remainingInstallments) ||
      remainingInstallments < 1 ||
      remainingInstallments > 144
    ) {
      return NextResponse.json(
        { error: "Kalan taksit 1–144 arası olmalıdır" },
        { status: 400 }
      );
    }
    if (!nextInstallmentDate || Number.isNaN(nextInstallmentDate.getTime())) {
      return NextResponse.json({ error: "Sıradaki taksit tarihi gerekli" }, { status: 400 });
    }
    if (!cashAccountId) {
      return NextResponse.json({ error: "Ödeme hesabı seçin" }, { status: 400 });
    }

    const acct = await prisma.cash_account.findFirst({
      where: { id: cashAccountId, businessId },
    });
    if (!acct) {
      return NextResponse.json({ error: "Hesap bulunamadı" }, { status: 400 });
    }

    const loan = await prisma.business_loan.create({
      data: {
        id: crypto.randomUUID(),
        businessId,
        name,
        remainingDebt,
        remainingInstallments,
        nextInstallmentDate,
        paymentSchedule,
        cashAccountId,
        notes,
        isClosed: Boolean(body.isClosed),
      },
      include: { cashAccount: { select: { id: true, name: true } } },
    });

    return NextResponse.json(loan);
  } catch (e) {
    console.error("loans POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
