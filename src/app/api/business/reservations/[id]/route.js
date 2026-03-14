import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getBusinessReservation(id, businessId) {
  if (!id || !businessId) return null;
  return prisma.reservation.findFirst({
    where: { id, businessId },
    select: { id: true, businessId: true },
  });
}

export async function PATCH(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;

    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await getBusinessReservation(id, businessId);
    if (!existing) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const body = await req.json();
    const nextStatus = typeof body.status === "string" ? body.status.trim().toUpperCase() : null;
    const statusSet = new Set(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]);

    if (nextStatus && !statusSet.has(nextStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const startAt = body.startAt ? new Date(body.startAt) : null;
    const endAt = body.endAt ? new Date(body.endAt) : null;

    if (startAt && Number.isNaN(startAt.getTime())) {
      return NextResponse.json({ error: "Invalid startAt" }, { status: 400 });
    }
    if (endAt && Number.isNaN(endAt.getTime())) {
      return NextResponse.json({ error: "Invalid endAt" }, { status: 400 });
    }
    if (startAt && endAt && startAt >= endAt) {
      return NextResponse.json({ error: "endAt must be after startAt" }, { status: 400 });
    }

    const data = {
      ...(nextStatus ? { status: nextStatus } : {}),
      ...(startAt ? { startAt } : {}),
      ...(endAt ? { endAt } : {}),
      ...(typeof body.notes === "string" ? { notes: body.notes.trim() || null } : {}),
      ...(typeof body.serviceName === "string"
        ? { serviceName: body.serviceName.trim() || "Randevu" }
        : {}),
      ...(typeof body.customerName === "string"
        ? { customerName: body.customerName.trim() || "Müşteri" }
        : {}),
      ...(typeof body.customerPhone === "string"
        ? { customerPhone: body.customerPhone.trim() || null }
        : {}),
      ...(typeof body.customerEmail === "string"
        ? { customerEmail: body.customerEmail.trim() || null }
        : {}),
    };

    const updated = await prisma.reservation.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        serviceName: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        notes: true,
        startAt: true,
        endAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ reservation: updated });
  } catch (error) {
    console.error("BUSINESS RESERVATION PATCH ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req, context) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;

    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await getBusinessReservation(id, businessId);
    if (!existing) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BUSINESS RESERVATION DELETE ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
