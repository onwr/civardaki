/**
 * PayTR iFrame API (1. ve 2. adım) — yalnızca iFrame; Direkt API alanları yok.
 * @see https://dev.paytr.com/iframe-api/iframe-api-1-adim
 */

import crypto from "crypto";

export const OID_PREFIX = "SP";

/**
 * Salt öncesi hash metni — buildGetTokenHash ile birebir aynı birleşim (log/teşhis için).
 */
export function buildPaytrIframeHashInputString({
  merchantId,
  userIp,
  merchantOid,
  email,
  paymentAmount,
  userBasketBase64,
  noInstallment,
  maxInstallment,
  currency,
  testMode,
}) {
  return (
    String(merchantId) +
    String(userIp) +
    String(merchantOid) +
    String(email) +
    String(paymentAmount) +
    String(userBasketBase64) +
    String(noInstallment) +
    String(maxInstallment) +
    String(currency) +
    String(testMode)
  );
}

/**
 * get-token için paytr_token (base64 HMAC-SHA256)
 */
export function buildGetTokenHash({
  merchantId,
  userIp,
  merchantOid,
  email,
  paymentAmount,
  userBasketBase64,
  noInstallment,
  maxInstallment,
  currency,
  testMode,
  merchantKey,
  merchantSalt,
}) {
  const hashStr = buildPaytrIframeHashInputString({
    merchantId,
    userIp,
    merchantOid,
    email,
    paymentAmount,
    userBasketBase64,
    noInstallment,
    maxInstallment,
    currency,
    testMode,
  });
  return crypto.createHmac("sha256", merchantKey).update(hashStr + merchantSalt).digest("base64");
}

/** Bildirim URL hash doğrulaması */
export function verifyCallbackHash({ merchantOid, merchantSalt, status, totalAmount, receivedHash, merchantKey }) {
  if (!receivedHash || !merchantKey) return false;
  const data = String(merchantOid) + String(merchantSalt) + String(status) + String(totalAmount);
  const computed = crypto.createHmac("sha256", merchantKey).update(data).digest("base64");
  return computed === receivedHash;
}

/** merchant_oid: alfanumerik, max 64 */
export function generatePaytrMerchantOid() {
  const suffix = crypto.randomBytes(20).toString("hex");
  const oid = `${OID_PREFIX}${suffix}`;
  return oid.length > 64 ? oid.slice(0, 64) : oid;
}

export function parseSubscriptionPaymentIdFromOid(merchantOid) {
  if (!merchantOid || typeof merchantOid !== "string" || !merchantOid.startsWith(OID_PREFIX)) {
    return null;
  }
  const id = merchantOid.slice(OID_PREFIX.length);
  return id.length > 0 ? id : null;
}

export function getClientIp(req) {
  const override = process.env.PAYTR_USER_IP_OVERRIDE?.trim();
  if (override) return override.slice(0, 39);

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 39);
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim().slice(0, 39);
  return "127.0.0.1";
}

/** Tam secret loglanmaz; yalnızca kısa önizleme */
export function maskSecret(secret, headLen = 4) {
  if (secret == null || secret === "") return null;
  const s = String(secret);
  if (s.length <= headLen) return "…";
  return `${s.slice(0, headLen)}…`;
}
