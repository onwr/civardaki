import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LAYOUTS = ["BANNER", "MODAL", "SIDEBAR", "INLINE"];
const AUDIENCES = ["ALL", "USER", "BUSINESS"];
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
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url || "", "http://localhost");
    const queryAudience = safeStr(searchParams.get("audience"));
    const layout = safeStr(searchParams.get("layout"));
    const limit = safeInt(searchParams.get("limit"), 5);

    let audienceFilter = [];
    if (session?.user?.role === "USER") {
      audienceFilter = queryAudience && AUDIENCES.includes(queryAudience) ? [queryAudience] : ["ALL", "USER"];
    } else if (session?.user?.role === "BUSINESS") {
      audienceFilter = queryAudience && AUDIENCES.includes(queryAudience) ? [queryAudience] : ["ALL", "BUSINESS"];
    } else {
      audienceFilter = queryAudience && AUDIENCES.includes(queryAudience) ? [queryAudience] : ["ALL"];
    }

    const where = {
      status: "ACTIVE",
      audience: { in: audienceFilter },
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: new Date() } }] },
        { OR: [{ endAt: null }, { endAt: { gte: new Date() } }] },
      ],
    };
    if (layout && LAYOUTS.includes(layout)) where.layout = layout;

    const broadcasts = await prisma.broadcast.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        body: true,
        imageUrl: true,
        linkUrl: true,
        linkLabel: true,
        layout: true,
        audience: true,
      },
    });

    return NextResponse.json({ success: true, broadcasts });
  } catch (e) {
    console.error("Broadcasts GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
