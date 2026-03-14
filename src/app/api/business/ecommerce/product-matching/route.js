import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const DEFAULT_PLATFORMS = ["Trendyol", "Hepsiburada", "N11"];

function normalizePlatform(value) {
  const text = String(value || "").trim();
  if (!text) return "Civardaki";
  return text;
}

function normalizeStatus(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "MATCHED" || raw === "PENDING" || raw === "NOT_LISTED") return raw;
  return "NOT_LISTED";
}

function makePlatformCode(platform) {
  return normalizePlatform(platform)
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 3) || "PLT";
}

async function requireBusinessId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return session.user.businessId;
}

async function buildSummary(businessId) {
  const [totalSku, matchedDistinct, pendingCount, matchedCount] = await Promise.all([
    prisma.product.count({ where: { businessId } }),
    prisma.ecommerce_product_match.findMany({
      where: { businessId, matchStatus: "MATCHED" },
      distinct: ["productId"],
      select: { productId: true },
    }),
    prisma.ecommerce_product_match.count({ where: { businessId, matchStatus: { in: ["PENDING", "NOT_LISTED"] } } }),
    prisma.ecommerce_product_match.count({ where: { businessId, matchStatus: "MATCHED" } }),
  ]);

  const matchedSku = matchedDistinct.length;
  const pendingSku = Math.max(totalSku - matchedSku, 0);
  const coverageRate = Math.round((matchedSku / Math.max(totalSku, 1)) * 100);

  return {
    totalSku,
    matchedSku,
    pendingSku,
    coverageRate,
    pendingCount,
    matchedCount,
  };
}

export async function GET(request) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get("q") || "").trim();
    const platform = String(searchParams.get("platform") || "").trim();
    const status = String(searchParams.get("status") || "").trim().toUpperCase();
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "40", 10)));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * limit;

    const where = { businessId };
    if (platform && platform !== "ALL") where.platform = normalizePlatform(platform);
    if (status && status !== "ALL") where.matchStatus = normalizeStatus(status);
    if (q) {
      where.OR = [
        { platformProductName: { contains: q } },
        { platformProductId: { contains: q } },
        { product: { name: { contains: q } } },
      ];
    }

    const [rows, total, summary] = await Promise.all([
      prisma.ecommerce_product_match.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          productId: true,
          platform: true,
          platformProductId: true,
          platformProductName: true,
          matchStatus: true,
          lastSyncedAt: true,
          updatedAt: true,
          product: { select: { id: true, name: true } },
        },
      }),
      prisma.ecommerce_product_match.count({ where }),
      buildSummary(businessId),
    ]);

    const items = rows.map((m) => ({
      id: m.id,
      localProductId: m.productId,
      localProductName: m.product?.name || "Ürün",
      platform: m.platform,
      platformProductId: m.platformProductId,
      platformProductName: m.platformProductName,
      matchStatus: m.matchStatus,
      lastSynced: m.lastSyncedAt,
      updatedAt: m.updatedAt,
    }));

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    });
  } catch (error) {
    console.error("Ecommerce product-matching GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "").trim().toUpperCase();

    if (action === "AUTO_MATCH") {
      const products = await prisma.product.findMany({
        where: { businessId, isActive: true },
        select: { id: true, name: true },
      });
      if (!products.length) {
        return NextResponse.json({ error: "Eşleştirilecek aktif ürün bulunamadı." }, { status: 404 });
      }

      const inputPlatforms = Array.isArray(body.platforms)
        ? body.platforms.map((x) => normalizePlatform(x)).filter(Boolean)
        : DEFAULT_PLATFORMS;
      const platforms = [...new Set(inputPlatforms.length ? inputPlatforms : DEFAULT_PLATFORMS)];

      const now = new Date();
      const operations = [];
      for (const product of products) {
        for (const platform of platforms) {
          const code = makePlatformCode(platform);
          const platformProductId = `${code}-${product.id.slice(-8).toUpperCase()}`;
          operations.push(
            prisma.ecommerce_product_match.upsert({
              where: {
                businessId_productId_platform: {
                  businessId,
                  productId: product.id,
                  platform,
                },
              },
              update: {
                platformProductId,
                platformProductName: product.name,
                matchStatus: "MATCHED",
                lastSyncedAt: now,
              },
              create: {
                businessId,
                productId: product.id,
                platform,
                platformProductId,
                platformProductName: product.name,
                matchStatus: "MATCHED",
                lastSyncedAt: now,
              },
            })
          );
        }
      }

      await prisma.$transaction(operations);
      return NextResponse.json({
        message: "Otomatik eşleştirme tamamlandı.",
        affectedCount: operations.length,
      });
    }

    const localProductId = String(body.localProductId || "").trim();
    const platform = normalizePlatform(body.platform);
    const platformProductId = String(body.platformProductId || "").trim() || null;
    const platformProductName = String(body.platformProductName || "").trim() || null;
    const matchStatus = normalizeStatus(body.matchStatus);
    const notes = String(body.notes || "").trim() || null;

    if (!localProductId) {
      return NextResponse.json({ error: "Yerel ürün seçimi zorunludur." }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: localProductId, businessId },
      select: { id: true, name: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }

    const now = new Date();
    const created = await prisma.ecommerce_product_match.upsert({
      where: {
        businessId_productId_platform: {
          businessId,
          productId: product.id,
          platform,
        },
      },
      update: {
        platformProductId,
        platformProductName: platformProductName || product.name,
        matchStatus,
        notes,
        lastSyncedAt: matchStatus === "MATCHED" ? now : null,
      },
      create: {
        businessId,
        productId: product.id,
        platform,
        platformProductId,
        platformProductName: platformProductName || product.name,
        matchStatus,
        notes,
        lastSyncedAt: matchStatus === "MATCHED" ? now : null,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id, message: "Eşleştirme kaydedildi." }, { status: 201 });
  } catch (error) {
    console.error("Ecommerce product-matching POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
