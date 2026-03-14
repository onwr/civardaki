import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const SORT_FIELDS = ["createdAt", "updatedAt", "name", "leadsCount", "reviewsCount", "expiresAt"];

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
    const status = safeStr(searchParams.get("status")); // active | inactive
    const subscription = safeStr(searchParams.get("subscription")); // TRIAL | ACTIVE | EXPIRED
    const verified = searchParams.get("verified"); // "true" | "false"
    const ownerVerified = searchParams.get("ownerVerified"); // "true" | "false"
    const ownerStatus = safeStr(searchParams.get("ownerStatus")); // ACTIVE | SUSPENDED | BANNED | PENDING
    const reservationEnabled = searchParams.get("reservationEnabled"); // "true" | "false"
    const category = safeStr(searchParams.get("category")); // primaryCategoryId
    const city = safeStr(searchParams.get("city"));
    const plan = safeStr(searchParams.get("plan")); // BASIC | PREMIUM
    const sortBy = SORT_FIELDS.includes(safeStr(searchParams.get("sortBy"))) ? searchParams.get("sortBy") : "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const conditions = [];

    if (q) {
      conditions.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { slug: { contains: q, mode: "insensitive" } },
          {
            ownedbusiness: {
              some: {
                user: {
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                  ],
                },
              },
            },
          },
        ],
      });
    }

    if (status === "active") conditions.push({ isActive: true });
    else if (status === "inactive") conditions.push({ isActive: false });

    if (verified === "true") conditions.push({ isVerified: true });
    else if (verified === "false") conditions.push({ isVerified: false });

    if (ownerVerified === "true") {
      conditions.push({
        ownedbusiness: {
          some: { isPrimary: true, user: { emailVerified: { not: null } } },
        },
      });
    } else if (ownerVerified === "false") {
      conditions.push({
        ownedbusiness: {
          some: { isPrimary: true, user: { emailVerified: null } },
        },
      });
    }

    if (["ACTIVE", "SUSPENDED", "BANNED", "PENDING"].includes(ownerStatus)) {
      conditions.push({
        ownedbusiness: {
          some: { isPrimary: true, user: { status: ownerStatus } },
        },
      });
    }

    if (reservationEnabled === "true") conditions.push({ reservationEnabled: true });
    else if (reservationEnabled === "false") conditions.push({ reservationEnabled: false });

    if (subscription && ["TRIAL", "ACTIVE", "EXPIRED"].includes(subscription)) {
      conditions.push({ businesssubscription: { status: subscription } });
    }

    if (plan && ["BASIC", "PREMIUM"].includes(plan)) {
      conditions.push({ businesssubscription: { plan } });
    }

    if (category) conditions.push({ primaryCategoryId: category });
    if (city) conditions.push({ city });

    const where = conditions.length === 0 ? {} : conditions.length === 1 ? conditions[0] : { AND: conditions };

    const orderBy =
      sortBy === "name"
        ? { name: sortOrder }
        : sortBy === "createdAt"
          ? { createdAt: sortOrder }
          : sortBy === "updatedAt"
            ? { updatedAt: sortOrder }
            : sortBy === "leadsCount"
              ? { lead: { _count: sortOrder } }
              : sortBy === "reviewsCount"
                ? { review: { _count: sortOrder } }
                : sortBy === "expiresAt"
                  ? { businesssubscription: { expiresAt: sortOrder } }
                  : { createdAt: "desc" };

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.business.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          businesssubscription: true,
          primaryCategory: { select: { id: true, name: true } },
          _count: {
            select: { lead: true, review: true, product: true, order: true },
          },
          ownedbusiness: {
            where: { isPrimary: true },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  emailVerified: true,
                  status: true,
                  role: true,
                },
              },
            },
          },
        },
      }),
      prisma.business.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const normalized = items.map((b) => {
      const { businesssubscription, ownedbusiness, _count: c, ...rest } = b;
      return {
        ...rest,
        subscription: businesssubscription
          ? {
              id: businesssubscription.id,
              status: businesssubscription.status,
              plan: businesssubscription.plan,
              startedAt: businesssubscription.startedAt,
              expiresAt: businesssubscription.expiresAt,
            }
          : null,
        owner: ownedbusiness?.[0]?.user ?? null,
        _count: c
          ? { leads: c.lead, reviews: c.review, products: c.product, orders: c.order }
          : { leads: 0, reviews: 0, products: 0, orders: 0 },
      };
    });

    return NextResponse.json({
      success: true,
      items: normalized,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error("Admin businesses list error:", err);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
