import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;
        const { searchParams } = new URL(request.url || "", "http://localhost");
        const status = searchParams.get("status");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");

        const where = { businessId };
        if (status && status !== "all") {
            where.status = status;
        }
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom + "T00:00:00.000Z");
            if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
        }

        const orders = await prisma.order.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Orders GET Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Missing ID or status" }, { status: 400 });
        }

        // Verify ownership
        const existingOrder = await prisma.order.findUnique({
            where: { id },
            select: { businessId: true },
        });

        if (!existingOrder || existingOrder.businessId !== businessId) {
            return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
            include: { items: true, business: { select: { name: true } } },
        });

        const userId = updatedOrder.userId;
        const normalizedStatus = updatedOrder.status != null ? String(updatedOrder.status).toLowerCase() : null;
        if (userId && normalizedStatus) {
            if (typeof global.io === "undefined") {
                console.warn("Socket emit skipped: global.io not available (API may be running in a different process).");
            } else {
                try {
                    const roomName = `user_${String(userId)}`;
                    global.io.to(roomName).emit("order_status_updated", {
                        orderId: id,
                        status: normalizedStatus,
                        orderNumber: updatedOrder.orderNumber || null,
                        businessName: updatedOrder.business?.name || null,
                    });
                } catch (e) {
                    console.warn("Socket emit order_status_updated failed:", e?.message);
                }
            }
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Orders PATCH Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
