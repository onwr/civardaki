export default function robots() {
    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://civardaki.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/user/",
                    "/r/",
                ],
            },
        ],
        sitemap: `${base}/sitemap.xml`,
    };
}
