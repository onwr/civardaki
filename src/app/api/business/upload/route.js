import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processAndSaveMedia } from "@/lib/media";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        // --- Rate Limit Check (Uploads) ---
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || session.user.id || "unknown-ip";
        const rateLimit = checkRateLimit(`upload_${ip}`, 15, 60 * 1000);
        if (!rateLimit.success) {
            return NextResponse.json(
                { message: "Çok fazla dosya yüklediniz. Lütfen bir süre bekleyip tekrar deneyin." },
                { status: 429 }
            );
        }

        let businessId = session.user.businessId;
        let businessSlug = session.user.businessSlug;
        if (!businessId) return NextResponse.json({ message: "Business not found" }, { status: 404 });
        if (!businessSlug) {
            const biz = await prisma.business.findUnique({ where: { id: businessId }, select: { slug: true } });
            if (!biz) return NextResponse.json({ message: "Business not found" }, { status: 404 });
            businessSlug = biz.slug;
        }

        const form = await req.formData();
        const file = form.get("file");
        const type = form.get("type")?.toString() || "GALLERY"; // LOGO, COVER, GALLERY, PRODUCT vs.

        try {
            const { url, media } = await processAndSaveMedia(file, type, businessId, businessSlug);
            return NextResponse.json({ message: "Yükleme başarılı", url, media }, { status: 201 });
        } catch (e) {
            return NextResponse.json({ message: e.message }, { status: 400 });
        }
    } catch (error) {
        console.error("UPLOAD SETTINGS API ERROR:", error);
        return NextResponse.json({ message: "Sunucu hatası." }, { status: 500 });
    }
}
