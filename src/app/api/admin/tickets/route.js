import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const SORT_FIELDS = ["createdAt", "updatedAt"];
const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_REPLY", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const CATEGORIES = ["GENERAL", "BILLING", "TECHNICAL", "ACCOUNT", "OTHER"];
const CREATOR_TYPES = ["USER", "BUSINESS"];

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
    const status = safeStr(searchParams.get("status"));
    const priority = safeStr(searchParams.get("priority"));
    const category = safeStr(searchParams.get("category"));
    const creatorType = safeStr(searchParams.get("creatorType"));
    const page = safeInt(searchParams.get("page"), 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, safeInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE));
    const sortBy = SORT_FIELDS.includes(safeStr(searchParams.get("sortBy"))) ? searchParams.get("sortBy") : "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const where = {};
    if (status && STATUSES.includes(status)) where.status = status;
    if (priority && PRIORITIES.includes(priority)) where.priority = priority;
    if (category && CATEGORIES.includes(category)) where.category = category;
    if (creatorType && CREATOR_TYPES.includes(creatorType)) where.creatorType = creatorType;

    const skip = (page - 1) * pageSize;

    const [items, total, openCount, waitingCount, resolvedCount] = await Promise.all([
      prisma.support_ticket.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true } },
          business: { select: { id: true, name: true, slug: true } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.support_ticket.count({ where }),
      prisma.support_ticket.count({ where: { status: "OPEN" } }),
      prisma.support_ticket.count({ where: { status: "WAITING_REPLY" } }),
      prisma.support_ticket.count({ where: { status: "RESOLVED" } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      success: true,
      items,
      pagination: { page, pageSize, total, totalPages },
      stats: { totalCount: total, openCount, waitingCount, resolvedCount },
    });
  } catch (e) {
    console.error("Admin tickets GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
