import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

function toStr(v) { return (v ?? "").toString().trim(); }
function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
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
    const order = Number.isFinite(body?.order) ? Number(body.order) : undefined;
    const isActive = typeof body?.isActive === "boolean" ? body.isActive : undefined;
    const stock = body?.stock !== undefined ? (body.stock === null || body.stock === "" ? null : Math.max(0, parseInt(String(body.stock), 10))) : undefined;
    const maxOrderQty = body?.maxOrderQty !== undefined ? (body.maxOrderQty === null || body.maxOrderQty === "" ? null : Math.max(1, parseInt(String(body.maxOrderQty), 10))) : undefined;

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
            select: { id: true, imageUrl: true }
        });

        if (!product) {
            return NextResponse.json({ message: "Ürün bulunamadı veya yetkiniz yok." }, { status: 404 });
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

        const updated = await prisma.product.update({
            where: { id },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(price !== undefined ? { price } : {}),
                ...(discountPrice !== undefined ? { discountPrice } : {}),
                ...(imageUrl !== undefined ? { imageUrl } : {}),
                ...(categoryId !== undefined ? { categoryId } : {}),
                ...(order !== undefined ? { order } : {}),
                ...(isActive !== undefined ? { isActive } : {}),
                ...(stock !== undefined ? { stock } : {}),
                ...(maxOrderQty !== undefined ? { maxOrderQty } : {}),
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
