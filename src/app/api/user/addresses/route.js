import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/addresses – Giriş yapmış kullanıcının kayıtlı adreslerini listeler.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }
    const list = await prisma.user_address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        line1: true,
        line2: true,
        city: true,
        district: true,
        mahalle: true,
        phone: true,
        isDefault: true,
      },
    });
    return NextResponse.json(list);
  } catch (err) {
    console.error("GET /api/user/addresses error:", err);
    return NextResponse.json({ error: "Adresler yüklenemedi." }, { status: 500 });
  }
}

/**
 * POST /api/user/addresses – Yeni adres ekler (giriş zorunlu).
 * Body: { title, line1, line2?, city, district?, mahalle?, phone?, isDefault? }
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { title, line1, line2, city, district, mahalle, phone, isDefault } =
      body;
    if (!title?.trim() || !line1?.trim() || !city?.trim()) {
      return NextResponse.json(
        { error: "Adres başlığı, adres satırı ve il zorunludur." },
        { status: 400 }
      );
    }
    const shouldBeDefault = Boolean(isDefault);
    if (shouldBeDefault) {
      await prisma.user_address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const created = await prisma.user_address.create({
      data: {
        userId: session.user.id,
        title: String(title).trim(),
        line1: String(line1).trim(),
        line2: line2 != null && line2 !== "" ? String(line2).trim() : null,
        city: String(city).trim(),
        district: district != null && district !== "" ? String(district).trim() : null,
        mahalle: mahalle != null && mahalle !== "" ? String(mahalle).trim() : null,
        phone: phone != null && phone !== "" ? String(phone).trim() : null,
        isDefault: shouldBeDefault,
      },
      select: {
        id: true,
        title: true,
        line1: true,
        line2: true,
        city: true,
        district: true,
        mahalle: true,
        phone: true,
        isDefault: true,
      },
    });
    return NextResponse.json(created);
  } catch (err) {
    console.error("POST /api/user/addresses error:", err);
    return NextResponse.json({ error: "Adres kaydedilemedi." }, { status: 500 });
  }
}
