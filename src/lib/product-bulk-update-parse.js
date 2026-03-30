import { SALES_UNIT_OPTIONS, SALES_UNIT_LABELS } from "@/lib/product-sales-units";

export function normProductName(s) {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

/** @returns {string|null} TL|USD|EUR; null = geçersiz */
export function parsePriceCurrencyCell(raw) {
  const u = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (!u) return "TL";
  if (u === "TRY" || u === "TL") return "TL";
  if (u === "USD") return "USD";
  if (u === "EUR") return "EUR";
  return null;
}

/** Geçerli kod veya etiket; boş = değiştirme yok */
export function parseSalesUnitCell(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const u = s.toUpperCase();
  if (SALES_UNIT_LABELS[u]) return u;
  const byLabel = SALES_UNIT_OPTIONS.find(
    (o) => o.label.toLowerCase() === s.toLowerCase(),
  );
  if (byLabel) return byLabel.value;
  return null;
}

/** A = aktif, P = pasif, boş = aktif */
export function parseActiveCell(raw) {
  const c = String(raw ?? "").trim().toUpperCase();
  if (c === "P") return false;
  return true;
}
