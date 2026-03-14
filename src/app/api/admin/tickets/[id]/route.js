import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveParams(context) {
  const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
  return params;
}

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_REPLY", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const CATEGORIES = ["GENERAL", "BILLING", "TECHNICAL", "ACCOUNT", "OTHER"];

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const ticket = await prisma.support_ticket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: { select: { id: true, name: true, slug: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, email: true } },
            business: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!ticket) return NextResponse.json({ success: false, error: "Talep bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, ticket });
  } catch (e) {
    console.error("Admin ticket GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const existing = await prisma.support_ticket.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Talep bulunamadı." }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const data = {};
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Geçersiz durum." }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.priority !== undefined) {
      if (!PRIORITIES.includes(body.priority)) {
        return NextResponse.json({ success: false, error: "Geçersiz öncelik." }, { status: 400 });
      }
      data.priority = body.priority;
    }
    if (body.category !== undefined) {
      if (!CATEGORIES.includes(body.category)) {
        return NextResponse.json({ success: false, error: "Geçersiz kategori." }, { status: 400 });
      }
      data.category = body.category;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: true, ticket: existing });
    }

    const ticket = await prisma.support_ticket.update({ where: { id }, data });
    return NextResponse.json({ success: true, ticket });
  } catch (e) {
    console.error("Admin ticket PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
