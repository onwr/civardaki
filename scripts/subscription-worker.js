/**
 * scripts/subscription-worker.js
 * 
 * Runs daily to expire subscriptions that have passed their expiresAt date.
 */
const { prisma } = require("../src/lib/prisma");
const { logPulse, logError } = require("../src/lib/system");

async function expireSubscriptions() {
    console.log("---- BATCH RUN: SUBSCRIPTION EXPIRATION START ----");
    await logPulse("worker:subscription_expiry", "RUNNING");

    try {
        const now = new Date();

        // 1. Find all ACTIVE or TRIAL subscriptions where expiresAt is in the past
        const expiredSubscriptions = await prisma.businessSubscription.findMany({
            where: {
                status: {
                    in: ['ACTIVE', 'TRIAL']
                },
                expiresAt: {
                    lt: now
                }
            },
            include: {
                business: true
            }
        });

        if (expiredSubscriptions.length === 0) {
            console.log("No expired subscriptions found.");
            await logPulse("worker:subscription_expiry", "OK", { expiredCount: 0, lastRun: new Date() });
            return;
        }

        console.log(`Found ${expiredSubscriptions.length} expired subscriptions. Pushing updates...`);

        // 2. Bulk update to set status to EXPIRED
        const result = await prisma.businessSubscription.updateMany({
            where: {
                id: {
                    in: expiredSubscriptions.map(s => s.id)
                }
            },
            data: {
                status: 'EXPIRED',
                updatedAt: new Date()
            }
        });

        console.log(`Successfully expired ${result.count} subscriptions.`);

        // 3. Import mailer (dynamic import for ES Module support in commonJS script)
        let sendSubscriptionExpiredEmail;
        try {
            const mailerPath = process.env.NODE_ENV === 'development'
                ? '../src/lib/mails/send-subscription-expired'
                : '../.next/server/app/lib/mails/send-subscription-expired.js';
            const mailModule = await import(mailerPath);
            sendSubscriptionExpiredEmail = mailModule.sendSubscriptionExpiredEmail;
        } catch (e) {
            console.warn("Could not import sendSubscriptionExpiredEmail helper. Proceeding with DB updates only.");
        }

        // 4. Send notifications
        for (const sub of expiredSubscriptions) {
            console.log(`- Expired ${sub.status} plan for Business ID: ${sub.businessId}`);

            if (sendSubscriptionExpiredEmail && sub.business && sub.business.email) {
                await sendSubscriptionExpiredEmail({
                    email: sub.business.email,
                    businessName: sub.business.name,
                    businessId: sub.businessId,
                    subscriptionId: sub.id
                }).catch(e => console.error("Error sending expired email:", e));
            }
        }

        await logPulse("worker:subscription_expiry", "OK", { expiredCount: result.count, lastRun: new Date() });

    } catch (error) {
        console.error("Critical Error in subscription worker:", error);
        await logError("worker:subscription_expiry", "Worker crash", error);
        await logPulse("worker:subscription_expiry", "ERROR", { error: error.message });
    } finally {
        await prisma.$disconnect();
        console.log("---- BATCH RUN: SUBSCRIPTION EXPIRATION END ----");
    }
}

// Execute
expireSubscriptions();
