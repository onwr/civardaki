import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDistance } from "@/lib/geo";
import {
    loadBusinessLeadCategories,
    buildBusinessLeadsWhere,
    leadLocationTier,
    serializeLeadForBusiness,
    canBusinessAccessLead,
} from "@/lib/business-lead-visibility";

// GET /api/business/leads - List leads for the current business
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "BUSINESS") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;
        if (!businessId) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const status = String(searchParams.get("status") || "").trim().toUpperCase();
        const q = String(searchParams.get("q") || "").trim();
        const limitRaw = Number.parseInt(searchParams.get("limit") || "50", 10);
        const limit = Number.isNaN(limitRaw) ? 50 : Math.min(200, Math.max(1, limitRaw));

        const { biz, categoryIds, legacyCategory } = await loadBusinessLeadCategories(prisma, businessId);

        const blat = biz?.latitude;
        const blng = biz?.longitude;
        const hasBizCoord =
            blat != null &&
            blng != null &&
            !Number.isNaN(Number(blat)) &&
            !Number.isNaN(Number(blng));

        const where = buildBusinessLeadsWhere({
            businessId,
            categoryIds,
            legacyCategory,
            status: status || null,
            q: q || null,
        });

        const fetchTake = Math.min(800, Math.max(limit * 25, limit));

        let leads = await prisma.lead.findMany({
            where,
            take: fetchTake,
            orderBy: { createdAt: "desc" },
            include: {
                product: {
                    select: { name: true, price: true },
                },
                leadBusinessStates: {
                    where: { businessId },
                },
            },
        });

        leads = leads.map((row) => serializeLeadForBusiness(row, businessId));

        const bCity = biz?.city;
        const bDistrict = biz?.district;

        leads = [...leads].sort((a, b) => {
            const ta = leadLocationTier(a, bCity, bDistrict);
            const tb = leadLocationTier(b, bCity, bDistrict);
            if (ta !== tb) return ta - tb;
            if (hasBizCoord) {
                const da =
                    a.latitude != null && a.longitude != null
                        ? calculateDistance(blat, blng, a.latitude, a.longitude)
                        : null;
                const db =
                    b.latitude != null && b.longitude != null
                        ? calculateDistance(blat, blng, b.latitude, b.longitude)
                        : null;
                if (da != null && db != null) return da - db;
                if (da != null) return -1;
                if (db != null) return 1;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        leads = leads.slice(0, limit);

        return NextResponse.json({ success: true, leads });
    } catch (error) {
        console.error("GET BUSINESS LEADS ERROR:", error);
        return NextResponse.json({ error: "Talepler getirilirken bir hata oluştu." }, { status: 500 });
    }
}

// PATCH /api/business/leads - Update lead status
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "BUSINESS") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;
        const body = await req.json();
        const { leadId, status, dismiss, replyText, quotedPrice } = body;

        if (!businessId) {
            return NextResponse.json({ message: "Business not found" }, { status: 404 });
        }

        if (!leadId) {
            return NextResponse.json({ error: "Eksik bilgi: leadId." }, { status: 400 });
        }

        const { categoryIds, legacyCategory } = await loadBusinessLeadCategories(prisma, businessId);

        const existingLead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                leadBusinessStates: { where: { businessId } },
            },
        });

        if (!existingLead || !canBusinessAccessLead(existingLead, businessId, categoryIds, legacyCategory)) {
            return NextResponse.json({ error: "Geçersiz talep veya yetkisiz işlem." }, { status: 403 });
        }

        const isDirect = existingLead.businessId === businessId;

        if (dismiss === true) {
            if (isDirect) {
                const updatedLead = await prisma.lead.update({
                    where: { id: leadId },
                    data: { dismissedAt: new Date(), updatedAt: new Date() },
                });
                return NextResponse.json({ success: true, lead: updatedLead });
            }
            const updatedState = await prisma.lead_business_state.upsert({
                where: {
                    leadId_businessId: { leadId, businessId },
                },
                create: {
                    leadId,
                    businessId,
                    status: "NEW",
                    dismissedAt: new Date(),
                },
                update: { dismissedAt: new Date(), updatedAt: new Date() },
            });
            const merged = serializeLeadForBusiness(
                { ...existingLead, leadBusinessStates: [updatedState] },
                businessId,
            );
            return NextResponse.json({ success: true, lead: merged });
        }

        const nextStatus = String(status || "").trim().toUpperCase();
        const allowed = new Set(["NEW", "CONTACTED", "QUOTED", "REPLIED", "CLOSED", "LOST"]);

        if (!nextStatus) {
            return NextResponse.json({ error: "Eksik bilgi: status." }, { status: 400 });
        }
        if (!allowed.has(nextStatus)) {
            return NextResponse.json({ error: "Geçersiz status değeri." }, { status: 400 });
        }

        if (isDirect) {
            const repliedBefore = Boolean(existingLead.repliedAt);

            const updateData = {
                status: nextStatus,
                updatedAt: new Date(),
            };

            if (replyText) updateData.replyText = replyText;
            if (quotedPrice) updateData.quotedPrice = parseFloat(quotedPrice);
            if (nextStatus !== "NEW" && !repliedBefore) {
                updateData.repliedAt = new Date();
            }

            const updatedLead = await prisma.lead.update({
                where: { id: leadId },
                data: updateData,
            });

            return NextResponse.json({ success: true, lead: updatedLead });
        }

        const prevState = existingLead.leadBusinessStates?.[0];
        const repliedBefore = Boolean(prevState?.repliedAt);

        const stateData = {
            status: nextStatus,
            updatedAt: new Date(),
        };
        if (replyText) stateData.replyText = replyText;
        if (quotedPrice) stateData.quotedPrice = parseFloat(quotedPrice);
        if (nextStatus !== "NEW" && !repliedBefore) {
            stateData.repliedAt = new Date();
        }

        const updatedState = await prisma.lead_business_state.upsert({
            where: {
                leadId_businessId: { leadId, businessId },
            },
            create: {
                leadId,
                businessId,
                ...stateData,
            },
            update: stateData,
        });

        const merged = serializeLeadForBusiness(
            { ...existingLead, leadBusinessStates: [updatedState] },
            businessId,
        );
        return NextResponse.json({ success: true, lead: merged });
    } catch (error) {
        console.error("PATCH BUSINESS LEADS ERROR:", error);
        return NextResponse.json({ error: "Talep güncellenirken bir hata oluştu." }, { status: 500 });
    }
}
