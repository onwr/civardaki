import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      include: {
        children: {
          where: {
            isActive: true,
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
            path: true,
            level: true,
            description: true,
            keywords: true,
          },
        },
        _count: {
          select: {
            businesscategory: true,
          },
        },
      },
    });

    const formatted = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      color: category.color,
      path: category.path,
      level: category.level,
      description: category.description,
      keywords: category.keywords,
      count: category._count.businesscategory,
      children: category.children,
    }));

    return NextResponse.json({ categories: formatted }, { status: 200 });
  } catch (e) {
    console.error("Public categories API error:", e);
    return NextResponse.json(
      { message: "Kategoriler alınırken hata oluştu." },
      { status: 500 }
    );
  }
}