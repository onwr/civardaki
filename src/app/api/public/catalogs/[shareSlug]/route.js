import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

function baseUnitPrice(product) {
  const variants = product.productvariant || [];
  if (variants.length) {
    let min = Infinity;
    for (const v of variants) {
      const d =
        v.discountPrice != null && Number.isFinite(Number(v.discountPrice))
          ? Number(v.discountPrice)
          : null;
      const p = v.price != null && Number.isFinite(Number(v.price)) ? Number(v.price) : null;
      const base = d ?? p;
      if (base != null && base < min) min = base;
    }
    if (min !== Infinity) return min;
  }
  const d =
    product.discountPrice != null && Number.isFinite(Number(product.discountPrice))
      ? Number(product.discountPrice)
      : null;
  const p = product.price != null && Number.isFinite(Number(product.price)) ? Number(product.price) : 0;
  return d ?? p;
}

function listUnitPrice(base, discountRate) {
  const r = Number(discountRate) || 0;
  return base * (1 - Math.min(100, Math.max(0, r)) / 100);
}

function productInStock(product) {
  const variants = product.productvariant || [];
  if (variants.length) {
    return variants.some((v) => (v.stock ?? 0) > 0);
  }
  return (product.stock ?? 0) > 0;
}

function totalStockQty(product) {
  const variants = product.productvariant || [];
  if (variants.length) {
    return variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
  }
  return Number(product.stock) || 0;
}

function effectiveSortOrder(catalog) {
  const so = catalog.sortOrder;
  if (catalog.priceDisplay === "HIDE" && (so === "PRICE_ASC" || so === "PRICE_DESC")) {
    return "BY_NAME";
  }
  return so;
}

export async function GET(req, { params }) {
  try {
    const resolved = typeof params?.then === "function" ? await params : params;
    const shareSlug = resolved?.shareSlug;
    if (!shareSlug) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    const catalog = await prisma.catalog.findFirst({
      where: { shareSlug, isPublished: true },
      include: {
        business: { select: { id: true, name: true, slug: true } },
        priceList: { select: { id: true, discountRate: true } },
        items: {
          orderBy: { order: "asc" },
          include: {
            product: {
              include: {
                productvariant: { orderBy: { order: "asc" } },
                productcategory: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!catalog || !catalog.business) {
      return NextResponse.json({ message: "Katalog bulunamadı." }, { status: 404 });
    }

    const discountRate = catalog.priceList?.discountRate ?? 0;
    const inListIds = new Set();
    if (catalog.priceListId) {
      const plItems = await prisma.pricelistitem.findMany({
        where: { pricelistId: catalog.priceListId },
        select: { productId: true },
      });
      plItems.forEach((r) => inListIds.add(r.productId));
    }

    const rows = catalog.items
      .map((it) => it.product)
      .filter((p) => p && p.isActive);

    const filtered = catalog.stockFilter === "IN_STOCK_ONLY" ? rows.filter(productInStock) : rows;

    const priced = filtered.map((product) => {
      const base = baseUnitPrice(product);
      const onList = !catalog.priceListId || inListIds.has(product.id);
      const listPrice = listUnitPrice(base, discountRate);
      const displayUnit =
        catalog.priceDisplay === "HIDE" ? null : onList ? listPrice : base;
      const sortPrice = onList ? listPrice : base;

      const out = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        imageUrl: product.imageUrl,
        categoryName: product.productcategory?.name ?? null,
      };

      if (catalog.priceDisplay !== "HIDE" && displayUnit != null) {
        out.unitPrice = Math.round(displayUnit * 100) / 100;
      }
      if (catalog.brandDisplay === "SHOW" && product.brand) {
        out.brand = product.brand;
      }
      if (catalog.stockQtyDisplay === "SHOW") {
        out.stockQty = totalStockQty(product);
      }

      return { out, sortPrice, name: product.name, slug: product.slug, categoryName: out.categoryName };
    });

    const sortKey = effectiveSortOrder(catalog);

    if (sortKey === "BY_NAME") {
      priced.sort((a, b) => a.name.localeCompare(b.name, "tr", { sensitivity: "base" }));
    } else if (sortKey === "BY_SLUG") {
      priced.sort((a, b) => a.slug.localeCompare(b.slug, "tr", { sensitivity: "base" }));
    } else if (sortKey === "BY_CATEGORY") {
      priced.sort((a, b) => {
        const c = (a.categoryName || "").localeCompare(b.categoryName || "", "tr", {
          sensitivity: "base",
        });
        if (c !== 0) return c;
        return a.name.localeCompare(b.name, "tr", { sensitivity: "base" });
      });
    } else if (sortKey === "PRICE_ASC") {
      priced.sort((a, b) => (a.sortPrice ?? 0) - (b.sortPrice ?? 0));
    } else if (sortKey === "PRICE_DESC") {
      priced.sort((a, b) => (b.sortPrice ?? 0) - (a.sortPrice ?? 0));
    }
    /* BY_CATALOG_ORDER: filtered sırası catalog.items ile aynı (map sırası korunur) */

    const products = priced.map((p) => p.out);

    return NextResponse.json(
      {
        catalog: {
          name: catalog.name,
          description: catalog.description,
          priceDisplay: catalog.priceDisplay,
          brandDisplay: catalog.brandDisplay,
          stockQtyDisplay: catalog.stockQtyDisplay,
          stockFilter: catalog.stockFilter,
          sortOrder: catalog.sortOrder,
        },
        business: {
          name: catalog.business.name,
          slug: catalog.business.slug,
        },
        products,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("PUBLIC CATALOG API:", e);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
