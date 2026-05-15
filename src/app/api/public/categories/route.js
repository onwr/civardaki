import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function GET() {
  try {
    const rows = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        _count: {
          select: {
            businesscategory: true,
          },
        },
      },
    });

    const categories = rows.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      imageUrl: item.imageUrl,
      count: item._count.businesscategory,
    }));

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Public categories error:", error);

    return NextResponse.json(
      {
        success: false,
        categories: [],
      },
      { status: 500 }
    );
  }
}