import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const categoryId = resolved?.id;
    if (!categoryId) {
      return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 400 });
    }

    const category = await prisma.supplier_category.findFirst({
      where: { id: categoryId, businessId },
      select: { id: true },
    });
    if (!category) {
      return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
    }

    const usedCount = await prisma.business_supplier.count({
      where: { businessId, categoryId },
    });
    if (usedCount > 0) {
      return NextResponse.json(
        { error: "Bu kategori tedarikçilerde kullanılıyor. Önce tedarikçilerden kaldırın." },
        { status: 409 }
      );
    }

    await prisma.supplier_category.delete({ where: { id: categoryId } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Supplier categories DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
