import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !["BUSINESS", "ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id: reviewId } = await params;
        const businessId = session.user.businessId;

        const body = await req.json();
        const { isApproved } = body;

        if (typeof isApproved !== "boolean") {
            return NextResponse.json({ message: "Geçersiz işlem." }, { status: 400 });
        }

        const review = await prisma.review.findFirst({
            where: { id: reviewId, businessId }
        });

        if (!review) {
            return NextResponse.json({ message: "Yorum bulunamadı." }, { status: 404 });
        }

        // Only process if status actually changes
        if (review.isApproved === isApproved) {
            return NextResponse.json({ message: "Durum zaten güncel." });
        }

        // Exact Recalculation via interactive transaction
        // On Approve: ratingSum + rating, reviewCount + 1
        // On Reject: ratingSum - rating, reviewCount - 1
        const updatedBusiness = await prisma.$transaction(async (tx) => {
            // Update review
            await tx.review.update({
                where: { id: reviewId },
                data: { isApproved }
            });

            // Update Business Exact Rating
            const biz = await tx.business.findUnique({
                where: { id: businessId },
                select: { reviewCount: true, ratingSum: true, rating: true }
            });

            const newCount = isApproved ? biz.reviewCount + 1 : Math.max(0, biz.reviewCount - 1);
            const newSum = isApproved ? biz.ratingSum + review.rating : Math.max(0, biz.ratingSum - review.rating);

            // Recompute float (if count = 0, float = 0)
            const newRating = newCount > 0 ? Number((newSum / newCount).toFixed(2)) : 0;

            return await tx.business.update({
                where: { id: businessId },
                data: {
                    reviewCount: newCount,
                    ratingSum: newSum,
                    rating: newRating
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: isApproved ? "Yorum onaylandı ve puan güncellendi." : "Yorum gizlendi ve puan güncellendi.",
            newBusinessStats: {
                reviewCount: updatedBusiness.reviewCount,
                ratingSum: updatedBusiness.ratingSum,
                rating: updatedBusiness.rating
            }
        });
    } catch (error) {
        console.error("PATCH REVIEW ERROR:", error);
        return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
    }
}
