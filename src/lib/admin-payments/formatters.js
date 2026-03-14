/**
 * Admin payments: tarih, tutar ve metin formatlama
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

export function formatAmount(value, currency = "TRY") {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const num = Number(value);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function safeStr(value) {
  if (value == null || String(value).trim() === "") return "—";
  return String(value).trim();
}
