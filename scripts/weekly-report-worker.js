// scripts/weekly-report-worker.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Sprint 9F: Retention Engine
 * 
 * Amaç: İşletmelere her hafta performans özeti e-postası göndererek
 * paneli hatırlatmak ve platformda (retention) kalmalarını sağlamak.
 * 
 * Cron Job olarak çalıştırılabilir (örn: Her Pazartesi sabah 09:00).
 */
async function sendWeeklyReports() {
    console.log(`[${new Date().toISOString()}] Weekly Report Worker Başladı...`);

    try {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        // Aktif tüm işletmeleri al
        const businesses = await prisma.business.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                avgResponseMinutes: true
            }
        });

        console.log(`${businesses.length} adet işletme için haftalık rapor hazırlanıyor.`);

        for (const business of businesses) {
            // Haftalık analitikleri çek
            const [events, leadCount] = await Promise.all([
                prisma.businessEvent.groupBy({
                    by: ['type'],
                    where: { businessId: business.id, createdAt: { gte: lastWeek } },
                    _count: { type: true }
                }),
                prisma.lead.count({
                    where: { businessId: business.id, createdAt: { gte: lastWeek } }
                })
            ]);

            let views = 0;
            let waClicks = 0;

            events.forEach(e => {
                if (e.type === "VIEW_PROFILE") views = e._count.type;
                if (e.type === "CLICK_WHATSAPP") waClicks = e._count.type;
            });

            // Sadece etkileşimi olan veya haftalık e-posta aktif olan firmalara mail atılabilir
            if (views === 0 && leadCount === 0) continue;

            // TODO: E-posta şablonunu oluştur ve SMTP ile gönder
            /*
            const emailHtml = `
                <h2>Haftalık Performans Özetiniz</h2>
                <ul>
                    <li>Bu hafta ${views} görüntülenme</li>
                    <li>${waClicks} WhatsApp tıklama</li>
                    <li>${leadCount} yeni talep</li>
                    <li>Ortalama yanıt süresi: ${Math.round(business.avgResponseMinutes || 0)} dk</li>
                </ul>
                <p><a href="https://civardaki.com/business/dashboard/...">Dashboard'a Git</a></p>
            `;
            await sendEmail({ to: business.email, subject: "Civardaki.com - Haftalık Performans", html: emailHtml });
            */

            console.log(`- [${business.name}]: ${views} view, ${waClicks} WA, ${leadCount} lead (MOCK)`);
        }

        console.log(`[${new Date().toISOString()}] Weekly Report Worker Tamamlandı.`);
    } catch (error) {
        console.error("Haftalık rapor gönderiminde hata:", error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

sendWeeklyReports();
