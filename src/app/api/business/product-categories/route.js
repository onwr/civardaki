import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toStr(v) { return (v ?? "").toString().trim(); }

async function requireBusiness() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
    if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
    const businessId = session.user.businessId;
    if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
    return { businessId };
}

export async function GET() {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const items = await prisma.productcategory.findMany({
        where: { businessId: auth.businessId },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true, order: true }
    });

    return NextResponse.json({ items });
}

export async function POST(req) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const body = await req.json();
    const name = toStr(body?.name);
    const order = Number.isFinite(body?.order) ? Number(body.order) : 0;

    if (!name || name.length < 2) {
        return NextResponse.json({ message: "Kategori adı en az 2 karakter olmalı." }, { status: 400 });
    }

    try {
        const created = await prisma.productcategory.create({
            data: { businessId: auth.businessId, name, order },
            select: { id: true, name: true, order: true }
        });
        return NextResponse.json({ item: created }, { status: 201 });
    } catch (e) {
        if (e.code === "P2002") {
            return NextResponse.json({ message: "Bu kategori adı zaten kullanılıyor. Farklı bir ad deneyin." }, { status: 409 });
        }
        throw e;
    }
}
