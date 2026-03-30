import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const TAB_TO_STATUS = {
  all: null,
  portfolio: "IN_PORTFOLIO",
  supplier: "GIVEN_TO_SUPPLIER",
  bank: "GIVEN_TO_BANK",
  paid: "PAID",
  bounced: "BOUNCED",
  cancelled: "CANCELLED",
};

const ALLOWED_STATUS = [
  "IN_PORTFOLIO",
  "GIVEN_TO_SUPPLIER",
  "GIVEN_TO_BANK",
  "PAID",
  "BOUNCED",
  "CANCELLED",
];

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseAmount(v) {
  if (v == null || v === "") return 0;
  const n = parseFloat(v);
  return Number.isNaN(n) || n < 0 ? 0 : n;
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const { searchParams } = new URL(req.url || "", "http://localhost");
    const tab = searchParams.get("tab") || "all";
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const where = { businessId };
    const statusFilter = TAB_TO_STATUS[tab] ?? null;
    if (statusFilter) where.status = statusFilter;

    const rows = await prisma.cash_check.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 500,
    });

    let filtered = rows;
    if (q.length >= 3) {
      filtered = rows.filter((r) => {
        const hay = [r.checkNumber, r.bankName, r.drawerName, r.payeeName, r.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({ checks: filtered });
  } catch (e) {
    console.error("cash checks GET:", e);
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

    const direction = body.direction === "ISSUED" ? "ISSUED" : "RECEIVED";
    const status = ALLOWED_STATUS.includes(body.status) ? body.status : "IN_PORTFOLIO";

    const row = await prisma.cash_check.create({
      data: {
        businessId,
        direction,
        status,
        checkNumber: body.checkNumber?.trim() || null,
        amount: parseAmount(body.amount),
        issueDate: parseDate(body.issueDate),
        dueDate: parseDate(body.dueDate),
        bankName: body.bankName?.trim() || null,
        drawerName: body.drawerName?.trim() || null,
        payeeName: body.payeeName?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(row);
  } catch (e) {
    console.error("cash checks POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
