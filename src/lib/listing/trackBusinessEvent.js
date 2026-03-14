/**
 * İşletme sayfası kullanıcı aksiyonlarını analytics event olarak backend'e gönderir.
 * UI bloklamaz; fetch hata verse bile sessizce fail eder.
 *
 * @param {string} type - Event tipi (VIEW_PROFILE, CLICK_PHONE, CLICK_CTA_PRIMARY, vb.)
 * @param {string} businessSlug - İşletme slug'ı (backend slug -> businessId resolve eder)
 * @param {{ productId?: string; useViewProfileDedupe?: boolean }} [options] - productId: ürün event'leri için; useViewProfileDedupe: VIEW_PROFILE için 60sn sessionStorage dedupe
 */
export function trackBusinessEvent(type, businessSlug, options = {}) {
  const slug = typeof businessSlug === "string" ? businessSlug.trim() : "";
  if (!slug || !type) return;

  const { productId, useViewProfileDedupe } = options;

  if (useViewProfileDedupe && typeof window !== "undefined") {
    const storageKey = `view_profile_${slug}`;
    const cooldownMs = 60 * 1000;
    const last = window.sessionStorage.getItem(storageKey);
    const now = Date.now();
    if (last != null && now - Number(last) < cooldownMs) return;
  }

  const body = { businessSlug: slug, type };
  if (productId != null && productId !== "") body.productId = String(productId);

  fetch("/api/public/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (res.ok && useViewProfileDedupe && typeof window !== "undefined") {
        window.sessionStorage.setItem(`view_profile_${slug}`, String(Date.now()));
      }
    })
    .catch(() => {});
}
