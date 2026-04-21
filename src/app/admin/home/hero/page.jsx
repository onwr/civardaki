"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Save, Plus, Trash2, GripVertical, Image as ImageIcon,
  Eye, EyeOff, Link2, Type, CalendarDays, Search,
  Settings2, ChevronDown, ChevronUp, Upload, X, Sparkles
} from "lucide-react";

function makeId() {
  return `slide_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const EMPTY_SLIDE = () => ({
  id: makeId(),
  title: "Yeni Slide",
  subtitle: "",
  searchPlaceholder: "Hangi hizmeti arıyorsun?",
  showSearch: true,
  bgImage: null,
  bgColor: null,
  overlayOpacity: 60,
  overlayColor: "#0f172a",
  showOverlay: true,
  imageOpacity: 100,
  badge: "",
  buttons: [],
  active: true,
  order: 999,
  specialDayStart: null,
  specialDayEnd: null,
});

const EMPTY_BUTTON = () => ({
  id: `btn_${Date.now()}`,
  text: "Buton",
  href: "/",
  variant: "primary",
  color: "#004aad",
  textColor: "#ffffff",
});
function HeroPreview({ slide }) {
  if (!slide) return null;
  return (
    <div className="sticky top-24 w-full aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
      <div className="relative w-full h-full">
        {/* BG */}
        {slide.bgImage ? (
          <img src={slide.bgImage} alt="" className="w-full h-full object-cover" style={{ opacity: (slide.imageOpacity ?? 100) / 100 }} />
        ) : (
          <div className="w-full h-full" style={{ background: slide.bgColor || "#004aad" }}>
            <img src="/images/hero-back.png" alt="" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        
        {/* Overlay */}
        {slide.showOverlay !== false && (
          <div className="absolute inset-0" 
            style={{ background: `linear-gradient(to top, ${slide.overlayColor || "#0f172a"} ${(slide.overlayOpacity ?? 60) + 20}%, transparent)` }} 
          />
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {slide.badge && (
            <span className="inline-block px-2.5 py-0.5 bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold rounded-full mb-3 border border-white/20 uppercase tracking-wider">
              {slide.badge}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight drop-shadow-md">{slide.title || "Başlık"}</h2>
          {slide.subtitle && <p className="text-[11px] text-white/80 mb-4 max-w-[80%] mx-auto line-clamp-2">{slide.subtitle}</p>}
          
          {slide.showSearch && (
            <div className="w-full max-w-[80%] bg-white rounded-lg flex overflow-hidden mb-4 shadow-lg scale-90">
              <div className="flex-1 px-3 py-2 text-[10px] text-slate-400 text-left truncate">{slide.searchPlaceholder || "Ara..."}</div>
              <div className="bg-[#004aad] px-4 py-2 text-[10px] text-white font-bold">Ara</div>
            </div>
          )}

          {slide.buttons?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {slide.buttons.map(btn => (
                <div key={btn.id} style={btn.variant === "custom" ? { backgroundColor: btn.color, color: btn.textColor } : {}}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                    btn.variant === "primary" ? "bg-[#004aad] text-white shadow-md" :
                    btn.variant === "secondary" ? "bg-white text-slate-800 shadow-md" :
                    btn.variant === "outline" ? "border border-white/50 text-white" :
                    "shadow-md"
                  }`}>
                  {btn.text}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
          <Eye className="w-3 h-3 text-white" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Canlı Önizleme</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState([]);
  const [config, setConfig] = useState({ autoplay: true, interval: 5000, transition: "fade" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openSlideId, setOpenSlideId] = useState(null);
  const [uploading, setUploading] = useState(null);

  // For Preview
  const activeSlide = useMemo(() => slides.find(s => s.id === openSlideId), [slides, openSlideId]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero");
      const json = await res.json();
      if (json.success) {
        setSlides(json.slides || []);
        setConfig(json.config || { autoplay: true, interval: 5000, transition: "fade" });
        if (json.slides?.length) setOpenSlideId(json.slides[0].id);
      }
    } catch { toast.error("Yüklenemedi"); }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const ordered = slides.map((s, i) => ({ ...s, order: i }));
      const res = await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: ordered, config }),
      });
      const json = await res.json();
      if (json.success) {
        setSlides(json.slides);
        setConfig(json.config);
        setDirty(false);
        toast.success("Kaydedildi!");
      } else toast.error(json.error || "Hata");
    } catch { toast.error("Kayıt hatası"); }
    setSaving(false);
  };

  const updateSlide = (id, field, value) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    setDirty(true);
  };

  const addSlide = () => {
    const ns = EMPTY_SLIDE();
    setSlides(prev => [...prev, ns]);
    setOpenSlideId(ns.id);
    setDirty(true);
  };

  const removeSlide = (id) => {
    setSlides(prev => prev.filter(s => s.id !== id));
    setDirty(true);
    if (openSlideId === id) setOpenSlideId(null);
  };

  const addButton = (slideId) => {
    setSlides(prev => prev.map(s =>
      s.id === slideId ? { ...s, buttons: [...(s.buttons || []), EMPTY_BUTTON()] } : s
    ));
    setDirty(true);
  };

  const updateButton = (slideId, btnId, field, value) => {
    setSlides(prev => prev.map(s =>
      s.id === slideId ? {
        ...s,
        buttons: (s.buttons || []).map(b => b.id === btnId ? { ...b, [field]: value } : b)
      } : s
    ));
    setDirty(true);
  };

  const removeButton = (slideId, btnId) => {
    setSlides(prev => prev.map(s =>
      s.id === slideId ? { ...s, buttons: (s.buttons || []).filter(b => b.id !== btnId) } : s
    ));
    setDirty(true);
  };

  const handleImageUpload = async (slideId, file) => {
    if (!file) return;
    setUploading(slideId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/hero/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) {
        updateSlide(slideId, "bgImage", json.url);
        toast.success("Görsel yüklendi");
      } else toast.error(json.error || "Yükleme hatası");
    } catch { toast.error("Yükleme başarısız"); }
    setUploading(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Anasayfa Hero / Slider</h1>
          <p className="text-sm text-slate-500 mt-1">Slide&apos;ları sürükleyerek sıralayın ve canlı önizleme ile düzenleyin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addSlide} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Yeni Slide
          </button>
          <button onClick={save} disabled={saving || !dirty}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${dirty ? "bg-[#004aad] text-white hover:bg-blue-700 shadow-lg" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
            <Save className={`w-4 h-4 ${saving ? "animate-spin" : ""}`} />
            {saving ? "Kaydediliyor..." : dirty ? "Kaydet" : "Güncel"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: List & Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Global Config */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slider Ayarları</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">Otomatik Oynatma</span>
                <button type="button" onClick={() => { setConfig(p => ({ ...p, autoplay: !p.autoplay })); setDirty(true); }}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${config.autoplay ? "bg-[#004aad]" : "bg-slate-300"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.autoplay ? "translate-x-5" : ""}`} />
                </button>
              </label>
              <div className="p-3 bg-slate-50 rounded-xl">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Geçiş Süresi (ms)</label>
                <input type="number" min={1000} step={500} value={config.interval}
                  onChange={e => { setConfig(p => ({ ...p, interval: Number(e.target.value) || 5000 })); setDirty(true); }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-[#004aad]" />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Geçiş Efekti</label>
                <select value={config.transition} onChange={e => { setConfig(p => ({ ...p, transition: e.target.value })); setDirty(true); }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-[#004aad]">
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Slides List */}
          <Reorder.Group axis="y" values={slides} onReorder={(v) => { setSlides(v); setDirty(true); }} className="space-y-3">
            {slides.map((slide, idx) => {
              const isOpen = openSlideId === slide.id;
              return (
                <Reorder.Item key={slide.id} value={slide} className="list-none">
                  <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${isOpen ? "border-[#004aad]/30 shadow-lg" : "border-slate-200 shadow-sm"}`}>
                    {/* Slide Header Row */}
                    <div className="flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing" onClick={() => setOpenSlideId(isOpen ? null : slide.id)}>
                      <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <span className="text-xs font-bold text-slate-400 w-6">{idx + 1}</span>
                      {slide.bgImage && <img src={slide.bgImage} alt="" className="w-10 h-6 object-cover rounded" />}
                      <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{slide.title || "Başlıksız"}</span>
                      {slide.specialDayStart && <CalendarDays className="w-4 h-4 text-amber-500" title="Özel gün" />}
                      <button type="button" onClick={e => { e.stopPropagation(); updateSlide(slide.id, "active", !slide.active); }}
                        className={`p-1.5 rounded-lg transition-colors ${slide.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"}`}>
                        {slide.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button type="button" onClick={e => { e.stopPropagation(); removeSlide(slide.id); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {/* Expanded Detail */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="border-t border-slate-100 p-5 space-y-5">
                            {/* Row 1: Title + Subtitle */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Type className="w-3 h-3" /> Başlık</label>
                                <input type="text" value={slide.title} onChange={e => updateSlide(slide.id, "title", e.target.value)}
                                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#004aad] focus:ring-2 focus:ring-blue-100" />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Type className="w-3 h-3" /> Alt Açıklama</label>
                                <input type="text" value={slide.subtitle || ""} onChange={e => updateSlide(slide.id, "subtitle", e.target.value)}
                                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#004aad] focus:ring-2 focus:ring-blue-100" />
                              </div>
                            </div>

                            {/* Row 2: Image Upload + Badge + BgColor */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Arka Plan Görseli</label>
                                <div className="relative group">
                                  {slide.bgImage ? (
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-24">
                                      <img src={slide.bgImage} alt="" className="w-full h-full object-cover" />
                                      <button onClick={() => updateSlide(slide.id, "bgImage", null)}
                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-lg hover:bg-black/70">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-[#004aad] hover:bg-blue-50/50 transition-all">
                                      {uploading === slide.id ? (
                                        <div className="w-5 h-5 border-2 border-[#004aad] border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <>
                                          <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                          <span className="text-xs text-slate-400 font-semibold">Yükle</span>
                                        </>
                                      )}
                                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(slide.id, e.target.files?.[0])} />
                                    </label>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Rozet (Badge)</label>
                                <input type="text" placeholder="Ör: Yeni Yıl" value={slide.badge || ""} onChange={e => updateSlide(slide.id, "badge", e.target.value)}
                                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#004aad]" />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Arka Plan Rengi</label>
                                <div className="flex items-center gap-2">
                                  <input type="color" value={slide.bgColor || "#004aad"} onChange={e => updateSlide(slide.id, "bgColor", e.target.value)}
                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer" />
                                  <div className="relative flex-1">
                                    <input type="text" placeholder="Renk seçilmedi" value={slide.bgColor || ""} onChange={e => updateSlide(slide.id, "bgColor", e.target.value)}
                                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-[#004aad]" />
                                    {slide.bgColor && (
                                      <button onClick={() => updateSlide(slide.id, "bgColor", null)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-600">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Row 3: Appearance Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                              <div className="md:col-span-3 flex items-center justify-between pb-2 border-b border-slate-200 mb-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Görünüm Efektleri</span>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <span className="text-xs font-bold text-slate-600">Overlay Aktif</span>
                                  <button type="button" onClick={() => updateSlide(slide.id, "showOverlay", !(slide.showOverlay ?? true))}
                                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${(slide.showOverlay ?? true) ? "bg-emerald-500" : "bg-slate-300"}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${(slide.showOverlay ?? true) ? "translate-x-4" : ""}`} />
                                  </button>
                                </label>
                              </div>
                              
                              <div className={!(slide.showOverlay ?? true) ? "opacity-30 pointer-events-none" : ""}>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                                  <span>Overlay Rengi</span>
                                  <span className="text-[10px] text-[#004aad] font-mono">{slide.overlayColor || "#0f172a"}</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <input type="color" value={slide.overlayColor || "#0f172a"} onChange={e => updateSlide(slide.id, "overlayColor", e.target.value)}
                                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                                  <input type="text" value={slide.overlayColor || "#0f172a"} onChange={e => updateSlide(slide.id, "overlayColor", e.target.value)}
                                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono outline-none focus:border-[#004aad]" />
                                </div>
                              </div>
                              <div className={!(slide.showOverlay ?? true) ? "opacity-30 pointer-events-none" : ""}>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                                  <span>Overlay Opaklık</span>
                                  <span className="text-[10px] text-[#004aad] font-mono">%{slide.overlayOpacity ?? 60}</span>
                                </label>
                                <input type="range" min="0" max="100" value={slide.overlayOpacity ?? 60} onChange={e => updateSlide(slide.id, "overlayOpacity", parseInt(e.target.value))}
                                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004aad]" />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                                  <span>Resim Opaklık</span>
                                  <span className="text-[10px] text-[#004aad] font-mono">%{slide.imageOpacity ?? 100}</span>
                                </label>
                                <input type="range" min="0" max="100" value={slide.imageOpacity ?? 100} onChange={e => updateSlide(slide.id, "imageOpacity", parseInt(e.target.value))}
                                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#004aad]" />
                              </div>
                            </div>

                            {/* Row 4: Search config */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Search className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-semibold text-slate-700 flex-1">Arama Kutusu Göster</span>
                                <button type="button" onClick={() => updateSlide(slide.id, "showSearch", !slide.showSearch)}
                                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${slide.showSearch ? "bg-[#004aad]" : "bg-slate-300"}`}>
                                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${slide.showSearch ? "translate-x-5" : ""}`} />
                                </button>
                              </label>
                              {slide.showSearch && (
                                <div>
                                  <label className="text-xs font-bold text-slate-500 mb-1.5 block">Arama Placeholder</label>
                                  <input type="text" value={slide.searchPlaceholder || ""} onChange={e => updateSlide(slide.id, "searchPlaceholder", e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#004aad]" />
                                </div>
                              )}
                            </div>

                            {/* Row 5: Special Day Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                              <div>
                                <label className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Özel Gün Başlangıç</label>
                                <input type="datetime-local" value={slide.specialDayStart || ""} onChange={e => updateSlide(slide.id, "specialDayStart", e.target.value || null)}
                                  className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-500 bg-white" />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Özel Gün Bitiş</label>
                                <input type="datetime-local" value={slide.specialDayEnd || ""} onChange={e => updateSlide(slide.id, "specialDayEnd", e.target.value || null)}
                                  className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-500 bg-white" />
                              </div>
                              <p className="md:col-span-2 text-xs text-amber-600">Tarih aralığı belirlerseniz bu slide yalnızca o süre boyunca gösterilir.</p>
                            </div>

                            {/* Row 6: Buttons */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Link2 className="w-3 h-3" /> Butonlar</label>
                                <button onClick={() => addButton(slide.id)} className="text-xs font-semibold text-[#004aad] hover:underline flex items-center gap-1">
                                  <Plus className="w-3 h-3" /> Buton Ekle
                                </button>
                              </div>
                              {(slide.buttons || []).length === 0 && <p className="text-xs text-slate-400 italic">Henüz buton yok.</p>}
                              <div className="space-y-2">
                                {(slide.buttons || []).map(btn => (
                                  <div key={btn.id} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                      <input type="text" placeholder="Buton Metni" value={btn.text} onChange={e => updateButton(slide.id, btn.id, "text", e.target.value)}
                                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#004aad]" />
                                      <input type="text" placeholder="/link" value={btn.href} onChange={e => updateButton(slide.id, btn.id, "href", e.target.value)}
                                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#004aad]" />
                                      <select value={btn.variant} onChange={e => updateButton(slide.id, btn.id, "variant", e.target.value)}
                                        className="border border-slate-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-[#004aad]">
                                        <option value="primary">Standart</option>
                                        <option value="custom">Özel Renk</option>
                                        <option value="outline">Outline</option>
                                      </select>
                                      <button onClick={() => removeButton(slide.id, btn.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    {btn.variant === "custom" && (
                                      <div className="flex items-center gap-4 px-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zemin</span>
                                          <input type="color" value={btn.color || "#004aad"} onChange={e => updateButton(slide.id, btn.id, "color", e.target.value)}
                                            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yazı</span>
                                          <input type="color" value={btn.textColor || "#ffffff"} onChange={e => updateButton(slide.id, btn.id, "textColor", e.target.value)}
                                            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          {slides.length === 0 && (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">Henüz slide eklenmemiş</p>
              <button onClick={addSlide} className="mt-3 text-sm font-bold text-[#004aad] hover:underline">+ İlk Slide&apos;ı Ekle</button>
            </div>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-5 relative">
          <HeroPreview slide={activeSlide} />
        </div>
      </div>
    </div>
  );
}
