/** @typedef {Record<string, boolean>} LayoutSettings */

export const PROPOSAL_TEMPLATE_KINDS = new Set([
  "PURCHASE_NOTE",
  "BA_BS_FORM",
  "SALES_NOTE",
  "QUOTE",
  "CUSTOM",
]);

export function defaultLayoutSettings() {
  return {
    showValidityDate: true,
    showLogo: true,
    showCustomerAddress: true,
    showLineTotals: true,
    showDescription: true,
    showCurrentBalance: false,
    showDiscountRateInRows: false,
    showUnitPrice: true,
    showUnitPriceExVat: false,
    showLineTotalIncVat: true,
    showDiscountedPrice: false,
    showVatRate: false,
  };
}

/** Sunucu: DB’den gelen + eksik anahtarları varsayılanla doldur */
export function normalizeLayoutSettings(raw) {
  const base = defaultLayoutSettings();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  return { ...base, ...raw };
}

/** PATCH: mevcut ayarların üzerine kısmi güncelleme */
export function mergeLayoutSettings(existing, patch) {
  const cur = normalizeLayoutSettings(existing);
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return cur;
  return { ...cur, ...patch };
}

export function kindLabelTr(kind) {
  const map = {
    PURCHASE_NOTE: "Alış",
    BA_BS_FORM: "BA BS Formu",
    SALES_NOTE: "Satış",
    QUOTE: "Teklif",
    CUSTOM: "Özel",
  };
  return map[kind] || kind;
}

export function defaultDocumentTitleForKind(kind) {
  const map = {
    PURCHASE_NOTE: "ALIŞ BİLGİ NOTU",
    BA_BS_FORM: "BA-BS MUTABAKAT FORMU",
    SALES_NOTE: "SATIŞ BİLGİ NOTU",
    QUOTE: "TEKLİF FORMU",
    CUSTOM: "BELGE",
  };
  return map[kind] || "TEKLİF FORMU";
}
