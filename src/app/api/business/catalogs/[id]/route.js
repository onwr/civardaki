import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUniqueShareSlug, publicCatalogUrl } from "@/lib/catalog-share";

function toStr(v) {
  return (v ?? "").toString().trim();
}

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

const PRICE_DISPLAY = new Set(["SHOW_SALES", "HIDE"]);
const BRAND_DISPLAY = new Set(["SHOW", "HIDE"]);
const STOCK_QTY_DISPLAY = new Set(["SHOW", "HIDE"]);
const STOCK_FILTER = new Set(["ALL", "IN_STOCK_ONLY"]);
const SORT_ORDER = new Set([
  "BY_NAME",
  "BY_CATALOG_ORDER",
  "BY_SLUG",
  "BY_CATEGORY",
  "PRICE_ASC",
  "PRICE_DESC",
]);

function normalizeSortForPriceDisplay(sortOrder, priceDisplay) {
  if (priceDisplay === "HIDE" && (sortOrder === "PRICE_ASC" || sortOrder === "PRICE_DESC")) {
    return "BY_NAME";
  }
  return sortOrder;
}

function parseCatalogEnums(body) {
  const out = {};
  if (body?.priceDisplay !== undefined) {
    const v = String(body.priceDisplay).trim();
    if (!PRICE_DISPLAY.has(v)) return { err: "Geçersiz priceDisplay." };
    out.priceDisplay = v;
  }
  if (body?.brandDisplay !== undefined) {
    const v = String(body.brandDisplay).trim();
    if (!BRAND_DISPLAY.has(v)) return { err: "Geçersiz brandDisplay." };
    out.brandDisplay = v;
  }
  if (body?.stockQtyDisplay !== undefined) {
    const v = String(body.stockQtyDisplay).trim();
    if (!STOCK_QTY_DISPLAY.has(v)) return { err: "Geçersiz stockQtyDisplay." };
    out.stockQtyDisplay = v;
  }
  if (body?.stockFilter !== undefined) {
    const v = String(body.stockFilter).trim();
    if (!STOCK_FILTER.has(v)) return { err: "Geçersiz stockFilter." };
    out.stockFilter = v;
  }
  if (body?.sortOrder !== undefined) {
    const v = String(body.sortOrder).trim();
    if (!SORT_ORDER.has(v)) return { err: "Geçersiz sortOrder." };
    out.sortOrder = v;
  }
  if (out.priceDisplay === "HIDE" && out.sortOrder) {
    out.sortOrder = normalizeSortForPriceDisplay(out.sortOrder, "HIDE");
  }
  return { ok: out };
}

function mapCatalogRow(c, productIds = null) {
  const pub = publicCatalogUrl(c.shareSlug);
  const base = {
    id: c.id,
    name: c.name,
    description: c.description,
    isPublished: c.isPublished,
    pdfUrl: c.pdfUrl,
    shareSlug: c.shareSlug,
    publicCatalogUrl: pub,
    shareUrl: pub || c.shareUrl,
    priceListId: c.priceListId,
    priceListName: c.priceList?.name ?? null,
    priceDisplay: c.priceDisplay,
    brandDisplay: c.brandDisplay,
    stockQtyDisplay: c.stockQtyDisplay,
    stockFilter: c.stockFilter,
    sortOrder: c.sortOrder,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    productCount: c._count?.items ?? c.productCount,
  };
  if (productIds !== null) base.productIds = productIds;
  return base;
}

async function getCatalogAndCheck(id, businessId) {
  return prisma.catalog.findFirst({
    where: { id, businessId },
    include: { items: { select: { productId: true, order: true } }, _count: { select: { items: true } } },
  });
}

async function appendProductsToCatalog(catalogId, businessId, candidateIds) {
  if (!candidateIds.length) return;
  const businessProducts = await prisma.product.findMany({
    where: { businessId, id: { in: candidateIds } },
    select: { id: true },
  });
  const existing = await prisma.catalogitem.findMany({
    where: { catalogId },
    select: { productId: true, order: true },
  });
  const have = new Set(existing.map((e) => e.productId));
  const maxOrder = existing.reduce((m, e) => Math.max(m, e.order), -1);
  const newIds = businessProducts.map((p) => p.id).filter((pid) => !have.has(pid));
  if (!newIds.length) return;
  await prisma.catalogitem.createMany({
    data: newIds.map((productId, index) => ({
      catalogId,
      productId,
      order: maxOrder + 1 + index,
    })),
  });
}

/** GET - single catalog with productIds */
export async function GET(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  let catalog = await prisma.catalog.findFirst({
    where: { id, businessId: auth.businessId },
    include: {
      items: { select: { productId: true, order: true } },
      _count: { select: { items: true } },
      priceList: { select: { id: true, name: true } },
    },
  });
  if (!catalog) return NextResponse.json({ message: "Katalog bulunamadı." }, { status: 404 });

  if (!catalog.shareSlug) {
    const slug = await createUniqueShareSlug();
    const pub = publicCatalogUrl(slug);
    await prisma.catalog.update({
      where: { id: catalog.id },
      data: { shareSlug: slug, shareUrl: pub },
    });
    catalog = await prisma.catalog.findFirst({
      where: { id, businessId: auth.businessId },
      include: {
        items: { select: { productId: true, order: true } },
        _count: { select: { items: true } },
        priceList: { select: { id: true, name: true } },
      },
    });
  }

  const productIds = catalog.items.sort((a, b) => a.order - b.order).map((i) => i.productId);

  return NextResponse.json(mapCatalogRow(catalog, productIds));
}

