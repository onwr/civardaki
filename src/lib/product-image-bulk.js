/** @returns {string|null} boş hücre; {false} geçersiz; {string} geçerli https URL */
export function validateHttpsImageUrl(u) {
  const s = String(u ?? "").trim();
  if (!s) return null;
  if (!/^https:\/\//i.test(s)) return false;
  const path = s.split(/[?#]/)[0].toLowerCase();
  if (!/\.(jpe?g|gif|png)$/.test(path)) return false;
  return s;
}

export function parseGalleryJson(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((x) => typeof x === "string");
  }
  return [];
}
