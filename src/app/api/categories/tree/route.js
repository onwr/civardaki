import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
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
      },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Categories tree error:", error);
    return NextResponse.json(
      { message: "Kategoriler alınamadı." },
      { status: 500 }
    );
  }
}