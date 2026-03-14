import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "ON_THE_WAY",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const params =
      typeof context.params?.then === "function"
        ? await context.params
        : context.params || {};
    const { id: businessId, orderId } = params;
    if (!businessId || !orderId) {
      return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const status = String(body.status || "").toUpperCase();
    if (!ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: "Geçersiz sipariş durumu." }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, businessId },
      select: { id: true },
    });
    if (!order) {
      return NextResponse.json({ success: false, error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (e) {
    console.error("Admin business order PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
