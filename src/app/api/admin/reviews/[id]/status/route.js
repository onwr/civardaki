import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, context) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
        const { id } = params;
        const body = await req.json().catch(() => ({}));
        const { status } = body;

        if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
            return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 });
        }

        const review = await prisma.review.update({
            where: { id },
            data: { status, isApproved: status === "APPROVED" },
            include: { business: true, user: true }
        });

        // Optional: Update the business rating dynamically here, 
        // similar to what exists in api/public/reviews (if it was an approval)

        // SPRINT 11C: Notify business owner of the approved review
        if (status === "APPROVED" && review.business && review.business.email) {
            try {
                const { sendNewReviewEmail } = await import("@/lib/mails/send-new-review");
                sendNewReviewEmail({
                    email: review.business.email,
                    businessName: review.business.name,
                    businessId: review.business.id,
                    reviewId: review.id,
                    rating: review.rating,
                    content: review.content,
                    businessSlug: review.business.slug
                }).catch(e => console.error("Logged New Review Email Failed:", e));
            } catch (e) {
                console.error("New review mailer failed to import:", e);
            }
        }

        return NextResponse.json({ status: "success", review });

    } catch (error) {
        console.error("Admin Update Review Status Error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
