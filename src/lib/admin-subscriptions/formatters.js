/**
 * Admin subscriptions: tarih ve metin formatlama, kalan gün
 */

export function formatDate(value) {
  if (value == null) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function formatDateTime(value) {
  if (value == null) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function safeStr(value) {
  if (value == null || String(value).trim() === "") return "—";
  return String(value).trim();
}

/**
 * expiresAt için "X gün kaldı" / "Bugün" / "Süresi doldu"
 * @param {string|Date|null|undefined} expiresAt
 * @returns {string}
 */
export function kalanGun(expiresAt) {
  if (expiresAt == null) return "—";
  const end = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(end.getTime())) return "—";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diffMs = end - now;
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays < 0) return "Süresi doldu";
  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "1 gün kaldı";
  return `${diffDays} gün kaldı`;
}

/**
 * Kalan gün sayısı (number); geçmişteyse negatif
 * @param {string|Date|null|undefined} expiresAt
 * @returns {number|null}
 */
export function kalanGunSayisi(expiresAt) {
  if (expiresAt == null) return null;
  const end = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - now) / (24 * 60 * 60 * 1000));
}
