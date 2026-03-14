import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/admin-categories/slugify";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const SORT_FIELDS = ["name", "slug", "sortOrder", "level", "createdAt"];

function safeInt(val, def) {
  const n = parseInt(String(val), 10);
  return Number.isNaN(n) ? def : Math.max(0, n);
}

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url || "", "http://localhost");
    const q = safeStr(searchParams.get("q"));
    const parentIdParam = searchParams.get("parentId");
    const isActiveParam = searchParams.get("isActive");
    const isFeaturedParam = searchParams.get("isFeatured");
    const page = safeInt(searchParams.get("page"), 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, safeInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE));
    const sortBy = SORT_FIELDS.includes(safeStr(searchParams.get("sortBy"))) ? searchParams.get("sortBy") : "sortOrder";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const conditions = [];

    if (q) {
      conditions.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    if (parentIdParam === "root" || parentIdParam === "") {
      conditions.push({ parentId: null });
    } else if (parentIdParam && parentIdParam !== "all") {
      conditions.push({ parentId: parentIdParam });
    }
    if (isActiveParam === "true") conditions.push({ isActive: true });
    else if (isActiveParam === "false") conditions.push({ isActive: false });
    if (isFeaturedParam === "true") conditions.push({ isFeatured: true });
    else if (isFeaturedParam === "false") conditions.push({ isFeatured: false });

    const where = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };

    const orderBy =
      sortBy === "name"
        ? { name: sortOrder }
        : sortBy === "slug"
          ? { slug: sortOrder }
          : sortBy === "sortOrder"
            ? { sortOrder: sortOrder }
            : sortBy === "level"
              ? { level: sortOrder }
              : sortBy === "createdAt"
                ? { createdAt: sortOrder }
                : { sortOrder: "asc" };

    const skip = (page - 1) * pageSize;

    const [items, total, totalCategories, activeCount, featuredCount, rootCount] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
          color: true,
          imageUrl: true,
          parentId: true,
          level: true,
          path: true,
          sortOrder: true,
          isActive: true,
          isFeatured: true,
          keywords: true,
          createdAt: true,
          updatedAt: true,
          parent: { select: { id: true, name: true, slug: true } },
          _count: { select: { children: true, businesscategory: true } },
        },
      }),
      prisma.category.count({ where }),
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isFeatured: true } }),
      prisma.category.count({ where: { parentId: null } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const stats = {
      totalCategories,
      activeCount,
      featuredCount,
      rootCount,
    };

    const normalized = items.map((it) => {
      const { parent, _count, ...rest } = it;
      return {
        ...rest,
        parentName: parent?.name ?? null,
        childrenCount: _count.children,
        businessCount: _count.businesscategory,
      };
    });

    return NextResponse.json({
      success: true,
      items: normalized,
      stats,
      pagination: { page, pageSize, total, totalPages },
    });
  } catch (e) {
    console.error("Admin categories GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const name = body.name != null ? String(body.name).trim() : "";
    if (!name) {
      return NextResponse.json({ success: false, error: "Kategori adı zorunludur." }, { status: 400 });
    }

    let slug = body.slug != null ? String(body.slug).trim() : "";
    if (!slug) slug = slugify(name);
    const description = body.description != null ? String(body.description).trim() || null : null;
    const icon = body.icon != null ? String(body.icon).trim() || null : null;
    const color = body.color != null ? String(body.color).trim() || null : null;
    const imageUrl = body.imageUrl != null ? String(body.imageUrl).trim() || null : null;
    const parentId = body.parentId != null ? String(body.parentId).trim() || null : null;
    const sortOrder = Number.isNaN(Number(body.sortOrder)) ? 0 : Number(body.sortOrder);
    const isActive = body.isActive !== false;
    const isFeatured = body.isFeatured === true;
    const keywords = body.keywords != null ? String(body.keywords).trim() || null : null;

    let level = 0;
    let path = slug;
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) return NextResponse.json({ success: false, error: "Üst kategori bulunamadı." }, { status: 400 });
      level = parent.level + 1;
      path = (parent.path || parent.slug) + "/" + slug;
    }

    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ success: false, error: "Bu slug zaten kullanılıyor." }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
        imageUrl,
        parentId,
        level,
        path,
        sortOrder,
        isActive,
        isFeatured,
        keywords,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (e) {
    console.error("Admin categories POST error:", e);
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "Bu ad veya slug zaten kullanılıyor." }, { status: 400 });
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
