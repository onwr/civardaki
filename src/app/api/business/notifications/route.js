import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/business/notifications — unread count + recent list
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "BUSINESS") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const businessId = session.user.businessId;
        if (!businessId) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const limit = Math.min(20, parseInt(searchParams.get("limit") || "10", 10));

        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { businessId },
                orderBy: { createdAt: "desc" },
                take: limit,
                select: {
                    id: true,
                    title: true,
                    body: true,
                    type: true,
                    isRead: true,
                    linkUrl: true,
                    createdAt: true
                }
            }),
            prisma.notification.count({
                where: { businessId, isRead: false }
            })
        ]);

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);
        return NextResponse.json({ error: "Bildirimler alınamadı." }, { status: 500 });
    }
}

// PATCH /api/business/notifications — mark all as read
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "BUSINESS") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const businessId = session.user.businessId;
        if (!businessId) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        await prisma.notification.updateMany({
            where: { businessId, isRead: false },
            data: { isRead: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("MARK READ ERROR:", error);
        return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
    }
}
