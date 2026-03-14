import { prisma } from "@/lib/prisma";
import { slugifyTR } from "@/lib/formatters";

const base = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

export async function GET() {
    // Get distinct cities from DB where businesses are active
    const cities = await prisma.business.groupBy({
        by: ["city"],
        where: { isActive: true },
        _max: { updatedAt: true }
    });

    const categories = await prisma.category.findMany({
        select: { slug: true }
    });

    // Cross product: City x Category
    let urls = [];
    cities.forEach(c => {
        if (!c.city) return;
        const citySlug = slugifyTR(c.city);
        categories.forEach(cat => {
            urls.push(`
                <url>
                    <loc>${base}/${citySlug}/${cat.slug}</loc>
                    <lastmod>${c._max.updatedAt?.toISOString() || new Date().toISOString()}</lastmod>
                    <changefreq>daily</changefreq>
                    <priority>0.8</priority>
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
