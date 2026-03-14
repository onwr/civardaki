import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;

    const orders = await prisma.order.findMany({
      where: { businessId },
      select: { total: true, deliveryType: true },
    });

    const platformStats = {};
    for (const o of orders) {
      const platform = o.deliveryType?.trim() || "Civardaki";
      if (!platformStats[platform]) {
        platformStats[platform] = { total: 0, count: 0, commission: 0 };
      }
      platformStats[platform].total += toAmount(o.total);
      platformStats[platform].count += 1;
    }

    const normalizedPlatformStats = Object.fromEntries(
      Object.entries(platformStats).map(([platform, stats]) => [
        platform,
        {
          total: Number(stats.total.toFixed(2)),
          count: Number(stats.count) || 0,
          commission: Number(stats.commission.toFixed(2)),
        },
      ])
    );

    const totalRevenue = Object.values(normalizedPlatformStats).reduce((s, p) => s + p.total, 0);
    const totalOrders = orders.length;
    const totalCommission = 0;

    return NextResponse.json({
      platformStats: normalizedPlatformStats,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalCommission,
    });
  } catch (error) {
    console.error("Ecommerce stats GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
