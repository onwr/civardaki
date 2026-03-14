/**
 * Metni slug formatına çevirir (Türkçe karakter desteği).
 * @param {string} text
 * @returns {string}
 */
const TR_MAP = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o",
  ş: "s", Ş: "s", ü: "u", Ü: "u",
};

export function slugify(text) {
  if (text == null || typeof text !== "string") return "";
  let s = text.trim();
  if (!s) return "";
  s = s.split("").map((c) => TR_MAP[c] ?? c).join("");
  s = s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return s || "kategori";
}
