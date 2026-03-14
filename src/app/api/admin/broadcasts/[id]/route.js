import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveParams(context) {
  const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
  return params;
}

const LAYOUTS = ["BANNER", "MODAL", "SIDEBAR", "INLINE"];
const AUDIENCES = ["ALL", "USER", "BUSINESS"];
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

    const broadcast = await prisma.broadcast.findUnique({ where: { id } });
    if (!broadcast) return NextResponse.json({ success: false, error: "Duyuru bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, broadcast });
  } catch (e) {
    console.error("Admin broadcast GET error:", e);
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

    const existing = await prisma.broadcast.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Duyuru bulunamadı." }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const data = {};

    if (body.title !== undefined) {
      const v = safeStr(body.title);
      if (!v) return NextResponse.json({ success: false, error: "Başlık boş olamaz." }, { status: 400 });
      data.title = v;
    }
    if (body.body !== undefined) data.body = safeStr(body.body) || null;
    if (body.imageUrl !== undefined) data.imageUrl = safeStr(body.imageUrl) || null;
    if (body.linkUrl !== undefined) data.linkUrl = safeStr(body.linkUrl) || null;
    if (body.linkLabel !== undefined) data.linkLabel = safeStr(body.linkLabel) || null;
    if (body.layout !== undefined) {
      if (!LAYOUTS.includes(body.layout)) {
        return NextResponse.json({ success: false, error: "Geçersiz yerleşim." }, { status: 400 });
      }
      data.layout = body.layout;
    }
    if (body.audience !== undefined) {
      if (!AUDIENCES.includes(body.audience)) {
        return NextResponse.json({ success: false, error: "Geçersiz hedef kitle." }, { status: 400 });
      }
      data.audience = body.audience;
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

    const broadcast = await prisma.broadcast.update({ where: { id }, data });
    return NextResponse.json({ success: true, broadcast });
  } catch (e) {
    console.error("Admin broadcast PATCH error:", e);
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

    const existing = await prisma.broadcast.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Duyuru bulunamadı." }, { status: 404 });

    await prisma.broadcast.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin broadcast DELETE error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
