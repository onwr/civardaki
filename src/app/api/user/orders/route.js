import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/orders – Giriş yapmış kullanıcının siparişlerini döndürür.
 * Session zorunludur.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            media: {
              where: { type: "LOGO" },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const list = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber || null,
      status: (order.status && String(order.status).toLowerCase()) || "pending",
      total: order.total != null ? Number(order.total) : 0,
      subtotal: order.subtotal != null ? Number(order.subtotal) : 0,
      orderDate: order.createdAt,
      businessId: order.business?.id || null,
      businessName: order.business?.name || "",
      businessSlug: order.business?.slug || "",
      businessLogo: order.business?.media?.[0]?.url || null,
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
    }));

    return NextResponse.json(list);
  } catch (err) {
    console.error("User orders fetch error:", err);
    return NextResponse.json(
      { error: "Siparişler yüklenirken hata oluştu." },
      { status: 500 }
    );
  }
}
