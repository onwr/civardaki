/**
 * lib/seo-utils.js
 * Utilities for generating dynamic SEO content for city/category/district pages.
 */

import { slugifyTR, capitalizeWords } from "./formatters";

/**
 * Generates dynamic SEO text for a city, category, and optional district combination.
 */
export function generateSEOContent(city, category, district = null) {
    const citySlug = slugifyTR(city);
    const categorySlug = slugifyTR(category);
    const districtSlug = district ? slugifyTR(district) : null;

    const cityCaps = capitalizeWords(citySlug);
    const categoryCaps = capitalizeWords(categorySlug);
    const districtCaps = districtSlug ? capitalizeWords(districtSlug) : null;

    const locationName = districtCaps ? `${cityCaps} ${districtCaps}` : cityCaps;
    const locationTail = districtCaps ? `${districtCaps} / ${cityCaps}` : cityCaps;

    // SPRINT 12C: Service-specific customizations
    const serviceAdjustments = {
        "ev-temizligi": {
            plus: "Profesyonel Ev Temizliği",
            faq: [
                { q: `${locationName} ev temizliği kaç saat sürer?`, a: "Evin büyüklüğüne ve temizlik türüne göre 4-8 saat arası değişebilmektedir." },
                { q: "Hangi temizlik malzemeleri kullanılıyor?", a: "Genellikle işletmeler kendi ekipmanlarıyla gelir ancak dilerseniz kendi malzemelerinizin kullanılmasını isteyebilirsiniz." }
            ]
        },
        "kombi-servisi": {
            plus: "Kombi Bakımı ve Arıza",
            faq: [
                { q: `${locationName} kombi bakım ücreti ne kadar?`, a: "Marka ve modele göre değişmekle birlikte güncel fiyatlar için teklif alabilirsiniz." },
                { q: "Acil servisiniz var mı?", a: "Birçok kombi servisi 7/24 acil müdahale ekibiyle hizmet vermektedir." }
            ]
        }
    };

    const adjustment = serviceAdjustments[category.toLowerCase()] || { plus: categoryCaps, faq: [] };

    return {
        title: `${locationName} ${adjustment.plus} | Civardaki`,
        description: `${locationName} bölgesindeki en iyi ${categoryCaps.toLowerCase()} profesyonellerini bulun. Müşteri yorumlarını okuyun ve en yakın işletmeden teklif alın.`,
        heading: `${locationName} ${categoryCaps} <span className="text-blue-600">Hizmetleri</span>`,
        introText: `${locationName} ${districtCaps ? 'ilçesinde' : 'şehrinde'} güvenilir ${categoryCaps.toLowerCase()} hizmeti mi arıyorsunuz? Civardaki.com olarak bölgenizdeki en iyi ${categoryCaps.toLowerCase()} işletmelerini listeledik.`,
        mainContent: `
            ${locationName} ${categoryCaps} aramalarınızda zaman kaybetmeyin. Profesyonellerimiz; 
            hizmet kalitesi, uygun fiyat ve hızlı çözüm kriterlerine göre sıralanmıştır. 
            Hemen teklif isteyerek ${locationName} içindeki en iyi hizmete ulaşın.
        `.trim(),
        faq: [
            ...adjustment.faq,
            {
                q: `${locationName} ${categoryCaps.toLowerCase()} fiyatları ne kadar?`,
                a: `Fiyatlar yapılan işin kapsamına göre değişmektedir. Kesin bilgi için "Teklif Al" butonunu kullanabilirsiniz.`
            }
        ],
        breadcrumbs: [
            { label: "Anasayfa", href: "/" },
            { label: "İşletmeler", href: "/user/isletmeler" },
            { label: cityCaps, href: `/${citySlug}` },
            { label: categoryCaps, href: `/${citySlug}/${categorySlug}` },
            ...(districtCaps ? [{ label: districtCaps, href: `/${citySlug}/${categorySlug}/${districtSlug}` }] : [])
        ]
    };
}

/**
 * Helper to normalize slugs for DB queries.
 */
export function normalizeCitySlug(slug) {
    return slug.toLowerCase().trim();
}
