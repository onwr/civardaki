/** İşletme services alanından kısa etiket listesi çıkarır */
export function parseBusinessTags(services, category, max = 3) {
    const tags = [];

    if (category && typeof category === "string") {
        tags.push(category.trim());
    }

    if (!services) return tags.slice(0, max);

    try {
        const parsed = typeof services === "string" ? JSON.parse(services) : services;
        if (Array.isArray(parsed)) {
            for (const item of parsed) {
                const label =
                    typeof item === "string"
                        ? item
                        : item?.name || item?.label || item?.title;
                if (label && typeof label === "string") {
                    const t = label.trim();
                    if (t && !tags.includes(t)) tags.push(t);
                }
                if (tags.length >= max) break;
            }
        } else if (typeof parsed === "object" && parsed !== null) {
            Object.values(parsed).forEach((v) => {
                if (typeof v === "string" && v.trim() && !tags.includes(v.trim())) {
                    tags.push(v.trim());
                }
            });
        }
    } catch {
        const parts = String(services)
            .split(/[,;|]/)
            .map((s) => s.trim())
            .filter(Boolean);
        for (const p of parts) {
            if (!tags.includes(p)) tags.push(p);
            if (tags.length >= max) break;
        }
    }

    return tags.slice(0, max);
}
