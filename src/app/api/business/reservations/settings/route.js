import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureSettings(businessId) {
  let settings = await prisma.business_reservation_settings.findUnique({
    where: { businessId },
  });
  if (!settings) {
    settings = await prisma.business_reservation_settings.create({
      data: { businessId },
    });
  }
  return settings;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;

    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [business, settings] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        select: { reservationEnabled: true },
      }),
      ensureSettings(businessId),
    ]);

    const [availability, questions] = await Promise.all([
      prisma.business_reservation_availability.findMany({
        where: { settingsId: settings.id },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      }),
      prisma.business_reservation_question.findMany({
        where: { settingsId: settings.id },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          options: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
    ]);

    return NextResponse.json({
      reservationEnabled: business?.reservationEnabled !== false,
      settings: {
        id: settings.id,
        timezone: settings.timezone,
        slotDurationMin: settings.slotDurationMin,
        minNoticeMinutes: settings.minNoticeMinutes,
        maxAdvanceDays: settings.maxAdvanceDays,
      },
      availability,
      questions,
    });
  } catch (error) {
    console.error("BUSINESS RESERVATION SETTINGS GET ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;

    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const settings = await ensureSettings(businessId);
    const settingsUpdate = {};
    if (body.settings && typeof body.settings === "object") {
      const s = body.settings;
      if (typeof s.timezone === "string" && s.timezone.trim()) {
        settingsUpdate.timezone = s.timezone.trim();
      }
      if (s.slotDurationMin != null) {
        const n = Number(s.slotDurationMin);
        if (!Number.isNaN(n)) settingsUpdate.slotDurationMin = Math.max(15, Math.min(240, Math.round(n)));
      }
      if (s.minNoticeMinutes != null) {
        const n = Number(s.minNoticeMinutes);
        if (!Number.isNaN(n)) settingsUpdate.minNoticeMinutes = Math.max(0, Math.min(10080, Math.round(n)));
      }
      if (s.maxAdvanceDays != null) {
        const n = Number(s.maxAdvanceDays);
        if (!Number.isNaN(n)) settingsUpdate.maxAdvanceDays = Math.max(1, Math.min(365, Math.round(n)));
      }
    }

    const [business, updatedSettings] = await Promise.all([
      typeof body.reservationEnabled === "boolean"
        ? prisma.business.update({
            where: { id: businessId },
            data: { reservationEnabled: body.reservationEnabled },
            select: { reservationEnabled: true },
          })
        : prisma.business.findUnique({
            where: { id: businessId },
            select: { reservationEnabled: true },
          }),
      Object.keys(settingsUpdate).length
        ? prisma.business_reservation_settings.update({
            where: { id: settings.id },
            data: settingsUpdate,
          })
        : prisma.business_reservation_settings.findUnique({ where: { id: settings.id } }),
    ]);

    return NextResponse.json({
      reservationEnabled: business.reservationEnabled,
      settings: {
        id: updatedSettings.id,
        timezone: updatedSettings.timezone,
        slotDurationMin: updatedSettings.slotDurationMin,
        minNoticeMinutes: updatedSettings.minNoticeMinutes,
        maxAdvanceDays: updatedSettings.maxAdvanceDays,
      },
    });
  } catch (error) {
    console.error("BUSINESS RESERVATION SETTINGS PATCH ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
