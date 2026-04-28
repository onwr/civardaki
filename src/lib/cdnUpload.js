import crypto from "crypto";

/**
 * Dosyayı güvenli bir şekilde dış CDN sunucusuna yükler.
 * .env dosyasındaki CDN_UPLOAD_URL ve CDN_UPLOAD_SIGNING_SECRET'ı kullanır.
 *
 * @param {File} file Yüklenecek dosya nesnesi (request.formData() içinden gelen File objesi)
 * @param {Object} options Ek token opsiyonları (örn. maxSize, mimeType)
 * @returns {Promise<string>} Başarılı olursa CDN üzerindeki public URL'yi döner
 */
export async function uploadToCDN(file, options = {}) {
  const cdnUrl = process.env.CDN_UPLOAD_URL;
  const secret = process.env.CDN_UPLOAD_SIGNING_SECRET;

  if (!cdnUrl || !secret) {
    throw new Error("Sistem hatası: CDN URL veya Secret ayarlanmamış.");
  }

  // Yükleme tokeni için payload (5 dk geçerlilik)
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 300,
    ...options,
  };

  const payloadJson = JSON.stringify(payload);
  const encodedPayload = Buffer.from(payloadJson).toString("base64url");
  
  // HMAC-SHA256 imzası oluşturma
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(encodedPayload);
  const signature = hmac.digest("base64url");
  const uploadToken = `${encodedPayload}.${signature}`;

  // Form verisi hazırlama
  const formData = new FormData();
  formData.append("upload_token", uploadToken);
  formData.append("file", file);

  // CDN'e POST isteği
  const res = await fetch(cdnUrl, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data || !data.success) {
    throw new Error(data?.error || "CDN sunucusuna yükleme başarısız.");
  }

  return data.url;
}
