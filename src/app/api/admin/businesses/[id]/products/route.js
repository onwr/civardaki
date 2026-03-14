import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const exists = await prisma.business.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ success: false, error: "İşletme bulunamadı." }, { status: 404 });

    const products = await prisma.product.findMany({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json({ success: true, products });
  } catch (e) {
    console.error("Admin business products error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
