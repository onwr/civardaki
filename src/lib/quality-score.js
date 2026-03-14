export function calculateQualityScore({
    rating = 0,
    reviewCount = 0,
    avgResponseMinutes = null,
    responseCount = 0,
    conversionRate = 0,
    completionPercent = 0,
    views30Days = 0
}) {
    let score = 0;

    // 1. Rating (30 Puan) - trust guard: 10 yoruma kadar lineer katsayı, 1 yorumla 5.0 alınca sistemi kırmaması için
    const trust = Math.min(reviewCount / 10, 1);
    const ratingScore = (rating / 5) * 30 * trust;
    score += ratingScore;

    // 2. Review Count (10 Puan) - Soft saturation (Logaritmik, ilk yorumlar daha değerli, 50'de ~10 puan)
    const rcNorm = Math.log10(reviewCount + 1) / Math.log10(51);
    const reviewScore = Math.min(rcNorm, 1) * 10;
    score += reviewScore;

    // 3. Response Speed (25 Puan) - 10 dakikaya kadar tam puan, 10-60 dk arası lineer düşüş, 60+ dk sıfır
    let responseScore = 0;
    if (avgResponseMinutes !== null && avgResponseMinutes > 0) {
        if (avgResponseMinutes <= 10) {
            responseScore = 25;
        } else if (avgResponseMinutes <= 60) {
            // 10'dan 60'a kadar (50 dakikalık fark) kademeli azalır.
            responseScore = 25 * (1 - ((avgResponseMinutes - 10) / 50));
        } else {
            responseScore = 0;
        }
    }
    score += responseScore;

    // 4. Conversion Rate (20 Puan) - low sample guard ile
    let cvScoreRaw = Math.min(Number(conversionRate) / 20, 1) * 20;
    if (views30Days < 30) {
        cvScoreRaw *= 0.5; // low sample penalty
    }
    const cvScore = cvScoreRaw;
    score += cvScore;

    // 5. Profile Completion (15 Puan) - Lineer
    const completionScore = (completionPercent / 100) * 15;
    score += completionScore;

    // SPRINT 9G: Quality Score Freeze Rule
    let isReliable = true;
    let reason = null;

    if (reviewCount < 3) {
        isReliable = false;
        reason = "Yeterli yorum yok";
    } else if (responseCount !== undefined && responseCount < 3) { // Use responseCount if passed
        isReliable = false;
        reason = "Yeterli yanıt verisi yok";
    }

    return {
        totalScore: Math.round(score),
        isReliable,
        reason,
        breakdown: {
            rating: Math.round(ratingScore),
            reviews: Math.round(reviewScore),
            response: Math.round(responseScore),
            conversion: Math.round(cvScore),
            completion: Math.round(completionScore)
        }
    };
}
