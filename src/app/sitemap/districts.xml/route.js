import { prisma } from "@/lib/prisma";
import { slugifyTR } from "@/lib/formatters";

const base = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

export async function GET() {
    // Get distinct city + district combinations from DB where businesses are active
    const locations = await prisma.business.groupBy({
        by: ["city", "district"],
        where: { isActive: true },
        _max: { updatedAt: true }
    });

    const categories = await prisma.category.findMany({
        select: { slug: true }
    });

    // Cross product: (City + District) x Category
    let urls = [];
    locations.forEach(loc => {
        if (!loc.city || !loc.district) return;
        const citySlug = slugifyTR(loc.city);
        const districtSlug = slugifyTR(loc.district);

        categories.forEach(cat => {
            urls.push(`
                <url>
                    <loc>${base}/${citySlug}/${cat.slug}/${districtSlug}</loc>
                    <lastmod>${loc._max.updatedAt?.toISOString() || new Date().toISOString()}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.6</priority>
                </url>
            `);
        });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls.join('')}
    </urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
