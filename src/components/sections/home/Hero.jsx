"use client";

import {
  Search,
  MapPin,
  Navigation,
  Map,
  X,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import HeroDropdown from "@/components/ui/HeroDropdown";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { turkeyLocations, getDistricts } from "@/constants/locations";

const categories = [
  {
    name: "Yemek İçecek",
    bgImage:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
  },
  {
    name: "Alışveriş",
    bgImage:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
  },
  {
    name: "Hizmet",
    bgImage:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80",
  },
  {
    name: "Ulaşım",
    bgImage:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80",
  },
  {
    name: "Danışmanlık",
    bgImage:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80",
  },
  {
    name: "Güzellik Sağlık",
    bgImage:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80",
  },
  {
    name: "Eğitim",
    bgImage:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80",
  },
  {
    name: "İlan",
    bgImage:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80",
  },
  {
    name: "Diğer",
    bgImage:
      "https://images.unsplash.com/photo-1511649475669-e288648b2339?w=400&q=80",
  },
];

function toQS(obj) {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== null && v !== undefined && String(v).trim() !== "")
      sp.set(k, String(v).trim());
  });
  return sp.toString();
}

export default function HeroSection() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");

  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [isLocationDetecting, setIsLocationDetecting] = useState(false);

  const [filtersMeta, setFiltersMeta] = useState({
    cityCounts: [],
    categoryCounts: [],
    districtCounts: [],
  });
  const [categoriesDict, setCategoriesDict] = useState([]);

  const districts = useMemo(() => (city ? getDistricts(city) : []), [city]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/public/categories", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setCategoriesDict(data.categories || []);
        }
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const qs = toQS({ city });
        const res = await fetch(`/api/public/businesses/filters?${qs}`, {
          cache: "no-store",
        });
        if (res.ok) setFiltersMeta(await res.json());
      } catch {}
    };
    run();
  }, [city]);

  useEffect(() => {
    setDistrict("");
    setCategory("");
  }, [city]);

  const handleSearch = () => {
    const params = toQS({ q, city, district, category, sort });
    router.push(params ? `/search?${params}` : "/search");
  };

  const handleTagClick = (tag) => {
    const match = categoriesDict.find(
      (c) => c.name?.toLowerCase() === tag.toLowerCase(),
    );
    const params = toQS({
      q: tag,
      city,
      district,
      category: match ? match.slug : "",
      sort,
    });
    router.push(`/search?${params}`);
  };

  const clearFilters = () => {
    setQ("");
    setCity("");
    setDistrict("");
    setCategory("");
    setSort("newest");
  };

  // Konum tespiti logic
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum tespiti desteklemiyor");
      return;
    }

    setIsLocationDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=tr&key=AIzaSyBvOkBw8tF5QmS7dGjF9JpQ4rV8nL2hE6w`,
          );

          if (!response.ok) {
            const fallbackResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`,
            );
            const fallbackData = await fallbackResponse.json();

            const address = fallbackData.display_name.split(",");
            const detectedCity =
              address[address.length - 3]?.trim() || "Bilinmeyen";
            const country = address[address.length - 1]?.trim() || "Türkiye";

            setCity(detectedCity);
          } else {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              const addressComponents = result.address_components;

              let detectedCity = "";

              addressComponents.forEach((component) => {
                if (
                  component.types.includes("locality") ||
                  component.types.includes("administrative_area_level_1")
                ) {
                  detectedCity = component.long_name;
                }
              });

              if (detectedCity) {
                setCity(detectedCity);
              }
            }
          }
        } catch (error) {
          console.error("Konum tespiti hatası:", error);
        }
        setIsLocationDetecting(false);
      },
      (error) => {
        console.error("Konum izni hatası:", error);
        setIsLocationDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  const toggleMapSelector = () => setShowMapSelector(!showMapSelector);

  const handleMapCitySelect = (cityName) => {
    setCity(cityName);
    setShowMapSelector(false);
  };

  return (
    <>
      <section className="relative pt-20 md:pt-0 h-[85vh] min-h-[500px] md:min-h-[700px] w-full overflow-hidden flex flex-col items-center justify-center">
        {/* Background with Ken Burns Effect and Overlay */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <img
              src="/images/hero-back.png"
              alt="City Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/60" />
            <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10 mix-blend-overlay" />
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Hero Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
          >
            Şehrin{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Ritmini
            </span>{" "}
            Yakala
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Restoranlardan kuryelere, tamircilerden danışmanlara kadar
            ihtiyacınız olan her şey bir tık uzağınızda.
          </motion.p>

          {/* Search & Filter Component - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-5xl bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-[2rem] shadow-2xl overflow-visible"
          >
            {/* Grid: aynı sütun hizası için iki satır da aynı yapıda */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 md:gap-3 overflow-visible">
              {/* Satır 1: Arama + Şehir + Ara butonu */}
              <div className="relative group min-w-0">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/70 group-focus-within:bg-[#004aad] group-focus-within:text-white transition-all duration-300">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ne arıyorsunuz? (Örn: Kebap, Çilingir...)"
                  className="w-full h-14 pl-16 pr-4 bg-white/5 border border-white/10 rounded-3xl text-white placeholder-white/50 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all font-medium"
                />
              </div>
              <div className="relative group min-w-0">
                <button
                  type="button"
                  onClick={() => setShowCityModal(true)}
                  className="w-full h-14 pl-2 pr-2 rounded-3xl bg-white/5 border border-white/10 text-left font-medium text-white hover:bg-white/10 focus:outline-none focus:border-white/30 transition-all flex items-center gap-3"
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <span
                    className={
                      city ? "text-white truncate" : "text-white/50 truncate"
                    }
                  >
                    {city || "Şehir Seçin"}
                  </span>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 z-10">
                  <button
                    onClick={detectLocation}
                    disabled={isLocationDetecting}
                    className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-50"
                    title="Konumu Bul"
                  >
                    <Navigation
                      className={`w-5 h-5 ${isLocationDetecting ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    onClick={toggleMapSelector}
                    className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    title="Haritadan Seç"
                  >
                    <Map className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="h-14 px-8 bg-[#004aad] hover:bg-[#003d8f] text-white rounded-3xl font-semibold text-lg shadow-lg hover:shadow-[#004aad]/30 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>Ara</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Satır 2: İlçe + Kategori + Sırala + Sıfırla (aynı sütun hizası) */}
              <div className="min-w-0">
                <HeroDropdown
                  value={district}
                  onChange={setDistrict}
                  options={districts.map((d) => {
                    const countObj = filtersMeta.districtCounts?.find(
                      (x) => x.district === d,
                    );
                    const countLabel = countObj ? ` (${countObj.count})` : "";
                    return { value: d, label: `${d}${countLabel}` };
                  })}
                  placeholder={city ? "İlçe Seçin" : "Önce şehir seç"}
                  disabled={!city}
                  className="h-14 rounded-3xl"
                />
              </div>
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="w-full h-14 px-4 rounded-3xl bg-white/5 border border-white/10 text-left font-medium text-white hover:bg-white/10 focus:outline-none focus:border-white/30 transition-all flex items-center justify-between gap-2"
                >
                  <span
                    className={
                      category
                        ? "text-white truncate"
                        : "text-white/50 truncate"
                    }
                  >
                    {category
                      ? ((categoriesDict || []).find(
                          (c) => (c.slug ?? c.raw) === category,
                        )?.name ?? category)
                      : "Kategori Seçin"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />
                </button>
              </div>
              <div className="flex items-stretch gap-2 min-w-0">
                <HeroDropdown
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: "newest", label: "En Yeni" },
                    { value: "popular", label: "Popüler" },
                  ]}
                  placeholder="Sırala"
                  className="h-14 rounded-3xl flex-1"
                />
                <button
                  onClick={clearFilters}
                  className="h-14 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-3xl font-semibold text-sm transition-all whitespace-nowrap"
                >
                  Sıfırla
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Selector Modal */}
        {/* Şehir Seçim Modal - Glassmorphism */}
        <AnimatePresence>
          {showCityModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-[999] flex items-center justify-center p-4"
              onClick={() => setShowCityModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl"
              >
                <div className="p-4 border-b border-white/20 flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="Şehir ara..."
                      className="w-full h-12 pl-10 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#004aad] focus:bg-white/10"
                    />
                  </div>
                  <button
                    onClick={() => setShowCityModal(false)}
                    className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-auto py-2">
                  {Object.keys(turkeyLocations)
                    .sort()
                    .filter(
                      (c) =>
                        !citySearch.trim() ||
                        c
                          .toLowerCase()
                          .includes(citySearch.trim().toLowerCase()),
                    )
                    .map((cityName) => (
                      <button
                        key={cityName}
                        type="button"
                        onClick={() => {
                          setCity(cityName);
                          setShowCityModal(false);
                          setCitySearch("");
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors ${city === cityName ? "bg-[#004aad]/50 text-white font-semibold" : "text-white/90 hover:bg-white/10"}`}
                      >
                        {cityName}
                      </button>
                    ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kategori Seçim Modal - Glassmorphism */}
        <AnimatePresence>
          {showCategoryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-[999] flex items-center justify-center p-4"
              onClick={() => setShowCategoryModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl"
              >
                <div className="p-4 border-b border-white/20 flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Kategori ara..."
                      className="w-full h-12 pl-10 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#004aad] focus:bg-white/10"
                    />
                  </div>
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-auto py-2">
                  {(categoriesDict || [])
                    .filter((c) => (c.slug ?? c.raw ?? "").trim() !== "")
                    .filter((c) => {
                      const name = (
                        c.name ??
                        c.displayName ??
                        ""
                      ).toLowerCase();
                      const q = categorySearch.trim().toLowerCase();
                      return !q || name.includes(q);
                    })
                    .map((c) => {
                      const val = c.slug ?? c.raw ?? "";
                      const label = `${c.name ?? c.displayName ?? ""} (${c.count ?? 0})`;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setCategory(val);
                            setShowCategoryModal(false);
                            setCategorySearch("");
                          }}
                          className={`w-full px-4 py-3 text-left transition-colors ${category === val ? "bg-[#004aad]/50 text-white font-semibold" : "text-white/90 hover:bg-white/10"}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Harita Modal */}
        <AnimatePresence>
          {showMapSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
              onClick={toggleMapSelector}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl overflow-hidden w-full max-w-4xl shadow-2xl"
              >
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-800">
                    Haritadan Konum Seç
                  </h3>
                  <button
                    onClick={toggleMapSelector}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="h-[400px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.27925!2d28.9784!3d41.0082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzI5LjUiTiAyOMKwNTgnNDIuMiJF!5e0!3m2!1str!2str!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Map"
                  />
                </div>
                <div className="p-4 grid grid-cols-4 gap-2 bg-gray-50">
                  {[
                    "İstanbul",
                    "Ankara",
                    "İzmir",
                    "Bursa",
                    "Antalya",
                    "Adana",
                    "Gaziantep",
                    "Konya",
                  ].map((cityName) => (
                    <button
                      key={cityName}
                      onClick={() => handleMapCitySelect(cityName)}
                      className="py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-[#004aad] hover:border-blue-200 transition-all"
                    >
                      {cityName}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
