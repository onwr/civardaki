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
  if (session.user.role !== "BUSINESS") return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
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
  const disp = out.priceDisplay;
  if (disp === "HIDE" && out.sortOrder) {
    out.sortOrder = normalizeSortForPriceDisplay(out.sortOrder, "HIDE");
  }
  return { ok: out };
}

function mapCatalogRow(c) {
  const pub = publicCatalogUrl(c.shareSlug);
  return {
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
    productCount: c._count.items,
  };
}

/** GET - list catalogs for business */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const catalogs = await prisma.catalog.findMany({
    where: { businessId: auth.businessId },
    include: {
      _count: { select: { items: true } },
      priceList: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const missingSlug = catalogs.filter((c) => !c.shareSlug);
  if (missingSlug.length) {
    for (const row of missingSlug) {
      const slug = await createUniqueShareSlug();
      await prisma.catalog.update({
        where: { id: row.id },
        data: { shareSlug: slug, shareUrl: publicCatalogUrl(slug) },
      });
      row.shareSlug = slug;
    }
  }

  const refreshed =
    missingSlug.length > 0
      ? await prisma.catalog.findMany({
          where: { businessId: auth.businessId },
          include: {
            _count: { select: { items: true } },
            priceList: { select: { id: true, name: true } },
          },
          orderBy: { updatedAt: "desc" },
        })
      : catalogs;

  return NextResponse.json(refreshed.map(mapCatalogRow));
}

/** POST - create catalog (ürünler isteğe bağlı) */
export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json();
  const name = toStr(body?.name);
  const description = toStr(body?.description) || null;
  const productIds = Array.isArray(body?.productIds) ? body.productIds.filter((id) => typeof id === "string" && id) : [];
  const priceListIdRaw = body?.priceListId !== undefined && body?.priceListId !== null && body?.priceListId !== ""
    ? toStr(body.priceListId)
    : null;

  const enums = parseCatalogEnums(body);
  if (enums.err) return NextResponse.json({ message: enums.err }, { status: 400 });

  if (!name || name.length < 2) return NextResponse.json({ message: "Katalog adı en az 2 karakter olmalı." }, { status: 400 });

  const createDisplay = enums.ok.priceDisplay ?? "SHOW_SALES";
  const listIdEffective = createDisplay === "HIDE" ? null : priceListIdRaw || null;

  if (listIdEffective) {
    const pl = await prisma.pricelist.findFirst({
      where: { id: listIdEffective, businessId: auth.businessId },
      select: { id: true },
    });
    if (!pl) return NextResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 400 });
  }

  const businessProducts = await prisma.product.findMany({
    where: { businessId: auth.businessId, id: { in: productIds } },
    select: { id: true },
  });
  const validProductIds = businessProducts.map((p) => p.id);

  const shareSlug = await createUniqueShareSlug();
  const pub = publicCatalogUrl(shareSlug);

  const catalog = await prisma.catalog.create({
    data: {
      businessId: auth.businessId,
      name,
      description,
      shareSlug,
      shareUrl: pub,
      priceListId: listIdEffective,
      ...enums.ok,
      items: {
        create: validProductIds.map((productId, index) => ({ productId, order: index })),
      },
    },
    include: {
      _count: { select: { items: true } },
      priceList: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(mapCatalogRow(catalog), { status: 201 });
}
