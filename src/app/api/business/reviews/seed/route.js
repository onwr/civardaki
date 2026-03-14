import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;

        const demoReviews = [
            {
                rating: 5,
                content: "Mükemmel hizmet! Her şey çok lezzetliydi ve çok hızlı geldi. Teşekkürler!",
                reviewerName: "Caner Kürkaya",
                reviewerEmail: "caner@example.com",
                metrics: JSON.stringify({ quality: 3, speed: 3, packaging: 3 }),
                likes: 12,
                isApproved: true,
                status: "APPROVED"
            },
            {
                rating: 4,
                content: "Lezzet harika ama servis biraz daha hızlı olabilirdi. Yine de tavsiye ederim.",
                reviewerName: "Elif Demir",
                metrics: JSON.stringify({ quality: 3, speed: 2, packaging: 3 }),
                likes: 5,
                isApproved: true,
                status: "APPROVED"
            },
            {
                rating: 2,
                content: "Paketleme çok kötüydü, yemekler soğumuştu. Bu sefer hayal kırıklığı oldu.",
                reviewerName: "Mustafa Kaya",
                metrics: JSON.stringify({ quality: 2, speed: 1, packaging: 1 }),
                likes: 2,
                isApproved: true,
                status: "APPROVED"
            },
            {
                rating: 5,
                content: "Her zamanki gibi 10 numara! Kadıköy'ün en iyisi.",
                reviewerName: "Selin Ak",
                metrics: JSON.stringify({ quality: 3, speed: 3, packaging: 3 }),
                likes: 8,
                isApproved: true,
                status: "APPROVED"
            },
            {
                rating: 3,
                content: "Döner güzel ama porsiyon biraz küçük gibi geldi bana.",
                reviewerName: "Mehmet Yılmaz",
                metrics: JSON.stringify({ quality: 2, speed: 3, packaging: 2 }),
                likes: 1,
                isApproved: true,
                status: "APPROVED"
            }
        ];

        for (const reviewData of demoReviews) {
            await prisma.review.create({
                data: {
                    ...reviewData,
                    businessId,
                    id: Math.random().toString(36).substring(2, 15)
                }
            });
        }

        return NextResponse.json({ success: true, count: demoReviews.length });
    } catch (error) {
        console.error("Reviews Seed Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
