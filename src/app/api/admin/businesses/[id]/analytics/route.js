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

    const events = await prisma.businessevent.groupBy({
      by: ["type"],
      where: { businessId: id },
      _count: { type: true },
    });

    const byType = {};
    let total = 0;
    for (const row of events) {
      byType[row.type] = row._count.type;
      total += row._count.type;
    }

    return NextResponse.json({
      success: true,
      analytics: {
        byType,
        total,
      },
    });
  } catch (e) {
    console.error("Admin business analytics error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
