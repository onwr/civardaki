import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function resolveBusinessId(session) {
    if (!session?.user) return null;
    if (session.user.businessId) return session.user.businessId;

    const fallback = await prisma.ownedbusiness.findFirst({
        where: { userId: session.user.id },
        select: { businessId: true },
        orderBy: [{ isPrimary: "desc" }],
    });
    return fallback?.businessId || null;
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !["BUSINESS", "ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = await resolveBusinessId(session);
        if (!businessId) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const [biz, mediaLogo, mediaCover] = await Promise.all([
            prisma.business.findUnique({
                where: { id: businessId },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    officialName: true,
                    taxId: true,
                    taxOffice: true,
                    representativeName: true,
                    vision: true,
                    phone: true,
                    email: true,
                    website: true,
                    address: true,
                    city: true,
                    district: true,
                    cargoSettings: true,
                    securitySettings: true,
                    notificationSettings: true,
                    services: true,
                    workingHours: true,
                    isOpen: true,
                    isActive: true,
                    reservationEnabled: true,
                    businesssubscription: {
                        select: { status: true, plan: true, expiresAt: true },
                    },
                },
            }),
            prisma.media.findFirst({ where: { businessId, type: "LOGO" }, select: { url: true } }),
            prisma.media.findFirst({ where: { businessId, type: "COVER" }, select: { url: true } }),
        ]);

        if (!biz) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        // Parse JSON fields if they are stored as strings
        const sub = biz.businesssubscription;
        const formattedBiz = {
            ...biz,
            businessType: biz.type,
            logoUrl: mediaLogo?.url || null,
            coverUrl: mediaCover?.url || null,
            cargoSettings: biz.cargoSettings ? JSON.parse(biz.cargoSettings) : null,
            securitySettings: biz.securitySettings ? JSON.parse(biz.securitySettings) : null,
            notificationSettings: biz.notificationSettings ? JSON.parse(biz.notificationSettings) : null,
            services: biz.services ? JSON.parse(biz.services) : null,
            workingHours: biz.workingHours ? JSON.parse(biz.workingHours) : null,
            subscription: sub
                ? {
                      status: sub.status,
                      plan: sub.plan,
                      expiresAt: sub.expiresAt,
                  }
                : null,
        };

        delete formattedBiz.businesssubscription;

        return NextResponse.json(formattedBiz);
    } catch (error) {
        console.error("Settings GET Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !["BUSINESS", "ADMIN"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = await resolveBusinessId(session);
        if (!businessId) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }
        const data = await request.json();

        const existing = await prisma.business.findUnique({
            where: { id: businessId },
            select: { type: true, officialName: true, taxId: true },
        });
        if (!existing) return NextResponse.json({ error: "Business not found" }, { status: 404 });

        if (existing.type === "CORPORATE") {
            const officialName = data.officialName !== undefined ? data.officialName : existing.officialName;
            const taxId = data.taxId !== undefined ? data.taxId : existing.taxId;
            if (!String(officialName || "").trim() || !String(taxId || "").trim()) {
                return NextResponse.json(
                    { error: "Şirket hesabı için ticari ünvan ve vergi numarası zorunludur." },
                    { status: 400 }
                );
            }
        }

        // Prepare update object (marka ismi / name değiştirilemez, gönderilse bile işlenmez)
        const updateData = {};
        if (data.officialName !== undefined) updateData.officialName = data.officialName;
        if (data.taxId !== undefined) updateData.taxId = data.taxId;
        if (data.taxOffice !== undefined) updateData.taxOffice = data.taxOffice;
        if (data.representativeName !== undefined) updateData.representativeName = data.representativeName;
        if (data.vision !== undefined) updateData.vision = data.vision;
        // name (marka ismi) kabul edilmez

        // Contact fields
        if (data.phone !== undefined) updateData.phone = data.phone;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.website !== undefined) updateData.website = data.website;
        if (data.address !== undefined) updateData.address = data.address;

        // JSON Settings (Save as stringized JSON)
        if (data.cargoSettings !== undefined) {
            updateData.cargoSettings = JSON.stringify(data.cargoSettings);
        }
        if (data.securitySettings !== undefined) {
            updateData.securitySettings = JSON.stringify(data.securitySettings);
        }
        if (data.notificationSettings !== undefined) {
            updateData.notificationSettings = JSON.stringify(data.notificationSettings);
        }
        if (data.workingHours !== undefined) {
            updateData.workingHours = JSON.stringify(data.workingHours);
        }
        if (data.services !== undefined) {
            updateData.services = JSON.stringify(data.services);
        }

        // Booleans
        if (data.isOpen !== undefined) updateData.isOpen = !!data.isOpen;
        if (data.isActive !== undefined) updateData.isActive = !!data.isActive;
        if (data.reservationEnabled !== undefined) updateData.reservationEnabled = !!data.reservationEnabled;

        const updatedBiz = await prisma.business.update({
            where: { id: businessId },
            data: updateData,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Settings PATCH Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
