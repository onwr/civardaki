"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Navigation,
  Building2,
  Grid3X3,
  Users,
  Clock3,
  Car,
  Home,
  Utensils,
  Scissors,
  HeartPulse,
  GraduationCap,
  ShoppingCart,
  Wrench,
  ClipboardList,
  GitCompare,
} from "lucide-react";
import { motion } from "framer-motion";
import FeaturedListings from "./FeaturedListings";
import NearbyBusinessesSection from "./NearbyBusinessesSection";

const CATEGORY_COLORS = [
  { bg: "bg-blue-50", color: "text-blue-600" },
  { bg: "bg-sky-50", color: "text-sky-600" },
  { bg: "bg-orange-50", color: "text-orange-500" },
  { bg: "bg-violet-50", color: "text-violet-500" },
  { bg: "bg-rose-50", color: "text-rose-500" },
  { bg: "bg-indigo-50", color: "text-indigo-600" },
  { bg: "bg-emerald-50", color: "text-emerald-500" },
  { bg: "bg-slate-50", color: "text-slate-600" },
];

function getCategoryIcon(name = "") {
  const n = name.toLowerCase();

  if (n.includes("ev") || n.includes("temizlik") || n.includes("tadilat")) return Home;
  if (n.includes("oto") || n.includes("araç") || n.includes("araba")) return Car;
  if (n.includes("yemek") || n.includes("restoran") || n.includes("cafe")) return Utensils;
  if (n.includes("güzellik") || n.includes("kuaför") || n.includes("bakım")) return Scissors;
  if (n.includes("sağlık") || n.includes("doktor")) return HeartPulse;
  if (n.includes("eğitim") || n.includes("kurs") || n.includes("ders")) return GraduationCap;
  if (n.includes("market") || n.includes("alışveriş")) return ShoppingCart;

  return Grid3X3;
}

function formatBusinessCount(count) {
  if (!count || count <= 0) return "İşletmeleri gör";
  if (count >= 1000) return `${Math.floor(count / 100) / 10}K+ işletme`;
  return `${count}+ işletme`;
}

