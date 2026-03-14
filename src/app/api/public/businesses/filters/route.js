import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ISR cache for 60s

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const cityFilter = searchParams.get("city")?.trim();

    const baseWhere = { isActive: true };

    // Şehirlere göre işletme sayısını gruplayalım
    const cityCountsRaw = await prisma.business.groupBy({
        by: ['city'],
        where: baseWhere,
        _count: {
            _all: true
        }
    });

    const cityCounts = cityCountsRaw
        .map(c => ({ city: (c.city || "").trim(), count: c._count._all }))
        .filter(c => c.city.length > 0);

    // Kategorilere göre işletme sayısı
    // Eğer belli bir city seçilmişse, o city içindeki kategorilere bakmak daha iyi UX
    const categoryCountsRaw = await prisma.business.groupBy({
        by: ['category'],
        where: { ...baseWhere, ...(cityFilter ? { city: cityFilter } : {}) },
        _count: {
            _all: true
        }
    });

    const categoryCounts = categoryCountsRaw
        .map(c => ({ category: (c.category || "").trim(), count: c._count._all }))
        .filter(c => c.category.length > 0);

    // İlçelere göre işletme sayısı (sadece şehir seçiliyse anlamlı)
    let districtCounts = [];
    if (cityFilter) {
        const districtCountsRaw = await prisma.business.groupBy({
            by: ['district'],
            where: { ...baseWhere, city: cityFilter },
            _count: { _all: true }
        });

        districtCounts = districtCountsRaw
            .map(d => ({ district: (d.district || "").trim(), count: d._count._all }))
            .filter(d => d.district.length > 0);
    }

    return NextResponse.json({
        cityCounts,
        categoryCounts,
        districtCounts
    });
}
