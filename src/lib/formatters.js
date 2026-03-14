export function slugifyTR(input) {
    return (input || "")
        .toString()
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

export function capitalizeWords(str) {
    return (str || "").trim().split(" ").map(word => {
        if (!word) return "";
        return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
    }).join(" ");
}

export function normalizeLocation(str) {
    return capitalizeWords(str);
}
