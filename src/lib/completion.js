/**
 * lib/completion.js
 * Server-side profile completion calculator.
 * Call computeCompletion(business, counts) where:
 *   business — prisma.business row with the fields below
 *   counts   — { productCount, categoryCount, hasCover }
 */

export const CHECKPOINTS = [
    {
        id: "name",
        title: "İşletme Adı",
        description: "İşletmenizin adını ekleyin.",
        ctaLabel: "Profili Düzenle",
        linkUrl: "/business/onboarding?step=1",
        check: (b) => !!b.name?.trim(),
    },
    {
        id: "category",
        title: "Kategori",
        description: "İşletme kategorinizi seçin.",
        ctaLabel: "Profili Düzenle",
        linkUrl: "/business/onboarding?step=1",
        check: (b) => !!b.category?.trim(),
    },
    {
        id: "location",
        title: "Şehir & İlçe",
        description: "Konumunuzu ekleyin; müşteriler yakınlarda arar.",
        ctaLabel: "Konumu Ekle",
        linkUrl: "/business/onboarding?step=2",
        check: (b) => !!b.city?.trim() && !!b.district?.trim(),
    },
    {
        id: "contact",
        title: "İletişim Bilgisi",
        description: "Telefon veya e-posta ekleyin.",
        ctaLabel: "İletişim Ekle",
        linkUrl: "/business/onboarding?step=2",
        check: (b) => !!b.phone?.trim() || !!b.email?.trim(),
    },
    {
        id: "address",
        title: "Adres",
        description: "Adresinizi belirtin.",
        ctaLabel: "Adresi Ekle",
        linkUrl: "/business/onboarding?step=2",
        check: (b) => !!b.address?.trim(),
    },
    {
        id: "description",
        title: "Açıklama (min 80 karakter)",
        description: "İşletmenizi tanıtan bir metin ekleyin (en az 80 karakter).",
        ctaLabel: "Açıklama Ekle",
        linkUrl: "/business/onboarding?step=1",
        check: (b) => (b.description?.trim()?.length || 0) >= 80,
    },
    {
        id: "logo",
        title: "Logo Görseli",
        description: "Logo ekleyin; güven algısını artırır.",
        ctaLabel: "Logo Yükle",
        linkUrl: "/business/onboarding?step=3",
        check: (_, counts) => !!counts.hasLogo,
    },
    {
        id: "products",
        title: "En Az 1 Ürün / Hizmet",
        description: "Kataloğunuzu doldurun; dönüşümü artırır.",
        ctaLabel: "Ürün Ekle",
        linkUrl: "/business/products",
        check: (_, counts) => counts.productCount >= 1,
    },
];

// Bonus (optional, capped at 100)
const BONUS = [
    {
        id: "cover",
        title: "Kapak Görseli",
        description: "Kapak fotoğrafı ekleyin.",
        check: (_, counts) => !!counts.hasCover,
        points: 5,
    },
    {
        id: "productCategory",
        title: "En Az 1 Ürün Kategorisi",
        description: "Ürünlerinizi kategorilere ayırın.",
        check: (_, counts) => counts.categoryCount >= 1,
        points: 5,
    },
];

const CHECKPOINT_POINTS = 100 / CHECKPOINTS.length; // 12.5 each

export function computeCompletion(business, counts = {}) {
    const results = CHECKPOINTS.map((cp) => ({
        ...cp,
        done: cp.check(business, counts),
    }));

    const base = results.filter((r) => r.done).length * CHECKPOINT_POINTS;

    const bonusPoints = BONUS.reduce((acc, b) => {
        return b.check(business, counts) ? acc + b.points : acc;
    }, 0);

    const completionPercent = Math.min(100, Math.round(base + bonusPoints));

    const missingSteps = results
        .filter((r) => !r.done)
        .map(({ id, title, description, ctaLabel, linkUrl }) => ({
            id, title, description, ctaLabel, linkUrl
        }));

    return { completionPercent, missingSteps };
}
