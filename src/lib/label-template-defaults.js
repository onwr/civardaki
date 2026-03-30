/** @typedef {"PRODUCT" | "ADDRESS"} LabelCategory */

export const LABEL_CATEGORIES = new Set(["PRODUCT", "ADDRESS"]);
export const LABEL_FORMATS = new Set(["A4", "RIBBON"]);

export function defaultSettingsProduct() {
  return {
    pageMarginLeftMm: 5,
    pageMarginRightMm: 5,
    labelsPerRow: 1,
    labelOrientation: "horizontal",
    labelWidthMm: 70,
    labelHeightMm: 46,
    gapHorizontalMm: 2,
    gapVerticalMm: 2,
    showProductName: true,
    showProductCode: true,
    showSalePrice: true,
    showBarcode: true,
    showLocalProductionLogo: true,
    showProductTags: false,
    showFixedDescription: false,
    showShelfLocation: false,
  };
}

export function defaultSettingsAddress() {
  return {
    pageMarginTopMm: 5,
    pageMarginBottomMm: 5,
    pageMarginLeftMm: 5,
    pageMarginRightMm: 5,
    rowsOnPage: 5,
    labelsPerRow: 2,
    labelWidthMm: 70,
    labelHeightMm: 30,
    gapHorizontalMm: 2,
    gapVerticalMm: 2,
    showRecipientName: true,
    showAddress: true,
    showPhone: true,
    showFixedDescription: false,
    showShelfLocation: false,
  };
}

function baseForCategory(category) {
  if (category === "ADDRESS") return defaultSettingsAddress();
  return defaultSettingsProduct();
}

/**
 * @param {string} category
 * @param {unknown} raw
 */
export function normalizeSettings(category, raw) {
  const base = baseForCategory(category);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ...base };
  return { ...base, ...raw };
}

/**
 * @param {string} category
 * @param {unknown} existing
 * @param {unknown} patch
 */
export function mergeSettings(category, existing, patch) {
  const cur = normalizeSettings(category, existing);
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return cur;
  return { ...cur, ...patch };
}

export function categoryLabelTr(category) {
  const map = { PRODUCT: "Ürün Etiketi", ADDRESS: "Adres Etiketi" };
  return map[category] || category;
}

export function formatLabelTr(format) {
  const map = { A4: "A4", RIBBON: "Şerit" };
  return map[format] || format;
}
