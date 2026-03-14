import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const businessId = session.user.businessId;

        await prisma.notification.updateMany({
            where: { id, businessId, isRead: false },
            data: { isRead: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH notification read error:", error);
        return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
    }
}
