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

const USER_INCLUDE = {
  ownedbusiness: {
    where: { isPrimary: true },
    take: 1,
    include: {
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          businesssubscription: {
            select: {
              status: true,
              plan: true,
              expiresAt: true,
            },
          },
        },
      },
    },
  },
};

function normalizeUser(u) {
  if (!u) return null;
  const { ownedbusiness, password, ...rest } = u;
  const business = ownedbusiness?.[0]?.business ?? null;
  return { ...rest, business };
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const err = await ensureAdmin(session);
    if (err) return err;

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
      include: USER_INCLUDE,
    });

    if (!user) return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, user: normalizeUser(user) });
  } catch (e) {
    console.error("Admin user GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

const ALLOWED_FIELDS = ["name", "email", "phone", "role", "status"];

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const err = await ensureAdmin(session);
    if (err) return err;

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Geçersiz istek." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Kullanıcı bulunamadı." }, { status: 404 });

    const data = {};
    if (body.name !== undefined) data.name = body.name == null ? null : String(body.name).trim();
    if (body.phone !== undefined) data.phone = body.phone == null ? null : String(body.phone).trim();
    if (body.email !== undefined) {
      const email = body.email == null ? null : String(body.email).trim().toLowerCase();
      if (email) data.email = email;
    }
    if (body.role !== undefined && ["USER", "BUSINESS", "ADMIN"].includes(body.role)) {
      if (id === session.user.id && body.role !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Kendi admin yetkinizi kaldıramazsınız." }, { status: 400 });
      }
      data.role = body.role;
    }
    if (body.status !== undefined && ["ACTIVE", "SUSPENDED", "BANNED", "PENDING"].includes(body.status)) {
      data.status = body.status;
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      include: USER_INCLUDE,
    });

    return NextResponse.json({ success: true, user: normalizeUser(updated) });
  } catch (e) {
    console.error("Admin user PATCH error:", e);
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "Bu e-posta zaten kullanılıyor." }, { status: 400 });
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
