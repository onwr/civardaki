import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ISR cache for catalog views

export async function GET(req, { params }) {
    try {
        const resolved = typeof params?.then === "function" ? await params : params;
        const slug = resolved?.slug;
        if (!slug) return NextResponse.json({ message: "Bad request" }, { status: 400 });

        const business = await prisma.business.findUnique({
            where: { slug, isActive: true },
            select: { id: true, name: true, slug: true }
        });

        if (!business) {
            return NextResponse.json({ message: "İşletme bulunamadı" }, { status: 404 });
        }

        const categories = await prisma.productcategory.findMany({
            where: { businessId: business.id },
            orderBy: { order: "asc" },
            include: {
                product: {
                    where: { isActive: true },
                    orderBy: { order: "asc" },
                    include: { productvariant: { orderBy: { order: "asc" } } }
                }
            }
        });

        const uncategorized = await prisma.product.findMany({
            where: { businessId: business.id, categoryId: null, isActive: true },
            orderBy: { order: "asc" },
            include: { productvariant: { orderBy: { order: "asc" } } }
        });

        return NextResponse.json({
            business,
            categories: categories.map((c) => ({ ...c, products: c.product })),
            uncategorized
        }, { status: 200 });

    } catch (e) {
        console.error("CATALOG API ERROR:", e);
        return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
    }
}
