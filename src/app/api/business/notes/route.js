import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function normalizeColor(value) {
  const color = String(value || "blue").trim().toLowerCase();
  const allowed = new Set(["blue", "emerald", "purple", "rose", "amber", "slate"]);
  return allowed.has(color) ? color : "blue";
}

function normalizeTags(input) {
  if (Array.isArray(input)) {
    return input
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  return [];
}

async function requireBusinessContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return {
    businessId: session.user.businessId,
    userId: session.user.id || null,
  };
}

export async function GET(request) {
  try {
    const context = await requireBusinessContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = context;
    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get("q") || "").trim();
    const category = String(searchParams.get("category") || "").trim();
    const pinned = String(searchParams.get("pinned") || "all").trim().toLowerCase();
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * limit;

    const where = { businessId, archivedAt: null };
    const visibleWhere = { ...where };
    if (category && category !== "all") visibleWhere.category = category;
    if (pinned === "true") visibleWhere.isPinned = true;
    if (pinned === "false") visibleWhere.isPinned = false;

    const [visibleNotes, allNotes] = await Promise.all([
      prisma.business_note.findMany({
        where: visibleWhere,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          color: true,
          tags: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.business_note.findMany({
        where,
        select: {
          id: true,
          category: true,
          isPinned: true,
          createdAt: true,
        },
      }),
    ]);

    const normalizedQ = q.toLowerCase();
    const searchedNotes = normalizedQ
      ? visibleNotes.filter((note) => {
          const title = String(note.title || "").toLowerCase();
          const content = String(note.content || "").toLowerCase();
          const tags = (Array.isArray(note.tags) ? note.tags : [])
            .map((tag) => String(tag || "").toLowerCase())
            .join(" ");
          return title.includes(normalizedQ) || content.includes(normalizedQ) || tags.includes(normalizedQ);
        })
      : visibleNotes;

    const total = searchedNotes.length;
    const items = searchedNotes.slice(skip, skip + limit);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const categorySet = new Set(allNotes.map((item) => item.category).filter(Boolean));
    const thisWeekCount = allNotes.filter((item) => new Date(item.createdAt) >= oneWeekAgo).length;
    const importantCount = allNotes.filter((item) => item.isPinned).length;

    return NextResponse.json({
      notes: items.map((item) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total: allNotes.length,
        thisWeek: thisWeekCount,
        categories: categorySet.size,
        important: importantCount,
      },
      categories: ["all", ...Array.from(categorySet.values()).sort((a, b) => a.localeCompare(b, "tr"))],
    });
  } catch (error) {
    console.error("Business notes GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const context = await requireBusinessContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    const category = String(body.category || "").trim() || "Genel";
    const color = normalizeColor(body.color);
    const isPinned = Boolean(body.isPinned);
    const tags = normalizeTags(body.tags);

    if (!title) {
      return NextResponse.json({ error: "Başlık zorunludur." }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: "Not içeriği zorunludur." }, { status: 400 });
    }

    const created = await prisma.business_note.create({
      data: {
        businessId: context.businessId,
        authorUserId: context.userId,
        title,
        content,
        category,
        color,
        tags,
        isPinned,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id, message: "Not oluşturuldu." }, { status: 201 });
  } catch (error) {
    console.error("Business notes POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
