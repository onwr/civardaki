import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        // Ownership enforced
        const lead = await prisma.lead.findFirst({
            where: { id, businessId },
            select: { id: true, status: true, createdAt: true }
        });
        if (!lead) return NextResponse.json({ message: "Not found" }, { status: 404 });

        // If a replyText is being set, mark repliedAt and ensure status is at least REPLIED
        const hasReply = replyText !== undefined && replyText !== null && String(replyText).trim().length > 0;
        const effectiveStatus = status || (hasReply ? "REPLIED" : undefined);

        // SPRINT 9C/9G: Response Engine Algorithm + Abuse Guard
        let responseTimeMinutes = null;
        if (lead.status === "NEW" && effectiveStatus === "REPLIED") {
            const now = new Date();
            responseTimeMinutes = (now.getTime() - lead.createdAt.getTime()) / 60000;

            // 9G-2: Response Time Abuse block
            if (responseTimeMinutes < 1) {
                responseTimeMinutes = 1; // 1-minute floor
            } else if (responseTimeMinutes > 1440) { // 24 hours
                responseTimeMinutes = null; // Ignore unreasonably long delays so they don't break the rolling average
            }
        }

        const updated = await prisma.$transaction(async (tx) => {
            const updatedLead = await tx.lead.update({
                where: { id },
                data: {
                    ...(effectiveStatus ? { status: effectiveStatus } : {}),
                    ...(adminNote !== undefined ? { adminNote } : {}),
                    ...(hasReply ? { replyText: String(replyText).trim(), repliedAt: new Date() } : {}),
                    ...(quotedPrice !== undefined ? { quotedPrice: quotedPrice !== null ? Number(quotedPrice) : null } : {}),
                },
            });

            if (responseTimeMinutes !== null) {
                const b = await tx.business.findUnique({
                    where: { id: businessId },
                    select: { avgResponseMinutes: true, responseCount: true }
                });
                if (b) {
                    const newAvg = ((b.avgResponseMinutes * b.responseCount) + responseTimeMinutes) / (b.responseCount + 1);
                    await tx.business.update({
                        where: { id: businessId },
                        data: {
                            avgResponseMinutes: newAvg,
                            responseCount: { increment: 1 }
                        }
                    });
                }
            }
            return updatedLead;
        });

        return NextResponse.json({ lead: updated });
    } catch (e) {
        console.error("PATCH LEAD ERROR:", e);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
