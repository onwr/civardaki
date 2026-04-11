/**
 * Türkiye cep için görüntüleme: (541) 196 18 30
 * @param {string} input
 * @returns {string}
 */
export function formatTurkishMobileDisplay(input) {
  let d = String(input || "").replace(/\D/g, "");
  if (d.startsWith("90") && d.length >= 12) d = d.slice(-10);
  if (d.startsWith("0")) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return "";
  if (d.length <= 3) {
    return d.length === 3 ? `(${d})` : `(${d}`;
  }
  if (d.length <= 6) {
    return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  }
  if (d.length <= 8) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

/**
 * API / eşleştirme için 10 hane (başta 0 veya 90 yok).
 * @param {string} input
 * @returns {string}
 */
export function digitsTurkishMobile(input) {
  let d = String(input || "").replace(/\D/g, "");
  if (d.startsWith("90") && d.length >= 12) d = d.slice(-10);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}
