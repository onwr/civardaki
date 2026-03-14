import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const PLATFORM_OPTIONS = ["ALL", "Civardaki", "Trendyol", "Hepsiburada", "N11"];

function formatRelativeTime(date) {
  if (!date) return "Henüz güncelleme yok";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} saat önce`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} gün önce`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;

    const [products, lastUpdated] = await Promise.all([
      prisma.product.findMany({
        where: { businessId },
        select: { price: true },
      }),
      prisma.product.findFirst({
        where: { businessId },
        select: { updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const pricedProducts = products.filter((p) => Number.isFinite(Number(p.price)));
    const totalSku = products.length;
    const updatableSku = pricedProducts.length;
    const averagePrice =
      pricedProducts.reduce((sum, item) => sum + Number(item.price || 0), 0) / Math.max(updatableSku, 1);

    return NextResponse.json({
      totalSku,
      updatableSku,
      averagePrice: Number(averagePrice.toFixed(2)),
      lastUpdateAt: lastUpdated?.updatedAt || null,
      lastUpdateText: formatRelativeTime(lastUpdated?.updatedAt),
      estimatedProfitImpact: 0,
      platformOptions: PLATFORM_OPTIONS,
    });
  } catch (error) {
    console.error("Ecommerce price-update summary GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
