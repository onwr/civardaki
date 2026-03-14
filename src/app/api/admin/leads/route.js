import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const suspiciousOnly = searchParams.get("suspicious") === "true";
        const businessId = searchParams.get("businessId");

        const where = {};
        if (suspiciousOnly) where.isSuspicious = true;
        if (businessId) where.businessId = businessId;

        const leads = await prisma.lead.findMany({
            where,
            include: {
                business: {
                    select: { name: true, slug: true }
                },
                product: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 200 // Safety limit
        });

        return NextResponse.json(leads);
    } catch (error) {
        console.error("ADMIN LEADS GET ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
