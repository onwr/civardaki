"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

export default function ListingReviewsSection({ listing }) {
  if (!listing) return null;
  const reviewsList = listing.reviewsList || [];
  const breakdown = listing.ratingBreakdown || {};
  const safeRating = Number(listing.rating) || 0;
  const qualityScore = Number(
    breakdown.quality ?? breakdown.service ?? safeRating
  ).toFixed(1);
  const communicationScore = Number(
    breakdown.communication ?? breakdown.ambience ?? safeRating
  ).toFixed(1);
  const reliabilityScore = Number(
    breakdown.reliability ?? breakdown.flavor ?? safeRating
  ).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Değerlendirmeler
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i <= Math.round(listing.rating)
                      ? "fill-current"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-slate-900">
              {listing.rating}
            </span>
            <span className="text-slate-500 text-sm">
              ({listing.reviews} yorum)
            </span>
          </div>
        </div>
        <button
          type="button"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
        >
          Yorum yaz
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 pb-8 border-b border-slate-100">
        <div className="rounded-xl p-4 bg-slate-50 border border-slate-100 text-center">
          <span className="block text-2xl font-bold text-slate-900 mb-1">
            {qualityScore}
          </span>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            İş Kalitesi
          </span>
        </div>
        <div className="rounded-xl p-4 bg-slate-50 border border-slate-100 text-center">
          <span className="block text-2xl font-bold text-slate-900 mb-1">
            {communicationScore}
          </span>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            İletişim
          </span>
        </div>
        <div className="rounded-xl p-4 bg-slate-50 border border-slate-100 text-center">
          <span className="block text-2xl font-bold text-slate-900 mb-1">
            {reliabilityScore}
          </span>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            Güvenilirlik
          </span>
        </div>
      </div>

      {reviewsList.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p className="font-medium">Henüz değerlendirme yok.</p>
          <p className="text-sm mt-1">
            Bu işletmeyi deneyimlediyseniz ilk yorumu siz yapın.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviewsList.map((review, i) => (
            <div
              key={i}
              className="border-b border-slate-100 last:border-0 pb-6 last:pb-0"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-lg shrink-0">
                    {(review.user || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {review.user}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500 text-xs gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-3.5 h-3.5 ${
                              j < review.rating ? "fill-current" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">
                        {review.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm pl-14">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
