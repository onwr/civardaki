import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toStr(v) { return (v ?? "").toString().trim(); }

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
    const order = Number.isFinite(body?.order) ? Number(body.order) : undefined;

    if (name !== undefined && name.length < 2) {
        return NextResponse.json({ message: "Kategori adı en az 2 karakter olmalı." }, { status: 400 });
    }

    try {
        const updated = await prisma.productcategory.updateMany({
            where: { id, businessId: auth.businessId },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(order !== undefined ? { order } : {})
            }
        });

        if (updated.count === 0) {
            return NextResponse.json({ message: "Kategori bulunamadı veya yetkiniz yok." }, { status: 404 });
        }

        return NextResponse.json({ message: "Güncellendi" }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: "Bu isimde bir kategori zaten mevcut olabilir." }, { status: 409 });
    }
}

export async function DELETE(req, { params }) {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const resolved = await params;
    const id = resolved?.id;
    if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    try {
        const deleted = await prisma.productcategory.deleteMany({
            where: { id, businessId: auth.businessId }
        });

        if (deleted.count === 0) {
            return NextResponse.json({ message: "Kategori bulunamadı veya yetkiniz yok." }, { status: 404 });
        }

        return NextResponse.json({ message: "Silindi" }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: "Silme işlemi başarısız." }, { status: 500 });
    }
}
