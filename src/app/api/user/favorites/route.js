import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

function mapFavorite(row) {
  const b = row?.business;
  const media = Array.isArray(b?.media) ? b.media : [];
  const logo = media.find((m) => m.type === "LOGO")?.url || null;
  const cover = media.find((m) => m.type === "COVER")?.url || null;
  return {
    id: row.id,
    businessId: b?.id || "",
    name: b?.name || "",
    slug: b?.slug || "",
    category: b?.category || "Genel",
    image: cover || logo || "",
    rating: Number(b?.rating || 0),
    reviews: Number(b?.reviewCount || 0),
    isOpen: b?.isOpen ?? true,
    city: b?.city || "",
    district: b?.district || "",
    createdAt: row.createdAt,
  };
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const rows = await prisma.user_favorite_business.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        business: {
          select: {
            id: true,
            slug: true,
            name: true,
            category: true,
            city: true,
            district: true,
            isOpen: true,
            rating: true,
            reviewCount: true,
            media: {
              select: { type: true, url: true },
            },
          },
        },
      },
    });

    return NextResponse.json(rows.map(mapFavorite));
  } catch (err) {
    console.error("GET /api/user/favorites error:", err);
    return NextResponse.json(
      { error: "Favoriler yüklenemedi." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const businessId = body?.businessId ? String(body.businessId) : null;
    const slug = body?.slug ? String(body.slug) : null;

    let business = null;
    if (businessId) {
      business = await prisma.business.findFirst({
        where: { id: businessId, isActive: true },
        select: { id: true },
      });
    } else if (slug) {
      business = await prisma.business.findFirst({
        where: { slug, isActive: true },
        select: { id: true },
      });
    }

    if (!business?.id) {
      return NextResponse.json(
        { error: "İşletme bulunamadı." },
        { status: 404 },
      );
    }

    const favorite = await prisma.user_favorite_business.upsert({
      where: {
        userId_businessId: {
          userId,
          businessId: business.id,
        },
      },
      update: {},
      create: {
        userId,
        businessId: business.id,
      },
      include: {
        business: {
          select: {
            id: true,
            slug: true,
            name: true,
            category: true,
            city: true,
            district: true,
            isOpen: true,
            rating: true,
            reviewCount: true,
            media: { select: { type: true, url: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, favorite: mapFavorite(favorite) });
  } catch (err) {
    console.error("POST /api/user/favorites error:", err);
    return NextResponse.json(
      { error: "Favori eklenemedi." },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const businessId = body?.businessId ? String(body.businessId) : null;
    if (!businessId) {
      return NextResponse.json(
        { error: "businessId gerekli." },
        { status: 400 },
      );
    }

    await prisma.user_favorite_business.deleteMany({
      where: { userId, businessId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/user/favorites error:", err);
    return NextResponse.json(
      { error: "Favori kaldırılamadı." },
      { status: 500 },
    );
  }
}
