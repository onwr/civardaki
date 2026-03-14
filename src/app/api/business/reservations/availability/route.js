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

async function ensureSettings(businessId) {
  let settings = await prisma.business_reservation_settings.findUnique({
    where: { businessId },
  });
  if (!settings) {
    settings = await prisma.business_reservation_settings.create({ data: { businessId } });
  }
  return settings;
}

function isTimeString(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await ensureSettings(businessId);
    const rows = await prisma.business_reservation_availability.findMany({
      where: { settingsId: settings.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json({ availability: rows });
  } catch (error) {
    console.error("BUSINESS RESERVATION AVAILABILITY GET ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const dayOfWeek = String(body.dayOfWeek || "").toUpperCase();
    const startTime = String(body.startTime || "").trim();
    const endTime = String(body.endTime || "").trim();
    const isEnabled = body.isEnabled !== false;

    if (!DAYS.includes(dayOfWeek)) {
      return NextResponse.json({ error: "Geçersiz gün." }, { status: 400 });
    }
    if (!isTimeString(startTime) || !isTimeString(endTime) || startTime >= endTime) {
      return NextResponse.json({ error: "Saat aralığı geçersiz." }, { status: 400 });
    }

    const settings = await ensureSettings(businessId);
    const created = await prisma.business_reservation_availability.create({
      data: {
        settingsId: settings.id,
        dayOfWeek,
        startTime,
        endTime,
        isEnabled,
      },
    });

    return NextResponse.json({ availability: created });
  } catch (error) {
    console.error("BUSINESS RESERVATION AVAILABILITY POST ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
