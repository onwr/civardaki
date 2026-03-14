/**
 * Arama: sipariş id, sipariş numarası, işletme adı, ürün isimleri.
 * Null-safe.
 *
 * @param {object[]} orders - Normalize edilmiş sipariş listesi
 * @param {string} searchTerm - Aram metni
 * @returns {object[]}
 */
export function filterOrdersBySearch(orders, searchTerm) {
  if (!Array.isArray(orders)) return [];
  const term = (searchTerm || "").trim().toLowerCase();
  if (term === "") return orders;

  return orders.filter((o) => {
    if (!o || typeof o !== "object") return false;
    const matchId =
      o.id && String(o.id).toLowerCase().includes(term);
    const matchOrderNumber =
      o.orderNumber && String(o.orderNumber).toLowerCase().includes(term);
    const matchBusiness =
      o.businessName && String(o.businessName).toLowerCase().includes(term);
    const items = Array.isArray(o.items) ? o.items : [];
    const matchProduct = items.some(
      (item) =>
        item &&
        (item.productName || item.name) &&
        String(item.productName || item.name || "")
          .toLowerCase()
          .includes(term)
    );
    return matchId || matchOrderNumber || matchBusiness || matchProduct;
  });
}
