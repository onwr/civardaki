"use client";

import {
  Star,
  ThumbsUp,
  BadgeCheck,
  MessageCircle,
} from "lucide-react";
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
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8"
    >
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-600">
            <MessageCircle className="h-4 w-4" />
            Kullanıcı Yorumları
          </div>

          <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-950">
            Değerlendirmeler
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i <= Math.round(safeRating)
                        ? "fill-current"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>

              <span className="text-2xl font-black text-slate-950">
                {safeRating > 0 ? safeRating.toFixed(1) : "—"}
              </span>
            </div>

            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">
              {listing.reviews || 0} değerlendirme
            </span>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0057d9] px-7 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.24)] transition hover:bg-[#004cc2]"
        >
          <MessageCircle className="h-5 w-5" />
          Yorum Yap
        </button>
      </div>

      {/* SCORE CARDS */}
      <div className="mb-8 grid gap-4 border-b border-slate-100 pb-8 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <span className="block text-4xl font-black text-slate-950">
            {qualityScore}
          </span>

          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            Hizmet Kalitesi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <span className="block text-4xl font-black text-slate-950">
            {communicationScore}
          </span>

          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            İletişim
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
          <span className="block text-4xl font-black text-slate-950">
            {reliabilityScore}
          </span>

          <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            Güvenilirlik
          </p>
        </div>
      </div>

      {reviewsList.length === 0 ? (
        <div className="py-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
            <MessageCircle className="h-10 w-10 text-slate-400" />
          </div>

          <h3 className="text-2xl font-black text-slate-950">
            Henüz yorum yok
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Bu işletmeyi deneyimlediyseniz ilk yorumu siz yapın.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviewsList.map((review, i) => (
            <div
              key={i}
              className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-[#0057d9]">
                    {(review.user || "A")[0].toUpperCase()}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-black text-slate-950">
                        {review.user}
                      </h4>

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-600">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Doğrulandı
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`h-4 w-4 ${
                              j < review.rating
                                ? "fill-current"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-xs font-semibold text-slate-400">
                        {review.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-[15px] leading-8 text-slate-600">
                {review.text}
              </p>

              <div className="mt-5 flex items-center gap-5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0057d9]"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Faydalı
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0057d9]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Yanıtla
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}