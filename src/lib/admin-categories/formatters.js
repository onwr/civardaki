/**
 * Admin categories: tarih ve metin formatlama
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
