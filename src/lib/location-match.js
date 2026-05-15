/**
 * İl/ilçe eşleştirme — DB (Title Case) vs API JSON (BÜYÜK HARF) toleransı.
 */

export function normalizeLocationText(text) {
  return String(text || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

export function toDisplayLocationName(name) {
  const normalized = normalizeLocationText(name);
  if (!normalized) return "";
  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1))
    .join(" ");
}

export function matchesLocation(business, city, district) {
  if (!business) return false;
  const bizCity = normalizeLocationText(business.city);
  const bizDistrict = normalizeLocationText(business.district);
  const wantCity = normalizeLocationText(city);
  const wantDistrict = normalizeLocationText(district);

  if (wantCity && bizCity !== wantCity) return false;
  if (wantDistrict && bizDistrict !== wantDistrict) return false;
  return true;
}

export function filterBusinessesByLocation(items, city, district) {
  if (!city && !district) return items;
  return items.filter((b) => matchesLocation(b, city, district));
}

/** Yakın sıralama: önce ilçe tam eşleşme, sonra rating */
export function sortByNearbyRelevance(items, city, district) {
  const wantCity = normalizeLocationText(city);
  const wantDistrict = normalizeLocationText(district);

  return [...items].sort((a, b) => {
    if (wantDistrict) {
      const aDist = normalizeLocationText(a.district) === wantDistrict ? 1 : 0;
      const bDist = normalizeLocationText(b.district) === wantDistrict ? 1 : 0;
      if (bDist !== aDist) return bDist - aDist;
    }
    if (wantCity) {
      const aCity = normalizeLocationText(a.city) === wantCity ? 1 : 0;
      const bCity = normalizeLocationText(b.city) === wantCity ? 1 : 0;
      if (bCity !== aCity) return bCity - aCity;
    }
    const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (Number(b.reviewCount) || 0) - (Number(a.reviewCount) || 0);
  });
}
