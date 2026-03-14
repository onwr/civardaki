import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

async function getVariantAndCheck(id, businessId) {
    const v = await prisma.productvariant.findFirst({
        where: { id },
        include: { product: { select: { businessId: true } } }
    });
    if (!v || v.product.businessId !== businessId) return null;
    return v;
}

/** PATCH variant */
export async function PATCH(req, { params }) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const resolved = await params;
    const id = resolved?.id;
    if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    const existing = await getVariantAndCheck(id, auth.businessId);
    if (!existing) return NextResponse.json({ message: "Varyant bulunamadı." }, { status: 404 });

    const body = await req.json();
    const name = body?.name !== undefined ? toStr(body.name) : undefined;
    const sku = body?.sku !== undefined ? (toStr(body.sku) || null) : undefined;
    const price = body?.price !== undefined ? (body.price === null || body.price === "" ? null : toNum(body.price)) : undefined;
    const discountPrice = body?.discountPrice !== undefined ? (body.discountPrice === null || body.discountPrice === "" ? null : toNum(body.discountPrice)) : undefined;
    const stock = body?.stock !== undefined ? Math.max(0, parseInt(String(body.stock), 10)) : undefined;
    const maxOrderQty = body?.maxOrderQty !== undefined ? (body.maxOrderQty === null || body.maxOrderQty === "" ? null : Math.max(1, parseInt(String(body.maxOrderQty), 10))) : undefined;
    const order = Number.isFinite(body?.order) ? body.order : undefined;

    if (name !== undefined && name.length < 1) return NextResponse.json({ message: "Varyant adı boş olamaz." }, { status: 400 });

    try {
        const updated = await prisma.productvariant.update({
            where: { id },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(sku !== undefined ? { sku } : {}),
                ...(price !== undefined ? { price } : {}),
                ...(discountPrice !== undefined ? { discountPrice } : {}),
                ...(stock !== undefined ? { stock } : {}),
                ...(maxOrderQty !== undefined ? { maxOrderQty } : {}),
                ...(order !== undefined ? { order } : {}),
            },
            include: { product: { select: { id: true, name: true } } }
        });
        return NextResponse.json(updated);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Güncelleme hatası." }, { status: 500 });
    }
}

/** DELETE variant */
export async function DELETE(req, { params }) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const resolved = await params;
    const id = resolved?.id;
    if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    const existing = await getVariantAndCheck(id, auth.businessId);
    if (!existing) return NextResponse.json({ message: "Varyant bulunamadı." }, { status: 404 });

    try {
        await prisma.productvariant.delete({ where: { id } });
        return NextResponse.json({ message: "Silindi" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Silme hatası." }, { status: 500 });
    }
}
