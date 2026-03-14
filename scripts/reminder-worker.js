/**
 * scripts/reminder-worker.js
 * 
 * Standalone Node.js worker to poll `LeadReminder` table and send missed-lead emails.
 * Run in background via systemd, PM2, or a cron wrapper:
 *    node scripts/reminder-worker.js
 */

const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");

// Load .env explicitly since this runs outside Next.js process
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

// Configure SMTP transport matching the web app
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // usually false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://civardaki.com";

async function sendReminderEmail(business, lead) {
    if (!business.email || !process.env.SMTP_HOST) return;

    const from = process.env.SMTP_FROM || `"Civardaki.com" <noreply@civardaki.com>`;
    const subject = `⚠️ Yeni Talebiniz ${business.name} İçin Bekliyor`;
    const ctaUrl = `${APP_URL}/business/dashboard?tab=leads&leadId=${lead.id}`;

    // Fallback template matching the new branding
    const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px;">
        <div style="max-w: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background-color: #f59e0b; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Talebe Henüz Dönüş Yapmadınız</h1>
            </div>
            
            <div style="padding: 30px;">
                <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">
                    Merhaba <strong>${business.name}</strong>,
                </p>
                <p style="color: #475569; font-size: 16px; margin-bottom: 30px;">
                    Sistemimize bırakılan yeni bir talep size ulaştı, ancak üzerinden <strong>10 dakika geçmesine rağmen</strong> henüz işlem sağlamadınız. Müşteriler hızlı dönen işletmelere daha fazla güvenir. Lütfen talebi inceleyin:
                </p>

                <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <p style="margin: 0 0 10px 0; color: #1e293b; font-size: 15px;"><strong>Müşteri:</strong> ${lead.name}</p>
                    ${lead.phone ? `<p style="margin: 0 0 10px 0; color: #1e293b; font-size: 15px;"><strong>Telefon:</strong> ${lead.phone}</p>` : ""}
                    ${lead.productNameSnapshot ? `<p style="margin: 0 0 10px 0; color: #1e293b; font-size: 15px;"><strong>Ürün:</strong> ${lead.productNameSnapshot}</p>` : ""}
                    <p style="margin: 0; color: #1e293b; font-size: 15px;"><strong>Talep:</strong> "${lead.message.length > 100 ? lead.message.substring(0, 100) + "..." : lead.message}"</p>
                </div>

                <div style="text-align: center;">
                    <a href="${ctaUrl}" style="display: inline-block; background-color: #004aad; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Hemen Yanıtla
                    </a>
                </div>
            </div>
            
            <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">Bu e-posta otomatik oluşturulmuştur.</p>
            </div>
        </div>
    </div>
    `;

    await transporter.sendMail({
        from,
        to: business.email,
        subject,
        html,
    });
}

async function processReminders() {
    console.log(`[${new Date().toISOString()}] Checking lead reminders...`);

    try {
        // 1. Claim rows to prevent concurrency issues (PM2 cluster mode safe)
        const claimId = crypto.randomUUID();

        // Claim up to 20 due, valid reminders
        const claimed = await prisma.leadReminder.updateMany({
            where: {
                scheduledAt: { lte: new Date() },
                sentAt: null,
                processingClaim: null, // ensure not claimed by another worker
                attempts: { lt: 3 },
            },
            data: {
                processingClaim: claimId
            }
        });

        if (claimed.count === 0) return;
        console.log(`[${new Date().toISOString()}] Claimed ${claimed.count} reminders to process.`);

        // 2. Fetch the claimed rows with relations
        const reminders = await prisma.leadReminder.findMany({
            where: { processingClaim: claimId },
            include: {
                lead: true,
                business: { select: { name: true, email: true, isActive: true } }
            },
        });

        // 3. Process each claimed row
        for (const reminder of reminders) {
            try {
                // Assertions for safe sending:
                // - Lead is still NEW
                // - Lead repliedAt is null
                // - Business is still active
                if (reminder.lead.status !== "NEW" || reminder.lead.repliedAt || reminder.business.isActive !== true) {
                    console.log(`[Reminder] Skipping ID ${reminder.id} (No longer valid for reminder)`);
                    await prisma.leadReminder.update({
                        where: { id: reminder.id },
                        data: {
                            sentAt: new Date(), // Mark as done without sending
                            processingClaim: null,
                            lastError: "Skipped: Lead status changed or business inactive"
                        }
                    });
                    continue;
                }

                if (!reminder.business.email) {
                    throw new Error("Business has no email address");
                }

                // 4. Send email
                await sendReminderEmail(reminder.business, reminder.lead);

                // 5. Mark successful
                await prisma.leadReminder.update({
                    where: { id: reminder.id },
                    data: { sentAt: new Date(), processingClaim: null, attempts: reminder.attempts + 1 }
                });
                console.log(`[Reminder] Sent ID ${reminder.id} for Lead ${reminder.leadId}`);

                // Throttling: wait 1 second between sends to respect SMTP limits
                await new Promise(r => setTimeout(r, 1000));

            } catch (err) {
                console.error(`[Reminder] Failed ID ${reminder.id}:`, err);
                // 6. Mark attempt & set exponential backoff for next schedule
                const nextAttempt = reminder.attempts + 1;
                // Backoff: 1st retry = +5m, 2nd = +15m
                const delayMs = nextAttempt === 1 ? 5 * 60 * 1000 : 15 * 60 * 1000;

                await prisma.leadReminder.update({
                    where: { id: reminder.id },
                    data: {
                        attempts: nextAttempt,
                        processingClaim: null,
                        lastError: String(err.message),
                        scheduledAt: new Date(Date.now() + delayMs)
                    }
                });
            }
        }
    } catch (e) {
        console.error("Worker error:", e);
        // Fallback: clear the claim if absolute failure occurs (ideally not needed but safe)
    }
}

// Polling Loop: every 60 seconds
const INTERVAL = 60 * 1000;

console.log("Starting Lead Reminder worker...");
// Initial run
processReminders();
// Set intervals
setInterval(processReminders, INTERVAL);

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("Shutting down worker...");
    await prisma.$disconnect();
    process.exit(0);
});
process.on("SIGINT", async () => {
    console.log("Worker interrupted...");
    await prisma.$disconnect();
    process.exit(0);
});
