import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const SORT_FIELDS = ["createdAt", "updatedAt", "name", "role", "lastLoginAt"];
const ROLES = ["USER", "BUSINESS", "ADMIN"];
const STATUSES = ["ACTIVE", "SUSPENDED", "BANNED", "PENDING"];

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
    const page = safeInt(searchParams.get("page"), 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, safeInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE));
    const role = safeStr(searchParams.get("role"));
    const status = safeStr(searchParams.get("status"));
    const verified = searchParams.get("verified");
    const hasBusiness = searchParams.get("hasBusiness");
    const sortBy = SORT_FIELDS.includes(safeStr(searchParams.get("sortBy"))) ? searchParams.get("sortBy") : "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const conditions = [];

    if (q) {
      conditions.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          {
            ownedbusiness: {
              some: {
                business: {
                  name: { contains: q, mode: "insensitive" },
                },
              },
            },
          },
        ],
      });
    }

    if (role && ROLES.includes(role)) conditions.push({ role });
    if (status && STATUSES.includes(status)) conditions.push({ status });
    if (verified === "true") conditions.push({ emailVerified: { not: null } });
    else if (verified === "false") conditions.push({ emailVerified: null });
    if (hasBusiness === "true") conditions.push({ ownedbusiness: { some: {} } });
    else if (hasBusiness === "false") conditions.push({ ownedbusiness: { none: {} } });

    const where = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };

    const orderBy =
      sortBy === "name"
        ? { name: sortOrder }
        : sortBy === "createdAt"
          ? { createdAt: sortOrder }
          : sortBy === "updatedAt"
            ? { updatedAt: sortOrder }
            : sortBy === "role"
              ? { role: sortOrder }
              : sortBy === "lastLoginAt"
                ? { lastLoginAt: sortOrder }
                : { createdAt: "desc" };

    const skip = (page - 1) * pageSize;

    const [items, total, totalUsers, totalCustomers, totalBusinesses, totalAdmins, suspendedCount, bannedCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          ownedbusiness: {
            where: { isPrimary: true },
            take: 1,
            select: {
              business: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "BUSINESS" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { status: "BANNED" } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const normalized = items.map((u) => {
      const { ownedbusiness, ...rest } = u;
      return {
        ...rest,
        business: ownedbusiness?.[0]?.business ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      items: normalized,
      stats: {
        totalUsers,
        totalCustomers,
        totalBusinesses,
        totalAdmins,
        suspendedCount,
        bannedCount,
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Admin users list error:", err);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
