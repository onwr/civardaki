import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

function parseDay(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** [rangeStart, rangeEnd] kapsamıyla zaman aralığı kesişimi */
function overlapWhere(startField, endField, rangeStart, rangeEnd) {
    return {
        AND: [
            { [startField]: { lte: rangeEnd } },
            { [endField]: { gte: rangeStart } },
        ],
    };
}

function mapCalendarEvent(e) {
    return {
        source: "CALENDAR",
        id: e.id,
        title: e.title,
        customerName: e.customerName,
        startTime: e.startTime.toISOString(),
        endTime: e.endTime.toISOString(),
        category: e.category,
        status: e.status,
        priority: e.priority,
        description: e.description ?? null,
        readOnly: false,
    };
}

function mapReservation(r) {
    return {
        source: "RESERVATION",
        id: r.id,
        title: r.serviceName,
        customerName: r.customerName,
        startTime: r.startAt.toISOString(),
        endTime: r.endAt.toISOString(),
        category: "RESERVATION",
        status: r.status,
        priority: "MEDIUM",
        description: r.notes ?? null,
        readOnly: true,
        customerPhone: r.customerPhone ?? null,
        customerEmail: r.customerEmail ?? null,
    };
}

function buildStats({ total, calendarCount, reservationCount, pendingInRange }) {
    const slotHeuristic = 12;
    const occupancy = Math.min(100, Math.round((total / slotHeuristic) * 100));
    let noShowRisk = "Düşük";
    if (pendingInRange >= 5) noShowRisk = "Yüksek";
    else if (pendingInRange >= 2) noShowRisk = "Orta";

    return {
        occupancy,
        estimatedVolume: 0,
        estimatedVolumeNote:
            "Tahmini ciro bu görünümde hesaplanmıyor; randevu tutarları ayrı modüllerde takip edilir.",
        noShowRisk,
        pendingRequests: pendingInRange,
        totalScheduled: total,
        calendarEventCount: calendarCount,
        reservationCount,
    };
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date");
        const fromStr = searchParams.get("from");
        const toStr = searchParams.get("to");
        const businessId = session.user.businessId;

        let rangeStart;
        let rangeEnd;

        if (fromStr && toStr) {
            const fromD = parseDay(fromStr);
            const toD = parseDay(toStr);
            if (!fromD || !toD) {
                return NextResponse.json({ error: "Geçersiz from/to" }, { status: 400 });
            }
            rangeStart = startOfDay(fromD);
            rangeEnd = endOfDay(toD);
        } else if (dateStr) {
            const d = parseDay(dateStr);
            if (!d) {
                return NextResponse.json({ error: "Geçersiz date" }, { status: 400 });
            }
            rangeStart = startOfDay(d);
            rangeEnd = endOfDay(d);
        } else {
            const today = new Date();
            rangeStart = startOfDay(today);
            rangeEnd = endOfDay(today);
        }

        const calWhere = {
            businessId,
            ...overlapWhere("startTime", "endTime", rangeStart, rangeEnd),
        };

        const resWhere = {
            businessId,
            ...overlapWhere("startAt", "endAt", rangeStart, rangeEnd),
        };

        const [calendarRows, reservationRows, pendingInRange] = await Promise.all([
            prisma.calendar_event.findMany({
                where: calWhere,
                orderBy: { startTime: "asc" },
            }),
            prisma.reservation.findMany({
                where: resWhere,
                orderBy: { startAt: "asc" },
            }),
            prisma.reservation.count({
                where: {
                    businessId,
                    status: "PENDING",
                    ...overlapWhere("startAt", "endAt", rangeStart, rangeEnd),
                },
            }),
        ]);

        const calMapped = calendarRows.map(mapCalendarEvent);
        const resMapped = reservationRows.map(mapReservation);
        const events = [...calMapped, ...resMapped].sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime),
        );

        const stats = buildStats({
            total: events.length,
            calendarCount: calMapped.length,
            reservationCount: resMapped.length,
            pendingInRange,
        });

        return NextResponse.json({
            events,
            stats,
            range: {
                from: rangeStart.toISOString(),
                to: rangeEnd.toISOString(),
            },
        });
    } catch (error) {
        console.error("Calendar GET Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, customerName, startTime, endTime, category, priority, description, status } = body;

        const allowedStatus = new Set(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]);
        const allowedPriority = new Set(["LOW", "MEDIUM", "HIGH"]);
        const nextStatus = allowedStatus.has(status) ? status : "CONFIRMED";
        const nextPriority = allowedPriority.has(priority) ? priority : "MEDIUM";

        const event = await prisma.calendar_event.create({
            data: {
                businessId: session.user.businessId,
                title,
                customerName,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                category: category || "APPOINTMENT",
                priority: nextPriority,
                status: nextStatus,
                description,
            },
        });

        return NextResponse.json(mapCalendarEvent(event));
    } catch (error) {
        console.error("Calendar POST Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, title, customerName, startTime, endTime, category, priority, description, status } =
            body;

        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "id gerekli" }, { status: 400 });
        }

        const businessId = session.user.businessId;

        const allowedStatus = new Set(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]);
        const allowedPriority = new Set(["LOW", "MEDIUM", "HIGH"]);

        const data = {};
        if (title !== undefined) data.title = String(title).trim();
        if (customerName !== undefined) data.customerName = customerName ? String(customerName).trim() : null;
        if (startTime !== undefined) data.startTime = new Date(startTime);
        if (endTime !== undefined) data.endTime = new Date(endTime);
        if (category !== undefined) data.category = category;
        if (priority !== undefined) {
            if (!allowedPriority.has(priority)) {
                return NextResponse.json({ error: "Geçersiz öncelik" }, { status: 400 });
            }
            data.priority = priority;
        }
        if (description !== undefined) data.description = description == null ? null : String(description);
        if (status !== undefined) {
            if (!allowedStatus.has(status)) {
                return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
            }
            data.status = status;
        }

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
        }

        const existing = await prisma.calendar_event.findFirst({
            where: { id, businessId },
        });
        if (!existing) {
            return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
        }

        const updated = await prisma.calendar_event.update({
            where: { id },
            data,
        });

        return NextResponse.json(mapCalendarEvent(updated));
    } catch (error) {
        console.error("Calendar PATCH Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "id gerekli" }, { status: 400 });
        }

        const existing = await prisma.calendar_event.findFirst({
            where: { id, businessId: session.user.businessId },
        });
        if (!existing) {
            return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
        }

        await prisma.calendar_event.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Calendar DELETE Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
