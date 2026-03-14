"use client";

import {
  Star,
  MapPin,
  CheckCircle,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80",
  "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80",
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
];

export default function FeaturedListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchListings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/public/businesses?limit=6&sort=popular", {
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
          category: b.category || "",
          rating: Number(b.rating) || 0,
          reviews: b.reviewCount || 0,
          location: [b.city, b.district].filter(Boolean).join(", ") || "—",
          image: b.logoUrl || PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
          isOpen: true,
          isVerified: Boolean(b.isVerified),
        }));
        setListings(items);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Veri yüklenemedi");
          setListings([]);
        }
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
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <style jsx global>{`
        .swiper-wrapper {
          transition-timing-function: linear;
        }
      `}</style>

      <div className="container mx-auto px-4 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </span>
              <span className="text-[#004aad] font-bold tracking-wider text-sm uppercase">
                Öne Çıkanlar
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
              Popüler İşletmeleri{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aad] to-blue-500">
                Keşfet
              </span>
            </h2>
            <p className="text-gray-500 mt-4 text-lg">
              Kullanıcılarımız tarafından en yüksek puanı almış, doğrulanmış ve
              kaliteli hizmet sunan işletmeler.
            </p>
          </div>

          <Link
            href="/search"
            className="hidden md:flex items-center gap-2 text-white font-bold bg-[#004aad] hover:bg-[#003d8f] transition-all px-6 py-3 rounded-xl shadow-lg shadow-[#004aad]/20 group"
          >
            Tümünü İncele{" "}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div
        className="w-full"
        onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
        onMouseLeave={() => swiperRef.current?.autoplay?.start()}
      >
        {loading ? (
          <div className="flex gap-6 px-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[min(320px,85vw)] h-[420px] bg-gray-100 rounded-[2rem] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mx-4 rounded-[2rem] bg-amber-50 border border-amber-200 px-6 py-10 text-center">
            <p className="text-amber-800 font-semibold">
              Öne çıkanlar yüklenirken bir hata oluştu.
            </p>
            <p className="text-amber-600 text-sm mt-1">{error}</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="mx-4 rounded-[2rem] bg-gray-50 border border-gray-100 px-6 py-14 text-center">
            <p className="text-gray-600 font-semibold text-lg">
              Listelenecek işletme bulunamadı
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Daha sonra tekrar deneyebilirsiniz.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-[#004aad] font-bold mt-4 hover:underline"
            >
              Tümünü ara <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            modules={[Autoplay, FreeMode]}
            spaceBetween={32}
            slidesPerView={1.2}
            loop={listings.length > 1}
            speed={6000}
            freeMode={true}
            autoplay={
              listings.length > 1
                ? {
                    delay: 0,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4.2 },
            }}
            className="pb-20 px-4 !overflow-visible"
          >
            {listings.map((listing) => (
              <SwiperSlide key={listing.id} className="h-auto">
                <Link
                  href={`/isletme/${listing.slug}`}
                  className="block h-full group"
                >
                  <article className="h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500 flex flex-col relative">
                    {/* Image Area */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        {listing.isVerified && (
                          <div className="bg-white/95 backdrop-blur-md text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-blue-100">
                            <CheckCircle className="w-3 h-3 fill-[#004aad] text-white" />{" "}
                            ONAYLI
                          </div>
                        )}
                      </div>

                      <div className="absolute top-4 right-4 z-10">
                        <div
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 backdrop-blur-md border border-white/20 ${listing.isOpen ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
                        >
                          <Clock className="w-3 h-3" />{" "}
                          {listing.isOpen ? "AÇIK" : "KAPALI"}
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#004aad] bg-blue-50 px-2 py-1 rounded-md">
                          {listing.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold text-gray-900">
                            {listing.reviews > 0
                              ? listing.rating.toFixed(1)
                              : "Yeni"}
                          </span>
                          {listing.reviews > 0 && (
                            <span className="text-gray-400 text-xs">
                              ({listing.reviews})
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#004aad] transition-colors">
                        {listing.title}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center text-gray-500 text-sm group-hover:text-gray-700 transition-colors">
                          <MapPin className="w-4 h-4 mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span className="truncate max-w-[140px]">
                            {listing.location}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#004aad] group-hover:bg-[#004aad] group-hover:text-white transition-all transform group-hover:rotate-45">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="mt-8 text-center md:hidden px-4">
        <Link
          href="/search"
          className="flex items-center justify-center gap-2 text-white font-bold bg-[#004aad] active:bg-blue-700 transition-all px-6 py-4 rounded-xl shadow-lg w-full"
        >
          Tüm İşletmeleri Gör <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
