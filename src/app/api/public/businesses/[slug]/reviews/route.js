import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
    try {
        const resolved = typeof params?.then === "function" ? await params : params;
        const slug = resolved?.slug?.toString?.()?.trim();
        if (!slug) return NextResponse.json({ error: "Bad request" }, { status: 400 });
        const business = await prisma.business.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!business) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Only return APPROVED reviews on the public endpoint
        const reviews = await prisma.review.findMany({
            where: {
                businessId: business.id,
                isApproved: true
            },
            orderBy: { createdAt: "desc" },
            take: 50 // Limit to last 50 for MVP public view
        });

        return NextResponse.json({ reviews });
    } catch (error) {
        console.error("PUBLIC REVIEWS GET ERROR:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
