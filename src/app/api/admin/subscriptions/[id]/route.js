import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveParams(context) {
  const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
  return params;
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const subscription = await prisma.businesssubscription.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            primaryCategoryId: true,
          },
        },
      },
    });

    if (!subscription) return NextResponse.json({ success: false, error: "Abonelik bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, subscription });
  } catch (e) {
    console.error("Admin subscription GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

const PLANS = ["BASIC", "PREMIUM"];
const STATUSES = ["TRIAL", "ACTIVE", "EXPIRED"];

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const existing = await prisma.businesssubscription.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Abonelik bulunamadı." }, { status: 404 });

    const data = {};
    if (body.plan !== undefined && PLANS.includes(body.plan)) data.plan = body.plan;
    if (body.status !== undefined && STATUSES.includes(body.status)) data.status = body.status;
    if (body.startedAt !== undefined) {
      const d = new Date(body.startedAt);
      if (!Number.isNaN(d.getTime())) data.startedAt = d;
    }
    if (body.expiresAt !== undefined) {
      const d = new Date(body.expiresAt);
      if (!Number.isNaN(d.getTime())) data.expiresAt = d;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: true, subscription: existing });
    }

    const updated = await prisma.businesssubscription.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, subscription: updated });
  } catch (e) {
    console.error("Admin subscription PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
