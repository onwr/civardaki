/**
 * Menü aktif durumu: varsayılan prefix (alt sayfalar dahil), "exact" yalnızca tam eşleşme.
 * Örn. /business/products alt sayfalarında "Ürün - Hizmet Ekle" yanlışlıkla aktif olmasın.
 */
export function isNavHrefActive(pathname, href, activePathMatch = "prefix") {
  if (!href || !pathname) return false;
  if (activePathMatch === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
