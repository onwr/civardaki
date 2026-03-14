import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const { id: businessId, productId } = params;
    if (!businessId || !productId) {
      return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const isActive = typeof body.isActive === "boolean" ? body.isActive : undefined;
    if (isActive === undefined) {
      return NextResponse.json({ success: false, error: "isActive gerekli." }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, businessId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ success: false, error: "Ürün bulunamadı." }, { status: 404 });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { isActive },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin business product PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
