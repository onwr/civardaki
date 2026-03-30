/**
 * EAN-13 kontrol basamağı (GS1).
 * @param {string} digits12 — tam 12 rakam
 */
export function ean13CheckDigit(digits12) {
  if (!/^\d{12}$/.test(digits12)) return 0;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = digits12.charCodeAt(i) - 48;
    sum += i % 2 === 0 ? d : d * 3;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Geçerli EAN-13 barkodu üretir (13 hane, son hane kontrol).
 */
export function generateEan13Barcode() {
  const arr = new Uint8Array(12);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 12; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  let digits12 = "";
  for (let i = 0; i < 12; i++) {
    digits12 += (arr[i] % 10).toString();
  }
  const check = ean13CheckDigit(digits12);
  return `${digits12}${check}`;
}
