import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mailer"; // Ensure mailer exports transporter

/**
 * Shared utility to send an email and log it to prevent duplicates.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.html - Email HTML content
 * @param {string} params.uniqueKey - Unique key to prevent duplicates (e.g. "trial-ending-3d-bizId")
 * @param {string} params.type - EventType or tag for the log (e.g. "EMAIL_SENT_TRIAL_WARNING")
 * @param {string} [params.businessId] - Optional Business ID for relation
 * @param {string} [params.userId] - Optional User ID for relation
 */
export async function sendLoggedEmail({ to, subject, html, uniqueKey, type, businessId, userId }) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn(`[mailer] SMTP disconnected. Skipping logged email: ${uniqueKey}`);
        return false;
    }

    try {
        // 1. Duplicate check via Prisma
        const existingLog = await prisma.emailLog.findUnique({
            where: { uniqueKey }
        });

        if (existingLog) {
            console.log(`[mailer/logged] Email skipped (already sent): ${uniqueKey}`);
            return false;
        }

        // 2. Send the email
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Civardaki.com Bildirim" <noreply@civardaki.com>',
            to,
            subject,
            html,
        });

        // 3. Log success
        await prisma.emailLog.create({
            data: {
                uniqueKey,
                type,
                businessId,
                userId
            }
        });

        return true;
    } catch (error) {
        console.error(`[mailer/logged] Failed to send email for: ${uniqueKey}`, error);
        return false;
    }
}
