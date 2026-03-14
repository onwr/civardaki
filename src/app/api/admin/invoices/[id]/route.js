import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveParams(context) {
  const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
  return params;
}

const STATUSES = ["DRAFT", "ISSUED", "PAID", "CANCELLED"];
const TYPES = ["SUBSCRIPTION", "MANUAL", "OTHER"];

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true, slug: true, email: true } },
        subscriptionPayment: { select: { id: true, amount: true, provider: true, paidAt: true } },
      },
    });

    if (!invoice) return NextResponse.json({ success: false, error: "Fatura bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, invoice });
  } catch (e) {
    console.error("Admin invoice GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Fatura bulunamadı." }, { status: 404 });

    const data = {};

    if (body.invoiceNumber !== undefined) {
      const v = safeStr(body.invoiceNumber);
      if (v) {
        const other = await prisma.invoice.findFirst({ where: { invoiceNumber: v, id: { not: id } }, select: { id: true } });
        if (other) return NextResponse.json({ success: false, error: "Bu fatura numarası zaten kullanılıyor." }, { status: 409 });
        data.invoiceNumber = v;
      }
    }
    if (body.type !== undefined && TYPES.includes(body.type)) data.type = body.type;
    if (body.status !== undefined && STATUSES.includes(body.status)) data.status = body.status;
    if (body.amount !== undefined) {
      const n = Number(body.amount);
      if (!Number.isNaN(n) && n > 0) data.amount = n;
    }
    if (body.currency !== undefined) data.currency = safeStr(body.currency) || "TRY";
    if (body.issueDate !== undefined) {
      const d = new Date(body.issueDate);
      if (!Number.isNaN(d.getTime())) data.issueDate = d;
    }
    if (body.dueDate !== undefined) {
      const d = new Date(body.dueDate);
      if (!Number.isNaN(d.getTime())) data.dueDate = d;
    }
    if (body.description !== undefined) data.description = body.description == null ? null : String(body.description).trim();
    if (body.pdfUrl !== undefined) data.pdfUrl = body.pdfUrl == null ? null : safeStr(body.pdfUrl) || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: true, invoice: existing });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data,
      include: {
        business: { select: { id: true, name: true, slug: true } },
        subscriptionPayment: { select: { id: true, amount: true, paidAt: true } },
      },
    });

    return NextResponse.json({ success: true, invoice: updated });
  } catch (e) {
    console.error("Admin invoice PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
