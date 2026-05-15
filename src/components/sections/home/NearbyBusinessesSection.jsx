"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
  Navigation,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation as SwiperNavigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useLocation } from "@/contexts/LocationContext";
import { formatDistance } from "@/lib/geo";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80",
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=900&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80",
];

function getImage(item, index) {
  return (
    item.coverImage ||
    item.imageUrl ||
    item.logoUrl ||
    PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length]
  );
}

function getDistanceLabel(item) {
  if (item.distanceText) return item.distanceText;
  if (item.distance != null && Number.isFinite(item.distance)) {
    return formatDistance(item.distance);
  }
  return null;
}

export default function NearbyBusinessesSection() {
  const swiperRef = useRef(null);
  const { selectedLocation, isHydrated } = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { cityName, districtName, lat, lng } = selectedLocation;

  const sectionTitle = useMemo(() => {
    const hasCoords =
      lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
    if (districtName) return `${districtName} Yakınındaki İşletmeler`;
    if (cityName) return `${cityName} Yakınındaki İşletmeler`;
    if (hasCoords) return "Konumuna En Yakın İşletmeler";
    return "Konumuna En Yakın İşletmeler";
  }, [cityName, districtName, lat, lng]);

  const locationHint = useMemo(() => {
    if (districtName && cityName) return `${cityName}, ${districtName}`;
    if (cityName) return cityName;
    if (lat != null && lng != null) return "Konumun";
    return "seçtiğin bölgede";
  }, [cityName, districtName, lat, lng]);

  const searchHref = useMemo(() => {
    const params = new URLSearchParams({ sort: "nearby" });
    if (cityName) params.set("city", cityName);
    if (districtName) params.set("district", districtName);
    if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
    }
    return `/search?${params.toString()}`;
  }, [cityName, districtName, lat, lng]);

  useEffect(() => {
    if (!isHydrated) return;

    let cancelled = false;

    async function loadBusinesses() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          limit: "10",
          sort: "nearby",
        });
        if (cityName) params.set("city", cityName);
        if (districtName) params.set("district", districtName);
        if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
          params.set("lat", String(lat));
          params.set("lng", String(lng));
        }

        const res = await fetch(`/api/public/businesses?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (!cancelled) setItems([]);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        const rows = data.items || data.businesses || [];

        setItems(
          rows.map((item, index) => ({
            id: item.id,
            slug: item.slug,
            name: item.name || item.title,
            category: item.category || item.type || "İşletme",
            rating: Number(item.rating) || 0,
            reviewCount: item.reviewCount || item.reviews || 0,
            location:
              [item.district, item.city].filter(Boolean).join(", ") ||
              item.location ||
              "Yakınında",
            image: getImage(item, index),
            distance: getDistanceLabel(item) || "—",
            isOpen: item.isOpen ?? true,
          })),
        );
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBusinesses();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, cityName, districtName, lat, lng]);

  if (!isHydrated || loading || items.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 overflow-hidden rounded-[34px] border border-slate-100 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.07)] sm:p-7">
      <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-rose-500">
            <MapPin className="h-4 w-4" />
            Konumuna Yakın
          </div>

          <h2 className="text-[30px] font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-[40px]">
            {sectionTitle}
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-500 sm:text-base">
            {locationHint} için açık ve popüler işletmeleri keşfet.
          </p>
        </div>

        <Link
          href={searchHref}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-[#0057d9] transition hover:bg-blue-50"
        >
          Tümünü Gör
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative">
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            modules={[SwiperNavigation, Autoplay]}
            spaceBetween={18}
            slidesPerView={1.15}
            loop={items.length > 5}
            autoplay={{
              delay: 3600,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".nearby-prev",
              nextEl: ".nearby-next",
            }}
            breakpoints={{
              520: { slidesPerView: 1.6, spaceBetween: 18 },
              640: { slidesPerView: 2, spaceBetween: 18 },
              900: { slidesPerView: 3, spaceBetween: 20 },
              1180: { slidesPerView: 4, spaceBetween: 20 },
              1420: { slidesPerView: 5, spaceBetween: 22 },
            }}
            className="!overflow-visible"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <Link href={`/isletme/${item.slug}`} className="block h-full">
                  <article className="group flex h-[310px] flex-col overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
                    <div className="relative h-[145px] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />

                      <div className="absolute left-3 top-1.5 rounded-full bg-white px-2 py-1 text-[9px] font-black text-emerald-600 shadow-md">
                        {item.isOpen ? "AÇIK" : "KAPALI"}
                      </div>

                      <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-slate-700 shadow-md backdrop-blur">
                        <Navigation className="mr-1 inline h-3.5 w-3.5 text-[#0057d9]" />
                        {item.distance}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <p className="line-clamp-1 text-xs font-black uppercase tracking-wide text-[#0057d9]">
                        {item.category}
                      </p>

                      <h3 className="mt-2 line-clamp-1 text-lg font-black text-slate-950 group-hover:text-[#0057d9]">
                        {item.name}
                      </h3>

                      <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-500">
                        <MapPin className="mr-1 inline h-4 w-4 text-slate-400" />
                        {item.location}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="flex items-center gap-1 text-sm font-black text-slate-900">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {item.reviewCount > 0 ? item.rating.toFixed(1) : "Yeni"}
                        </span>

                        <span className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-[#0057d9] transition group-hover:border-[#0057d9] group-hover:bg-blue-50">
                          Teklif Al
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
            className="nearby-prev absolute -left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-700 shadow-xl transition hover:scale-105 lg:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="nearby-next absolute -right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-700 shadow-xl transition hover:scale-105 lg:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
    </section>
  );
}
