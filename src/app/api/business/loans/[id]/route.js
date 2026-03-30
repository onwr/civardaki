import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const SCHEDULES = ["MONTHLY", "WEEKLY", "BIWEEKLY", "QUARTERLY", "YEARLY"];

async function assertOwn(businessId, id) {
  return prisma.business_loan.findFirst({
    where: { id, businessId },
    include: { cashAccount: { select: { id: true, name: true } } },
  });
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
    console.error("loans [id] GET:", e);
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
      if (!n) return NextResponse.json({ error: "Kredi adı boş olamaz" }, { status: 400 });
      data.name = n;
    }
    if (body.remainingDebt != null) {
      const v = parseFloat(body.remainingDebt);
      if (Number.isNaN(v) || v < 0) {
        return NextResponse.json({ error: "Geçersiz kalan borç" }, { status: 400 });
      }
      data.remainingDebt = v;
    }
    if (body.remainingInstallments != null) {
      const n = parseInt(body.remainingInstallments, 10);
      if (Number.isNaN(n) || n < 1 || n > 144) {
        return NextResponse.json({ error: "Taksit 1–144 arası olmalı" }, { status: 400 });
      }
      data.remainingInstallments = n;
    }
    if (body.nextInstallmentDate != null) {
      const d = new Date(body.nextInstallmentDate);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Geçersiz tarih" }, { status: 400 });
      }
      data.nextInstallmentDate = d;
    }
    if (body.paymentSchedule != null && SCHEDULES.includes(body.paymentSchedule)) {
      data.paymentSchedule = body.paymentSchedule;
    }
    if (body.cashAccountId != null) {
      const acct = await prisma.cash_account.findFirst({
        where: { id: body.cashAccountId, businessId },
      });
      if (!acct) return NextResponse.json({ error: "Hesap bulunamadı" }, { status: 400 });
      data.cashAccountId = body.cashAccountId;
    }
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
    if (body.isClosed !== undefined) data.isClosed = Boolean(body.isClosed);

    const loan = await prisma.business_loan.update({
      where: { id },
      data,
      include: { cashAccount: { select: { id: true, name: true } } },
    });

    return NextResponse.json(loan);
  } catch (e) {
    console.error("loans PATCH:", e);
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

    await prisma.business_loan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("loans DELETE:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
