import { prisma } from "@/lib/prisma";
import { slugifyTR } from "@/lib/formatters";

const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://civardaki.com";
const BATCH_SIZE = 50000;

export async function generateSitemaps() {
    const total = await prisma.business.count({ where: { isActive: true } });
    const chunks = Math.ceil(total / BATCH_SIZE);
    // id=0 → static + categories + first business batch
    // id=1..n → additional business batches
    return Array.from({ length: chunks || 1 }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }) {
    const chunkId = Number(id) || 0;
    let routes = [];

    if (chunkId === 0) {
        // Static pages
        routes = [
            { url: `${base}`, lastModified: new Date().toISOString(), changeFrequency: "daily", priority: 1.0 },
            { url: `${base}/business/login`, lastModified: new Date().toISOString(), changeFrequency: "monthly", priority: 0.5 },
            { url: `${base}/business/register`, lastModified: new Date().toISOString(), changeFrequency: "monthly", priority: 0.6 },
        ];

        // Category pages — get last updated
        try {
            // SPRINT 9H: Sitemap Optimization (Category lastModified)
            const categoryStats = await prisma.business.groupBy({
                by: ["category"],
                where: { isActive: true, category: { not: null } },
                _max: { updatedAt: true },
            });

            const categoryRoutes = categoryStats
                .filter(c => c.category?.trim())
                .map(c => ({
                    url: `${base}/kategori/${slugifyTR(c.category.trim())}`,
                    lastModified: c._max.updatedAt?.toISOString() || new Date().toISOString(),
                    changeFrequency: "weekly",
                    priority: 0.8,
                }));

            routes.push(...categoryRoutes);
        } catch (e) {
            console.error("[sitemap] category generation error:", e);
        }
    }

    // Business pages (chunked)
    try {
        const businesses = await prisma.business.findMany({
            where: { isActive: true },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: "desc" },
            skip: chunkId * BATCH_SIZE,
            take: BATCH_SIZE,
        });

        const businessRoutes = businesses.map(b => ({
            url: `${base}/business/${b.slug}`,
            lastModified: b.updatedAt.toISOString(),
            changeFrequency: "weekly",
            priority: 0.9,
        }));

        routes.push(...businessRoutes);
    } catch (error) {
        console.error("[sitemap] business generation error:", error);
    }

    return routes;
}
