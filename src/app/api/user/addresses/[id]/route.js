import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function PATCH(request, context) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Adres bulunamadı." }, { status: 400 });
    }

    const existing = await prisma.user_address.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Adres bulunamadı." },
        { status: 404 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const patchData = {};

    if (typeof body.title === "string") patchData.title = body.title.trim();
    if (typeof body.line1 === "string") patchData.line1 = body.line1.trim();
    if (typeof body.line2 === "string") {
      const v = body.line2.trim();
      patchData.line2 = v || null;
    }
    if (typeof body.city === "string") patchData.city = body.city.trim();
    if (typeof body.district === "string") {
      const v = body.district.trim();
      patchData.district = v || null;
    }
    if (typeof body.mahalle === "string") {
      const v = body.mahalle.trim();
      patchData.mahalle = v || null;
    }
    if (typeof body.phone === "string") {
      const v = body.phone.trim();
      patchData.phone = v || null;
    }

    const isDefault = body?.isDefault;
    if (isDefault === true) {
      await prisma.user_address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
      patchData.isDefault = true;
    } else if (isDefault === false) {
      patchData.isDefault = false;
    }

    const updated = await prisma.user_address.update({
      where: { id },
      data: patchData,
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

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/user/addresses/[id] error:", err);
    return NextResponse.json(
      { error: "Adres güncellenemedi." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, context) {
  try {
    const userId = await getAuthUser();
    if (!userId) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Adres bulunamadı." }, { status: 400 });
    }

    const existing = await prisma.user_address.findFirst({
      where: { id, userId },
      select: { id: true, isDefault: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Adres bulunamadı." },
        { status: 404 },
      );
    }

    await prisma.user_address.delete({ where: { id } });

    // Varsayilan adres silindiyse, kalanlardan en gunceli varsayilan yap.
    if (existing.isDefault) {
      const fallback = await prisma.user_address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (fallback?.id) {
        await prisma.user_address.update({
          where: { id: fallback.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/user/addresses/[id] error:", err);
    return NextResponse.json({ error: "Adres silinemedi." }, { status: 500 });
  }
}
