/**
 * lib/jsonld.js
 * JSON-LD structured data builders for Civardaki pages.
 * All functions return plain JS objects (not strings).
 * Use: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildXxx()) }} />
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

/** Remove undefined/null values so JSON.stringify skips them cleanly */
function clean(obj) {
    return JSON.parse(JSON.stringify(obj, (_, v) => (v === null || v === undefined || v === "") ? undefined : v));
}

/**
 * buildLocalBusiness — for /business/[slug]
 * @param {object} b         — business row (from public API)
 * @param {object} catalog   — { categories: [{ name, products: [{name, description, price, isActive}] }] }
 */
export function buildLocalBusiness(b, catalog) {
    const url = `${APP_URL}/business/${b.slug}`;

    // Address
    const address = b.address || b.district || b.city
        ? {
            "@type": "PostalAddress",
            streetAddress: b.address || undefined,
            addressLocality: b.district || undefined,
            addressRegion: b.city || undefined,
            addressCountry: "TR",
        }
        : undefined;

    // Images
    const images = [b.logoUrl, b.coverUrl].filter(Boolean);

    // SPRINT 9H: Review Snippet Hardening (Require at least 3 reviews to show rating in JSON-LD)
    const aggregateRating = (b.reviewCount >= 3 && b.rating > 0)
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(b.rating).toFixed(1),
            reviewCount: b.reviewCount,
            bestRating: 5,
            worstRating: 1,
        }
        : undefined;

    // Offer Catalog built from catalog data (max 20 products total)
    let hasOfferCatalog;
    const cats = catalog?.categories || [];
    if (cats.length > 0) {
        let productCount = 0;
        const itemListElement = cats
            .filter(c => c.products?.length > 0)
            .map(c => {
                const offers = (c.products || [])
                    .filter(p => p.isActive !== false && productCount < 20)
                    .map(p => {
                        productCount++;
                        const product = {
                            "@type": "Product",
                            name: p.name,
                            description: p.description || undefined,
                        };
                        if (p.price != null) {
                            product.offers = {
                                "@type": "Offer",
                                price: Number(p.price).toFixed(2),
                                priceCurrency: "TRY",
                            };
                        }
                        return product;
                    });
                if (offers.length === 0) return null;
                return {
                    "@type": "OfferCatalog",
                    name: c.name || "Genel",
                    itemListElement: offers,
                };
            })
            .filter(Boolean);

        if (itemListElement.length > 0) {
            hasOfferCatalog = {
                "@type": "OfferCatalog",
                name: `${b.name} Ürünleri ve Hizmetleri`,
                itemListElement,
            };
        }
    }

    return clean({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: b.name,
        description: b.description || undefined,
        url,
        telephone: b.phone || undefined,
        email: b.email || undefined,
        image: images.length > 0 ? (images.length === 1 ? images[0] : images) : undefined,
        address,
        sameAs: b.website ? [b.website] : undefined,
        // Sprint 9A Review Aggregation:
        aggregateRating: b.reviewCount && b.reviewCount > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": b.rating,
            "reviewCount": b.reviewCount,
            "bestRating": 5,
            "worstRating": 1
        } : undefined,
        hasOfferCatalog,
    });
}

/**
 * buildCollectionPage — for /kategori/[category]
 * @param {string} displayName   — human-readable category name
 * @param {string} slug          — URL slug
 * @param {Array}  businesses    — [{ name, slug }]
 */
export function buildCollectionPage(displayName, slug, businesses = []) {
    const url = `${APP_URL}/kategori/${slug}`;

    const itemListElement = businesses.slice(0, 100).map((biz, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${APP_URL}/business/${biz.slug}`,
        name: biz.name,
    }));

    return clean({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `${displayName} İşletmeleri - Civardaki`,
        description: `Civardaki.com üzerinde ${displayName} kategorisindeki en iyi işletmeler.`,
        url,
        mainEntity: {
            "@type": "ItemList",
            name: `${displayName} İşletmeleri`,
            numberOfItems: businesses.length,
            itemListElement,
        },
    });
}

/**
 * buildWebSite — for homepage
 */
export function buildWebSite() {
    return clean({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Civardaki",
        url: APP_URL,
        description: "Yakınınızdaki işletmeleri bulun, talep bırakın.",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${APP_URL}/?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    });
}

/**
 * SPRINT 9H: BreadcrumbList Schema Builder
 * @param {Array<{name: string, url?: string}>} items 
 */
export function buildBreadcrumbList(items) {
    if (!items || items.length === 0) return undefined;

    return clean({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url ? `${APP_URL}${item.url}` : undefined
        }))
    });
}
