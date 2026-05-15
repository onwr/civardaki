/**
 * İşletme paneli erişimi: user.role + ownedbusiness (session.businessId / hasBusiness).
 * business tablosunda userId yok; bağlantı ownedbusiness üzerinden.
 */

export function userHasOwnedBusiness(user) {
  if (!user) return false;
  return Boolean(user.businessId || user.hasBusiness);
}

/** /business layout ve panel linkleri */
export function canAccessBusinessPanel(user) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return userHasOwnedBusiness(user) || user.role === "BUSINESS";
}

/** İşletme API route'ları — admin veya bağlı işletme */
export function canCallBusinessApi(user) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return userHasOwnedBusiness(user) || user.role === "BUSINESS";
}

/**
 * Header'da "İşletme Paneli" metni ve /business yönlendirmesi.
 * ADMIN + ownedbusiness → işletme paneli (admin menüsünden /admin ayrı kalır).
 */
export function isBusinessPanelUser(user) {
  if (!user) return false;
  return userHasOwnedBusiness(user) || user.role === "BUSINESS";
}

/** Header "Panel" butonu URL'i */
export function getPanelHrefForUser(user) {
  if (!user) return "/user/login";
  if (isBusinessPanelUser(user)) return "/business";
  if (user.role === "ADMIN") return "/user";
  return "/user";
}
