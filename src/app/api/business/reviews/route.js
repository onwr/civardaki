import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;

        const reviews = await prisma.review.findMany({
            where: {
                businessId,
                // İşletme kendi tüm yorumlarını görsün (onay bekleyen + onaylı, yanıt bekleyenler Bekleyenler'de)
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Reviews GET Error:", error);
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
        const { id, replyContent } = await request.json();

        if (!id || !replyContent) {
            return NextResponse.json({ error: "Missing ID or reply content" }, { status: 400 });
        }

        // Verify ownership
        const existingReview = await prisma.review.findUnique({
            where: { id },
            select: { businessId: true },
        });

        if (!existingReview || existingReview.businessId !== businessId) {
            return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
        }

        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                replyContent,
                repliedAt: new Date()
            }
        });

        return NextResponse.json(updatedReview);
    } catch (error) {
        console.error("Reviews PATCH Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
