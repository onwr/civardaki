import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLeadNotificationEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import { getIpHash, analyzeLeadContent, checkDuplicateLead } from "@/lib/anti-spam";
import { rankBusinesses } from "@/lib/lead-scoring";

export async function POST(req) {
    try {
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
        const userAgent = req.headers.get("user-agent") || "unknown-ua";
        const ipHash = getIpHash(ip);

        // --- 1. Rate Limit Check ---
        const rateLimit = checkRateLimit(`lead_${ip}`, 5, 60 * 1000);
        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Çok fazla istek gönderdiniz. Lütfen bir süre bekleyip tekrar deneyin." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const {
            businessSlug, name, phone, email, message,
            category, categoryId, categorySlug, productId, source, sourcePage, _honeypot, fingerprint,
            isDistributed = false, latitude, longitude, city, district
        } = body;

        // --- 2. Honeypot check ---
        if (_honeypot && _honeypot.length > 0) {
            return NextResponse.json({ success: true, fake: true }, { status: 201 });
        }

        // Validate minimum required fields
        if (!name || (!phone && !email) || !message) {
            return NextResponse.json({ error: "Lütfen gerekli tüm alanları doldurun." }, { status: 400 });
        }

        // Handle Distribution vs Single Target
        let targetBusinesses = [];

        if (isDistributed || !businessSlug) {
            const cityText = String(city || "").trim();
            const districtText = String(district || "").trim();
            const categoryText = String(category || "").trim();
            const categorySlugText = String(categorySlug || "").trim();
            const categoryIdText = String(categoryId || "").trim();

            if (!cityText) {
                return NextResponse.json({ error: "Dağıtımlı taleplerde şehir zorunludur." }, { status: 400 });
            }
            if (!categoryText && !categorySlugText && !categoryIdText) {
                return NextResponse.json({ error: "Dağıtımlı taleplerde kategori zorunludur." }, { status: 400 });
            }

            let resolvedCategoryId = categoryIdText || null;
            let resolvedCategorySlug = categorySlugText || null;
            let resolvedCategoryName = categoryText || null;

            if (!resolvedCategoryId) {
                const resolvedCategory = await prisma.category.findFirst({
                    where: {
                        isActive: true,
                        OR: [
                            categoryIdText ? { id: categoryIdText } : undefined,
                            categorySlugText ? { slug: categorySlugText } : undefined,
                            categoryText ? { slug: categoryText } : undefined,
                            categoryText ? { name: categoryText } : undefined,
                        ].filter(Boolean),
                    },
                    select: { id: true, slug: true, name: true },
                });
                if (resolvedCategory) {
                    resolvedCategoryId = resolvedCategory.id;
                    resolvedCategorySlug = resolvedCategory.slug;
                    resolvedCategoryName = resolvedCategory.name;
                }
            }

            if (!resolvedCategoryId && !resolvedCategorySlug && !resolvedCategoryName) {
                return NextResponse.json({ error: "Geçerli kategori bulunamadı." }, { status: 400 });
            }

            const candidates = await prisma.business.findMany({
                where: {
                    isActive: true,
                    city: cityText,
                    OR: [
                        resolvedCategoryId ? { primaryCategoryId: resolvedCategoryId } : undefined,
                        resolvedCategoryId
                            ? {
                                  businesscategory: {
                                      some: { categoryId: resolvedCategoryId },
                                  },
                              }
                            : undefined,
                        resolvedCategorySlug ? { category: resolvedCategorySlug } : undefined,
                        resolvedCategoryName ? { category: resolvedCategoryName } : undefined,
                    ].filter(Boolean),
                },
                include: {
                    businesssubscription: {
                        select: { plan: true },
                    },
                },
                take: 30,
            });

            if (candidates.length === 0) {
                return NextResponse.json(
                    { error: "Seçtiğiniz şehir ve kategori için uygun işletme bulunamadı." },
                    { status: 404 },
                );
            }

            let filteredByDistrict = candidates;
            if (districtText) {
                const inDistrict = candidates.filter((b) => String(b.district || "").trim() === districtText);
                if (inDistrict.length > 0) {
                    filteredByDistrict = inDistrict;
                }
            }

            targetBusinesses = rankBusinesses(filteredByDistrict, { lat: latitude, lng: longitude }, 3);
        } else {
            // Single target business
            const business = await prisma.business.findUnique({
                where: { slug: businessSlug },
                include: { businesssubscription: { select: { plan: true } } }
            });

            if (!business) {
                return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
            }
            targetBusinesses = [{ ...business, leadScore: 100 }];
        }

        if (targetBusinesses.length === 0) {
            return NextResponse.json({ error: "Uygun işletme bulunamadı." }, { status: 404 });
        }

        const contentAna = analyzeLeadContent(message);
        const results = [];

        for (const target of targetBusinesses) {
            // Spam check for each (to prevent multi-spamming same business)
            const dupCheck = await checkDuplicateLead({
                businessId: target.id,
                phone,
                email,
                ipHash,
                message
            });

            let isSuspicious = contentAna.isSuspicious || dupCheck.duplicate;
            let spamReason = contentAna.reason || (dupCheck.duplicate ? "Frequency limit" : null);

            // Create lead
            const newLead = await prisma.lead.create({
                data: {
                    businessId: target.id,
                    name: name.trim(),
                    phone: phone?.trim() || null,
                    email: email?.trim() || null,
                    message: message.trim(),
                    category: categorySlug || category || null,
                    productId: productId || null,
                    source: isDistributed ? "CATEGORY_PAGE" : (source || "BUSINESS_PAGE"),
                    status: "NEW",
                    ipHash,
                    userAgent: userAgent.slice(0, 512),
                    fingerprint: fingerprint || null,
                    latitude,
                    longitude,
                    city,
                    district,
                    isDistributed,
                    isSuspicious,
                    spamReason,
                    sourcePage: sourcePage ? String(sourcePage).slice(0, 255) : null,
                }
            });

            if (!isSuspicious) {
                // Notifications
                const notifTitle = `Yeni Talep: ${name}`;

                // In-App
                prisma.notification.create({
                    data: {
                        businessId: target.id,
                        title: notifTitle,
                        body: message.trim().slice(0, 200),
                        type: "LEAD",
                        linkUrl: "/business/leads"
                    }
                }).catch(() => { });

                // Reminder
                prisma.leadreminder.create({
                    data: {
                        leadId: newLead.id,
                        businessId: target.id,
                        scheduledAt: new Date(Date.now() + 10 * 60 * 1000),
                    }
                }).catch(() => { });

                // Emails (Logged & Legacy)
                try {
                    const { sendNewLeadEmail } = await import("@/lib/mails/send-new-lead");
                    sendNewLeadEmail({
                        email: target.email,
                        businessName: target.name,
                        businessId: target.id,
                        leadId: newLead.id,
                        leadName: name,
                        leadPhone: phone,
                        leadEmail: email,
                        leadMessage: message
                    }).catch(() => { });
                } catch (e) { }

                // Socket
                if (global.io) {
                    global.io.to(`business_${target.id}`).emit("new_lead", {
                        id: newLead.id,
                        name: name,
                        createdAt: new Date().toISOString()
                    });
                }
            }

            results.push({ id: newLead.id, businessId: target.id });
        }

        return NextResponse.json({ success: true, leads: results }, { status: 201 });

    } catch (error) {
        console.error("DISTRIBUTED LEAD ERROR:", error);
        return NextResponse.json({ error: "Talep işlenirken bir hata oluştu." }, { status: 500 });
    }
}
