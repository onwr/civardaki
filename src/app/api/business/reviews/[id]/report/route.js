import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: reviewId } = await params;
        const businessId = session.user.businessId;

        const existingReview = await prisma.review.findFirst({
            where: { id: reviewId, businessId },
        });

        if (!existingReview) {
            return NextResponse.json({ error: "Yorum bulunamadı." }, { status: 404 });
        }

        await prisma.review.update({
            where: { id: reviewId },
            data: {
                reportedAt: new Date(),
                reportedByBusinessId: businessId,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Şikayet iletildi, inceleme ekibimiz değerlendirecektir.",
        });
    } catch (error) {
        console.error("Review report error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
