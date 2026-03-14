import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        const leads = await prisma.lead.findMany({
            where: {
                businessId,
                ...(status && status !== "ALL" ? { status } : {}),
                ...(q
                    ? {
                          OR: [
                              { name: { contains: q } },
                              { phone: { contains: q } },
                              { email: { contains: q } },
                              { message: { contains: q } },
                              { category: { contains: q } },
                          ],
                      }
                    : {}),
            },
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                product: {
                    select: { name: true, price: true }
                }
            }
        });

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
        const { leadId, status, replyText, quotedPrice } = body;
        const nextStatus = String(status || "").trim().toUpperCase();
        const allowed = new Set(["NEW", "CONTACTED", "QUOTED", "REPLIED", "CLOSED", "LOST"]);

        if (!leadId || !nextStatus) {
            return NextResponse.json({ error: "Eksik bilgi: leadId veya status." }, { status: 400 });
        }
        if (!allowed.has(nextStatus)) {
            return NextResponse.json({ error: "Geçersiz status değeri." }, { status: 400 });
        }

        // Verify lead ownership
        const existingLead = await prisma.lead.findUnique({
            where: { id: leadId },
            select: { businessId: true, repliedAt: true }
        });

        if (!existingLead || existingLead.businessId !== businessId) {
            return NextResponse.json({ error: "Geçersiz talep veya yetkisiz işlem." }, { status: 403 });
        }

        const updateData = {
            status: nextStatus,
            updatedAt: new Date()
        };

        if (replyText) updateData.replyText = replyText;
        if (quotedPrice) updateData.quotedPrice = parseFloat(quotedPrice);
        if (nextStatus !== "NEW" && !existingLead.repliedAt) {
            updateData.repliedAt = new Date();
        }

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: updateData
        });

        return NextResponse.json({ success: true, lead: updatedLead });
    } catch (error) {
        console.error("PATCH BUSINESS LEADS ERROR:", error);
        return NextResponse.json({ error: "Talep güncellenirken bir hata oluştu." }, { status: 500 });
    }
}
