import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildGetTokenHash,
  buildPaytrIframeHashInputString,
  generatePaytrMerchantOid,
  getClientIp,
  maskSecret,
} from "@/lib/paytr";

export const runtime = "nodejs";

const PAYTR_GET_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";

function subscriptionKurus() {
  const raw = process.env.PAYTR_SUBSCRIPTION_KURUS;
  if (raw != null && raw !== "") {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 29900;
}

const RENEWAL_BLOCK_DAYS = 7;

function shouldLogPaytrInit() {
  return process.env.NODE_ENV === "development" || process.env.PAYTR_INIT_DEBUG === "1";
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "BUSINESS") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    const merchant_id = process.env.PAYTR_MERCHANT_ID?.trim();
    const merchant_key = process.env.PAYTR_MERCHANT_KEY?.trim();
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT?.trim();

    if (!merchant_id || !merchant_key || !merchant_salt) {
      console.error("PayTR init: eksik PAYTR_MERCHANT_* ortam değişkenleri");
      return NextResponse.json(
        { ok: false, error: "Ödeme yapılandırması eksik.", code: "PAYTR_CONFIG_MISSING" },
        { status: 503 }
      );
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { ownedbusiness: { include: { user: true } } },
    });

    if (!business) {
      return NextResponse.json({ ok: false, error: "Business not found" }, { status: 404 });
    }

    const primaryOwner =
      business.ownedbusiness.find((o) => o.isPrimary)?.user || business.ownedbusiness[0]?.user;

    const subscription = await prisma.businesssubscription.findUnique({
      where: { businessId },
    });

    if (subscription?.status === "ACTIVE" && subscription.expiresAt) {
      const blockUntil = new Date(subscription.expiresAt);
      blockUntil.setDate(blockUntil.getDate() - RENEWAL_BLOCK_DAYS);
      if (blockUntil > new Date()) {
        return NextResponse.json(
          {
            ok: false,
            error: "Aboneliğiniz henüz yenilenmeye ihtiyaç duymuyor.",
            code: "SUBSCRIPTION_NOT_DUE",
          },
          { status: 409 }
        );
      }
    }

    await prisma.businessevent.create({
      data: {
        businessId: business.id,
        type: "CLICK_BILLING_PAY",
      },
    });

    const payment_amount = subscriptionKurus();
    const amountTL = payment_amount / 100;

    await prisma.subscription_payment.updateMany({
      where: {
        businessId,
        provider: "PAYTR",
        status: "PENDING",
      },
      data: {
        status: "FAILED",
        metadata: { reason: "SUPERSEDED_BY_NEW_INIT", at: new Date().toISOString() },
      },
    });

    const pending = await prisma.subscription_payment.create({
      data: {
        businessId,
        subscriptionId: subscription?.id ?? null,
        amount: amountTL,
        currency: "TRY",
        status: "PENDING",
        provider: "PAYTR",
        providerReference: null,
        metadata: { expectedTotalKurus: payment_amount },
      },
    });

    const merchant_oid = generatePaytrMerchantOid();

    await prisma.subscription_payment.update({
      where: { id: pending.id },
      data: { providerReference: merchant_oid },
    });

    const email = (primaryOwner?.email || session.user.email || "").trim().slice(0, 100);
    if (!email) {
      await prisma.subscription_payment.update({
        where: { id: pending.id },
        data: {
          status: "FAILED",
          metadata: { expectedTotalKurus: payment_amount, reason: "NO_EMAIL" },
        },
      });
      return NextResponse.json(
        { ok: false, error: "İşletme için e-posta bulunamadı.", code: "NO_EMAIL" },
        { status: 400 }
      );
    }

    const user_ip = getClientIp(req);
    if (user_ip === "127.0.0.1" || user_ip === "::1") {
      console.warn(
        "PayTR: user_ip yerel; get-token için .env PAYTR_USER_IP_OVERRIDE=gerçek_dış_IP kullanın."
      );
    }

    const user_name = (primaryOwner?.name || business.name || "Isletme").slice(0, 60);
    const user_address = (business.address || business.city || "Turkiye").slice(0, 400);
    const user_phone = (business.phone || "05000000000").replace(/\s/g, "").slice(0, 20);

    const basketUnitPrice = (payment_amount / 100).toFixed(2);
    const basketJson = JSON.stringify([["Civardaki Aylik Panel Aboneligi", basketUnitPrice, 1]]);
    const user_basket = Buffer.from(basketJson, "utf8").toString("base64");

    const payment_amount_str = String(Math.round(Number(payment_amount)));

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const merchant_ok_url = `${baseUrl}/business/billing?payment=success`;
    const merchant_fail_url = `${baseUrl}/business/billing?payment=fail`;

    const test_mode = process.env.PAYTR_TEST_MODE === "1" ? 1 : 0;
    const no_installment = 1;
    const max_installment = 0;
    const currency = "TL";
    const debug_on = process.env.NODE_ENV === "development" ? 1 : 0;

    const hashParts = {
      merchantId: merchant_id,
      userIp: user_ip,
      merchantOid: merchant_oid,
      email,
      paymentAmount: payment_amount_str,
      userBasketBase64: user_basket,
      noInstallment: no_installment,
      maxInstallment: max_installment,
      currency,
      testMode: test_mode,
    };

    const hash_input = buildPaytrIframeHashInputString(hashParts);

    const paytr_token = buildGetTokenHash({
      ...hashParts,
      merchantKey: merchant_key,
      merchantSalt: merchant_salt,
    });

    if (shouldLogPaytrInit()) {
      const formFieldsForLog = {
        merchant_id: String(merchant_id),
        user_ip,
        merchant_oid,
        email,
        payment_amount: payment_amount_str,
        user_basket,
        debug_on: String(debug_on),
        no_installment: String(no_installment),
        max_installment: String(max_installment),
        user_name,
        user_address,
        user_phone,
        merchant_ok_url,
        merchant_fail_url,
        timeout_limit: "30",
        currency,
        test_mode: String(test_mode),
        // Secret değil ama hassas türev; full loglamıyoruz
        paytr_token_preview: maskSecret(paytr_token, 12),
      };

      console.log("[PayTR iFrame init]", {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || null,
        paytr_endpoint_url: PAYTR_GET_TOKEN_URL,
        merchant_id_configured: Boolean(merchant_id),
        merchant_key_length: merchant_key.length,
        merchant_salt_length: merchant_salt.length,
        merchant_key_preview: maskSecret(merchant_key),
        merchant_salt_preview: maskSecret(merchant_salt),
        user_ip,
        merchant_oid,
        email,
        payment_amount: payment_amount_str,
        user_basket,
        user_basket_json: basketJson,
        no_installment,
        max_installment,
        currency,
        test_mode,
        hash_input,
        paytr_token_preview: maskSecret(paytr_token, 12),
        merchant_ok_url,
        merchant_fail_url,
        formFields: formFieldsForLog,
      });
    }

    const formFields = {
      merchant_id: String(merchant_id),
      user_ip,
      merchant_oid,
      email,
      payment_amount: payment_amount_str,
      paytr_token,
      user_basket,
      debug_on: String(debug_on),
      no_installment: String(no_installment),
      max_installment: String(max_installment),
      user_name,
      user_address,
      user_phone,
      merchant_ok_url,
      merchant_fail_url,
      timeout_limit: "30",
      currency,
      test_mode: String(test_mode),
    };

    const body = new URLSearchParams(formFields);

    const paytrRes = await fetch(PAYTR_GET_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: body.toString(),
    });

    const rawText = await paytrRes.text();

    if (shouldLogPaytrInit()) {
      console.log("[PayTR iFrame init] HTTP", {
        paytr_http_status: paytrRes.status,
        paytr_raw_response: rawText.slice(0, 2000),
      });
    }

    let json;
    try {
      json = JSON.parse(rawText);
    } catch {
      console.error("PayTR get-token geçersiz JSON:", rawText.slice(0, 500));
      await prisma.subscription_payment.update({
        where: { id: pending.id },
        data: {
          status: "FAILED",
          metadata: {
            expectedTotalKurus: payment_amount,
            reason: "PAYTR_INVALID_RESPONSE",
            snippet: rawText.slice(0, 200),
          },
        },
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Ödeme sağlayıcısı beklenen formatta yanıt vermedi.",
          code: "PAYTR_UPSTREAM_NON_JSON",
        },
        { status: 503 }
      );
    }

    if (json.status !== "success" || !json.token) {
      console.error("PayTR get-token failed:", JSON.stringify(json));
      await prisma.subscription_payment.update({
        where: { id: pending.id },
        data: {
          status: "FAILED",
          metadata: {
            expectedTotalKurus: payment_amount,
            reason: "PAYTR_TOKEN_FAILED",
            paytrReason: json.reason || null,
            paytrRaw: json,
            merchantOid: merchant_oid,
            userIp: user_ip,
            paymentAmount: payment_amount_str,
            basketJson,
          },
        },
      });
      return NextResponse.json(
        {
          ok: false,
          error: json.reason || "Ödeme oturumu başlatılamadı.",
          code: "PAYTR_TOKEN_REJECTED",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { ok: true, token: json.token, merchant_oid },
      { status: 200 }
    );
  } catch (error) {
    console.error("PayTR Init Error:", error);
    return NextResponse.json(
      { ok: false, error: "Ödeme başlatılamadı.", code: "PAYTR_INIT_EXCEPTION" },
      { status: 500 }
    );
  }
}
