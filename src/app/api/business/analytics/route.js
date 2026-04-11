import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { loadBusinessLeadCategories, buildBusinessLeadsWhere } from "@/lib/business-lead-visibility";
import { startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, format } from "date-fns";
import { tr } from "date-fns/locale";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;
        const { searchParams } = new URL(request.url);
        const rangeParam = searchParams.get("range") || "week";
        const range = String(rangeParam).toLowerCase().trim();

        let startDate;
        const now = new Date();

        switch (range) {
            case "gün":
            case "day":
                startDate = startOfDay(now);
                break;
            case "hafta":
            case "week":
                startDate = startOfWeek(now, { weekStartsOn: 1 });
                break;
            case "ay":
            case "month":
                startDate = startOfMonth(now);
                break;
            case "yıl":
            case "year":
                startDate = startOfYear(now);
                break;
            default:
                startDate = subDays(now, 7);
        }

        const { categoryIds, legacyCategory } = await loadBusinessLeadCategories(prisma, businessId);
        const leadVisAll = buildBusinessLeadsWhere({
            businessId,
            categoryIds,
            legacyCategory,
            status: null,
            q: null,
        });

        // 1. Fetch Business Events (Views, Calls, etc.)
        const events = await prisma.businessevent.findMany({
            where: {
                businessId,
                createdAt: { gte: startDate }
            }
        });

        // 2. Fetch Leads (doğrudan + dağıtımlı görünür)
        const leadsCount = await prisma.lead.count({
            where: {
                AND: [leadVisAll, { createdAt: { gte: startDate } }],
            },
        });

        // 3. Fetch Orders (Revenue)
        const orders = await prisma.order.findMany({
            where: {
                businessId,
                status: 'DELIVERED',
                createdAt: { gte: startDate }
            },
            select: { total: true, createdAt: true }
        });

        const revenue = orders.reduce((sum, o) => sum + o.total, 0);

        const viewsCount = events.filter(e => e.type === 'VIEW_PROFILE').length;
        const directionsCount = events.filter(e => e.type === 'CLICK_CTA_PRIMARY').length;

        // 4. Group data for charts (Interaction Trends - Day by Day for last 7 days)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = subDays(now, 6 - i);
            const dayStr = format(d, 'EEE', { locale: tr });
            const dayEvents = events.filter(e => format(e.createdAt, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'));

            return {
                name: dayStr,
                views: dayEvents.filter(e => e.type === 'VIEW_PROFILE').length,
                clicks: dayEvents.filter(e => ['CLICK_PHONE', 'CLICK_WHATSAPP'].includes(e.type)).length,
                directions: dayEvents.filter(e => e.type === 'CLICK_CTA_PRIMARY').length,
                calls: dayEvents.filter(e => e.type === 'CLICK_PHONE').length,
                share: dayEvents.filter(e => e.type === 'CLICK_SHARE_PROFILE').length,
                website: dayEvents.filter(e => e.type === 'CLICK_WEBSITE').length
            };
        });

        // 5. Source: no referrer tracking yet, single slice
        const sources = [
            { name: 'Direkt / Diğer', value: 100, color: '#004aad' },
        ];

        // 6. Time Heatmap (By Hour)
        const hours = Array.from({ length: 8 }).map((_, i) => {
            const hour = 8 + (i * 2);
            const hourStr = `${hour.toString().padStart(2, '0')}:00`;
            const hourEvents = events.filter(e => e.createdAt.getHours() >= hour && e.createdAt.getHours() < hour + 2);
            return { hour: hourStr, value: hourEvents.length };
        });

        const conversionRate = viewsCount > 0 ? Number(((leadsCount / viewsCount) * 100).toFixed(1)) : 0;

        return NextResponse.json({
            kpis: {
                views: viewsCount,
                directions: directionsCount,
                calls: events.filter(e => e.type === 'CLICK_PHONE').length,
                whatsapp: events.filter(e => e.type === 'CLICK_WHATSAPP').length,
                share: events.filter(e => e.type === 'CLICK_SHARE_PROFILE').length,
                website: events.filter(e => e.type === 'CLICK_WEBSITE').length,
                leads: leadsCount,
                revenue: revenue,
                conversionRate
            },
            interactionData: last7Days,
            sourceData: sources,
            timeHeatmap: hours
        });

    } catch (error) {
        console.error("Analytics GET Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
