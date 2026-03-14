/**
 * lib/rate-limit.js
 * A simple in-memory rate limiter for Next.js API Routes.
 * Note: Since this is in-memory, it resets on server restart and is per-worker.
 * For true distributed rate limiting (like Vercel Edge), use Upstash Redis.
 * This is meant as a basic VPS guardrail.
 */

const rateLimitMap = new Map();

export function checkRateLimit(ip, limit = 5, windowMs = 60000) {
    const now = Date.now();

    // Clear old entries roughly (to prevent map growing forever)
    if (Math.random() < 0.05) { // 5% chance on each request
        for (const [key, data] of rateLimitMap.entries()) {
            if (now - data.firstRequest > windowMs) {
                rateLimitMap.delete(key);
            }
        }
    }

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, {
            count: 1,
            firstRequest: now
        });
        return { success: true };
    }

    const data = rateLimitMap.get(ip);

    if (now - data.firstRequest > windowMs) {
        // Reset window
        rateLimitMap.set(ip, {
            count: 1,
            firstRequest: now
        });
        return { success: true };
    }

    if (data.count >= limit) {
        return { success: false, remainingTime: windowMs - (now - data.firstRequest) };
    }

    data.count++;
    return { success: true };
}
