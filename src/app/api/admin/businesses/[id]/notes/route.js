import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureAdmin(session) {
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
  }
  return null;
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const err = await ensureAdmin(session);
    if (err) return err;

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const exists = await prisma.business.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ success: false, error: "İşletme bulunamadı." }, { status: 404 });

    const notes = await prisma.businessadminnote.findMany({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, notes });
  } catch (e) {
    console.error("Admin business notes GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const err = await ensureAdmin(session);
    if (err) return err;

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (!note) return NextResponse.json({ success: false, error: "Not metni gerekli." }, { status: 400 });

    const exists = await prisma.business.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return NextResponse.json({ success: false, error: "İşletme bulunamadı." }, { status: 404 });

    const created = await prisma.businessadminnote.create({
      data: {
        businessId: id,
        authorId: session.user?.id ?? null,
        note,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, note: created });
  } catch (e) {
    console.error("Admin business notes POST error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
