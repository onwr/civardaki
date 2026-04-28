import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCompletion } from "@/lib/completion";

// Allowlist for PATCH
const ALLOWED_FIELDS = new Set([
    "name", "category", "phone", "email", "website",
    "address", "city", "district", "description",
    "latitude", "longitude",
]);

// GET /api/business/onboarding
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const businessId = session.user.businessId;
        if (!businessId) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const [business, productCount, categoryCount, mediaLogo, mediaCover] = await Promise.all([
            prisma.business.findUnique({
                where: { id: businessId },
                select: {
                    id: true, slug: true,
                    name: true, category: true, description: true,
                    phone: true, email: true, website: true,
                    address: true, city: true, district: true,
                    latitude: true, longitude: true,
                }
            }),
            prisma.product.count({ where: { businessId, isActive: true } }),
            prisma.productcategory.count({ where: { businessId } }),
            prisma.media.findFirst({ where: { businessId, type: "LOGO" }, select: { url: true } }),
            prisma.media.findFirst({ where: { businessId, type: "COVER" }, select: { url: true } }),
        ]);

        if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const counts = {
            productCount,
            categoryCount,
            hasLogo: !!mediaLogo,
            hasCover: !!mediaCover,
        };

        const { completionPercent, missingSteps } = computeCompletion(business, counts);

        return NextResponse.json({
            completionPercent,
            missingSteps,
            business: { ...business, logoUrl: mediaLogo?.url || null },
            counts,
        });
    } catch (error) {
        console.error("GET ONBOARDING ERROR:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH /api/business/onboarding — update profile fields
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const businessId = session.user.businessId;
        if (!businessId) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const body = await req.json();

        // Whitelist — only allowed fields pass through
        const data = {};
        for (const [key, val] of Object.entries(body)) {
            if (!ALLOWED_FIELDS.has(key)) continue;

            if (key === "latitude" || key === "longitude") {
                if (val === null || val === undefined || val === "") {
                    data[key] = null;
                } else {
                    const n = typeof val === "number" ? val : parseFloat(String(val));
                    if (!Number.isFinite(n)) continue;
                    data[key] = n;
                }
                continue;
            }

            data[key] = typeof val === "string" ? val.trim() || null : val;
        }

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "Güncellenecek alan bulunamadı." }, { status: 400 });
        }

        // Validate description length if provided
        if (data.description && data.description.length > 0 && data.description.length < 20) {
            return NextResponse.json({ error: "Açıklama en az 20 karakter olmalıdır." }, { status: 400 });
        }

        const updated = await prisma.business.update({
            where: { id: businessId },
            data,
            select: {
                id: true, name: true, category: true, description: true,
                phone: true, email: true, website: true,
                address: true, city: true, district: true,
                latitude: true, longitude: true,
            }
        });

        return NextResponse.json({ business: updated, success: true });
    } catch (error) {
        console.error("PATCH ONBOARDING ERROR:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
