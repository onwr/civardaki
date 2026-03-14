import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== "BUSINESS") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;

        // Fetch business and user info securely
        const business = await prisma.business.findUnique({
            where: { id: businessId },
            include: { owners: { include: { user: true } } }
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const primaryOwner = business.owners.find(o => o.isPrimary)?.user || business.owners[0]?.user;

        // Event Logging
        await prisma.businessEvent.create({
            data: {
                businessId: business.id,
                type: "CLICK_BILLING_PAY",
            }
        });

        // ----------------------------------------------------
        // PAYTR INTEGRATION PREPARATION
        // ----------------------------------------------------
        // Replace with actual credentials in .env
        const merchant_id = process.env.PAYTR_MERCHANT_ID || "TEST_MERCHANT_ID";
        const merchant_key = process.env.PAYTR_MERCHANT_KEY || "TEST_MERCHANT_KEY";
        const merchant_salt = process.env.PAYTR_MERCHANT_SALT || "TEST_MERCHANT_SALT";

        // Generate a unique order ID
        const merchant_oid = `CIV_${businessId}_${Date.now()}`;

        // Subscription price (e.g., 299 TL) -> stored in Kurus for PayTR (299 * 100)
        const payment_amount = 29900;
        const amountTL = 299;

        // PENDING subscription_payment kaydı: callback geldiğinde COMPLETED/FAILED güncellenecek
        const subscription = await prisma.businesssubscription.findUnique({
            where: { businessId },
            select: { id: true },
        });
        await prisma.subscription_payment.create({
            data: {
                businessId,
                subscriptionId: subscription?.id ?? null,
                amount: amountTL,
                currency: "TRY",
                status: "PENDING",
                provider: "PAYTR",
                providerReference: merchant_oid,
            },
        });

        const email = primaryOwner?.email || session.user.email;
        const userName = primaryOwner?.name || "Business Owner";
        const userCount = 1;

        // Callback URLs for success or fail
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const merchant_ok_url = `${baseUrl}/business/billing?payment=success`;
        const merchant_fail_url = `${baseUrl}/business/billing?payment=fail`;

        // Dummy IP fetch (in production, use req headers)
        const user_ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

        // Payload basket
        const user_basket = Buffer.from(JSON.stringify([
            ["Civardaki Aylık Panel Aboneliği", "299.00", 1]
        ])).toString("base64");

        // Hash verification for PayTR
        const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}0${merchant_ok_url}${merchant_fail_url}`;
        const paytr_token = crypto
            .createHmac("sha256", merchant_key)
            .update(hash_str + merchant_salt)
            .digest("base64");

        return NextResponse.json({
            status: "success",
            paytr_token,
            merchant_oid,
            iframe_url: `https://www.paytr.com/odeme/guvenli/${paytr_token}` // Conceptual URL, normally you embed the token in an iframe script
        }, { status: 200 });

    } catch (error) {
        console.error("PayTR Init Error:", error);
        return NextResponse.json({ error: "Ödeme başlatılamadı." }, { status: 500 });
    }
}
