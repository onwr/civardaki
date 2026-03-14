import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PLACEMENTS = ["BANNER", "SIDEBAR", "LISTING_TOP", "LISTING_INLINE", "FOOTER", "POPUP"];
const MAX_LIMIT = 10;

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

function safeInt(val, def) {
  const n = parseInt(String(val), 10);
  return Number.isNaN(n) ? def : Math.max(1, Math.min(MAX_LIMIT, n));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url || "", "http://localhost");
    const placement = safeStr(searchParams.get("placement"));
    if (!placement || !PLACEMENTS.includes(placement)) {
      return NextResponse.json({ success: false, error: "Geçerli placement gerekli." }, { status: 400 });
    }

    const limit = safeInt(searchParams.get("limit"), 5);
    const now = new Date();

    const ads = await prisma.ad.findMany({
      where: {
        status: "ACTIVE",
        placement,
        AND: [
          { OR: [{ startAt: null }, { startAt: { lte: now } }] },
          { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        linkUrl: true,
        placement: true,
      },
    });

    return NextResponse.json({ success: true, ads });
  } catch (e) {
    console.error("Public ads GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
