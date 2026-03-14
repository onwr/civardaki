import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { level: "asc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        level: true,
        path: true,
        icon: true,
        color: true,
        description: true,
        keywords: true,
      },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Categories flat error:", error);
    return NextResponse.json(
      { message: "Kategoriler alınamadı." },
      { status: 500 }
    );
  }
}