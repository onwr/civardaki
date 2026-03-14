import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n;
}

function roundTwo(value) {
  return Number((Math.round(value * 100) / 100).toFixed(2));
}

function calculateNextPrice(current, discountPrice, type, value) {
  const currentPrice = toNumber(current);
  const discount = discountPrice === null || discountPrice === undefined ? null : toNumber(discountPrice);

  if (type === "USE_LOCAL") {
    return roundTwo(discount !== null ? discount : currentPrice);
  }
  if (type === "INCREASE_PERCENT") {
    return roundTwo(currentPrice * (1 + value / 100));
  }
  if (type === "DECREASE_PERCENT") {
    return roundTwo(Math.max(0, currentPrice * (1 - value / 100)));
  }
  if (type === "ADD_FIXED") {
    return roundTwo(Math.max(0, currentPrice + value));
  }
  return currentPrice;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;

    const body = await request.json().catch(() => ({}));
    const platform = String(body.platform || "ALL").trim() || "ALL";
    const updateType = String(body.updateType || "USE_LOCAL").trim().toUpperCase();
    const value = toNumber(body.value || 0);

    if (!["USE_LOCAL", "INCREASE_PERCENT", "DECREASE_PERCENT", "ADD_FIXED"].includes(updateType)) {
      return NextResponse.json({ error: "Geçersiz güncelleme tipi." }, { status: 400 });
    }
    if ((updateType === "INCREASE_PERCENT" || updateType === "DECREASE_PERCENT") && (value < 0 || value > 100)) {
      return NextResponse.json({ error: "Yüzde değerleri 0-100 aralığında olmalı." }, { status: 400 });
    }
    if (updateType === "ADD_FIXED" && value === 0) {
      return NextResponse.json({ error: "Sabit tutar 0 olamaz." }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { businessId },
      select: { id: true, price: true, discountPrice: true },
    });
    if (!products.length) {
      return NextResponse.json({ error: "Güncellenecek ürün bulunamadı." }, { status: 404 });
    }

    let changedCount = 0;
    let oldTotal = 0;
    let newTotal = 0;

    const operations = [];
    for (const product of products) {
      if (product.price === null && product.discountPrice === null) continue;
      const currentPrice = toNumber(product.price || 0);
      const nextPrice = calculateNextPrice(product.price, product.discountPrice, updateType, value);
      oldTotal += currentPrice;
      newTotal += nextPrice;
      if (Math.abs(nextPrice - currentPrice) > 0.0001) changedCount += 1;
      operations.push(
        prisma.product.update({
          where: { id: product.id },
          data: { price: nextPrice },
        })
      );
    }

    if (!operations.length) {
      return NextResponse.json({ error: "Fiyatı olan ürün bulunamadı." }, { status: 404 });
    }

    await prisma.$transaction(operations);

    const diff = roundTwo(newTotal - oldTotal);
    const percentDiff = oldTotal > 0 ? roundTwo((diff / oldTotal) * 100) : 0;

    return NextResponse.json({
      message: `${platform === "ALL" ? "Tüm platformlar" : platform} için fiyat güncellemesi tamamlandı.`,
      platformApplied: platform,
      updateType,
      value,
      processedCount: operations.length,
      changedCount,
      oldTotal: roundTwo(oldTotal),
      newTotal: roundTwo(newTotal),
      deltaAmount: diff,
      deltaPercent: percentDiff,
      simulatedPlatform: platform !== "ALL" && platform !== "Civardaki",
    });
  } catch (error) {
    console.error("Ecommerce price-update POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
