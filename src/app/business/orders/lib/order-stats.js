/**
 * Sipariş listesi üzerinden istatistik hesapları.
 */

export function getLiveCount(orders) {
  if (!Array.isArray(orders)) return 0;
  return orders.filter((o) => o && !["DELIVERED", "CANCELLED"].includes(o.status)).length;
}

export function getTodayRevenue(orders) {
  if (!Array.isArray(orders)) return 0;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return orders
    .filter((o) => {
      if (!o || o.status !== "DELIVERED" || !o.createdAt) return false;
      const t = new Date(o.createdAt).getTime();
      return t >= start.getTime() && t <= end.getTime();
    })
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
}

export function getYesterdayRevenue(orders) {
  if (!Array.isArray(orders)) return 0;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
  return orders
    .filter((o) => {
      if (!o || o.status !== "DELIVERED" || !o.createdAt) return false;
      const t = new Date(o.createdAt).getTime();
      return t >= start.getTime() && t <= end.getTime();
    })
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
}

export function getRevenueChangePercent(todayRevenue, yesterdayRevenue) {
  const today = Number(todayRevenue) || 0;
  const yesterday = Number(yesterdayRevenue) || 0;
  if (yesterday > 0) return Math.round(((today - yesterday) / yesterday) * 100);
  return today > 0 ? 100 : null;
}
