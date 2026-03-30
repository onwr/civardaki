import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const TAG_COLORS = ["white", "green", "sky", "yellow", "slate", "red"];

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    const body = await req.json();
    const categoryId = body.categoryId;
    const name = (body.name || "").trim();
    if (!categoryId || !name) {
      return NextResponse.json({ error: "Kategori ve masraf kalemi adı gerekli" }, { status: 400 });
    }

    const cat = await prisma.expense_category.findFirst({
      where: { id: categoryId, businessId },
    });
    if (!cat) {
      return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
    }

    const count = await prisma.expense_item.count({ where: { categoryId } });
    const picked =
      body.tagColor && TAG_COLORS.includes(body.tagColor)
        ? body.tagColor
        : TAG_COLORS[count % TAG_COLORS.length];
    const item = await prisma.expense_item.create({
      data: {
        id: crypto.randomUUID(),
        businessId,
        categoryId,
        name,
        tagColor: picked,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("expense-items POST:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