/** PATCH - update catalog */
export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getCatalogAndCheck(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Katalog bulunamadı." }, { status: 404 });

  const body = await req.json();
  const name = body?.name !== undefined ? toStr(body.name) : undefined;
  const description = body?.description !== undefined ? (toStr(body.description) || null) : undefined;
  const isPublished = typeof body?.isPublished === "boolean" ? body.isPublished : undefined;
  const productIds = Array.isArray(body?.productIds) ? body.productIds.filter((pid) => typeof pid === "string" && pid) : undefined;
  const addProductIds = Array.isArray(body?.addProductIds)
    ? [...new Set(body.addProductIds.filter((pid) => typeof pid === "string" && pid))]
    : undefined;
  const removeProductIds = Array.isArray(body?.removeProductIds)
    ? [...new Set(body.removeProductIds.filter((pid) => typeof pid === "string" && pid))]
    : undefined;
  const addByCategoryId = body?.addByCategoryId !== undefined ? toStr(body.addByCategoryId) : undefined;
  const addByBrand = body?.addByBrand !== undefined ? toStr(body.addByBrand) : undefined;

  const priceListIdIn = body?.priceListId;
  let priceListId;
  if (priceListIdIn === null || priceListIdIn === "") {
    priceListId = null;
  } else if (priceListIdIn !== undefined) {
    priceListId = toStr(priceListIdIn) || null;
  } else {
    priceListId = undefined;
  }

  const enums = parseCatalogEnums(body);
  if (enums.err) return NextResponse.json({ message: enums.err }, { status: 400 });

  if (name !== undefined && name.length < 2) {
    return NextResponse.json({ message: "Katalog adı en az 2 karakter olmalı." }, { status: 400 });
  }

  if (priceListId) {
    const pl = await prisma.pricelist.findFirst({
      where: { id: priceListId, businessId: auth.businessId },
      select: { id: true },
    });
    if (!pl) return NextResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 400 });
  }

  const updateData = { ...enums.ok };
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (isPublished !== undefined) updateData.isPublished = isPublished;
  if (priceListId !== undefined) updateData.priceListId = priceListId;

  const mergedDisplay =
    updateData.priceDisplay !== undefined ? updateData.priceDisplay : existing.priceDisplay;
  if (mergedDisplay === "HIDE") {
    updateData.priceListId = null;
    const sortSrc = updateData.sortOrder !== undefined ? updateData.sortOrder : existing.sortOrder;
    updateData.sortOrder = normalizeSortForPriceDisplay(sortSrc, "HIDE");
  }

  let shareSlug = existing.shareSlug;
  if (!shareSlug) {
    shareSlug = await createUniqueShareSlug();
    updateData.shareSlug = shareSlug;
  }
  const effectiveSlug = updateData.shareSlug ?? existing.shareSlug ?? shareSlug;
  if (effectiveSlug && (isPublished === true || existing.isPublished)) {
    updateData.shareUrl = publicCatalogUrl(effectiveSlug);
  }

  if (productIds !== undefined) {
    const businessProducts = await prisma.product.findMany({
      where: { businessId: auth.businessId, id: { in: productIds } },
      select: { id: true },
    });
    const validIds = businessProducts.map((p) => p.id);
    await prisma.catalogitem.deleteMany({ where: { catalogId: id } });
    await prisma.catalogitem.createMany({
      data: validIds.map((productId, index) => ({ catalogId: id, productId, order: index })),
    });
  } else {
    if (removeProductIds?.length) {
      const ok = await prisma.product.findMany({
        where: { businessId: auth.businessId, id: { in: removeProductIds } },
        select: { id: true },
      });
      const ids = ok.map((p) => p.id);
      if (ids.length) {
        await prisma.catalogitem.deleteMany({
          where: { catalogId: id, productId: { in: ids } },
        });
      }
    }
    if (addProductIds?.length) {
      await appendProductsToCatalog(id, auth.businessId, addProductIds);
    }

    const hasCatFilter = Boolean(addByCategoryId);
    const hasBrandFilter = Boolean(addByBrand);
    if (hasCatFilter || hasBrandFilter) {
      const where = { businessId: auth.businessId };
      if (hasCatFilter) {
        const cat = await prisma.productcategory.findFirst({
          where: { id: addByCategoryId, businessId: auth.businessId },
          select: { id: true },
        });
        if (!cat) {
          return NextResponse.json({ message: "Kategori bulunamadı." }, { status: 400 });
        }
        where.categoryId = cat.id;
      }
      if (hasBrandFilter) {
        where.brand = addByBrand;
      }
      const prods = await prisma.product.findMany({
        where,
        select: { id: true },
      });
      await appendProductsToCatalog(
        id,
        auth.businessId,
        prods.map((p) => p.id)
      );
    }
  }

  const hasScalar = Object.keys(updateData).length > 0;
  if (hasScalar) {
    await prisma.catalog.update({
      where: { id },
      data: updateData,
    });
  }

  const updated = await prisma.catalog.findFirst({
    where: { id },
    include: {
      _count: { select: { items: true } },
      priceList: { select: { id: true, name: true } },
      items: { select: { productId: true, order: true } },
    },
  });

  const sortedIds = updated.items.sort((a, b) => a.order - b.order).map((i) => i.productId);
  return NextResponse.json(mapCatalogRow(updated, sortedIds));
}

/** DELETE - delete catalog */
export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const catalogId = resolved?.id;
  if (!catalogId) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getCatalogAndCheck(catalogId, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Katalog bulunamadı." }, { status: 404 });

  await prisma.catalog.delete({ where: { id: catalogId } });
  return NextResponse.json({ message: "Silindi" });
}
