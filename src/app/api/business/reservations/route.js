import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;

    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "").trim();
    const q = (searchParams.get("q") || "").trim();
    const dateFrom = (searchParams.get("dateFrom") || "").trim();
    const dateTo = (searchParams.get("dateTo") || "").trim();

    const where = { businessId };

    if (status && status !== "all") {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { customerName: { contains: q } },
        { customerPhone: { contains: q } },
        { customerEmail: { contains: q } },
        { serviceName: { contains: q } },
      ];
    }

    if (dateFrom || dateTo) {
      where.startAt = {};
      if (dateFrom) where.startAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      if (dateTo) where.startAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    const [reservations, settings] = await Promise.all([
      prisma.reservation.findMany({
        where,
        orderBy: { startAt: "asc" },
        select: {
          id: true,
          userId: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          serviceName: true,
          notes: true,
          source: true,
          status: true,
          startAt: true,
          endAt: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.business.findUnique({
        where: { id: businessId },
        select: { reservationEnabled: true },
      }),
    ]);

    return NextResponse.json({
      reservationEnabled: settings?.reservationEnabled !== false,
      reservations,
    });
  } catch (error) {
    console.error("BUSINESS RESERVATIONS GET ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
