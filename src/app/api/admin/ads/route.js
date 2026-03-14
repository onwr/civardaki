import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const SORT_FIELDS = ["createdAt", "sortOrder", "startAt", "title"];
const PLACEMENTS = ["BANNER", "SIDEBAR", "LISTING_TOP", "LISTING_INLINE", "FOOTER", "POPUP"];
const STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "ENDED"];

function safeInt(val, def) {
  const n = parseInt(String(val), 10);
  return Number.isNaN(n) ? def : Math.max(0, n);
}

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

function parseDate(val) {
  if (val == null || val === "") return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url || "", "http://localhost");
    const placement = safeStr(searchParams.get("placement"));
    const status = safeStr(searchParams.get("status"));
    const page = safeInt(searchParams.get("page"), 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, safeInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE));
    const sortBy = SORT_FIELDS.includes(safeStr(searchParams.get("sortBy"))) ? searchParams.get("sortBy") : "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where = {};
    if (placement && PLACEMENTS.includes(placement)) where.placement = placement;
    if (status && STATUSES.includes(status)) where.status = status;

    const orderBy =
      sortBy === "sortOrder"
        ? [{ sortOrder: sortOrder }, { createdAt: "desc" }]
        : sortBy === "startAt"
          ? { startAt: sortOrder }
          : sortBy === "title"
            ? { title: sortOrder }
            : { createdAt: sortOrder };

    const skip = (page - 1) * pageSize;

    const [items, total, draftCount, activeCount, pausedCount, endedCount] = await Promise.all([
      prisma.ad.findMany({
        where,
        orderBy: Array.isArray(orderBy) ? orderBy : [orderBy],
        skip,
        take: pageSize,
      }),
      prisma.ad.count({ where }),
      prisma.ad.count({ where: { status: "DRAFT" } }),
      prisma.ad.count({ where: { status: "ACTIVE" } }),
      prisma.ad.count({ where: { status: "PAUSED" } }),
      prisma.ad.count({ where: { status: "ENDED" } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      success: true,
      items,
      pagination: { page, pageSize, total, totalPages },
      stats: { totalCount: total, draftCount, activeCount, pausedCount, endedCount },
    });
  } catch (e) {
    console.error("Admin ads GET error:", e);
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
    const title = safeStr(body.title);
    if (!title) return NextResponse.json({ success: false, error: "Başlık zorunludur." }, { status: 400 });

    const placement = safeStr(body.placement);
    if (!placement || !PLACEMENTS.includes(placement)) {
      return NextResponse.json({ success: false, error: "Geçerli bir yerleşim seçin." }, { status: 400 });
    }

    const status = safeStr(body.status);
    const finalStatus = status && STATUSES.includes(status) ? status : "DRAFT";

    const description = body.description != null ? String(body.description).trim() || null : null;
    const imageUrl = body.imageUrl != null ? safeStr(body.imageUrl) || null : null;
    const linkUrl = body.linkUrl != null ? safeStr(body.linkUrl) || null : null;
    const startAt = parseDate(body.startAt);
    const endAt = parseDate(body.endAt);
    const sortOrder = safeInt(body.sortOrder, 0);

    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        imageUrl,
        linkUrl,
        placement,
        status: finalStatus,
        startAt,
        endAt,
        sortOrder,
        createdById: session.user.id ?? null,
      },
    });

    return NextResponse.json({ success: true, ad }, { status: 201 });
  } catch (e) {
    console.error("Admin ads POST error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
