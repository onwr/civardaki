import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req) {
    try {
        // --- 1. Rate Limit Check for Reviews ---
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
        // Max 3 reviews per minute per IP to prevent spam burst
        const rateLimit = checkRateLimit(`review_${ip}`, 3, 60 * 1000);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Çok fazla yorum gönderdiniz. Lütfen bir süre bekleyip tekrar deneyin." },
                { status: 429 }
            );
        }

        // --- 2. IP Hashing for database tracking ---
        // Hash IP so we don't store raw PII without consent, but can still block abusers
        const ipHash = crypto.createHash('sha256').update(ip + process.env.NEXTAUTH_SECRET).digest('hex').substring(0, 16);

        const body = await req.json();
        const { businessSlug, reviewerName, reviewerEmail, reviewerPhone, rating, content, _honeypot } = body;

        // --- 3. Spam Check (Honeypot) ---
        if (_honeypot && _honeypot.length > 0) {
            // Silently pretend it worked for bots
            return NextResponse.json({ success: true, message: "Yorumunuz alındı." }, { status: 200 });
        }

        // --- 4. Basic Validation ---
        if (!businessSlug || !reviewerName || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Lütfen adınızı ve geçerli bir puan aralığını (1-5) girin." }, { status: 400 });
        }

        if (content && content.length > 2000) {
            return NextResponse.json({ error: "Yorumunuz çok uzun. Maksimum 2000 karakter olmalıdır." }, { status: 400 });
        }

        // Validate business
        const business = await prisma.business.findUnique({
            where: { slug: businessSlug },
            select: { id: true, name: true }
        });

        if (!business) {
            return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
        }

        // Check if this IP has already rated this business within the last 24 hours (Anti-spam)
        const recentReview = await prisma.review.findFirst({
            where: {
                businessId: business.id,
                ipHash: ipHash,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
                }
            }
        });

        if (recentReview) {
            return NextResponse.json({ error: "Bu işletme için yakın zamanda zaten bir değerlendirme yaptınız." }, { status: 429 });
        }

        // --- 5. Create Pending Review ---
        const newReview = await prisma.review.create({
            data: {
                businessId: business.id,
                rating: Number(rating),
                content: content?.trim() || null,
                reviewerName: reviewerName.trim(),
                reviewerEmail: reviewerEmail?.trim() || null,
                reviewerPhone: reviewerPhone?.trim() || null,
                ipHash: ipHash,
                isApproved: false, // Must be approved by business owner
            }
        });

        // 6. Notify Business (In-App)
        await prisma.notification.create({
            data: {
                businessId: business.id,
                title: `Yeni Değerlendirme Bekliyor`,
                body: `${reviewerName} işletmenize ${rating} yıldız verdi. Onayınızı bekliyor.`,
                type: "REVIEW",
                linkUrl: "/business/reviews"
            }
        }).catch(e => console.error("[review] notification fail:", e));

        return NextResponse.json({
            success: true,
            message: "Değerlendirmeniz alındı ve işletme onayına sunuldu. Teşekkür ederiz!",
            reviewId: newReview.id
        }, { status: 201 });

    } catch (error) {
        console.error("PUBLIC REVIEW API ERROR:", error);
        return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
    }
}
