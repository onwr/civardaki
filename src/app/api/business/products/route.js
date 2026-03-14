import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugifyTR } from "@/lib/formatters";

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

export async function GET(req) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const { searchParams } = new URL(req.url);
    const q = toStr(searchParams.get("q"));
    const categoryId = toStr(searchParams.get("categoryId"));
    const status = toStr(searchParams.get("status")) || "active";
    const sort = toStr(searchParams.get("sort")) || "order";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {
        businessId: auth.businessId,
        ...(status === "all" ? {} : { isActive: status === "active" }),
        ...(categoryId ? { categoryId } : {}),
        ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
    };

    const orderBy =
        sort === "newest" ? [{ createdAt: "desc" }] :
            sort === "priceAsc" ? [{ price: "asc" }] :
                sort === "priceDesc" ? [{ price: "desc" }] :
                    [{ order: "asc" }, { createdAt: "desc" }];

    const [rawItems, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            select: {
                id: true, name: true, slug: true, description: true, price: true, discountPrice: true,
                imageUrl: true, isActive: true, order: true, categoryId: true, stock: true, maxOrderQty: true,
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
    const order = Number.isFinite(body?.order) ? Number(body.order) : 0;
    const stock = body?.stock !== undefined && body?.stock !== null && body?.stock !== "" ? Math.max(0, parseInt(String(body.stock), 10)) : null;
    const maxOrderQty = body?.maxOrderQty !== undefined && body?.maxOrderQty !== null && body?.maxOrderQty !== "" ? Math.max(1, parseInt(String(body.maxOrderQty), 10)) : null;

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
                name,
                slug,
                description,
                price,
                discountPrice,
                imageUrl,
                order,
                stock,
                maxOrderQty,
                isActive: true,
            },
            select: { id: true, slug: true }
        });

        return NextResponse.json({ id: created.id, slug: created.slug }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: "Kayıt sırasında hata oluştu." }, { status: 500 });
    }
}
