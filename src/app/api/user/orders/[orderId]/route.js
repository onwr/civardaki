import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/orders/[orderId] – Giriş yapmış kullanıcının tek sipariş detayı.
 * Sadece kendi siparişine erişebilir.
 */
export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const params = typeof context?.params?.then === "function" ? await context.params : context?.params || {};
    const orderId = params?.orderId?.toString?.()?.trim?.();
    if (!orderId) {
      return NextResponse.json({ error: "Sipariş ID gerekli." }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: true,
        business: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    const data = {
      id: order.id,
      orderNumber: order.orderNumber || null,
      status: (order.status && String(order.status).toLowerCase()) || "pending",
      total: order.total != null ? Number(order.total) : 0,
      subtotal: order.subtotal != null ? Number(order.subtotal) : 0,
      orderDate: order.createdAt,
      businessId: order.business?.id || null,
      businessName: order.business?.name || "",
      businessSlug: order.business?.slug || "",
      businessLogo: null,
      items: (order.items || []).map((item) => ({
        id: item.id,
        productName: item.name || "",
        quantity: item.qty != null ? Number(item.qty) : 1,
        price: item.price != null ? Number(item.price) : 0,
        total: (item.qty != null ? Number(item.qty) : 1) * (item.price != null ? Number(item.price) : 0),
      })),
      deliveryAddress: order.customerLoc || "",
      deliveryNote: order.customerNote || "",
      deliveryType: order.deliveryType || null,
      paymentMethod: order.paymentMethod || null,
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("User order detail fetch error:", err);
    return NextResponse.json(
      { error: "Sipariş yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
