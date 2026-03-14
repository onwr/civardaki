import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUOTED", "REPLIED", "CLOSED", "LOST"];

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const params =
      typeof context.params?.then === "function"
        ? await context.params
        : context.params || {};
    const id = params.id;
    if (!id) {
      return NextResponse.json({ success: false, error: "Lead ID gerekli." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const data = {};

    if (body.status !== undefined) {
      const nextStatus = String(body.status || "").toUpperCase();
      if (!LEAD_STATUSES.includes(nextStatus)) {
        return NextResponse.json({ success: false, error: "Geçersiz lead durumu." }, { status: 400 });
      }
      data.status = nextStatus;
    }

    if (body.adminNote !== undefined) {
      data.adminNote =
        body.adminNote == null ? null : String(body.adminNote).trim() || null;
    }

    if (body.isSuspicious !== undefined) {
      data.isSuspicious = Boolean(body.isSuspicious);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: "Güncellenecek alan yok." }, { status: 400 });
    }

    const existing = await prisma.lead.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Lead bulunamadı." }, { status: 404 });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        adminNote: true,
        isSuspicious: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (e) {
    console.error("Admin lead PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
