/**
 * Admin businesses: subscription and business status labels/styles.
 * Matches Prisma enums: businesssubscription_status, businesssubscription_plan.
 */

export const SUBSCRIPTION_STATUS = {
  TRIAL: { label: "Deneme", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  ACTIVE: { label: "Aktif", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  EXPIRED: { label: "Süresi Doldu", badge: "bg-rose-50 text-rose-700 border-rose-200" },
};

export const SUBSCRIPTION_PLAN = {
  BASIC: { label: "Temel", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  PREMIUM: { label: "Premium", badge: "bg-blue-50 text-blue-700 border-blue-200" },
};

export function getSubscriptionStatusConfig(status) {
  if (!status) return { label: "Yok", badge: "bg-slate-100 text-slate-500 border-slate-200" };
  return SUBSCRIPTION_STATUS[status] || { label: status, badge: "bg-slate-100 text-slate-600 border-slate-200" };
}

export function getSubscriptionPlanConfig(plan) {
  if (!plan) return { label: "—", badge: "bg-slate-100 text-slate-500 border-slate-200" };
  return SUBSCRIPTION_PLAN[plan] || { label: plan, badge: "bg-slate-100 text-slate-600 border-slate-200" };
}

export const ACTIVE_BADGE = {
  true: { label: "Aktif", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  false: { label: "Pasif", badge: "bg-slate-100 text-slate-600 border-slate-200" },
};

export const VERIFIED_BADGE = {
  true: { label: "Doğrulandı", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  false: { label: "Doğrulanmadı", badge: "bg-slate-100 text-slate-500 border-slate-200" },
};

export function getActiveBadge(isActive) {
  return ACTIVE_BADGE[isActive === true] || ACTIVE_BADGE[false];
}

export function getVerifiedBadge(isVerified) {
  return VERIFIED_BADGE[isVerified === true] || VERIFIED_BADGE[false];
}
