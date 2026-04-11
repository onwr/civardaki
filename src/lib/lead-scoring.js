import { calculateDistance } from "./geo";

/**
 * Calculates a distribution score for a business regarding a specific lead.
 * 
 * Score components (Total 100):
 * 1. Distance (40 points): Points based on proximity (0-20km).
 * 2. Rating (30 points): Points based on business rating (0-5 stars).
 * 3. Response Speed (20 points): Points based on avgResponseMinutes.
 * 4. Plan (10 points): Bonus for PREMIUM plan.
 * 
 * @param {Object} business - The business object from Prisma
 * @param {Object} leadLocation - { lat, lng }
 * @returns {number} Final score (0-100)
 */
export function calculateLeadScore(business, leadLocation) {
    let score = 0;

    // 1. Distance Score (max 40)
    // Formula: 40 * (1 - distance / max_radius)
    // We assume a 20km max radius for local relevance
    if (leadLocation && leadLocation.lat && leadLocation.lng && business.latitude && business.longitude) {
        const dist = calculateDistance(
            leadLocation.lat,
            leadLocation.lng,
            business.latitude,
            business.longitude
        );

        const distScore = Math.max(0, 40 * (1 - dist / 20));
        score += distScore;
    } else {
        // Fallback if location missing (middle ground)
        score += 20;
    }

    // 2. Rating Score (max 30)
    // Scale: rating (0.0 - 5.0) -> (0 - 30)
    const rating = business.rating || (business.ratingSum > 0 ? (business.ratingSum / business.responseCount) : 0) || 0;
    const ratingScore = (Math.min(5, rating) / 5) * 30;
    score += ratingScore;

    // 3. Response Speed Score (max 20)
    // Faster is better. 0-15 mins = 20 pts, 15-60 mins = 15 pts, 60-180 mins = 10 pts, >180 mins = 5 pts
    const responseMin = business.avgResponseMinutes || 120; // fallback to 2h
    let speedScore = 0;
    if (responseMin <= 15) speedScore = 20;
    else if (responseMin <= 60) speedScore = 15;
    else if (responseMin <= 180) speedScore = 10;
    else speedScore = 5;
    score += speedScore;

    // 4. Plan Priority (max 10)
    const planTier = business.subscription?.plan ?? business.businesssubscription?.plan;
    if (planTier === "PREMIUM") {
        score += 10;
    } else if (planTier === "BASIC") {
        score += 5;
    }

    return Math.round(score * 10) / 10; // Round to 1 decimal
}

/**
 * Ranks businesses for a specific lead and returns top candidates.
 * 
 * @param {Array} businesses - List of candidates
 * @param {Object} leadLocation - { lat, lng }
 * @param {number} limit - Max number of candidates to return
 * @returns {Array} Scored and sorted businesses
 */
export function rankBusinesses(businesses, leadLocation, limit = 3) {
    return businesses
        .map(biz => ({
            ...biz,
            leadScore: calculateLeadScore(biz, leadLocation)
        }))
        .sort((a, b) => b.leadScore - a.leadScore)
        .slice(0, limit);
}