export default function HeroSection() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/public/categories");
        const data = await res.json();

        if (data?.success && Array.isArray(data.categories)) {
          setCategories(data.categories.slice(0, 7));
        }
      } catch (error) {
        console.error("Hero categories load error:", error);
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f7fbff] via-white to-[#eef6ff] px-4 pb-12 pt-[135px] sm:px-6 lg:px-8">
      <div className="absolute left-[-160px] top-20 h-[420px] w-[420px] rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute right-[-160px] top-24 h-[420px] w-[420px] rounded-full bg-sky-100/70 blur-3xl" />

      <div className="relative mx-auto container">
        <div className="relative overflow-hidden rounded-[42px] border border-white/80 bg-gradient-to-br from-white via-[#f5faff] to-[#eaf4ff] p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] lg:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="relative z-10"
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-black text-[#0057d9] shadow-sm">
                <MapPin className="h-4 w-4 text-rose-500" />
                Yakınındaki işletmeler, hizmetler ve fırsatlar
              </div>

              <h1 className="max-w-[680px] text-[48px] font-black leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-[64px] xl:text-[82px]">
                Mahallende aradığın her şey{" "}
                <span className="text-[#0057d9]">Civardaki’de!</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                Binlerce işletmeyi keşfet, teklif al, yorumları incele ve sana
                en yakın hizmetlere saniyeler içinde ulaş.
              </p>

              <div className="mt-8 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "15.000+", sub: "İşletme", icon: Building2 },
                  { label: "50+", sub: "Kategori", icon: Grid3X3 },
                  { label: "100.000+", sub: "Kullanıcı", icon: Users },
                  { label: "7/24", sub: "Hizmet", icon: Clock3 },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                        <Icon className="h-5 w-5 text-[#0057d9]" />
                      </div>

                      <div>
                        <p className="font-black text-slate-950">{item.label}</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="relative hidden min-h-[420px] items-center justify-center lg:flex"
            >
              <img
                src="/images/sagoverlay.png"
                alt="Civardaki yakın işletmeler haritası"
                className="relative z-10 w-full max-w-[650px] object-contain"
              />

              <div className="absolute right-5 top-8 z-20 w-[190px] rounded-[24px] border border-slate-100 bg-white/95 p-4 shadow-[0_22px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400">Sana en yakın</p>
                  <button className="text-slate-300">×</button>
                </div>

                <h3 className="font-black text-slate-950">Lastikçi</h3>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Car className="h-7 w-7 text-[#0057d9]" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500">0,3 km</p>
                    <p className="text-sm font-black text-amber-500">★ 4.8</p>
                  </div>
                </div>

                <h3 className="mt-3 font-black text-slate-950">Kuaför</h3>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Scissors className="h-7 w-7 text-[#0057d9]" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-500">0,5 km</p>
                    <p className="text-sm font-black text-amber-500">★ 4.5</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="relative z-20 mx-auto mt-10 rounded-[30px] border border-slate-100 bg-white p-4 shadow-[0_28px_80px_rgba(15,23,42,0.10)]"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex h-16 flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-5">
                <Search className="h-5 w-5 text-[#0057d9]" />

                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ne arıyorsunuz? Örn: Lastik, Kuaför, Ev Temizliği, Oto Servis..."
                  className="h-full w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                className="flex h-16 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 text-sm font-black text-[#0057d9] transition hover:bg-blue-50"
              >
                <Navigation className="h-4 w-4" />
                Konumum
              </button>

              <button
                type="submit"
                className="h-16 rounded-2xl bg-[#0057d9] px-12 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.28)] transition hover:bg-[#004cc2]"
              >
                Ara
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-500">
                Popüler Aramalar:
              </span>

              {[
                "Lastikçi",
                "Kuaför",
                "Oto Servis",
                "Ev Temizliği",
                "Boyacı",
                "Nakliyat",
                "Diş Hekimi",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    router.push(`/search?q=${encodeURIComponent(tag)}`)
                  }
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:text-[#0057d9]"
                >
                  {tag}
                </button>
              ))}

              <button
                type="button"
                onClick={() => router.push("/kategoriler")}
                className="rounded-full bg-blue-50 px-5 py-2.5 text-sm font-black text-[#0057d9]"
              >
                Tümü
              </button>
            </div>
          </motion.form>
        </div>

        {/* TEKLİF BANDI */}

        <section className="mt-8 overflow-hidden rounded-[34px] border border-blue-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
          <div className="grid lg:grid-cols-[0.95fr_1.45fr]">
            <div className="relative overflow-hidden bg-[#0057d9] p-7 text-white lg:p-8">
              <div className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full bg-white/15 blur-2xl" />

              <div className="relative">
                <div className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] backdrop-blur-xl">
                  <Wrench className="h-4 w-4" />
                  Teklif Sistemi
                </div>

                <h2 className="text-2xl font-black leading-tight tracking-[-0.03em] md:text-3xl">
                  Fiyat teklifi al, en uygun seçeneği bul!
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-7 text-blue-100">
                  Aynı hizmet için birden fazla işletmeden teklif al,
                  karşılaştır ve sana en uygun seçeneği seç.
                </p>

              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-3 lg:p-7">
              {[
                {
                  title: "İhtiyacını Belirt",
                  desc: "Hizmeti seç ve detayları gir",
                  icon: ClipboardList,
                },
                {
                  title: "Teklifleri Topla",
                  desc: "İşletmelerden teklifler gelsin",
                  icon: Wrench,
                },
                {
                  title: "Karşılaştır & Seç",
                  desc: "En uygun teklifi seç ve tasarruf et",
                  icon: GitCompare,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => router.push("/teklif-al")}
                    className="group flex items-center gap-4 rounded-[24px] border border-slate-100 bg-slate-50 p-4 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0057d9] shadow-sm transition group-hover:bg-blue-50">
                      <Icon className="h-7 w-7" />
                    </div>

                    <div>
                      <h3 className="font-black text-slate-950">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <NearbyBusinessesSection />


        <FeaturedListings />

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categoriesLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[190px] animate-pulse rounded-[28px] border border-slate-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
              />
            ))
          ) : (
            <>
              {categories.map((cat, index) => {
                const Icon = getCategoryIcon(cat.name);
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

                return (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/kategori/${cat.slug}`)}
                    className="group rounded-[28px] border border-slate-100 bg-white p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
                  >
                    <div
                      className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] ${color.bg}`}
                    >
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <Icon className={`h-9 w-9 ${color.color}`} />
                      )}
                    </div>

                    <p className="line-clamp-1 font-black text-slate-950">
                      {cat.name}
                    </p>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      {formatBusinessCount(cat.count)}
                    </p>
                  </button>
                );
              })}

              <button
                onClick={() => router.push("/kategoriler")}
                className="group rounded-[28px] border border-slate-100 bg-white p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
              >
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-50">
                  <Grid3X3 className="h-9 w-9 text-slate-600" />
                </div>

                <p className="font-black text-slate-950">Tüm Kategoriler</p>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  Hepsini Gör
                </p>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}