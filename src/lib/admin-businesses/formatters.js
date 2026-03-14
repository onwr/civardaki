/**
 * Admin businesses: date, number and display formatters.
 * Null-safe.
 */

export function formatDate(value) {
  if (value == null) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("tr-TR");
}

export function formatDateTime(value) {
  if (value == null) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("tr-TR");
}

export function formatSubscriptionExpiry(expiresAt) {
  if (expiresAt == null) return "—";
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const days = Math.ceil((d - now) / (24 * 60 * 60 * 1000));
  if (days < 0) return `${formatDate(expiresAt)} (süresi doldu)`;
  if (days === 0) return "Bugün";
  if (days === 1) return "Yarın";
  return `${formatDate(expiresAt)} (${days} gün)`;
}

export function daysUntil(expiresAt) {
  if (expiresAt == null) return null;
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d - new Date()) / (24 * 60 * 60 * 1000));
}

export function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return "0";
  return String(Number(n));
}

export function safeStr(val) {
  if (val == null) return "";
  return String(val).trim();
}
