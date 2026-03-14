/**
 * User orders format helpers.
 */

/**
 * @param {Date | null | undefined} date
 * @param {Intl.DateTimeFormatOptions} [opts]
 * @returns {string}
 */
export function formatOrderDate(date, opts = { day: "numeric", month: "long" }) {
  if (!date) return "—";
  if (typeof date.toLocaleDateString !== "function") return "—";
  return date.toLocaleDateString("tr-TR", opts);
}

/**
 * @param {Date | null | undefined} date
 * @returns {string}
 */
export function formatOrderTime(date) {
  if (!date) return "—";
  if (typeof date.toLocaleTimeString !== "function") return "—";
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * @param {number} value
 * @returns {string}
 */
export function formatMoney(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "0 ₺";
  return `${n.toLocaleString("tr-TR")} ₺`;
}

/**
 * @param {Array<{ productName?: string }>} items
 * @param {string} [separator]
 * @returns {string}
 */
export function productSummary(items, separator = " + ") {
  if (!Array.isArray(items) || items.length === 0) return "—";
  return items
    .map((i) => (i && (i.productName ?? i.name)) || "—")
    .join(separator);
}
