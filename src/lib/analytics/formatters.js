/**
 * Admin analytics: para, yüzde ve sayı formatlama.
 * Tüm fonksiyonlar null/undefined/NaN safe.
 */

/**
 * Türk Lirası formatı (tr-TR).
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatCurrencyTR(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Yüzde formatı. value 0–100 arası kabul edilir (örn. 14.2 → "%14,2").
 * 0–1 arası gelirse * 100 uygulanmaz; dokümantasyona göre 0–100 kullanın.
 * @param {number|null|undefined} value - 0–100 (örn. 14.2)
 * @returns {string}
 */
export function formatPercent(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `%${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n)}`;
}

/**
 * Kısa sayı gösterimi (1.200, 1,2B vb.).
 * @param {number|null|undefined} value
 * @returns {string}
 */
export function formatCompactNumber(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1).replace(".", ",")}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(".", ",")}M`;
  if (n >= 1e3) return new Intl.NumberFormat("tr-TR").format(n);
  return String(n);
}
