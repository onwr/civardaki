import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 30;

function toStr(v) {
  return (v ?? "").toString().trim();
}

function toNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function clampInt(v, min, max, fallback) {
  const n = parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = toStr(searchParams.get("q"));
    const categoryId = toStr(searchParams.get("categoryId"));
    const sort = toStr(searchParams.get("sort")) || "updatedDesc";
    const inStockOnly = searchParams.get("inStockOnly") === "1";
    const min = toNum(searchParams.get("min"));
    const max = toNum(searchParams.get("max"));

    const page = clampInt(searchParams.get("page"), 1, 9999, 1);
    const pageSize = clampInt(searchParams.get("pageSize"), 6, 48, 24);
    const skip = (page - 1) * pageSize;

    const priceWhere = {
      ...(min !== null ? { price: { gte: min } } : {}),
      ...(max !== null ? { price: { ...(min !== null ? { gte: min } : {}), lte: max } } : {}),
    };

    const where = {
      publishedOnMarketplace: true,
      isActive: true,
      ...(categoryId === "null"
        ? { categoryId: null }
        : categoryId
          ? { categoryId }
          : {}),
      ...(inStockOnly ? { stock: { gt: 0 } } : {}),
      ...(min !== null || max !== null ? priceWhere : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { brand: { contains: q } },
              { tagsString: { contains: q } },
            ],
          }
        : {}),
    };

    const orderBy =
      sort === "priceAsc"
        ? [{ price: "asc" }, { updatedAt: "desc" }]
        : sort === "priceDesc"
          ? [{ price: "desc" }, { updatedAt: "desc" }]
          : sort === "nameAsc"
            ? [{ name: "asc" }]
            : sort === "newest"
              ? [{ createdAt: "desc" }]
              : [{ updatedAt: "desc" }];

    const [items, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          price: true,
          discountPrice: true,
          priceCurrency: true,
          imageUrl: true,
          stock: true,
          categoryId: true,
          business: { select: { id: true, name: true, slug: true } },
          productcategory: { select: { id: true, name: true } },
          updatedAt: true,
          createdAt: true,
        },
      }),
      prisma.product.count({ where }),
      prisma.productcategory.findMany({
        where: {
          product: { some: { publishedOnMarketplace: true, isActive: true } },
        },
        orderBy: { order: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    return NextResponse.json(
      {
        items: items.map((p) => ({
          ...p,
          category: p.productcategory || null,
        })),
        categories,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("[marketplace/products] error:", e);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}

