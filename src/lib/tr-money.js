/**
 * Türkçe para / ondalık metin: "1.234,56" → 1234.56
 */
export function parseTrMoney(input) {
  if (input === null || input === undefined) return null;
  const s = String(input).trim();
  if (s === "") return null;
  const normalized = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * Sayıyı tr-TR gösterimine (örn. 1.234,56)
 */
export function formatTrMoney(value, options = {}) {
  const {
    minFractionDigits = 0,
    maxFractionDigits = 2,
  } = options;
  if (value === null || value === undefined || value === "") return "";
  const n =
    typeof value === "number"
      ? value
      : parseTrMoney(String(value));
  if (n === null || !Number.isFinite(n)) return "";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  }).format(n);
}
