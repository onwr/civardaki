import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date");
        const businessId = session.user.businessId;

        let where = { businessId };

        if (dateStr) {
            const date = new Date(dateStr);
            where.startTime = {
                gte: startOfDay(date),
                lte: endOfDay(date)
            };
        }

        const events = await prisma.calendar_event.findMany({
            where,
            orderBy: { startTime: "asc" }
        });

        // Simple occupancy and volume stats
        const stats = {
            occupancy: events.length > 10 ? 86 : events.length * 8, // Dummy logic for demo aesthetic
            estimatedVolume: events.filter(e => e.category === "RESERVATION").length * 1200,
            noShowRisk: "Düşük",
            pendingRequests: 0 // In real app, this would query a 'leads' or 'pending' table
        };

        return NextResponse.json({ events, stats });
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
        const { title, customerName, startTime, endTime, category, priority, description } = body;

        const event = await prisma.calendar_event.create({
            data: {
                id: crypto.randomUUID(),
                businessId: session.user.businessId,
                title,
                customerName,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                category: category || "APPOINTMENT",
                priority: priority || "MEDIUM",
                status: "CONFIRMED",
                description
            }
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error("Calendar POST Error:", error);
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

        await prisma.calendar_event.delete({
            where: { id, businessId: session.user.businessId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Calendar DELETE Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
