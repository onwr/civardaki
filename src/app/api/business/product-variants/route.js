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

/** GET ?productId=xxx (optional) - list variants for business or for one product */
export async function GET(req) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const { searchParams } = new URL(req.url || "", "http://localhost");
    const productId = toStr(searchParams.get("productId"));

    const where = {};
    if (productId) {
        const product = await prisma.product.findFirst({
            where: { id: productId, businessId: auth.businessId },
            select: { id: true }
        });
        if (!product) return NextResponse.json({ message: "Ürün bulunamadı." }, { status: 404 });
        where.productId = productId;
    } else {
        where.product = { businessId: auth.businessId };
    }

    const variants = await prisma.productvariant.findMany({
        where,
        include: { product: { select: { id: true, name: true } } },
        orderBy: [{ productId: "asc" }, { order: "asc" }]
    });

    return NextResponse.json(variants);
}

/** POST - create variant */
export async function POST(req) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const body = await req.json();
    const productId = toStr(body?.productId);
    const name = toStr(body?.name);
    const sku = toStr(body?.sku) || null;
    const price = body?.price === null || body?.price === undefined || body?.price === "" ? null : toNum(body.price);
    const discountPrice = body?.discountPrice === null || body?.discountPrice === undefined || body?.discountPrice === "" ? null : toNum(body.discountPrice);
    const stock = body?.stock !== undefined && body?.stock !== null && body?.stock !== "" ? Math.max(0, parseInt(String(body.stock), 10)) : 0;
    const maxOrderQty = body?.maxOrderQty !== undefined && body?.maxOrderQty !== null && body?.maxOrderQty !== "" ? Math.max(1, parseInt(String(body.maxOrderQty), 10)) : null;
    const order = Number.isFinite(body?.order) ? body.order : 0;

    if (!productId || !name || name.length < 1) return NextResponse.json({ message: "Ürün ve varyant adı zorunludur." }, { status: 400 });

    const product = await prisma.product.findFirst({
        where: { id: productId, businessId: auth.businessId },
        select: { id: true }
    });
    if (!product) return NextResponse.json({ message: "Ürün bulunamadı." }, { status: 404 });

    try {
        const created = await prisma.productvariant.create({
            data: {
                productId,
                name,
                sku,
                price,
                discountPrice,
                stock,
                maxOrderQty,
                order
            },
            include: { product: { select: { id: true, name: true } } }
        });
        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Varyant eklenirken hata oluştu." }, { status: 500 });
    }
}
