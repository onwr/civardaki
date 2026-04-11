import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getIpHash, analyzeLeadContent, checkDuplicateLead } from "@/lib/anti-spam";

const CANDIDATE_PAGE = 200;

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
            businessSlug, name, phone, email, message, title: titleIn,
            category, categoryId, categorySlug, productId, source, sourcePage, _honeypot, fingerprint,
            isDistributed = false, latitude, longitude, city, district
        } = body;

        const titleTrimmed = String(titleIn || "").trim().slice(0, 200);
        const titleForDb = titleTrimmed.length > 0 ? titleTrimmed : null;

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
        let resolvedCategoryId = null;
        let resolvedCategorySlug = null;
        let resolvedCategoryName = null;

        if (isDistributed || !businessSlug) {
            const categoryText = String(category || "").trim();
            const categorySlugText = String(categorySlug || "").trim();
            const categoryIdText = String(categoryId || "").trim();

            if (!titleForDb || titleForDb.length < 3) {
                return NextResponse.json(
                    { error: "Talep başlığı en az 3 karakter olmalıdır." },
                    { status: 400 },
                );
            }
            if (!categoryText && !categorySlugText && !categoryIdText) {
                return NextResponse.json({ error: "Dağıtımlı taleplerde kategori zorunludur." }, { status: 400 });
            }

            resolvedCategoryId = categoryIdText || null;
            resolvedCategorySlug = categorySlugText || null;
            resolvedCategoryName = categoryText || null;

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

            if (!resolvedCategoryId) {
                return NextResponse.json({ error: "Geçerli kategori bulunamadı." }, { status: 400 });
            }

            const baseWhere = {
                isActive: true,
                OR: [
                    { primaryCategoryId: resolvedCategoryId },
                    {
                        businesscategory: {
                            some: { categoryId: resolvedCategoryId },
                        },
                    },
                    resolvedCategorySlug ? { category: resolvedCategorySlug } : undefined,
                    resolvedCategoryName ? { category: resolvedCategoryName } : undefined,
                ].filter(Boolean),
            };

            targetBusinesses = [];
            let skip = 0;
            for (;;) {
                const batch = await prisma.business.findMany({
                    where: baseWhere,
                    include: {
                        businesssubscription: {
                            select: { plan: true },
                        },
                    },
                    take: CANDIDATE_PAGE,
                    skip,
                    orderBy: { id: "asc" },
                });
                targetBusinesses.push(...batch);
                if (batch.length < CANDIDATE_PAGE) break;
                skip += CANDIDATE_PAGE;
            }
        } else {
            const business = await prisma.business.findUnique({
                where: { slug: businessSlug },
                include: { businesssubscription: { select: { plan: true } } }
            });

            if (!business) {
                return NextResponse.json({ error: "İşletme bulunamadı." }, { status: 404 });
            }
            targetBusinesses = [business];
        }

        const contentAna = analyzeLeadContent(message);
        const leadPreviewForSocket = (
            titleForDb ||
            String(categorySlug || category || "").trim() ||
            "Hizmet talebi"
        ).slice(0, 50);

        const isDistFlow = Boolean(isDistributed || !businessSlug);

        if (isDistFlow) {
            const dupCheck = await checkDuplicateLead({
                isDistributed: true,
                categoryId: resolvedCategoryId,
                phone,
                email,
                ipHash,
                message,
            });

            const isSuspicious = contentAna.isSuspicious || dupCheck.duplicate;
            const spamReason = contentAna.reason || (dupCheck.duplicate ? "Frequency limit" : null);

            const categoryLabel =
                resolvedCategorySlug || resolvedCategoryName || String(category || "").trim() || null;

            const newLead = await prisma.lead.create({
                data: {
                    businessId: null,
                    name: name.trim(),
                    phone: phone?.trim() || null,
                    email: email?.trim() || null,
                    message: message.trim(),
                    title: titleForDb,
                    category: categoryLabel,
                    categoryId: resolvedCategoryId,
                    productId: productId || null,
                    source: "CATEGORY_PAGE",
                    status: "NEW",
                    ipHash,
                    userAgent: userAgent.slice(0, 512),
                    fingerprint: fingerprint || null,
                    latitude,
                    longitude,
                    city: city != null && String(city).trim() ? String(city).trim() : null,
                    district: district != null && String(district).trim() ? String(district).trim() : null,
                    isDistributed: true,
                    isSuspicious,
                    spamReason,
                    sourcePage: sourcePage ? String(sourcePage).slice(0, 255) : null,
                },
            });

            if (!isSuspicious) {
                const notifTitle = titleForDb
                    ? `${titleForDb.slice(0, 72)} · ${name}`
                    : `Yeni Talep: ${name}`;

                for (const target of targetBusinesses) {
                    prisma.notification.create({
                        data: {
                            businessId: target.id,
                            title: notifTitle,
                            body: message.trim().slice(0, 200),
                            type: "LEAD",
                            linkUrl: "/business/leads"
                        }
                    }).catch(() => { });

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
                            leadMessage: message,
                            leadTitle: titleForDb,
                        }).catch(() => { });
                    } catch (e) { }

                    if (global.io) {
                        global.io.to(`business_${target.id}`).emit("new_lead", {
                            id: newLead.id,
                            name: name,
                            createdAt: new Date().toISOString(),
                            title: leadPreviewForSocket,
                            product: leadPreviewForSocket,
                        });
                    }
                }
            }

            return NextResponse.json(
                { success: true, leads: [{ id: newLead.id, businessId: null, isDistributed: true }] },
                { status: 201 },
            );
        }

        // --- Tek işletme: satır başına bir lead (mevcut davranış) ---
        const results = [];
        for (const target of targetBusinesses) {
            const dupCheck = await checkDuplicateLead({
                businessId: target.id,
                phone,
                email,
                ipHash,
                message
            });

            let isSuspicious = contentAna.isSuspicious || dupCheck.duplicate;
            let spamReason = contentAna.reason || (dupCheck.duplicate ? "Frequency limit" : null);

            const newLead = await prisma.lead.create({
                data: {
                    businessId: target.id,
                    name: name.trim(),
                    phone: phone?.trim() || null,
                    email: email?.trim() || null,
                    message: message.trim(),
                    title: titleForDb,
                    category: categorySlug || category || null,
                    productId: productId || null,
                    source: source || "BUSINESS_PAGE",
                    status: "NEW",
                    ipHash,
                    userAgent: userAgent.slice(0, 512),
                    fingerprint: fingerprint || null,
                    latitude,
                    longitude,
                    city: city != null && String(city).trim() ? String(city).trim() : null,
                    district: district != null && String(district).trim() ? String(district).trim() : null,
                    isDistributed: false,
                    isSuspicious,
                    spamReason,
                    sourcePage: sourcePage ? String(sourcePage).slice(0, 255) : null,
                }
            });

            if (!isSuspicious) {
                const notifTitle = titleForDb
                    ? `${titleForDb.slice(0, 72)} · ${name}`
                    : `Yeni Talep: ${name}`;

                prisma.notification.create({
                    data: {
                        businessId: target.id,
                        title: notifTitle,
                        body: message.trim().slice(0, 200),
                        type: "LEAD",
                        linkUrl: "/business/leads"
                    }
                }).catch(() => { });

                prisma.leadreminder.create({
                    data: {
                        leadId: newLead.id,
                        businessId: target.id,
                        scheduledAt: new Date(Date.now() + 10 * 60 * 1000),
                    }
                }).catch(() => { });

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
                        leadMessage: message,
                        leadTitle: titleForDb,
                    }).catch(() => { });
                } catch (e) { }

                if (global.io) {
                    global.io.to(`business_${target.id}`).emit("new_lead", {
                        id: newLead.id,
                        name: name,
                        createdAt: new Date().toISOString(),
                        title: leadPreviewForSocket,
                        product: leadPreviewForSocket,
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
