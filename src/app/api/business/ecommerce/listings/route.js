import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const platform = (searchParams.get("platform") ?? "ALL").trim();
    const status = (searchParams.get("status") ?? "ALL").trim().toUpperCase();
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * limit;

    if (platform && platform !== "ALL" && platform !== "Civardaki") {
      return NextResponse.json({
        listings: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        summary: {
          activeListings: 0,
          totalListings: 0,
          syncStatus: "Pasif",
        },
      });
    }

    const where = { businessId };
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }
    if (status === "ACTIVE") where.isActive = true;
    if (status === "PENDING") where.isActive = false;

    const [products, total, leadCounts] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          discountPrice: true,
          imageUrl: true,
          isActive: true,
          categoryId: true,
          productcategory: { select: { name: true } },
        },
      }),
      prisma.product.count({ where }),
      prisma.lead.groupBy({
        by: ["productId"],
        where: { businessId, productId: { not: null } },
        _count: { productId: true },
      }),
    ]);

    const countByProductId = Object.fromEntries(
      leadCounts.map((x) => [x.productId, x._count.productId])
    );

    const listings = products.map((p) => ({
      id: p.id,
      productName: p.name,
      slug: p.slug,
      platform: "Civardaki",
      status: p.isActive ? "ACTIVE" : "PENDING",
      price: Number(p.price) ?? 0,
      sales: countByProductId[p.id] ?? 0,
      imageUrl: p.imageUrl,
      categoryName: p.productcategory?.name,
    }));

    const activeCount = await prisma.product.count({
      where: { businessId, isActive: true },
    });

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        activeListings: activeCount,
        totalListings: total,
        syncStatus: platform && platform !== "ALL" ? platform : "Civardaki",
      },
    });
  } catch (error) {
    console.error("Ecommerce listings GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
