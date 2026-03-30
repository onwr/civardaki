import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const TAB_TO_STATUS = {
  all: null,
  overdue: "OVERDUE",
  portfolio: "IN_PORTFOLIO",
  supplier: "GIVEN_TO_SUPPLIER",
  bank: "GIVEN_TO_BANK",
  paid: "PAID",
  partial: "PARTIAL_PAID",
  cancelled: "CANCELLED",
};

const ALLOWED_STATUS = [
  "IN_PORTFOLIO",
  "OVERDUE",
  "GIVEN_TO_SUPPLIER",
  "GIVEN_TO_BANK",
  "PAID",
  "PARTIAL_PAID",
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

function isOverdue(row) {
  if (!row?.dueDate) return false;
  if (row.status === "PAID" || row.status === "CANCELLED") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(row.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
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
    if (statusFilter && tab !== "overdue") where.status = statusFilter;

    const rows = await prisma.cash_promissory_note.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 500,
    });

    let filtered = rows;
    if (tab === "overdue") filtered = filtered.filter(isOverdue);

    if (q.length >= 3) {
      filtered = filtered.filter((r) => {
        const hay = [r.noteNumber, r.drawerName, r.payeeName, r.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({ notes: filtered });
  } catch (e) {
    console.error("promissory notes GET:", e);
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

    const row = await prisma.cash_promissory_note.create({
      data: {
        businessId,
        direction,
        status,
        noteNumber: body.noteNumber?.trim() || null,
        amount: parseAmount(body.amount),
        paidAmount: parseAmount(body.paidAmount),
        issueDate: parseDate(body.issueDate),
        dueDate: parseDate(body.dueDate),
        drawerName: body.drawerName?.trim() || null,
        payeeName: body.payeeName?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(row);
  } catch (e) {
    console.error("promissory notes POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
