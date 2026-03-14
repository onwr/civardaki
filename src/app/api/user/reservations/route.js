import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId },
      orderBy: { startAt: "desc" },
      select: {
        id: true,
        serviceName: true,
        status: true,
        source: true,
        notes: true,
        startAt: true,
        endAt: true,
        createdAt: true,
        business: {
          select: {
            id: true,
            slug: true,
            name: true,
            media: {
              where: { type: "LOGO" },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    const normalized = reservations.map((item) => ({
      ...item,
      businessLogo: item.business?.media?.[0]?.url || null,
    }));

    return NextResponse.json({ reservations: normalized });
  } catch (error) {
    console.error("USER RESERVATIONS GET ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
