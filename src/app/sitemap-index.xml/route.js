const base = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

export async function GET() {
    const sitemaps = [
        `${base}/sitemap/cities.xml`,
        `${base}/sitemap/categories.xml`,
        `${base}/sitemap/districts.xml`,
        `${base}/sitemap.xml`, // Existing one for static/businesses
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${sitemaps.map(loc => `
            <sitemap>
                <loc>${loc}</loc>
            </sitemap>
        `).join('')}
    </sitemapindex>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
