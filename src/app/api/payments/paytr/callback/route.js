import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// `config` export removed since Next.js App Router reads requests without bodyParser config.
export async function POST(req) {
    try {
        const textBody = await req.text();
        const params = new URLSearchParams(textBody);

        const merchant_oid = params.get("merchant_oid");
        const status = params.get("status");
        const total_amount = params.get("total_amount");
        const hash = params.get("hash");

        const merchant_key = process.env.PAYTR_MERCHANT_KEY || "TEST_MERCHANT_KEY";
        const merchant_salt = process.env.PAYTR_MERCHANT_SALT || "TEST_MERCHANT_SALT";

        // PayTR Hash validation: base64(sha256(merchant_oid + salt + status + total_amount))
        const strToHash = `${merchant_oid}${merchant_salt}${status}${total_amount}`;
        const calculatedHash = crypto.createHmac("sha256", merchant_key).update(strToHash).digest("base64");

        if (hash !== calculatedHash) {
            console.error(`PayTR Hash Mismatch: expected ${calculatedHash}, got ${hash}`);
            return new NextResponse("PAYTR NOTIFICATION FAILED: HASH MISMATCH", { status: 400 });
        }

        if (status === "success") {
            // merchant_oid contains businessId (CIV_b1d83k_xxxx)
            const parts = merchant_oid.split("_");
            const businessId = parts[1];
            const now = new Date();
            const amountTL = total_amount ? Number(total_amount) / 100 : 299;

            // subscription_payment: bul veya oluştur, COMPLETED yap
            const existing = await prisma.subscription_payment.findFirst({
                where: { providerReference: merchant_oid },
            });
            if (existing) {
                await prisma.subscription_payment.update({
                    where: { id: existing.id },
                    data: { status: "COMPLETED", paidAt: now, amount: amountTL },
                });
            } else if (businessId) {
                const sub = await prisma.businesssubscription.findUnique({
                    where: { businessId },
                    select: { id: true },
                });
                await prisma.subscription_payment.create({
                    data: {
                        businessId,
                        subscriptionId: sub?.id ?? null,
                        amount: amountTL,
                        currency: "TRY",
                        status: "COMPLETED",
                        provider: "PAYTR",
                        providerReference: merchant_oid,
                        paidAt: now,
                    },
                });
            }

            if (businessId) {
                // Determine new expiry date (30 days from now)
                const expires = new Date();
                expires.setDate(now.getDate() + 30);

                await prisma.businesssubscription.update({
                    where: { businessId },
                    data: {
                        status: "ACTIVE",
                        startedAt: now,
                        expiresAt: expires,
                    }
                });

                // Event logging
                await prisma.businessEvent.create({
                    data: {
                        businessId: businessId,
                        type: "SUBSCRIPTION_RENEWED",
                    }
                });

                console.log(`Successfully extended subscription for business ${businessId} via PayTR`);

                // SPRINT 11C: Send Payment Success Email
                const businessData = await prisma.business.findUnique({
                    where: { id: businessId },
                    select: { name: true, email: true }
                });

                if (businessData && businessData.email) {
                    try {
                        const { sendPaymentSuccessEmail } = await import("@/lib/mails/send-payment-success");
                        sendPaymentSuccessEmail({
                            email: businessData.email,
                            businessName: businessData.name,
                            businessId: businessId,
                            planName: "PRO", // Determine logically if different plans exist
                            expiresAt: expires,
                            subscriptionId: businessId // Using business ID as temporary identifier if subscription ID isnt easily grabbed
                        }).catch(e => console.error("Payment Success Email Failed:", e));
                    } catch (e) {
                        console.error("Failed to import/send payment email", e);
                    }
                }
            }
        } else {
            console.log(`PayTR Payment Failed for order ${merchant_oid}`);
            const pendingPayment = await prisma.subscription_payment.findFirst({
                where: { providerReference: merchant_oid, status: "PENDING" },
            });
            if (pendingPayment) {
                await prisma.subscription_payment.update({
                    where: { id: pendingPayment.id },
                    data: { status: "FAILED" },
                });
            }
        }

        // Must return exactly "OK" for PayTR to stop retrying the webhook
        return new NextResponse("OK", { status: 200, headers: { 'Content-Type': 'text/plain' } });

    } catch (error) {
        console.error("PayTR Callback Error:", error);
        return new NextResponse("INTERNAL SERVER ERROR", { status: 500 });
    }
}
