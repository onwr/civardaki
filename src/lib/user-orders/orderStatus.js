/**
 * Sipariş durumu sabitleri ve yardımcılar.
 * active: pending, confirmed, preparing, on_the_way
 * past: delivered, completed, cancelled
 */

/** @type {string[]} */
export const ACTIVE_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "on_the_way",
];

/** delivered ve completed aynı kabul edilir (tek yerde yönetim) */
/** @type {string[]} */
export const PAST_STATUSES = ["delivered", "completed", "cancelled"];

/**
 * @param {string} status
 * @returns {boolean}
 */
export function isActiveStatus(status) {
  if (!status || typeof status !== "string") return false;
  const s = status.toLowerCase();
  return ACTIVE_STATUSES.includes(s);
}

/**
 * @param {string} status
 * @returns {boolean}
 */
export function isPastStatus(status) {
  if (!status || typeof status !== "string") return true;
  const s = status.toLowerCase();
  return PAST_STATUSES.includes(s) || !ACTIVE_STATUSES.includes(s);
}

/**
 * @param {string} status
 * @returns {boolean}
 */
export function isDeliveredOrCompleted(status) {
  if (!status || typeof status !== "string") return false;
  const s = status.toLowerCase();
  return s === "delivered" || s === "completed";
}

/**
 * @param {string} status
 * @returns {boolean}
 */
export function isCancelled(status) {
  return status != null && String(status).toLowerCase() === "cancelled";
}
