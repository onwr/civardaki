import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** Siparişleri e-ticaret satış formatına dönüştürür. */
function mapOrderToSale(order) {
  const firstItem = order.items?.[0];
  const productName = firstItem?.name ?? "Sipariş";
  const total = Number(order.total) || 0;
  const commission = 0; // Şema da yok, ileride eklenebilir
  const netAmount = total - commission;
  const platform = order.deliveryType?.trim() || "Civardaki";

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    platform,
    customerName: order.customerName ?? "—",
    productName,
    quantity: order.items?.reduce((sum, i) => sum + (i.qty || 0), 0) || 1,
    unitPrice: firstItem ? Number(firstItem.price) || 0 : total,
    total,
    commission,
    netAmount,
    orderDate: order.createdAt,
    status: order.status,
  };
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const platform = (searchParams.get("platform") ?? "").trim();
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

    const where = { businessId };
    if (platform) {
      where.deliveryType = platform;
    }
    if (q) {
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const sales = orders.map(mapOrderToSale);

    const [agg] = await prisma.order.aggregate({
      where: { businessId },
      _sum: { total: true },
      _count: true,
    });
    const totalSales = Number(agg._sum?.total) || 0;
    const totalCommission = 0;
    const netAmount = totalSales - totalCommission;
    const pendingReconciliations = 0;

    return NextResponse.json({
      sales,
      summary: {
        totalSales,
        totalCommission,
        netAmount,
        pendingReconciliations,
      },
    });
  } catch (error) {
    console.error("Ecommerce sales GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
