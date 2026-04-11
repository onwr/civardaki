import crypto from "crypto";

export function buildStatusInquiryToken({ merchantId, merchantOid, merchantKey, merchantSalt }) {
  const hashStr = String(merchantId) + String(merchantOid) + String(merchantSalt);
  return crypto.createHmac("sha256", merchantKey).update(hashStr).digest("base64");
}

