import crypto from "crypto";
import { prisma } from "./prisma";

/**
 * Generates a SHA-256 hash of an IP address for tracking without storing PII.
 */
export function getIpHash(ip) {
    if (!ip) return "unknown";
    return crypto.createHash("sha256").update(ip).digest("hex");
}

/**
 * Simple content analysis to detect spam markers.
 * Returns a score (0-100), where > 50 is suspicious.
 */
export function analyzeLeadContent(message = "") {
    let score = 0;
    const reasons = [];

    const msg = message.toLowerCase();

    // 1. Link Density
    const urlMatches = msg.match(/https?:\/\/[^\s]+/g) || [];
    if (urlMatches.length > 2) {
        score += 40;
        reasons.push("Multiple links detected");
    } else if (urlMatches.length > 0) {
        score += 15;
    }

    // 2. Keyword Spam (Typical spam terms)
    const spamKeywords = ["crypto", "bitcoin", "lottery", "prize", "winner", "casino", "viagra", "marketing agency", "seo services", "whatsapp me"];
    spamKeywords.forEach(kw => {
        if (msg.includes(kw)) {
            score += 20;
            reasons.push(`Spam keyword: ${kw}`);
        }
    });

    // 3. Gibberish / Very high consonant ratio (Lazy check)
    const totalChars = msg.length;
    const vowels = msg.match(/[aeıioöuü]/g) || [];
    const vowelRatio = vowels.length / totalChars;
    if (totalChars > 20 && vowelRatio < 0.15) {
        score += 30;
        reasons.push("Irregular character distribution (possible gibberish)");
    }

    // 4. Short message check
    if (totalChars < 10) {
        score += 10;
    }

    return {
        score: Math.min(score, 100),
        isSuspicious: score >= 50,
        reason: reasons.join(", ")
    };
}

/**
 * Checks if a lead from the same person (IP/Phone) was sent to the same business recently,
 * or (dağıtımlı) aynı kategoride kanonik talep var mı.
 */
export async function checkDuplicateLead({ businessId, phone, email, ipHash, message, isDistributed, categoryId }) {
    const windowStart = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes

    if (isDistributed && categoryId) {
        const existing = await prisma.lead.findFirst({
            where: {
                isDistributed: true,
                categoryId,
                businessId: null,
                createdAt: { gte: windowStart },
                OR: [
                    { phone: phone || "no-phone" },
                    { email: email || "no-email" },
                    { ipHash: ipHash }
                ]
            },
            orderBy: { createdAt: 'desc' },
            select: { message: true, createdAt: true }
        });

        if (existing) {
            if (existing.message.trim() === message.trim()) {
                return { duplicate: true, type: 'identical' };
            }
            const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
            if (existing.createdAt > twoMinsAgo) {
                return { duplicate: true, type: 'frequency' };
            }
        }
        return { duplicate: false };
    }

    const existing = await prisma.lead.findFirst({
        where: {
            businessId,
            dismissedAt: null,
            createdAt: { gte: windowStart },
            OR: [
                { phone: phone || "no-phone" },
                { email: email || "no-email" },
                { ipHash: ipHash }
            ]
        },
        orderBy: { createdAt: 'desc' },
        select: { message: true, createdAt: true }
    });

    if (existing) {
        if (existing.message.trim() === message.trim()) {
            return { duplicate: true, type: 'identical' };
        }
        const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (existing.createdAt > twoMinsAgo) {
            return { duplicate: true, type: 'frequency' };
        }
    }

    return { duplicate: false };
}
