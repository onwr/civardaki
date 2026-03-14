import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function buildRefCode(id) {
  return `RES-${String(id || "").slice(-6).toUpperCase()}`;
}

const JS_DAY_TO_ENUM = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
  0: "SUNDAY",
};

function toHm(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const businessSlug = (body.businessSlug || "").toString().trim();
    const customerName = (body.customerName || "").toString().trim();
    const customerPhone = (body.customerPhone || "").toString().trim();
    const customerEmail = (body.customerEmail || "").toString().trim();
    const serviceName = (body.serviceName || "").toString().trim();
    const notes = (body.notes || "").toString().trim();
    const startAtRaw = (body.startAt || "").toString().trim();
    const endAtRaw = (body.endAt || "").toString().trim();
    const questionAnswers = Array.isArray(body.questionAnswers) ? body.questionAnswers : [];

    if (!businessSlug || !customerName || !customerPhone || !serviceName || !startAtRaw || !endAtRaw) {
      return NextResponse.json(
        { error: "Eksik alan: businessSlug, customerName, customerPhone, serviceName, startAt, endAt" },
        { status: 400 },
      );
    }

    const startAt = new Date(startAtRaw);
    const endAt = new Date(endAtRaw);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      return NextResponse.json({ error: "Tarih formatı geçersiz" }, { status: 400 });
    }
    if (startAt >= endAt) {
      return NextResponse.json({ error: "Bitiş saati başlangıçtan sonra olmalı" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { slug: businessSlug },
      select: {
        id: true,
        name: true,
        isActive: true,
        reservationEnabled: true,
        reservationSettings: {
          select: {
            id: true,
            slotDurationMin: true,
            minNoticeMinutes: true,
            maxAdvanceDays: true,
            availability: {
              where: { isEnabled: true },
              select: { dayOfWeek: true, startTime: true, endTime: true },
            },
            questions: {
              where: { isActive: true },
              select: {
                id: true,
                type: true,
                isRequired: true,
                options: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    if (!business || !business.isActive) {
      return NextResponse.json({ error: "İşletme bulunamadı" }, { status: 404 });
    }
    if (business.reservationEnabled === false) {
      return NextResponse.json(
        { error: "İşletme şu anda rezervasyon almıyor." },
        { status: 400 },
      );
    }

    const settings = business.reservationSettings;
    const now = Date.now();
    if (settings) {
      const minStartAt = now + settings.minNoticeMinutes * 60 * 1000;
      const maxStartAt = now + settings.maxAdvanceDays * 24 * 60 * 60 * 1000;
      if (startAt.getTime() < minStartAt) {
        return NextResponse.json(
          { error: "Seçilen saat minimum bildirim süresinin dışında." },
          { status: 400 },
        );
      }
      if (startAt.getTime() > maxStartAt) {
        return NextResponse.json(
          { error: "Seçilen tarih izin verilen ileri tarihten daha uzak." },
          { status: 400 },
        );
      }

      const durationMin = Math.round((endAt.getTime() - startAt.getTime()) / 60000);
      if (durationMin !== settings.slotDurationMin) {
        return NextResponse.json(
          { error: "Seçilen randevu süresi işletme kurallarıyla uyumlu değil." },
          { status: 400 },
        );
      }

      const selectedDay = JS_DAY_TO_ENUM[startAt.getDay()];
      const hmStart = toHm(startAt);
      const hmEnd = toHm(endAt);
      const isWithinAvailability = settings.availability.some(
        (slot) =>
          slot.dayOfWeek === selectedDay &&
          slot.startTime <= hmStart &&
          slot.endTime >= hmEnd,
      );
      if (!isWithinAvailability) {
        return NextResponse.json(
          { error: "Seçilen gün/saat aralığı işletmenin uygunluk takviminde açık değil." },
          { status: 400 },
        );
      }
    }

    const conflict = await prisma.reservation.findFirst({
      where: {
        businessId: business.id,
        status: { not: "CANCELLED" },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { id: true },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Seçilen zaman dilimi dolu. Lütfen başka saat seçin." },
        { status: 409 },
      );
    }

    const allowedQuestionMap = new Map(
      (settings?.questions || []).map((q) => [q.id, q]),
    );
    const incomingMap = new Map();
    for (const ans of questionAnswers) {
      const questionId = String(ans?.questionId || "").trim();
      if (!questionId || !allowedQuestionMap.has(questionId)) continue;
      incomingMap.set(questionId, ans?.value);
    }
    for (const q of settings?.questions || []) {
      const value = incomingMap.get(q.id);
      const hasValue =
        Array.isArray(value) ? value.length > 0 : String(value ?? "").trim().length > 0;
      if (q.isRequired && !hasValue) {
        return NextResponse.json(
          { error: "Zorunlu rezervasyon soruları eksik." },
          { status: 400 },
        );
      }
      if ((q.type === "SINGLE_CHOICE" || q.type === "MULTI_CHOICE") && hasValue) {
        const allowedOptionIds = new Set((q.options || []).map((o) => o.id));
        const values = Array.isArray(value) ? value : [value];
        const valid = values.every((id) => allowedOptionIds.has(String(id)));
        if (!valid) {
          return NextResponse.json({ error: "Seçilen soru cevabı geçersiz." }, { status: 400 });
        }
      }
    }

    const session = await getServerSession(authOptions);
    const sessionUserId = session?.user?.id || null;

    if (sessionUserId) {
      const activeReservation = await prisma.reservation.findFirst({
        where: {
          businessId: business.id,
          userId: sessionUserId,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { id: true, startAt: true, status: true },
      });
      if (activeReservation) {
        return NextResponse.json(
          { error: "Aynı işletme için zaten aktif bir randevunuz bulunuyor." },
          { status: 409 },
        );
      }

      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentlyCreated = await prisma.reservation.findFirst({
        where: {
          businessId: business.id,
          userId: sessionUserId,
          createdAt: { gte: last24Hours },
        },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      });
      if (recentlyCreated) {
        return NextResponse.json(
          { error: "Aynı işletmeye 24 saat içinde tekrar randevu oluşturamazsınız." },
          { status: 409 },
        );
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        businessId: business.id,
        userId: sessionUserId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        serviceName,
        notes: notes || null,
        source: "PUBLIC_LISTING",
        status: "PENDING",
        startAt,
        endAt,
        answers: {
          create: [...incomingMap.entries()].map(([questionId, value]) => ({
            questionId,
            valueText: Array.isArray(value) ? JSON.stringify(value) : String(value ?? ""),
          })),
        },
      },
      select: {
        id: true,
        status: true,
        startAt: true,
        endAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      reservation: {
        ...reservation,
        referenceCode: buildRefCode(reservation.id),
      },
      business: {
        id: business.id,
        name: business.name,
      },
    });
  } catch (error) {
    console.error("PUBLIC RESERVATION CREATE ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
