/**
 * User orders normalize helpers.
 * - Array değilse boş array dön
 * - date parse güvenli
 * - items fallback
 * - total/subtotal number fallback
 * - business logo fallback
 */

export const PLACEHOLDER_LOGO =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop";

/**
 * @param {unknown} value
 * @returns {Date | null}
 */
export function safeOrderDate(value) {
  if (value == null) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Tek sipariş objesini normalize eder.
 * @param {unknown} o - API'dan gelen sipariş
 * @returns {object | null}
 */
export function normalizeOrder(o) {
  if (!o || typeof o !== "object") return null;
  const orderDate = safeOrderDate(o.orderDate ?? o.createdAt);
  const items = Array.isArray(o.items)
    ? o.items.map((item) => ({
        id: item.id != null ? String(item.id) : "",
        productName:
          item.productName != null
            ? String(item.productName)
            : item.name != null
              ? String(item.name)
              : "—",
        quantity:
          item.quantity != null
            ? Number(item.quantity)
            : item.qty != null
              ? Number(item.qty)
              : 1,
        price: item.price != null ? Number(item.price) : 0,
        total:
          item.total != null
            ? Number(item.total)
            : (item.quantity != null ? Number(item.quantity) : 1) *
              (item.price != null ? Number(item.price) : 0),
      }))
    : [];

  return {
    id: o.id != null ? String(o.id) : "",
    orderNumber: o.orderNumber != null ? String(o.orderNumber) : "",
    status:
      o.status != null ? String(o.status).toLowerCase() : "pending",
    total: o.total != null ? Number(o.total) : 0,
    subtotal: o.subtotal != null ? Number(o.subtotal) : 0,
    orderDate: orderDate || new Date(0),
    businessId: o.businessId != null ? String(o.businessId) : "",
    businessName: o.businessName != null ? String(o.businessName) : "",
    businessSlug: o.businessSlug != null ? String(o.businessSlug) : "",
    businessLogo:
      o.businessLogo && String(o.businessLogo).trim()
        ? String(o.businessLogo).trim()
        : PLACEHOLDER_LOGO,
    items,
    deliveryAddress: o.deliveryAddress != null ? String(o.deliveryAddress) : "",
    deliveryNote: o.deliveryNote != null ? String(o.deliveryNote) : "",
    deliveryType: o.deliveryType != null ? o.deliveryType : null,
    paymentMethod: o.paymentMethod != null ? String(o.paymentMethod) : "",
  };
}

/**
 * API cevabını (array veya tek obje) normalize sipariş listesine çevirir.
 * @param {unknown} data - GET /api/user/orders cevabı
 * @returns {object[]}
 */
export function normalizeOrdersList(data) {
  if (!data) return [];
  const rawList = Array.isArray(data) ? data : [];
  return rawList.map(normalizeOrder).filter(Boolean);
}
