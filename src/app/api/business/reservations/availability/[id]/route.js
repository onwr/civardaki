import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function isTimeString(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

export async function PATCH(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await prisma.business_reservation_availability.findFirst({
      where: { id, settings: { businessId } },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Uygunluk kaydı bulunamadı." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const data = {};
    if (body.dayOfWeek !== undefined) {
      const day = String(body.dayOfWeek || "").toUpperCase();
      if (!DAYS.includes(day)) return NextResponse.json({ error: "Geçersiz gün." }, { status: 400 });
      data.dayOfWeek = day;
    }
    if (body.startTime !== undefined) {
      const startTime = String(body.startTime || "").trim();
      if (!isTimeString(startTime)) return NextResponse.json({ error: "Geçersiz başlangıç saati." }, { status: 400 });
      data.startTime = startTime;
    }
    if (body.endTime !== undefined) {
      const endTime = String(body.endTime || "").trim();
      if (!isTimeString(endTime)) return NextResponse.json({ error: "Geçersiz bitiş saati." }, { status: 400 });
      data.endTime = endTime;
    }
    if (body.isEnabled !== undefined) {
      data.isEnabled = Boolean(body.isEnabled);
    }

    if ((data.startTime || body.startTime !== undefined) && (data.endTime || body.endTime !== undefined)) {
      if (String(data.startTime || body.startTime) >= String(data.endTime || body.endTime)) {
        return NextResponse.json({ error: "Saat aralığı geçersiz." }, { status: 400 });
      }
    }

    const updated = await prisma.business_reservation_availability.update({
      where: { id },
      data,
    });
    return NextResponse.json({ availability: updated });
  } catch (error) {
    console.error("BUSINESS RESERVATION AVAILABILITY PATCH ERROR:", error);
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
    const existing = await prisma.business_reservation_availability.findFirst({
      where: { id, settings: { businessId } },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Uygunluk kaydı bulunamadı." }, { status: 404 });
    }
    await prisma.business_reservation_availability.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BUSINESS RESERVATION AVAILABILITY DELETE ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
