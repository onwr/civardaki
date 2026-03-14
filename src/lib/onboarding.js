/**
 * Calculates business profile completion percentage
 * @param {Object} business - The business object from Prisma
 * @returns {Object} { score: number, pendingTasks: Array }
 */
export function calculateProfileCompletion(business) {
    if (!business) return { score: 0, pendingTasks: [] };

    const tasks = [
        {
            id: "basic",
            label: "Temel Bilgiler",
            weight: 40,
            isDone: !!(business.name && business.category && business.phone && business.email),
            cta: "/business/profile/edit",
        },
        {
            id: "logo",
            label: "İşletme Logosu",
            weight: 10,
            isDone: !!(business.media?.some(m => m.type === "LOGO")),
            cta: "/business/profile/edit",
        },
        {
            id: "gallery",
            label: "Fotoğraf Galerisi (En az 1)",
            weight: 20,
            isDone: (business.media?.filter(m => m.type === "GALLERY").length >= 3),
            cta: "/business/profile/edit",
        },
        {
            id: "services",
            label: "Hizmetler veya Ürünler",
            weight: 20,
            isDone: !!(business.product?.length > 0 || business.services),
            cta: "/business/products",
        },
        {
            id: "hours",
            label: "Çalışma Saatleri",
            weight: 10,
            isDone: !!business.workingHours,
            cta: "/business/profile/edit",
        },
    ];

    const score = tasks.reduce((acc, task) => acc + (task.isDone ? task.weight : 0), 0);
    const pendingTasks = tasks.filter(t => !t.isDone);

    return { score, pendingTasks };
}

export function getOnboardingMessage(score) {
    if (score < 50) return "Profiliniz çok taze! Birkaç dokunuşla daha fazla güven kazanın.";
    if (score < 80) return "Harika gidiyorsunuz! Profilinizi tamamlayarak aramada öne çıkın.";
    if (score < 100) return "Neredeyse bitti! Son birkaç adımda mükemmelliğe ulaşın.";
    return "Profiliniz mükemmel! Müşterileriniz sizi bekliyor.";
}
