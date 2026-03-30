import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { PRODUCT_COUNTRY_OPTIONS } from "@/lib/product-country-codes";

const COUNTRY_IDS = new Set(PRODUCT_COUNTRY_OPTIONS.map((o) => o.value));

function toStr(v) { return (v ?? "").toString().trim(); }
function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

const STOCK_TRACKING = new Set(["NORMAL", "NONE", "BATCH", "SERIAL"]);
function parseStockTracking(v) {
    const s = (v ?? "").toString().trim();
    return STOCK_TRACKING.has(s) ? s : "NORMAL";
}

const SERIAL_INVOICE_MODES = new Set(["HIDE", "SHOW", "OPTIONAL"]);
function parseSerialInvoiceMode(v) {
    const s = (v ?? "").toString().trim();
    if (!s) return null;
    return SERIAL_INVOICE_MODES.has(s) ? s : null;
}

function parseCountryCode(v) {
    const s = (v ?? "").toString().trim().slice(0, 8);
    if (!s) return null;
    return COUNTRY_IDS.has(s) ? s : null;
}

async function requireBusiness() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
    if (session.user.role !== "BUSINESS") return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
    const businessId = session.user.businessId;
    if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
    return { businessId };
}

export async function PATCH(req, { params }) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const resolved = await params;
    const id = resolved?.id;
    if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    const body = await req.json();
    const name = body?.name !== undefined ? toStr(body.name) : undefined;
    const description = body?.description !== undefined ? (toStr(body.description) || null) : undefined;

    let price = undefined;
    if (body?.price !== undefined) {
        price = body.price === null || body.price === "" ? null : toNum(body.price);
    }

    let discountPrice = undefined;
    if (body?.discountPrice !== undefined) {
        discountPrice = body.discountPrice === null || body.discountPrice === "" ? null : toNum(body.discountPrice);
    }

    const imageUrl = body?.imageUrl !== undefined ? (toStr(body.imageUrl) || null) : undefined;
    const categoryId = body?.categoryId !== undefined ? (toStr(body.categoryId) || null) : undefined;
    const brand = body?.brand !== undefined ? (toStr(body.brand) || null) : undefined;
    const order = Number.isFinite(body?.order) ? Number(body.order) : undefined;
    const isActive = typeof body?.isActive === "boolean" ? body.isActive : undefined;
    let stock = undefined;
    if (body?.stock !== undefined) {
        if (body.stock === null || body.stock === "") stock = null;
        else {
            const n = parseInt(String(body.stock), 10);
            if (!Number.isFinite(n)) {
                return NextResponse.json({ message: "Stok geçersiz." }, { status: 400 });
            }
            stock = n;
        }
    }
    const maxOrderQty = body?.maxOrderQty !== undefined ? (body.maxOrderQty === null || body.maxOrderQty === "" ? null : Math.max(1, parseInt(String(body.maxOrderQty), 10))) : undefined;
    const publishedOnMarketplace = typeof body?.publishedOnMarketplace === "boolean" ? body.publishedOnMarketplace : undefined;

    let barcode = undefined;
    if (body?.barcode !== undefined) {
        barcode = body.barcode === null || body.barcode === "" ? null : toStr(body.barcode).slice(0, 32);
    }

    let productCode = undefined;
    if (body?.productCode !== undefined) {
        productCode = body.productCode === null || body.productCode === "" ? null : toStr(body.productCode).slice(0, 64);
    }
    let gtip = undefined;
    if (body?.gtip !== undefined) {
        gtip = body.gtip === null || body.gtip === "" ? null : toStr(body.gtip).slice(0, 32);
    }
    let gtin = undefined;
    if (body?.gtin !== undefined) {
        gtin = body.gtin === null || body.gtin === "" ? null : toStr(body.gtin).slice(0, 32);
    }
    let shelfLocation = undefined;
    if (body?.shelfLocation !== undefined) {
        shelfLocation = body.shelfLocation === null || body.shelfLocation === "" ? null : toStr(body.shelfLocation).slice(0, 128);
    }
    let stockTracking = undefined;
    if (body?.stockTracking !== undefined) {
        stockTracking = parseStockTracking(body.stockTracking);
    }

    let countryCode = undefined;
    if (body?.countryCode !== undefined) {
        countryCode = body.countryCode === null || body.countryCode === ""
            ? null
            : parseCountryCode(body.countryCode);
    }

    let serialInvoiceMode = undefined;
    if (body?.serialInvoiceMode !== undefined) {
        serialInvoiceMode =
            body.serialInvoiceMode === null || body.serialInvoiceMode === ""
                ? null
                : parseSerialInvoiceMode(body.serialInvoiceMode);
    }

    let imageGallery = undefined;
    if (body?.imageGallery !== undefined) {
        if (body.imageGallery === null) {
            imageGallery = null;
        } else if (Array.isArray(body.imageGallery)) {
            const g = body.imageGallery
                .filter((x) => typeof x === "string")
                .slice(0, 5);
            imageGallery = g.length ? g : null;
        }
    }

    let salesUnit = undefined;
    if (body?.salesUnit !== undefined) {
        salesUnit =
            body.salesUnit === null || body.salesUnit === ""
                ? null
                : toStr(body.salesUnit).slice(0, 32);
    }
    let tagsString = undefined;
    if (body?.tagsString !== undefined) {
        tagsString =
            body.tagsString === null || body.tagsString === ""
                ? null
                : toStr(body.tagsString).slice(0, 8000);
    }
    let priceCurrency = undefined;
    if (body?.priceCurrency !== undefined) {
        const pc = toStr(body.priceCurrency).toUpperCase();
        priceCurrency =
            body.priceCurrency === null || body.priceCurrency === ""
                ? null
                : !pc || pc === "TL" || pc === "TRY"
                  ? "TL"
                  : pc === "USD"
                    ? "USD"
                    : pc === "EUR"
                      ? "EUR"
                      : "TL";
    }

    if (name !== undefined && name.length < 2) return NextResponse.json({ message: "Ürün adı en az 2 karakter olmalı." }, { status: 400 });
    if (price !== undefined && price !== null && price < 0) return NextResponse.json({ message: "Fiyat geçersiz." }, { status: 400 });
    if (discountPrice !== undefined && discountPrice !== null && price !== null && price !== undefined && (discountPrice < 0 || discountPrice > price)) {
        return NextResponse.json({ message: "İndirimli fiyat, fiyattan büyük olamaz." }, { status: 400 });
    }

    if (categoryId !== undefined && categoryId !== null) {
        const cat = await prisma.productcategory.findFirst({
            where: { id: categoryId, businessId: auth.businessId },
            select: { id: true }
        });
        if (!cat) return NextResponse.json({ message: "Kategori bulunamadı veya yetkiniz yok." }, { status: 404 });
    }

    try {
        const product = await prisma.product.findFirst({
            where: { id, businessId: auth.businessId },
            select: {
                id: true,
                imageUrl: true,
                stockTracking: true,
                serialInvoiceMode: true,
            },
        });

        if (!product) {
            return NextResponse.json({ message: "Ürün bulunamadı veya yetkiniz yok." }, { status: 404 });
        }

        const nextTracking =
            stockTracking !== undefined ? stockTracking : product.stockTracking;

        let serialUpdate = undefined;
        if (stockTracking !== undefined) {
            if (stockTracking !== "SERIAL") {
                serialUpdate = null;
            } else {
                serialUpdate =
                    serialInvoiceMode !== undefined
                        ? serialInvoiceMode ?? "OPTIONAL"
                        : product.serialInvoiceMode ?? "OPTIONAL";
            }
        } else if (serialInvoiceMode !== undefined) {
            if (nextTracking === "SERIAL") {
                serialUpdate =
                    parseSerialInvoiceMode(body.serialInvoiceMode) ?? "OPTIONAL";
            }
        }

        // Disk Cleanup if imageUrl changes
        if (imageUrl !== undefined && imageUrl !== product.imageUrl && product.imageUrl?.startsWith("/uploads/")) {
            try {
                const relativePath = product.imageUrl.replace(/^\//, "");
                const absolutePath = join(process.cwd(), "public", relativePath);
                await unlink(absolutePath);
            } catch (err) {
                console.error("Failed to delete old product image from disk:", err);
            }
        }

        await prisma.product.update({
            where: { id },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(price !== undefined ? { price } : {}),
                ...(discountPrice !== undefined ? { discountPrice } : {}),
                ...(imageUrl !== undefined ? { imageUrl } : {}),
                ...(imageGallery !== undefined ? { imageGallery } : {}),
                ...(categoryId !== undefined ? { categoryId } : {}),
                ...(brand !== undefined ? { brand } : {}),
                ...(order !== undefined ? { order } : {}),
                ...(isActive !== undefined ? { isActive } : {}),
                ...(stock !== undefined ? { stock } : {}),
                ...(maxOrderQty !== undefined ? { maxOrderQty } : {}),
                ...(publishedOnMarketplace !== undefined ? { publishedOnMarketplace } : {}),
                ...(barcode !== undefined ? { barcode } : {}),
                ...(productCode !== undefined ? { productCode } : {}),
                ...(gtip !== undefined ? { gtip } : {}),
                ...(gtin !== undefined ? { gtin } : {}),
                ...(countryCode !== undefined ? { countryCode } : {}),
                ...(shelfLocation !== undefined ? { shelfLocation } : {}),
                ...(stockTracking !== undefined ? { stockTracking } : {}),
                ...(serialUpdate !== undefined
                    ? { serialInvoiceMode: serialUpdate }
                    : {}),
                ...(salesUnit !== undefined ? { salesUnit } : {}),
                ...(tagsString !== undefined ? { tagsString } : {}),
                ...(priceCurrency !== undefined ? { priceCurrency } : {}),
            }
        });

        return NextResponse.json({ message: "Güncellendi" }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Güncellemde hata oluştu." }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const resolved = await params;
    const id = resolved?.id;
    if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    try {
        // Önce ürünü bulup imajını kontrol edelim
        const product = await prisma.product.findFirst({
            where: { id, businessId: auth.businessId }
        });

        if (!product) {
            return NextResponse.json({ message: "Ürün bulunamadı veya yetkiniz yok." }, { status: 404 });
        }

        // Delete from DB
        await prisma.product.delete({
            where: { id }
        });

        // Local diskten sil
        if (product.imageUrl && product.imageUrl.startsWith("/uploads/")) {
            try {
                // URL format roughly matches /uploads/businesses/slug/file.ext
                // So we can map it to public directory
                const relativePath = product.imageUrl.replace(/^\//, ""); // remove leading slash
                const absolutePath = join(process.cwd(), "public", relativePath);
                await unlink(absolutePath);
            } catch (err) {
                console.error("Failed to delete product image from disk:", err);
            }
        }

        return NextResponse.json({ message: "Silindi" }, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Silme işlemi başarısız." }, { status: 500 });
    }
}
