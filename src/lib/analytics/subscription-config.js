/**
 * Admin analytics: abonelik plan fiyatları (aylık TL).
 * Şema businesssubscription_plan: BASIC, PREMIUM.
 */
export const SUBSCRIPTION_PLAN_PRICES = {
  BASIC: 299,
  PREMIUM: 999,
};

/**
 * @param {string} plan - Plan adı (BASIC, PREMIUM)
 * @returns {number}
 */
export function getPlanPrice(plan) {
  if (plan == null || plan === "") return 0;
  return SUBSCRIPTION_PLAN_PRICES[String(plan).toUpperCase()] ?? 0;
}

/**
 * Tahmini aylık tekrarlayan gelir (MRR).
 * @param {{ plan: string, count: number }[]} subscriptions - Plan bazlı dağılım
 * @returns {number}
 */
export function estimateMRR(subscriptions) {
  if (!Array.isArray(subscriptions)) return 0;
  return subscriptions.reduce((acc, sub) => {
    const count = Number(sub?.count) || 0;
    return acc + count * getPlanPrice(sub?.plan);
  }, 0);
}
