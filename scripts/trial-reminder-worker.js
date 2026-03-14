/**
 * scripts/trial-reminder-worker.js
 * 
 * Runs daily via cron to check for TRIAL subscriptions that are expiring
 * in exactly 3 days or exactly 1 day.
 */
const { prisma } = require("../src/lib/prisma");
const { logPulse, logError } = require("../src/lib/system");

async function runTrialReminderWorker() {
    console.log("---- BATCH RUN: TRIAL REMINDERS START ----");
    await logPulse("worker:trial_reminder", "RUNNING");

    try {
        const now = new Date();

        // 1. Import mailer helper
        let sendTrialEndingEmail;
        try {
            const mailerPath = process.env.NODE_ENV === 'development'
                ? '../src/lib/mails/send-trial-ending'
                : '../.next/server/app/lib/mails/send-trial-ending.js';
            const mailModule = await import(mailerPath);
            sendTrialEndingEmail = mailModule.sendTrialEndingEmail;
        } catch (e) {
            console.warn("Could not import sendTrialEndingEmail. Sending will be skipped.");
        }

        // 2. Define ranges
        const getDayRange = (daysOffset) => {
            const date = new Date(now);
            date.setDate(now.getDate() + daysOffset);
            return {
                start: new Date(new Date(date).setHours(0, 0, 0, 0)),
                end: new Date(new Date(date).setHours(23, 59, 59, 999))
            };
        };

        const range3d = getDayRange(3);
        const range1d = getDayRange(1);

        // 3. Find trials
        const fetchTrials = async (range) => {
            return await prisma.businessSubscription.findMany({
                where: {
                    status: "TRIAL",
                    expiresAt: {
                        gte: range.start,
                        lte: range.end
                    }
                },
                include: { business: true }
            });
        };

        const trials3d = await fetchTrials(range3d);
        const trials1d = await fetchTrials(range1d);

        console.log(`Found ${trials3d.length} trials (3 days left) and ${trials1d.length} trials (1 day left).`);

        // 4. Send emails
        const processTrials = async (list, days) => {
            for (const sub of list) {
                if (sendTrialEndingEmail && sub.business.email) {
                    await sendTrialEndingEmail({
                        email: sub.business.email,
                        businessName: sub.business.name,
                        businessId: sub.business.id,
                        daysLeft: days,
                        expiresAt: sub.expiresAt
                    }).catch(e => console.error(`Error sending ${days}-day reminder for ${sub.business.name}:`, e));
                }
            }
        };

        await processTrials(trials3d, 3);
        await processTrials(trials1d, 1);

        console.log("Trial reminder worker completed successfully.");
        await logPulse("worker:trial_reminder", "OK", {
            lastRun: new Date(),
            processed: trials3d.length + trials1d.length
        });

    } catch (error) {
        console.error("Critical Error in trial reminder worker:", error);
        await logError("worker:trial_reminder", "Worker crash", error);
        await logPulse("worker:trial_reminder", "ERROR", { error: error.message });
    } finally {
        await prisma.$disconnect();
        console.log("---- BATCH RUN: TRIAL REMINDERS END ----");
    }
}

// Execute
runTrialReminderWorker();
