import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    loadBusinessLeadCategories,
    canBusinessAccessLead,
    serializeLeadForBusiness,
} from "@/lib/business-lead-visibility";

const allowedStatuses = new Set(["NEW", "REPLIED", "CLOSED"]);

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        if (session.user.role !== "BUSINESS") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const businessId = session.user.businessId;
        if (!businessId) return NextResponse.json({ message: "Business not found" }, { status: 404 });

        const id = params?.id?.toString();
        const body = await req.json();
        const { status, adminNote, replyText, quotedPrice } = body;

        if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });
        if (status && !allowedStatuses.has(status)) {
            return NextResponse.json({ message: "Geçersiz durum." }, { status: 400 });
        }
        if (replyText !== undefined && typeof replyText === "string" && replyText.trim().length > 2000) {
            return NextResponse.json({ message: "Yanıt metni en fazla 2000 karakter olabilir." }, { status: 400 });
        }
        if (quotedPrice !== undefined && quotedPrice !== null && (isNaN(Number(quotedPrice)) || Number(quotedPrice) < 0)) {
            return NextResponse.json({ message: "Geçersiz teklif tutarı." }, { status: 400 });
        }

        const { categoryIds, legacyCategory } = await loadBusinessLeadCategories(prisma, businessId);

        const lead = await prisma.lead.findUnique({
            where: { id },
            include: { leadBusinessStates: { where: { businessId } } },
        });

        if (!lead || !canBusinessAccessLead(lead, businessId, categoryIds, legacyCategory)) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }

        const isDirect = lead.businessId === businessId;

        const hasReply = replyText !== undefined && replyText !== null && String(replyText).trim().length > 0;
        const effectiveStatus = status || (hasReply ? "REPLIED" : undefined);

        const prevStatus = isDirect ? lead.status : (lead.leadBusinessStates?.[0]?.status ?? "NEW");

        let responseTimeMinutes = null;
        if (prevStatus === "NEW" && effectiveStatus === "REPLIED") {
            const now = new Date();
            responseTimeMinutes = (now.getTime() - lead.createdAt.getTime()) / 60000;
            if (responseTimeMinutes < 1) {
                responseTimeMinutes = 1;
            } else if (responseTimeMinutes > 1440) {
                responseTimeMinutes = null;
            }
        }

        await prisma.$transaction(async (tx) => {
            if (isDirect) {
                await tx.lead.update({
                    where: { id },
                    data: {
                        ...(effectiveStatus ? { status: effectiveStatus } : {}),
                        ...(adminNote !== undefined ? { adminNote } : {}),
                        ...(hasReply ? { replyText: String(replyText).trim(), repliedAt: new Date() } : {}),
                        ...(quotedPrice !== undefined ? { quotedPrice: quotedPrice !== null ? Number(quotedPrice) : null } : {}),
                    },
                });
            } else {
                const prev = lead.leadBusinessStates?.[0];
                const repliedBefore = Boolean(prev?.repliedAt);
                const nextStatus = effectiveStatus || prev?.status || "NEW";

                const updateData = {
                    status: nextStatus,
                    ...(hasReply ? { replyText: String(replyText).trim(), repliedAt: new Date() } : {}),
                    ...(quotedPrice !== undefined ? { quotedPrice: quotedPrice !== null ? Number(quotedPrice) : null } : {}),
                };
                if (effectiveStatus === "REPLIED" && !repliedBefore && !hasReply) {
                    updateData.repliedAt = new Date();
                }

                await tx.lead_business_state.upsert({
                    where: { leadId_businessId: { leadId: id, businessId } },
                    create: {
                        leadId: id,
                        businessId,
                        status: nextStatus,
                        ...(hasReply ? { replyText: String(replyText).trim(), repliedAt: new Date() } : {}),
                        ...(quotedPrice !== undefined ? { quotedPrice: quotedPrice !== null ? Number(quotedPrice) : null } : {}),
                        ...(effectiveStatus === "REPLIED" && !hasReply ? { repliedAt: new Date() } : {}),
                    },
                    update: updateData,
                });

                if (adminNote !== undefined) {
                    await tx.lead.update({
                        where: { id },
                        data: { adminNote },
                    });
                }
            }

            if (responseTimeMinutes !== null) {
                const b = await tx.business.findUnique({
                    where: { id: businessId },
                    select: { avgResponseMinutes: true, responseCount: true },
                });
                if (b) {
                    const newAvg = ((b.avgResponseMinutes * b.responseCount) + responseTimeMinutes) / (b.responseCount + 1);
                    await tx.business.update({
                        where: { id: businessId },
                        data: {
                            avgResponseMinutes: newAvg,
                            responseCount: { increment: 1 },
                        },
                    });
                }
            }
        });

        const fresh = await prisma.lead.findUnique({
            where: { id },
            include: {
                leadBusinessStates: { where: { businessId } },
            },
        });
        const out = isDirect
            ? (() => {
                const { leadBusinessStates: _x, ...rest } = fresh;
                return rest;
            })()
            : serializeLeadForBusiness(fresh, businessId);

        return NextResponse.json({ lead: out });
    } catch (e) {
        console.error("PATCH LEAD ERROR:", e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
