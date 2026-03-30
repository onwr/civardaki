import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function assertOwn(businessId, id) {
  return prisma.business_purchase.findFirst({
    where: { id, businessId },
    include: {
      items: true,
      supplier: { select: { id: true, name: true } },
      cashAccount: { select: { id: true, name: true } },
    },
  });
}

export async function GET(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const row = await assertOwn(session.user.businessId, id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      purchase: {
        ...row,
        purchaseDate: row.purchaseDate.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("Purchase GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
