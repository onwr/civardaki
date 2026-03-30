"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  ImageIcon,
  Package,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { turkeyLocations, getDistricts } from "@/constants/locations";

const OnboardingLocationMap = dynamic(
  () => import("@/components/business/OnboardingLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(320px,55vh)] min-h-[240px] animate-pulse rounded-2xl bg-gray-100" />
    ),
  },
);

const STEPS = [
  { id: 1, label: "Temel Bilgiler", icon: Building2 },
  { id: 2, label: "Konum & İletişim", icon: MapPin },
  { id: 3, label: "Marka Görseli", icon: ImageIcon },
  { id: 4, label: "Menü Hazırlığı", icon: Package },
];

const inputClass =
  "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium outline-none focus:ring-2 focus:ring-[#004aad]/30 focus:border-[#004aad] placeholder:text-gray-400";
const labelClass =
  "text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2";
const selectClass = inputClass + " cursor-pointer appearance-none pr-10";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = parseInt(searchParams.get("step") || "1", 10);
  const [step, setStep] = useState(Math.min(Math.max(stepParam, 1), 4));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    city: "",
    district: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    latitude: null,
    longitude: null,
  });

  const cities = Object.keys(turkeyLocations).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
  const [districts, setDistricts] = useState([]);
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/onboarding");
      if (!res.ok) {
        toast.error("Veriler yüklenemedi.");
        return;
      }
      const json = await res.json();
      setData(json);
      const b = json.business;
      setForm((prev) => ({
        ...prev,
        name: b.name || "",
        category: b.category || "",
        description: b.description || "",
        city: b.city || "",
        district: b.district || "",
        address: b.address || "",
        phone: b.phone || "",
        email: b.email || "",
        website: b.website || "",
        latitude: b.latitude != null ? Number(b.latitude) : null,
        longitude: b.longitude != null ? Number(b.longitude) : null,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    setLoadingCategories(true);
    fetch("/api/categories/tree")
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((j) => {
        if (!cancelled) setCategoriesTree(j.categories || []);
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!form.city?.trim()) {
      setDistricts([]);
      return;
    }
    setDistricts(getDistricts(form.city));
  }, [form.city]);

  const save = async (fields) => {
    setSaving(true);
    try {
      const res = await fetch("/api/business/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Kaydedilemedi.");
        return false;
      }
      toast.success("Kaydedildi!");
      return true;
    } catch {
      toast.error("Bağlantı hatası.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goTo = (n) => {
    setStep(n);
    window.history.pushState({}, "", `/business/onboarding?step=${n}`);
  };

  const handleNext = async () => {
    let fields = {};
    if (step === 1)
      fields = { category: form.category, description: form.description };
    if (step === 2)
      fields = {
        city: form.city,
        district: form.district,
        address: form.address,
        phone: form.phone,
        website: form.website,
        latitude: form.latitude,
        longitude: form.longitude,
      };

    if (Object.keys(fields).length > 0) {
      const ok = await save(fields);
      if (!ok) return;
    }

    if (step < 4) {
      goTo(step + 1);
      load();
    } else {
      router.push("/business/dashboard");
    }
  };

  const completion = data?.completionPercent || 0;
  const missing = data?.missingSteps || [];
  const counts = data?.counts || {};

  const selectedParent =
    categoriesTree.find((c) => c.name === form.category) ||
    categoriesTree.find((c) =>
      c.children?.some((ch) => ch.name === form.category),
    );
  const subCategories = selectedParent?.children || [];
  const parentDropdownValue = selectedParent?.name ?? "";
  const subDropdownValue = subCategories.some((c) => c.name === form.category)
    ? form.category
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#004aad]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Üst: Başlık + ilerleme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Profil Tamamlama
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            İşletme bilgilerinizi tamamlayın.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-500">
            %{completion} tamamlandı
          </span>
          <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#004aad] rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Adım sekmeleri */}
      <div className="flex items-center justify-center gap-0 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = s.id < step;
          const active = s.id === step;
          return (
            <div key={s.id} className="flex items-center">
              <button
                type="button"
                onClick={() => goTo(s.id)}
                className={`flex flex-col items-center gap-1.5 px-3 py-1 rounded-xl transition-all ${active ? "bg-[#004aad]/10" : "hover:bg-gray-50"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${done ? "bg-emerald-500 text-white" : active ? "bg-[#004aad] text-white" : "bg-gray-100 text-gray-400"}`}
                >
                  {done ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${active ? "text-[#004aad]" : "text-gray-500"}`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-6 h-px mx-1 ${s.id < step ? "bg-emerald-400" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* İçerik kartı — panel ile aynı stil */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 md:p-10">
          {/* STEP 1 — Temel Bilgiler */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Temel Bilgiler
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  İşletmenizi tanımlayın.
                </p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>İşletme Adı</label>
                  <input
                    value={form.name}
                    readOnly
                    className={
                      inputClass +
                      " bg-gray-100 text-gray-600 cursor-not-allowed"
                    }
                    placeholder="—"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    İşletme adı değiştirilemez.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Kategori *</label>
                  <select
                    value={parentDropdownValue}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, category: e.target.value || "" }))
                    }
                    className={selectClass}
                    disabled={loadingCategories}
                  >
                    <option value="">Kategori seçin</option>
                    {categoriesTree.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {subCategories.length > 0 && (
                  <div>
                    <label className={labelClass}>Alt Kategori</label>
                    <select
                      value={subDropdownValue}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          category:
                            e.target.value || (selectedParent?.name ?? ""),
                        }))
                      }
                      className={selectClass}
                    >
                      <option value="">Seçin (opsiyonel)</option>
                      {subCategories.map((ch) => (
                        <option key={ch.id} value={ch.name}>
                          {ch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className={labelClass}>
                    Açıklama *{" "}
                    <span
                      className={
                        form.description.length >= 80
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }
                    >
                      ({form.description.length}/80+)
                    </span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    rows={4}
                    placeholder="İşletmeniz hakkında kısa tanıtım (en az 80 karakter)"
                    className={inputClass + " resize-none"}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Konum & İletişim */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Konum & İletişim
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Müşteriler önce yakınlardakileri bulur. Konum ekleyin.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Şehir *</label>
                  <select
                    value={form.city}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        city: e.target.value,
                        district: "",
                      }))
                    }
                    className={selectClass}
                  >
                    <option value="">Şehir seçin</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>İlçe *</label>
                  <select
                    value={form.district}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, district: e.target.value }))
                    }
                    className={selectClass}
                    disabled={!form.city}
                  >
                    <option value="">İlçe seçin</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Telefon</label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="0533 123 45 67"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>E-posta</label>
                  <input
                    value={form.email}
                    readOnly
                    className={
                      inputClass +
                      " bg-gray-100 text-gray-600 cursor-not-allowed"
                    }
                    placeholder="—"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    E-posta değiştirilemez.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Website</label>
                  <input
                    value={form.website}v 
                    onChange={(e) =>
                      setForm((p) => ({ ...p, website: e.target.value }))
                    }
                    placeholder="https://"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Adres *</label>
                  <input
                    value={form.address}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, address: e.target.value }))
                    }
                    placeholder="Tam adres"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Harita konumu</label>
                  <p className="mb-3 text-sm text-gray-500">
                    İşletmenizin haritada doğru görünmesi için konumu tıklayarak
                    seçin veya &quot;Konumumu kullan&quot; ile cihaz konumunu
                    alın.
                  </p>
                  <OnboardingLocationMap
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onChange={(lat, lng) =>
                      setForm((p) => ({
                        ...p,
                        latitude: lat,
                        longitude: lng,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Marka Görseli */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Marka Görseli
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Logo ekleyen işletmeler daha fazla talep alır.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className={`rounded-2xl border-2 border-dashed p-8 text-center space-y-4 transition-all ${counts.hasLogo ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200 bg-gray-50/50"}`}
                >
                  {counts.hasLogo ? (
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
                  )}
                  <p className="font-bold text-gray-900">
                    {counts.hasLogo ? "Logo Yüklendi" : "Logo Yükle"}
                  </p>
                  <Link
                    href="/business/settings"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#004aad] text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors"
                  >
                    {counts.hasLogo ? "Değiştir" : "Logo Yükle"}
                  </Link>
                </div>
                <div
                  className={`rounded-2xl border-2 border-dashed p-8 text-center space-y-4 transition-all ${counts.hasCover ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200 bg-gray-50/50"}`}
                >
                  {counts.hasCover ? (
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-300 mx-auto" />
                  )}
                  <p className="font-bold text-gray-900">
                    {counts.hasCover ? "Kapak Yüklendi" : "Kapak Görseli"}
                  </p>
                  <Link
                    href="/business/settings"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-300 transition-colors"
                  >
                    {counts.hasCover ? "Değiştir" : "Kapak Yükle"}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Menü Hazırlığı */}
          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Menü Hazırlığı
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Kataloğunuz doluysa dönüşüm artar.
                </p>
              </div>
              <div className="space-y-4">
                <div
                  className={`flex items-center gap-5 p-5 rounded-xl border ${counts.categoryCount >= 1 ? "border-emerald-200 bg-emerald-50/50" : "border-gray-100 bg-gray-50"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${counts.categoryCount >= 1 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    {counts.categoryCount >= 1 ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      En Az 1 Ürün Kategorisi
                    </p>
                    <p className="text-gray-500 text-sm">
                      {counts.categoryCount} kategori
                    </p>
                  </div>
                  <Link
                    href="/business/products"
                    className="px-4 py-2 rounded-xl bg-[#004aad] text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700"
                  >
                    Ekle
                  </Link>
                </div>
                <div
                  className={`flex items-center gap-5 p-5 rounded-xl border ${counts.productCount >= 3 ? "border-emerald-200 bg-emerald-50/50" : "border-gray-100 bg-gray-50"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${counts.productCount >= 3 ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    {counts.productCount >= 1 ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">
                      En Az 1 Ürün / Hizmet
                    </p>
                    <p className="text-gray-500 text-sm">
                      {counts.productCount} ürün (hedef: 1)
                    </p>
                  </div>
                  <Link
                    href="/business/products"
                    className="px-4 py-2 rounded-xl bg-[#004aad] text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700"
                  >
                    Ekle
                  </Link>
                </div>
                <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Profil durumu
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-gray-900">
                      %{completion}
                    </span>
                    <span className="text-gray-500 text-sm">tamamlandı</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#004aad] rounded-full transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  {missing.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {missing.slice(0, 3).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {m.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 md:px-10 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Geri
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#004aad] text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {step === 4 ? "Panele Dön" : "İleri"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
