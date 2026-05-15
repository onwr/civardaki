"use client";

import {
  Star,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=80",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=900&q=80",
];

function getCategoryColor(category = "") {
  const c = category.toLowerCase();

  if (c.includes("yeme") || c.includes("restoran")) {
    return "bg-orange-50 text-orange-600";
  }

  if (c.includes("güzellik") || c.includes("bakım")) {
    return "bg-violet-50 text-violet-600";
  }

  if (c.includes("oto") || c.includes("araç")) {
    return "bg-sky-50 text-sky-600";
  }

  if (c.includes("teknoloji") || c.includes("yazılım")) {
    return "bg-blue-50 text-blue-600";
  }

  if (c.includes("market")) {
    return "bg-emerald-50 text-emerald-600";
  }

  return "bg-slate-50 text-slate-600";
}

export default function FeaturedListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      setLoading(true);

      try {
        const res = await fetch("/api/public/businesses?limit=8&sort=popular", {
          cache: "no-store",
        });

        if (!res.ok) {
          if (!cancelled) setListings([]);
          return;
        }

        const data = await res.json();

        if (cancelled) return;

        const items = (data.items || []).map((b, i) => ({
          id: b.id,
          slug: b.slug,
          title: b.name,
          category: b.category || "İşletme",
          rating: Number(b.rating) || 0,
          reviews: b.reviewCount || 0,
          location: [b.district, b.city].filter(Boolean).join(", ") || "Yakında",
          image: b.coverImage || b.logoUrl || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
          isOpen: true,
        }));

        setListings(items);
      } catch {
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchListings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative mx-auto mt-10 ">
      <div className="relative overflow-hidden rounded-[38px] border border-slate-100 bg-white/85 px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:px-7 lg:px-9">
        <div className="absolute right-12 top-10 hidden h-28 w-28 bg-[radial-gradient(#d8e7ff_2px,transparent_2px)] [background-size:16px_16px] lg:block" />

        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#0057d9]">
              <TrendingUp className="h-4 w-4" />
              Öne Çıkanlar
            </div>

            <h2 className="text-[30px] font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-[40px] lg:text-[48px]">
              Popüler İşletmeleri{" "}
              <span className="text-[#0057d9]">Keşfet</span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Kullanıcılarımız tarafından en yüksek puanı almış, doğrulanmış ve
              kaliteli hizmet sunan işletmeler.
            </p>
          </div>

          <Link
            href="/search"
            className="hidden items-center gap-2 rounded-2xl bg-[#0057d9] px-6 py-4 text-sm font-black text-white shadow-[0_14px_34px_rgba(0,87,217,0.24)] transition hover:bg-[#004cc2] md:flex"
          >
            Tümünü İncele
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[330px] animate-pulse rounded-[28px] bg-slate-100"
                />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-[28px] border border-slate-100 bg-slate-50 px-6 py-12 text-center">
              <Store className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-4 font-black text-slate-700">
                Listelenecek işletme bulunamadı
              </p>
            </div>
          ) : (
            <>
              <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                modules={[Navigation, Autoplay]}
                spaceBetween={22}
                slidesPerView={1.12}
                loop={listings.length > 4}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                navigation={{
                  prevEl: ".featured-prev",
                  nextEl: ".featured-next",
                }}
                breakpoints={{
                  480: { slidesPerView: 1.35, spaceBetween: 16 },
                  640: { slidesPerView: 2, spaceBetween: 18 },
                  1024: { slidesPerView: 3, spaceBetween: 20 },
                  1280: { slidesPerView: 4, spaceBetween: 22 },
                }}
                className="!overflow-visible"
              >
                {listings.map((listing) => (
                  <SwiperSlide key={listing.id} className="h-auto">
                    <Link href={`/isletme/${listing.slug}`} className="block h-full">
                      <article className="group flex h-[335px] flex-col overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
                        <div className="relative h-[150px] overflow-hidden">
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                          />

                          <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-xs font-black text-emerald-600 shadow-md">
                            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                            AÇIK
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span
                              className={`line-clamp-1 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${getCategoryColor(
                                listing.category
                              )}`}
                            >
                              {listing.category}
                            </span>

                            <span className="flex shrink-0 items-center gap-1 text-sm font-black text-slate-900">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              {listing.reviews > 0
                                ? listing.rating.toFixed(1)
                                : "Yeni"}
                            </span>
                          </div>

                          <h3 className="line-clamp-1 text-lg font-black text-slate-950 transition group-hover:text-[#0057d9]">
                            {listing.title}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            Kaliteli hizmet, güvenilir işletme ve hızlı iletişim.
                          </p>

                          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                            <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-500">
                              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                              <span className="truncate">{listing.location}</span>
                            </span>

                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0057d9] transition group-hover:rotate-45 group-hover:bg-[#0057d9] group-hover:text-white">
                              <TrendingUp className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                type="button"
                className="featured-prev absolute -left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-700 shadow-xl transition hover:scale-105 lg:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                className="featured-next absolute -right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-700 shadow-xl transition hover:scale-105 lg:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <Link
          href="/search"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#0057d9] px-6 py-4 text-sm font-black text-white shadow-[0_14px_34px_rgba(0,87,217,0.20)] md:hidden"
        >
          Tümünü İncele
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}