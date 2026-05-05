"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, ChevronLeft, ChevronRight, MapPinIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  const router = useRouter();
  const wrapperRef = useRef(null);
  const timerRef = useRef(null);

  const [q, setQ] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [categoriesDict, setCategoriesDict] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [config, setConfig] = useState({ autoplay: true, interval: 5000, transition: "fade" });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [heroRes, catsRes] = await Promise.all([
          fetch("/api/public/hero").catch(() => null),
          fetch("/api/public/categories").catch(() => null),
        ]);

        if (heroRes?.ok) {
          const json = await heroRes.json();
          setSlides(json.slides || []);
          setConfig(json.config || { autoplay: true, interval: 5000, transition: "fade" });
        }

        if (catsRes?.ok) {
          const d = await catsRes.json();
          setCategoriesDict(d.categories || []);
        }
      } catch { }

      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!config.autoplay || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(p => (p + 1) % slides.length);
    }, config.interval || 5000);
    return () => clearInterval(timerRef.current);
  }, [config, slides.length, current]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
    setShowDropdown(false);
  };

  const filteredSuggestions = categoriesDict
    .filter(c => q.trim() && (c.name || "").toLowerCase().includes(q.toLowerCase().trim()))
    .slice(0, 5);

  const slide = slides[current] || null;

  /* 🔥 MOCK HERO (TASARIMLA BİREBİR) */
  const renderMockHero = () => (
    <section className="relative w-full pt-5 md:pt-0 min-h-[920px] flex items-center">
      {/* BACKGROUND GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#eef4ff] via-white to-[#f8fbff]" />

      <div className="relative z-10 container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT */}
        <div>
          <span className="hidden md:flex items-center w-fit gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#004aad] text-sm font-semibold mb-6 ">
            <MapPinIcon className="text-[#ad0000]" size={20} /> Yakınındaki işletmeler, fırsatlar ve hizmetler
          </span>

          <h1 className="text-4xl md:text-6xl font-black leading-tight text-slate-900 mb-6">
            Mahallende <br /> aradığın her şey{" "}
            <span className="text-[#004aad]">Civardaki'de!</span>
          </h1>

          <p className="text-lg font-semibold text-slate-600 mb-8 max-w-xl">
            Binlerce işletmeyi keşfet, yorumları incele,<br /> iletişime geç ve hayatını kolaylaştır.
          </p>

          {/* SEARCH */}
          <div className="relative max-w-xl" ref={wrapperRef}>
            <form
              onSubmit={handleSearch}
              className="flex p-4 items-center bg-white rounded-2xl shadow-xl overflow-hidden border"
            >
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShowDropdown(true);
                }}
                placeholder="İşletme, hizmet veya kategori ara..."
                className="flex-1 px-5 py-4 outline-none text-slate-700"
              />
              <button className="px-6 rounded-full py-4 bg-[#004aad] text-white font-bold">
                Ara
              </button>
            </form>

            {/* DROPDOWN */}
            <AnimatePresence>
              {showDropdown && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border z-50"
                >
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => router.push(`/search?category=${s.slug}`)}
                      className="block w-full text-black/70 font-bold text-left px-4 py-3 hover:bg-gray-50"
                    >
                      {s.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* POPULAR TAGS */}
          <div className="flex flex-wrap gap-2 mt-6 text-sm">
            {["Kuaför", "Oto Servis", "Yemek", "Market"].map((t) => (
              <span key={t} className="px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative mt-4 md:mt-0 flex justify-center">
          <img
            src="/images/hero-uyg.png"
            alt="App Preview"
            className="w-[420px] md:w-[100vh] scale-130"
          />
        </div>
      </div>
    </section>
  );

  if (loading) {
    return (
      <section className="h-[600px] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </section>
    );
  }

  /* 🔥 EĞER SLIDE YOKSA → MOCK TASARIM */
  if (!slide) {
    return renderMockHero();
  }

  /* 🔥 SENİN ORİJİNAL SİSTEMİN (HİÇ DOKUNMADIM) */
  return (
    <section className="relative h-[85vh] min-h-[550px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          <img src={slide.bgImage} className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex items-center justify-center h-full text-white">
        <h1 className="text-5xl font-bold">{slide.title}</h1>
      </div>
    </section>
  );
}