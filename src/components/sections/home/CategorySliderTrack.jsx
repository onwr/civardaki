"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const COLORS = [
  ["#004aad", "#eef4ff"],
  ["#0d9488", "#ecfdf5"],
  ["#7c3aed", "#f5f3ff"],
  ["#d97706", "#fffbeb"],
  ["#e11d48", "#fff1f2"],
  ["#0ea5e9", "#f0f9ff"],
  ["#16a34a", "#f0fdf4"],
  ["#9333ea", "#faf5ff"],
  ["#ea580c", "#fff7ed"],
  ["#0891b2", "#ecfeff"],
];

function getStyle(cat) {
  const idx = cat.name.charCodeAt(0) % COLORS.length;
  return {
    img: cat.imageUrl || null,
    accent: COLORS[idx][0],
    bg: COLORS[idx][1],
  };
}

function getEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes("temizlik")) return "🧹";
  if (n.includes("nakliyat")) return "🚛";
  if (n.includes("güzellik")) return "💇";
  if (n.includes("yemek")) return "🍽️";
  if (n.includes("oto")) return "🚗";
  return "🏪";
}

const SPEED = 0.5;

export default function CategorySliderTrack({ categories }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (!categories.length) return;
    const track = trackRef.current;

    const tick = () => {
      if (!pausedRef.current && track) {
        const half = track.scrollWidth / 2;
        posRef.current += SPEED;
        if (posRef.current >= half) posRef.current = 0;
        track.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [categories]);

  const items = [...categories, ...categories];

  return (
    <div
      className="relative"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      {/* fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

      <div className="overflow-hidden md:py-6">
        <div
          ref={trackRef}
          className="flex gap-6 will-change-transform"
          style={{ width: "max-content" }}
        >
          {items.map((cat, idx) => {
            const { img, accent, bg } = getStyle(cat);
            const emoji = getEmoji(cat.name);
            const isDuplicate = idx >= categories.length;

            return (
              <Link
                key={`${cat.id}-${idx}`}
                href={`/kategori/${cat.slug}`}
                tabIndex={isDuplicate ? -1 : 0}
                className="group w-[260px] shrink-0"
              >
                <div className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">

                  {/* IMAGE */}
                  <div
                    className="relative h-40 flex items-center justify-center"
                    style={{ background: img ? undefined : bg }}
                  >
                    {img ? (
                      <img
                        src={img}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition">
                        {emoji}
                      </span>
                    )}

                    {/* badge */}
                    {cat.count > 0 && (
                      <div
                        className="absolute bottom-3 right-3 text-xs px-3 py-1 rounded-full text-white font-bold shadow"
                        style={{ background: accent }}
                      >
                        {cat.count}
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 group-hover:text-[#004aad] transition">
                      {cat.name}
                    </h3>

                    {cat.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}