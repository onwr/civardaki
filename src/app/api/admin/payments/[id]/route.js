import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveParams(context) {
  const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
  return params;
}

const STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const payment = await prisma.subscription_payment.findUnique({
      where: { id },
      include: {
        business: {
          select: { id: true, name: true, slug: true },
        },
        subscription: {
          select: { id: true, plan: true, status: true, startedAt: true, expiresAt: true },
        },
      },
    });

    if (!payment) return NextResponse.json({ success: false, error: "Ödeme bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, payment });
  } catch (e) {
    console.error("Admin payment GET error:", e);
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
    const existing = await prisma.subscription_payment.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Ödeme bulunamadı." }, { status: 404 });

    const data = {};
    if (body.status !== undefined && STATUSES.includes(body.status)) data.status = body.status;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: true, payment: existing });
    }

    const updated = await prisma.subscription_payment.update({
      where: { id },
      data,
      include: {
        business: { select: { id: true, name: true, slug: true } },
        subscription: { select: { id: true, plan: true, status: true, expiresAt: true } },
      },
    });

    return NextResponse.json({ success: true, payment: updated });
  } catch (e) {
    console.error("Admin payment PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
