/**
 * PayTR iFrame bildirim URL — abonelik ödemesi (Prisma).
 * Ödeme başarılı: subscription_payment.status = COMPLETED (şemada PAID yok; anlam olarak “ödendi”).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCallbackHash, parseSubscriptionPaymentIdFromOid } from "@/lib/paytr";

function mergeMetadata(existing, patch) {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing) ? { ...existing } : {};
  return { ...base, ...patch };
}

async function findPaymentByOid(merchant_oid) {
  let payment = await prisma.subscription_payment.findFirst({
    where: { providerReference: merchant_oid, provider: "PAYTR" },
  });
  if (payment) return payment;
  const id = parseSubscriptionPaymentIdFromOid(merchant_oid);
  if (!id) return null;
  payment = await prisma.subscription_payment.findUnique({ where: { id } });
  if (payment?.provider === "PAYTR") return payment;
  return null;
}

/** PayTR bildirimi: application/x-www-form-urlencoded gövde (form alanları = URLSearchParams) */
async function parsePaytrFormFields(req) {
  const text = await req.text();
  return new URLSearchParams(text);
}

export async function handlePaytrIframeCallback(req) {
  try {
    const params = await parsePaytrFormFields(req);

    const merchant_oid = params.get("merchant_oid");
    const status = params.get("status");
    const total_amount = params.get("total_amount");
    const hash = params.get("hash");

    const merchant_key = process.env.PAYTR_MERCHANT_KEY?.trim();
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT?.trim();

    if (!merchant_oid || !status || total_amount == null || !hash) {
      return new NextResponse("BAD REQUEST", { status: 400 });
    }

    if (!merchant_key || !merchant_salt) {
      console.error("PayTR callback: eksik PAYTR_MERCHANT_KEY / PAYTR_MERCHANT_SALT");
      return new NextResponse("CONFIG ERROR", { status: 500 });
    }

    const hashOk = verifyCallbackHash({
      merchantOid: merchant_oid,
      merchantSalt: merchant_salt,
      status,
      totalAmount: total_amount,
      receivedHash: hash,
      merchantKey: merchant_key,
    });

    if (!hashOk) {
      console.error("PayTR callback: hash uyuşmazlığı", { merchant_oid, status });
      return new NextResponse("HASH MISMATCH", { status: 400 });
    }

    const payment = await findPaymentByOid(merchant_oid);

    if (!payment) {
      console.error("PayTR callback: ödeme kaydı bulunamadı", merchant_oid);
      return new NextResponse("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (payment.status === "COMPLETED" && payment.providerReference === merchant_oid) {
      return new NextResponse("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const expectedKurus =
      payment.metadata &&
      typeof payment.metadata === "object" &&
      typeof payment.metadata.expectedTotalKurus === "number"
        ? payment.metadata.expectedTotalKurus
        : Math.round(payment.amount * 100);

    const receivedKurus = parseInt(String(total_amount), 10);
    if (Number.isNaN(receivedKurus)) {
      return new NextResponse("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (status === "success") {
      if (receivedKurus !== expectedKurus) {
        console.error("PayTR callback: tutar uyuşmazlığı", {
          merchant_oid,
          expectedKurus,
          receivedKurus,
        });
        await prisma.subscription_payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            metadata: mergeMetadata(payment.metadata, {
              reason: "AMOUNT_MISMATCH",
              expectedTotalKurus: expectedKurus,
              receivedTotalKurus: receivedKurus,
            }),
          },
        });
        return new NextResponse("OK", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      const now = new Date();
      const amountTL = receivedKurus / 100;

      const subRow = await prisma.businesssubscription.findUnique({
        where: { businessId: payment.businessId },
      });

      let newExpiresAt = new Date(now);
      if (subRow?.expiresAt && subRow.expiresAt > now) {
        newExpiresAt = new Date(subRow.expiresAt);
      }
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);

      let didComplete = false;
      await prisma.$transaction(async (tx) => {
        const upd = await tx.subscription_payment.updateMany({
          where: { id: payment.id, status: "PENDING" },
          data: {
            status: "COMPLETED",
            paidAt: now,
            amount: amountTL,
            providerReference: merchant_oid,
            metadata: mergeMetadata(payment.metadata, { completedAt: now.toISOString() }),
          },
        });
        if (upd.count === 0) return;
        didComplete = true;

        await tx.businesssubscription.upsert({
          where: { businessId: payment.businessId },
          create: {
            businessId: payment.businessId,
            status: "ACTIVE",
            plan: "BASIC",
            startedAt: now,
            expiresAt: newExpiresAt,
          },
          update: {
            status: "ACTIVE",
            startedAt: subRow?.startedAt && subRow.startedAt < now ? subRow.startedAt : now,
            expiresAt: newExpiresAt,
          },
        });

        await tx.businessevent.create({
          data: {
            businessId: payment.businessId,
            type: "SUBSCRIPTION_RENEWED",
          },
        });
      });

      if (didComplete) {
        const businessData = await prisma.business.findUnique({
          where: { id: payment.businessId },
          select: { name: true, email: true },
        });

        const refreshedSub = await prisma.businesssubscription.findUnique({
          where: { businessId: payment.businessId },
          select: { id: true, plan: true },
        });

        if (businessData?.email) {
          try {
            const { sendPaymentSuccessEmail } = await import("@/lib/mails/send-payment-success");
            const planName = refreshedSub?.plan === "PREMIUM" ? "Premium" : "Aylık Erişim";
            sendPaymentSuccessEmail({
              email: businessData.email,
              businessName: businessData.name,
              businessId: payment.businessId,
              planName,
              expiresAt: newExpiresAt,
              subscriptionId: refreshedSub?.id || payment.businessId,
            }).catch((e) => console.error("Payment Success Email Failed:", e));
          } catch (e) {
            console.error("Failed to import/send payment email", e);
          }
        }
      }
    } else {
      if (payment.status === "PENDING") {
        await prisma.subscription_payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            metadata: mergeMetadata(payment.metadata, {
              reason: "PAYTR_FAIL_STATUS",
              paytrStatus: status,
            }),
          },
        });
      }
    }

    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("PayTR Callback Error:", error);
    return new NextResponse("INTERNAL SERVER ERROR", { status: 500 });
  }
}
