"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
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
      } catch {}
      setLoading(false);
    }
    loadData();
  }, []);

  // Autoplay
  useEffect(() => {
    if (!config.autoplay || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(p => (p + 1) % slides.length);
    }, config.interval || 5000);
    return () => clearInterval(timerRef.current);
  }, [config, slides.length, current]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
    setShowDropdown(false);
  };

  const handleSuggestionClick = (slug) => {
    setQ("");
    setShowDropdown(false);
    router.push(`/search?category=${slug}`);
  };

  const filteredSuggestions = categoriesDict
    .filter(c => q.trim() && (c.name || "").toLowerCase().includes(q.toLowerCase().trim()))
    .slice(0, 5);

  const goTo = useCallback((dir) => {
    clearInterval(timerRef.current);
    setCurrent(p => (p + dir + slides.length) % slides.length);
  }, [slides.length]);

  const slide = slides[current] || null;

  const variants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    slide: { initial: { x: 80, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -80, opacity: 0 } },
    zoom: { initial: { scale: 1.1, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 } },
  };
  const anim = variants[config.transition] || variants.fade;

  if (loading) {
    return (
      <section className="relative h-[85vh] min-h-[550px] w-full flex items-center justify-center bg-slate-900">
        <Loader2 className="h-10 w-10 text-white animate-spin opacity-50" />
      </section>
    );
  }

  if (!slide) {
    return (
      <section className="relative h-[85vh] min-h-[550px] w-full overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-back.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-slate-900/50" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Civardaki</h1>
          <p className="text-xl text-slate-200 mb-10">Yakınındaki hizmetleri keşfet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[85vh] min-h-[550px] md:min-h-[650px] w-full overflow-hidden">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div key={slide.id} {...anim} transition={{ duration: 0.6 }} className="absolute inset-0 z-0">
          {slide.bgImage ? (
            <img 
              src={slide.bgImage} 
              alt="" 
              className="w-full h-full object-cover" 
              style={{ opacity: (slide.imageOpacity ?? 100) / 100 }}
            />
          ) : (
            <div className="w-full h-full" style={{ background: slide.bgColor || "#004aad" }}>
              <img src="/images/hero-back.png" alt="" className="w-full h-full object-cover opacity-30" />
            </div>
          )}
          {/* Dynamic Overlay */}
          {slide.showOverlay !== false && (
            <div 
              className="absolute inset-0 bg-gradient-to-t" 
              style={{ 
                background: `linear-gradient(to top, ${slide.overlayColor || "#0f172a"} ${(slide.overlayOpacity ?? 60) + 20}%, transparent)` 
              }} 
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div key={slide.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }} className="text-center w-full max-w-[900px]">

            {slide.badge && (
              <span className="inline-block px-4 py-1.5 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-6 border border-white/20">
                {slide.badge}
              </span>
            )}

            <h1 className="text-4xl md:text-6xl lg:text-[5rem] font-black text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
              {slide.title}
            </h1>

            {slide.subtitle && (
              <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto font-medium drop-shadow-lg leading-relaxed">
                {slide.subtitle}
              </p>
            )}

            {/* Search Bar */}
            {slide.showSearch && (
              <div className="relative w-full max-w-[800px] mx-auto mb-8" ref={wrapperRef}>
                <form onSubmit={handleSearch}
                  className="w-full bg-white rounded-2xl shadow-2xl flex overflow-hidden focus-within:ring-4 focus-within:ring-[#004aad]/20 transition-all">
                  <input type="text" value={q}
                    onChange={e => { setQ(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={slide.searchPlaceholder || "Hangi hizmeti arıyorsun?"}
                    className="flex-1 h-16 md:h-[72px] px-6 text-slate-800 text-lg placeholder-slate-400 outline-none font-semibold bg-white"
                    autoComplete="off" />
                  <button type="submit" className="h-16 md:h-[72px] bg-[#004aad] hover:bg-[#003d8f] text-white px-10 md:px-14 font-black text-xl transition-colors min-w-[140px]">
                    Ara
                  </button>
                </form>

                <AnimatePresence>
                  {showDropdown && q.trim().length > 0 && filteredSuggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left">
                      <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-[#004aad]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Öneriler</span>
                      </div>
                      <ul className="py-1">
                        {filteredSuggestions.map(s => (
                          <li key={s.slug || s.raw}>
                            <button type="button" onClick={() => handleSuggestionClick(s.slug)}
                              className="w-full text-left px-5 py-3 hover:bg-blue-50/70 text-slate-700 font-semibold text-base flex items-center justify-between group">
                              <span>{s.name}</span>
                              <span className="text-xs text-[#004aad] opacity-0 group-hover:opacity-100 transition-opacity">Git →</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button onClick={handleSearch}
                        className="w-full text-center py-3 bg-slate-50 hover:bg-slate-100 text-[#004aad] font-bold text-sm border-t border-slate-100">
                        &quot;{q}&quot; ile ara
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* CTA Buttons */}
            {slide.buttons?.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {slide.buttons.map(btn => (
                  <Link 
                    key={btn.id} 
                    href={btn.href || "/"}
                    style={btn.variant === "custom" ? { backgroundColor: btn.color, color: btn.textColor } : {}}
                    className={`px-7 py-3 rounded-xl font-bold text-base transition-all ${
                      btn.variant === "primary" ? "bg-[#004aad] text-white hover:bg-blue-700 shadow-lg" :
                      btn.variant === "secondary" ? "bg-white text-slate-800 hover:bg-slate-100 shadow-lg" :
                      btn.variant === "outline" ? "border-2 border-white/50 text-white hover:bg-white/10" :
                      "shadow-lg hover:brightness-110"
                    }`}>
                    {btn.text}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows & Dots */}
        {slides.length > 1 && (
          <>
            <button onClick={() => goTo(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => goTo(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {slides.map((s, i) => (
                <button key={s.id} onClick={() => { clearInterval(timerRef.current); setCurrent(i); }}
                  className={`rounded-full transition-all ${i === current ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
