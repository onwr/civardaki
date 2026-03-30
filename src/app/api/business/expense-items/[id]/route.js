import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Geçersiz id" }, { status: 400 });
    }

    const businessId = session.user.businessId;
    const item = await prisma.expense_item.findFirst({
      where: { id, businessId },
    });

    if (!item) {
      return NextResponse.json({ error: "Masraf kalemi bulunamadı" }, { status: 404 });
    }

    await prisma.expense_item.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("expense-items DELETE:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
