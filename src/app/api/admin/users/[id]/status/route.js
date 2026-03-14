import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["ACTIVE", "SUSPENDED", "BANNED", "PENDING"];

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const status = body.status;
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: "Geçersiz durum." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, user: { id: user.id, status: user.status } });
  } catch (e) {
    console.error("Admin user status PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
