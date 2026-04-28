import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLES = ["USER", "BUSINESS", "ADMIN"];

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === "development";
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const isSelfUpdate = id === session.user.id;
    const canSelfPromoteInDev = isDevelopment && isSelfUpdate;
    const isAdmin = session.user.role === "ADMIN";
    if (!isAdmin && !canSelfPromoteInDev) {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    if (isSelfUpdate && !canSelfPromoteInDev) {
      return NextResponse.json({ success: false, error: "Kendi rolünüzü değiştiremezsiniz." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const role = body.role;
    if (!ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "Geçersiz rol." }, { status: 400 });
    }
    if (canSelfPromoteInDev && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Development modunda sadece ADMIN rolüne geçebilirsiniz." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ success: true, user: { id: user.id, role: user.role } });
  } catch (e) {
    console.error("Admin user role PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
