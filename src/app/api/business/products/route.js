import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugifyTR } from "@/lib/formatters";
import { PRODUCT_COUNTRY_OPTIONS } from "@/lib/product-country-codes";

const COUNTRY_IDS = new Set(PRODUCT_COUNTRY_OPTIONS.map((o) => o.value));

function toStr(v) { return (v ?? "").toString().trim(); }
function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

const STOCK_TRACKING = new Set(["NORMAL", "NONE", "BATCH", "SERIAL"]);
function parseStockTracking(v) {
    const s = toStr(v);
    return STOCK_TRACKING.has(s) ? s : "NORMAL";
}

const SERIAL_INVOICE_MODES = new Set(["HIDE", "SHOW", "OPTIONAL"]);
function parseSerialInvoiceMode(v) {
    const s = toStr(v);
    if (!s) return null;
    return SERIAL_INVOICE_MODES.has(s) ? s : null;
}

function parseCountryCode(v) {
    const s = toStr(v).slice(0, 8);
    if (!s) return null;
    return COUNTRY_IDS.has(s) ? s : null;
}

async function requireBusiness() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
    if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
    const businessId = session.user.businessId;
    if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
    return { businessId };
}

export async function GET(req) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const { searchParams } = new URL(req.url);
    const q = toStr(searchParams.get("q"));
    const categoryId = toStr(searchParams.get("categoryId"));
    const brand = toStr(searchParams.get("brand"));
    const warehouseId = toStr(searchParams.get("warehouseId"));
    const stockFilter = toStr(searchParams.get("stockFilter"));
    const status = toStr(searchParams.get("status")) || "active";
    const sort = toStr(searchParams.get("sort")) || "order";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const bulkMode = searchParams.get("bulk") === "1";
    const maxLimit = bulkMode ? 500 : 50;
    const limit = Math.min(maxLimit, Math.max(5, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const statusWhere =
        status === "all"
            ? {}
            : status === "inactive"
              ? { isActive: false }
              : { isActive: true };

    const stockWhere =
        stockFilter === "positive"
            ? { stock: { gt: 0 } }
            : stockFilter === "zero"
              ? { stock: 0 }
              : stockFilter === "negative"
                ? { stock: { lt: 0 } }
                : stockFilter === "unset"
                  ? { stock: null }
                  : {};

    const where = {
        businessId: auth.businessId,
        ...statusWhere,
        ...(categoryId === "null" ? { categoryId: null } : categoryId ? { categoryId } : {}),
        ...(brand ? { brand } : {}),
        ...(warehouseId
            ? { warehouseProductStocks: { some: { warehouseId } } }
            : {}),
        ...stockWhere,
        ...(q
            ? {
                  OR: [
                      { name: { contains: q } },
                      { description: { contains: q } },
                      { barcode: { contains: q } },
                      { productCode: { contains: q } },
                  ],
              }
            : {}),
    };

    const orderBy =
        sort === "newest" ? [{ createdAt: "desc" }] :
            sort === "priceAsc" ? [{ price: "asc" }] :
                sort === "priceDesc" ? [{ price: "desc" }] :
                    sort === "stockAsc" ? [{ stock: "asc" }] :
                        sort === "stockDesc" ? [{ stock: "desc" }] :
                            [{ order: "asc" }, { createdAt: "desc" }];

    const [rawItems, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            select: {
                id: true, name: true, slug: true, brand: true, description: true, price: true, discountPrice: true,
                priceCurrency: true, salesUnit: true, tagsString: true,
                imageUrl: true, isActive: true, order: true, categoryId: true, stock: true, maxOrderQty: true,
                barcode: true,
                productCode: true, gtip: true, gtin: true, countryCode: true, shelfLocation: true, stockTracking: true,
                serialInvoiceMode: true,
                imageGallery: true,
                publishedOnMarketplace: true,
                createdAt: true,
                productcategory: { select: { id: true, name: true } },
                productvariant: { select: { id: true, name: true, sku: true, price: true, discountPrice: true, stock: true, maxOrderQty: true, order: true } }
            }
        }),
        prisma.product.count({ where })
    ]);

    const items = rawItems.map(({ productcategory, productvariant, ...rest }) => ({
        ...rest,
        category: productcategory,
        variants: (productvariant || []).sort((a, b) => a.order - b.order)
    }));

    return NextResponse.json({
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
}

export async function POST(req) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const body = await req.json();
    const name = toStr(body?.name);
    const description = toStr(body?.description) || null;
    const price = body?.price === null || body?.price === undefined || body?.price === "" ? null : toNum(body.price);
    const discountPrice = body?.discountPrice === null || body?.discountPrice === undefined || body?.discountPrice === "" ? null : toNum(body.discountPrice);
    const imageUrl = toStr(body?.imageUrl) || null;
    const categoryId = toStr(body?.categoryId) || null;
    const brand = toStr(body?.brand) || null;
    const order = Number.isFinite(body?.order) ? Number(body.order) : 0;
    const stock = body?.stock !== undefined && body?.stock !== null && body?.stock !== "" ? Math.max(0, parseInt(String(body.stock), 10)) : null;
    const maxOrderQty = body?.maxOrderQty !== undefined && body?.maxOrderQty !== null && body?.maxOrderQty !== "" ? Math.max(1, parseInt(String(body.maxOrderQty), 10)) : null;
    const publishedOnMarketplace = typeof body?.publishedOnMarketplace === "boolean" ? body.publishedOnMarketplace : false;
    const barcode = body?.barcode !== undefined && body?.barcode !== null && String(body.barcode).trim() !== ""
        ? toStr(body.barcode).slice(0, 32)
        : null;
    const productCode = toStr(body?.productCode).slice(0, 64) || null;
    const gtip = toStr(body?.gtip).slice(0, 32) || null;
    const gtin = toStr(body?.gtin).slice(0, 32) || null;
    const shelfLocation = toStr(body?.shelfLocation).slice(0, 128) || null;
    const stockTracking = parseStockTracking(body?.stockTracking);
    const countryCode = parseCountryCode(body?.countryCode);
    const serialInvoiceMode =
        stockTracking === "SERIAL"
            ? parseSerialInvoiceMode(body?.serialInvoiceMode) ?? "OPTIONAL"
            : null;

    let imageGallery = null;
    if (Array.isArray(body?.imageGallery)) {
        const g = body.imageGallery
            .filter((x) => typeof x === "string")
            .slice(0, 5);
        imageGallery = g.length ? g : null;
    }

    const salesUnit = toStr(body?.salesUnit).slice(0, 32) || null;
    const tagsString = toStr(body?.tagsString) || null;
    const pc = toStr(body?.priceCurrency).toUpperCase();
    const priceCurrency =
        !pc || pc === "TL" || pc === "TRY" ? "TL" : pc === "USD" ? "USD" : pc === "EUR" ? "EUR" : "TL";

    if (!name || name.length < 2) return NextResponse.json({ message: "Ürün adı en az 2 karakter olmalı." }, { status: 400 });
    if (price !== null && price < 0) return NextResponse.json({ message: "Fiyat geçersiz." }, { status: 400 });
    if (discountPrice !== null && price !== null && (discountPrice < 0 || discountPrice > price)) {
        return NextResponse.json({ message: "İndirimli fiyat, fiyattan büyük olamaz." }, { status: 400 });
    }

    if (categoryId) {
        const cat = await prisma.productcategory.findFirst({
            where: { id: categoryId, businessId: auth.businessId },
            select: { id: true }
        });
        if (!cat) return NextResponse.json({ message: "Kategori bulunamadı." }, { status: 404 });
    }

    const baseSlug = slugifyTR(name) || "urun";
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
        const created = await prisma.product.create({
            data: {
                businessId: auth.businessId,
                categoryId,
                brand,
                name,
                slug,
                description,
                price,
                discountPrice,
                priceCurrency,
                salesUnit,
                tagsString,
                imageUrl,
                imageGallery,
                order,
                stock,
                maxOrderQty,
                barcode,
                productCode,
                gtip,
                gtin,
                countryCode,
                shelfLocation,
                stockTracking,
                serialInvoiceMode,
                isActive: true,
                publishedOnMarketplace,
            },
            select: { id: true, slug: true }
        });

        return NextResponse.json({ id: created.id, slug: created.slug }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Kayıt sırasında hata oluştu." }, { status: 500 });
    }
}
