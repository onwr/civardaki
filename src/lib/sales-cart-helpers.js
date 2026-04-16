/** @param {unknown} v */
export function parseMoneyInput(v) {
  if (v === "" || v == null) return 0;
  const n = parseFloat(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** @param {{ isDiscount?: boolean }[]} items */
export function stripDiscountLines(items) {
  return items.filter((it) => !it?.isDiscount);
}

export function sumLineTotals(items) {
  return items.reduce((sum, it) => sum + (Number(it?.total) || 0), 0);
}

/**
 * @param {number} discountAmount pozitif tutar (satırdaki total negatif olacak)
 */
export function makeDiscountLineItem(discountAmount) {
  const D = Math.max(0, Number(discountAmount) || 0);
  if (D <= 0) return null;
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `discount-${crypto.randomUUID()}`
      : `discount-${Date.now()}`;
  return {
    id,
    isDiscount: true,
    productId: null,
    name: "İskonto",
    quantity: 1,
    unitPrice: -D,
    total: -D,
  };
}
