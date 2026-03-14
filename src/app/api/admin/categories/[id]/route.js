import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/admin-categories/slugify";

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true, level: true, sortOrder: true } },
        _count: { select: { businesscategory: true } },
      },
    });
    if (!category) return NextResponse.json({ success: false, error: "Kategori bulunamadı." }, { status: 404 });

    const primaryCount = await prisma.business.count({ where: { primaryCategoryId: id } });
    return NextResponse.json({
      success: true,
      category: {
        ...category,
        primaryBusinessCount: primaryCount,
      },
    });
  } catch (e) {
    console.error("Admin category GET error:", e);
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

    const body = await request.json().catch(() => ({}));
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: "Kategori bulunamadı." }, { status: 404 });

    if (body.parentId !== undefined && body.parentId === id) {
      return NextResponse.json({ success: false, error: "Kategori kendisinin üst kategorisi olamaz." }, { status: 400 });
    }

    const data = {};
    if (body.name !== undefined) data.name = safeStr(body.name) || existing.name;
    if (body.slug !== undefined) data.slug = safeStr(body.slug) || slugify(data.name || existing.name);
    if (body.description !== undefined) data.description = body.description == null ? null : safeStr(body.description) || null;
    if (body.icon !== undefined) data.icon = body.icon == null ? null : safeStr(body.icon) || null;
    if (body.color !== undefined) data.color = body.color == null ? null : safeStr(body.color) || null;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl == null ? null : safeStr(body.imageUrl) || null;
    if (body.sortOrder !== undefined) data.sortOrder = Number.isNaN(Number(body.sortOrder)) ? existing.sortOrder : Number(body.sortOrder);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
    if (body.keywords !== undefined) data.keywords = body.keywords == null ? null : safeStr(body.keywords) || null;

    if (body.parentId !== undefined) {
      const newParentId = body.parentId == null || body.parentId === "" ? null : body.parentId;
      if (newParentId) {
        const parent = await prisma.category.findUnique({ where: { id: newParentId } });
        if (!parent) return NextResponse.json({ success: false, error: "Üst kategori bulunamadı." }, { status: 400 });
        if (parent.id === id) return NextResponse.json({ success: false, error: "Kendi üst kategoriniz olamaz." }, { status: 400 });
        data.parentId = newParentId;
        data.level = parent.level + 1;
        data.path = (parent.path || parent.slug) + "/" + (data.slug ?? existing.slug);
      } else {
        data.parentId = null;
        data.level = 0;
        data.path = data.slug ?? existing.slug;
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, category: updated });
  } catch (e) {
    console.error("Admin category PATCH error:", e);
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "Bu slug veya ad zaten kullanılıyor." }, { status: 400 });
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

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return NextResponse.json({ success: false, error: "Kategori bulunamadı." }, { status: 404 });

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin category DELETE error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
