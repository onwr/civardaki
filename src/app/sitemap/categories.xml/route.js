import { prisma } from "@/lib/prisma";
import { slugifyTR } from "@/lib/formatters";

const base = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

export async function GET() {
    // Get all categories that have at least one active business
    const stats = await prisma.business.groupBy({
        by: ["category"],
        where: { isActive: true },
        _max: { updatedAt: true }
    });

    const urls = stats
        .filter(s => s.category?.trim())
        .map(s => {
            const slug = slugifyTR(s.category.trim());
            return `
                <url>
                    <loc>${base}/kategori/${slug}</loc>
                    <lastmod>${s._max.updatedAt?.toISOString() || new Date().toISOString()}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.7</priority>
                </url>
            `;
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
