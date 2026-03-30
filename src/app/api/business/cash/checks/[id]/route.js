import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ALLOWED_STATUS = [
  "IN_PORTFOLIO",
  "GIVEN_TO_SUPPLIER",
  "GIVEN_TO_BANK",
  "PAID",
  "BOUNCED",
  "CANCELLED",
];

function parseDate(v) {
  if (v === null || v === "") return null;
  if (v === undefined) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "invalid" : d;
}

async function assertOwn(businessId, id) {
  return prisma.cash_check.findFirst({ where: { id, businessId } });
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
    return NextResponse.json(row);
  } catch (e) {
    console.error("checks [id] GET:", e);
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

    if (body.direction !== undefined) {
      data.direction = body.direction === "ISSUED" ? "ISSUED" : "RECEIVED";
    }
    if (body.status !== undefined) {
      if (!ALLOWED_STATUS.includes(body.status)) {
        return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.checkNumber !== undefined) data.checkNumber = body.checkNumber?.trim() || null;
    if (body.amount !== undefined) {
      if (body.amount === "" || body.amount === null) {
        data.amount = 0;
      } else {
        const n = parseFloat(body.amount);
        if (Number.isNaN(n) || n < 0) {
          return NextResponse.json({ error: "Geçersiz tutar" }, { status: 400 });
        }
        data.amount = n;
      }
    }

    const issueDate = parseDate(body.issueDate);
    const dueDate = parseDate(body.dueDate);
    if (issueDate === "invalid" || dueDate === "invalid") {
      return NextResponse.json({ error: "Geçersiz tarih" }, { status: 400 });
    }
    if (issueDate !== undefined) data.issueDate = issueDate;
    if (dueDate !== undefined) data.dueDate = dueDate;

    if (body.bankName !== undefined) data.bankName = body.bankName?.trim() || null;
    if (body.drawerName !== undefined) data.drawerName = body.drawerName?.trim() || null;
    if (body.payeeName !== undefined) data.payeeName = body.payeeName?.trim() || null;
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    const row = await prisma.cash_check.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (e) {
    console.error("checks PATCH:", e);
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
    await prisma.cash_check.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("checks DELETE:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
