/**
 * Admin users: tarih ve metin formatlama
 */

/**
 * @param {string|Date|null|undefined} value
 * @returns {string} YYYY-MM-DD veya "—"
 */
export function formatDate(value) {
  if (value == null) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

/**
 * @param {string|Date|null|undefined} value
 * @returns {string} Tarih + saat veya "—"
 */
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

/**
 * @param {string|null|undefined} value
 * @returns {string} Boşsa "—"
 */
export function safeStr(value) {
  if (value == null || String(value).trim() === "") return "—";
  return String(value).trim();
}

/**
 * lastLoginAt için "X gün önce" / "—"
 * @param {string|Date|null|undefined} value
 * @returns {string}
 */
export function formatLastLogin(value) {
  if (value == null) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Dün";
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return formatDateTime(value);
}
