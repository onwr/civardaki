import { NextResponse } from "next/server";
import { buildStatusInquiryToken } from "@/lib/paytr-status";
import { prisma } from "@/lib/prisma";
import { maskSecret } from "@/lib/paytr";

export const runtime = "nodejs";

const PAYTR_STATUS_URL = "https://www.paytr.com/odeme/durum-sorgu";

function shouldLog() {
  return process.env.NODE_ENV === "development" || process.env.PAYTR_STATUS_DEBUG === "1";
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const merchantOid = (body.merchantOid || "").trim();

    if (!merchantOid) {
      return NextResponse.json({ ok: false, error: "merchantOid zorunludur." }, { status: 400 });
    }

    const merchantId = process.env.PAYTR_MERCHANT_ID?.trim();
    const merchantKey = process.env.PAYTR_MERCHANT_KEY?.trim();
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT?.trim();

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json(
        { ok: false, error: "PayTR yapılandırması eksik.", code: "PAYTR_CONFIG_MISSING" },
        { status: 503 }
      );
    }

    const paytr_token = buildStatusInquiryToken({
      merchantId,
      merchantOid,
      merchantKey,
      merchantSalt,
    });

    // Opsiyonel: DB'de varsa bul (update yok)
    let paymentHint = null;
    try {
      const p = await prisma.subscription_payment.findFirst({
        where: { provider: "PAYTR", providerReference: merchantOid },
        select: { id: true, status: true, businessId: true, createdAt: true },
      });
      if (p) paymentHint = p;
    } catch {
      // DB hatası status sorgusunu engellemesin
    }

    const formFields = {
      merchant_id: String(merchantId),
      merchant_oid: merchantOid,
      paytr_token,
    };

    if (shouldLog()) {
      console.log("[PayTR status]", {
        merchant_id_configured: Boolean(merchantId),
        merchant_oid: merchantOid,
        token_preview: maskSecret(paytr_token, 12),
        endpoint: PAYTR_STATUS_URL,
        NODE_ENV: process.env.NODE_ENV,
        paymentHint,
        // Secret yok; paytr_token tam halini loglamıyoruz
        formFields: {
          merchant_id: formFields.merchant_id,
          merchant_oid: formFields.merchant_oid,
          paytr_token_preview: maskSecret(formFields.paytr_token, 12),
        },
      });
    }

    const paytrRes = await fetch(PAYTR_STATUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: new URLSearchParams(formFields).toString(),
    });

    const rawText = await paytrRes.text();

    if (shouldLog()) {
      console.log("[PayTR status] HTTP", {
        paytr_http_status: paytrRes.status,
        raw_response_preview: rawText.slice(0, 2000),
      });
    }

    let json;
    try {
      json = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { ok: false, error: "PayTR JSON dönmedi.", code: "PAYTR_UPSTREAM_NON_JSON" },
        { status: 502 }
      );
    }

    // PayTR yanıtını aynen dön (üstüne ok + hint ekliyoruz)
    const statusCode = json.status === "success" ? 200 : 422;
    return NextResponse.json(
      { ok: true, paytr: json, paymentHint },
      { status: statusCode }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Beklenmeyen hata." },
      { status: 500 }
    );
  }
}

