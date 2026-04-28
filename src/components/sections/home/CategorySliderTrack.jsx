"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const COLORS = [
  ["#004aad", "#e8f0fe"],
  ["#0d9488", "#d1fae5"],
  ["#7c3aed", "#ede9fe"],
  ["#d97706", "#fef3c7"],
  ["#e11d48", "#ffe4e6"],
  ["#0ea5e9", "#e0f2fe"],
  ["#16a34a", "#dcfce7"],
  ["#9333ea", "#f3e8ff"],
  ["#ea580c", "#ffedd5"],
  ["#0891b2", "#cffafe"],
];

function getStyle(cat) {
  const idx = cat.name.charCodeAt(0) % COLORS.length;
  // Eğer category'nin imageUrl'i varsa onu kullan
  return {
    img: cat.imageUrl || null,
    accent: COLORS[idx][0],
    bg: COLORS[idx][1],
  };
}

function getEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes("temizlik")) return "🧹";
  if (n.includes("nakliyat") || n.includes("taşıma")) return "🚛";
  if (n.includes("boya") || n.includes("badana")) return "🖌️";
  if (n.includes("elektrik")) return "⚡";
  if (n.includes("klima")) return "❄️";
  if (n.includes("tadilat") || n.includes("usta")) return "🔨";
  if (n.includes("güzellik") || n.includes("kuaför")) return "💇";
  if (n.includes("sağlık") || n.includes("tıp")) return "🏥";
  if (n.includes("yemek") || n.includes("restoran") || n.includes("catering")) return "🍽️";
  if (n.includes("cafe") || n.includes("kahve")) return "☕";
  if (n.includes("spor") || n.includes("fitness")) return "🏋️";
  if (n.includes("fotoğraf")) return "📷";
  if (n.includes("hukuk") || n.includes("avukat")) return "⚖️";
  if (n.includes("muhasebe") || n.includes("mali")) return "📊";
  if (n.includes("eğitim") || n.includes("kurs")) return "📚";
  if (n.includes("evcil") || n.includes("pet")) return "🐾";
  if (n.includes("çiçek")) return "💐";
  if (n.includes("araba") || n.includes("oto")) return "🚗";
  if (n.includes("bahçe")) return "🌿";
  if (n.includes("düğün") || n.includes("organizasyon")) return "🎊";
  return "🏪";
}

const SPEED = 0.5; // px per frame

export default function CategorySliderTrack({ categories }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  // Seamless infinite scroll via rAF
  useEffect(() => {
    if (!categories.length) return;
    const track = trackRef.current;
    if (!track) return;

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

  // Duplicate list for seamless loop
  const items = [...categories, ...categories];

  return (
    <div
      className="relative"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-white to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-white to-transparent" />

      <div className="overflow-hidden px-4">
        <div
          ref={trackRef}
          className="flex gap-4 will-change-transform"
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
                aria-hidden={isDuplicate}
                className="group shrink-0 w-[280px] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#004aad]"
                style={{ textDecoration: "none" }}
              >
                {/* Image / colour placeholder */}
                <div
                  className="relative h-44 w-full flex items-center justify-center overflow-hidden"
                  style={{ background: img ? undefined : bg }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <span
                      className="text-7xl select-none transition-transform duration-300 group-hover:scale-110"
                      role="img"
                      aria-label={cat.name}
                    >
                      {emoji}
                    </span>
                  )}

                  {/* Business count badge */}
                  {cat.count > 0 && (
                    <span
                      className="absolute bottom-3 right-3 text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm"
                      style={{ background: accent }}
                    >
                      {cat.count} işletme
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 px-4 py-4 bg-white border border-t-0 border-gray-100 rounded-b-2xl group-hover:bg-gray-50 transition-colors">
                  <p className="text-[15px] font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#004aad] transition-colors">
                    {cat.name}
                  </p>
                  {cat.description && (
                    <p className="text-[13px] text-gray-500 mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
