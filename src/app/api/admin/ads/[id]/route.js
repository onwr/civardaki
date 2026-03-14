import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveParams(context) {
  const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
  return params;
}

const PLACEMENTS = ["BANNER", "SIDEBAR", "LISTING_TOP", "LISTING_INLINE", "FOOTER", "POPUP"];
const STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "ENDED"];

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

function parseDate(val) {
  if (val == null || val === "") return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

function safeInt(val, def) {
  const n = parseInt(String(val), 10);
  return Number.isNaN(n) ? def : n;
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const ad = await prisma.ad.findUnique({ where: { id } });
    if (!ad) return NextResponse.json({ success: false, error: "Reklam bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, ad });
  } catch (e) {
    console.error("Admin ad GET error:", e);
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

    const existing = await prisma.ad.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Reklam bulunamadı." }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const data = {};

    if (body.title !== undefined) {
      const v = safeStr(body.title);
      if (!v) return NextResponse.json({ success: false, error: "Başlık boş olamaz." }, { status: 400 });
      data.title = v;
    }
    if (body.description !== undefined) data.description = safeStr(body.description) || null;
    if (body.imageUrl !== undefined) data.imageUrl = safeStr(body.imageUrl) || null;
    if (body.linkUrl !== undefined) data.linkUrl = safeStr(body.linkUrl) || null;
    if (body.placement !== undefined) {
      if (!PLACEMENTS.includes(body.placement)) {
        return NextResponse.json({ success: false, error: "Geçersiz yerleşim." }, { status: 400 });
      }
      data.placement = body.placement;
    }
    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Geçersiz durum." }, { status: 400 });
      }
      data.status = body.status;
    }
    if (body.startAt !== undefined) data.startAt = parseDate(body.startAt);
    if (body.endAt !== undefined) data.endAt = parseDate(body.endAt);
    if (body.sortOrder !== undefined) data.sortOrder = safeInt(body.sortOrder, 0);

    const ad = await prisma.ad.update({ where: { id }, data });
    return NextResponse.json({ success: true, ad });
  } catch (e) {
    console.error("Admin ad PATCH error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const existing = await prisma.ad.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Reklam bulunamadı." }, { status: 404 });

    await prisma.ad.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin ad DELETE error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
