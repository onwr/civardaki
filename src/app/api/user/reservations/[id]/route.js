import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "").toLowerCase();
    if (action !== "cancel") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    const reservation = await prisma.reservation.findFirst({
      where: { id, userId },
      select: {
        id: true,
        status: true,
        startAt: true,
      },
    });
    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    if (!["PENDING", "CONFIRMED"].includes(reservation.status)) {
      return NextResponse.json(
        { error: "Bu randevu artık iptal edilemez." },
        { status: 400 },
      );
    }

    const diffMs = new Date(reservation.startAt).getTime() - Date.now();
    const minDiff = 24 * 60 * 60 * 1000;
    if (diffMs < minDiff) {
      return NextResponse.json(
        { error: "Randevuyu sadece en az 24 saat kala iptal edebilirsiniz." },
        { status: 400 },
      );
    }

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: "CANCELLED" },
      select: {
        id: true,
        status: true,
        startAt: true,
        endAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ reservation: updated });
  } catch (error) {
    console.error("USER RESERVATION CANCEL PATCH ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
