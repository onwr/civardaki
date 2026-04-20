"use client";

import { useState, useEffect } from "react";
import {
  Store, Save, ImageIcon, MapPin, Phone, Globe, Instagram, Facebook, Twitter, Youtube, Building2, Mail, Loader2,
  Clock, Power, Sparkles, CheckSquare, Square
} from "lucide-react";
import { toast } from "sonner";
import { turkeyLocations, getDistricts } from "@/constants/locations";

const DAYS = [
  { key: "monday", label: "Pazartesi" },
  { key: "tuesday", label: "Salı" },
  { key: "wednesday", label: "Çarşamba" },
  { key: "thursday", label: "Perşembe" },
  { key: "friday", label: "Cuma" },
  { key: "saturday", label: "Cumartesi" },
  { key: "sunday", label: "Pazar" },
];

const AMENITIES = [
  { id: "wifi", label: "Ücretsiz Wi-Fi" },
  { id: "parking", label: "Otopark" },
  { id: "takeaway", label: "Paket Servis (Gel-Al)" },
  { id: "delivery", label: "Eve Teslimat" },
  { id: "credit_card", label: "Kredi Kartı / POS" },
  { id: "disabled_access", label: "Engelliye Uygun" },
  { id: "outdoor", label: "Açık Alan / Bahçe" },
  { id: "pet_friendly", label: "Evcil Hayvan Dostu" },
  { id: "baby_care", label: "Bebek Bakım Odası" },
  { id: "reservation", label: "Rezervasyon Gerekli" },
  { id: "valet", label: "Vale Hizmeti" },
  { id: "alcohol", label: "Alkollü İçecek" },
];

const DEFAULT_HOURS = DAYS.reduce((acc, day) => {
  acc[day.key] = { isOpen: true, open: "09:00", close: "18:00" };
  return acc;
}, {});
DEFAULT_HOURS.sunday.isOpen = false;

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50">
      <div>
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${checked ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-300 shadow-inner'}`}
      >
        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function BusinessProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);

  const [form, setForm] = useState({
    vision: "",
    phone: "",
    email: "",
    website: "",
    city: "",
    district: "",
    address: "",
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    isOpen: true,
    isActive: true,
    reservationEnabled: true,
    services: [],
    workingHours: DEFAULT_HOURS,
  });

  const [districts, setDistricts] = useState([]);
  const cities = Object.keys(turkeyLocations).sort((a, b) => a.localeCompare(b, "tr"));

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/business/settings");
        if (!res.ok) throw new Error("Veriler alınamadı");
        const json = await res.json();
        setData(json);

        const notif = json.notificationSettings || {};
        const social = notif.social || {};

        setForm({
          vision: json.vision || json.description || "",
          phone: json.phone || "",
          email: json.email || "",
          website: json.website || "",
          city: json.city || "",
          district: json.district || "",
          address: json.address || "",
          instagram: social.instagram || "",
          facebook: social.facebook || "",
          twitter: social.twitter || "",
          youtube: social.youtube || "",
          isOpen: json.isOpen ?? true,
          isActive: json.isActive ?? true,
          reservationEnabled: json.reservationEnabled ?? true,
          services: json.services || [],
          workingHours: json.workingHours || DEFAULT_HOURS,
        });

        if (json.city) {
          setDistricts(getDistricts(json.city));
        }
      } catch (err) {
        toast.error("İşletme ayarları yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!form.city) {
      setDistricts([]);
      return;
    }
    setDistricts(getDistricts(form.city));
  }, [form.city]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const currentNotif = data?.notificationSettings || {};
      const newNotif = {
        ...currentNotif,
        social: {
          instagram: form.instagram,
          facebook: form.facebook,
          twitter: form.twitter,
          youtube: form.youtube,
        },
      };

      const res = await fetch("/api/business/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vision: form.vision,
          phone: form.phone,
          email: form.email,
          website: form.website,
          city: form.city,
          district: form.district,
          address: form.address,
          notificationSettings: newNotif,
          isOpen: form.isOpen,
          isActive: form.isActive,
          reservationEnabled: form.reservationEnabled,
          services: form.services,
          workingHours: form.workingHours,
        }),
      });

      if (!res.ok) throw new Error("Ayarlar kaydedilemedi");
      toast.success("Tüm mağaza ayarları başarıyla kaydedildi!");

      setData((prev) => ({ ...prev, notificationSettings: newNotif }));
    } catch (err) {
      toast.error("Hata oluştu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadMedia = async (file, type) => {
    if (!file) return;
    const toastId = toast.loading(`${type === "LOGO" ? "Logo" : "Kapak Görseli"} yükleniyor...`);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res = await fetch("/api/business/upload", { method: "POST", body: fd });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Yükleme başarısız");

      toast.success("Görsel güncellendi", { id: toastId });
      setData((prev) => ({
        ...prev,
        [type === "LOGO" ? "logoUrl" : "coverUrl"]: resData.url,
      }));
    } catch (err) {
      toast.error("Görsel yüklenemedi: " + err.message, { id: toastId });
    }
  };

  const toggleService = (id) => {
    setForm(prev => {
      const current = prev.services || [];
      return {
        ...prev,
        services: current.includes(id) ? current.filter(s => s !== id) : [...current, id]
      };
    });
  };

  const updateWorkingHour = (dayKey, field, value) => {
    setForm(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [dayKey]: {
          ...prev.workingHours[dayKey],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#004aad]" />
          <p className="text-slate-500 font-medium animate-pulse">Mağaza ayarları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-[0_24px_50px_rgba(15,23,42,0.22)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur">
                <Store className="h-4 w-4" />
                Pazaryeri Vitrini
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl mb-3">
                Gelişmiş Mağaza Kontrolü
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-300 font-medium">
                Sipariş alımı, çalışma saatleri, özel imkanlar ve marka detayları dahil olmak üzere vitrininizde görünen <strong>her detayı</strong> buradan yönetebilirsiniz.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-sm font-black text-slate-900 transition-all hover:bg-emerald-50 hover:text-emerald-700 shadow-xl disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Tümünü Kaydet
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">

          {/* Sol Kolon (Ayarlar) */}
          <div className="xl:col-span-8 flex flex-col gap-8">

            {/* 1. Genel Durum */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6 border-b border-slate-100 pb-5">
                <Power className="h-6 w-6 text-rose-500" /> Mağaza Genel Durumu
              </h2>
              <div className="flex flex-col gap-4">
                <Toggle
                  checked={form.isOpen}
                  onChange={(val) => setForm({ ...form, isOpen: val })}
                  label="Bugün İçin Şuan Açık Mi?"
                  description="Mağazanızı anlık olarak kapalı göstermek isterseniz (molalarda vb.) bunu kapatabilirsiniz."
                />
                <Toggle
                  checked={form.reservationEnabled}
                  onChange={(val) => setForm({ ...form, reservationEnabled: val })}
                  label="Sipariş / Rezervasyon Alımına Açık"
                  description="Mağazanız görünür kalır ancak dışarıdan geçici olarak sipariş veya randevu alımını kapatmanızı sağlar (Yoğunluk anlarında kullanışlıdır)."
                />
                <Toggle
                  checked={form.isActive}
                  onChange={(val) => setForm({ ...form, isActive: val })}
                  label="Profili Yayında Tut (Aktif)"
                  description="Bunu kapatırsanız, mağazanız pazar yerinde listelenmez ve tamamen gizlenir."
                />
              </div>
            </div>

            {/* 2. Çalışma Saatleri */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6 border-b border-slate-100 pb-5">
                <Clock className="h-6 w-6 text-amber-500" /> Standart Çalışma Saatleri
              </h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Pazar yerinde ve sipariş sisteminde gösterilecek temel açılış ve kapanış saatlerinizi belirleyin.</p>

              <div className="flex flex-col gap-3">
                {DAYS.map((day) => {
                  const currentInfo = form.workingHours?.[day.key] || { isOpen: true, open: "09:00", close: "18:00" };
                  return (
                    <div key={day.key} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all ${currentInfo.isOpen ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-slate-50/50 opacity-70'}`}>
                      <div className="flex items-center gap-4 mb-3 sm:mb-0 w-full sm:w-48">
                        <button
                          type="button"
                          onClick={() => updateWorkingHour(day.key, 'isOpen', !currentInfo.isOpen)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${currentInfo.isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${currentInfo.isOpen ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <span className={`font-bold text-sm ${currentInfo.isOpen ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{day.label}</span>
                      </div>

                      {currentInfo.isOpen ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={currentInfo.open || "09:00"}
                            onChange={(e) => updateWorkingHour(day.key, 'open', e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:border-[#004aad] outline-none"
                          />
                          <span className="text-slate-400 font-bold">-</span>
                          <input
                            type="time"
                            value={currentInfo.close || "18:00"}
                            onChange={(e) => updateWorkingHour(day.key, 'close', e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:border-[#004aad] outline-none"
                          />
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-slate-400 px-4">Kapalı</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Hizmetler & İmkanlar */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6 border-b border-slate-100 pb-5">
                <Sparkles className="h-6 w-6 text-purple-500" /> Mağaza İmkanları & Etiketler
              </h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Müşterilerin filtreleme yapabilmesi ve işletmenizin avantajlarını görebilmesi için mevcut imkanları işaretleyin.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES.map((amenity) => {
                  const isSelected = (form.services || []).includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleService(amenity.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-semibold text-sm text-left ${isSelected
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                    >
                      <div className={`shrink-0 ${isSelected ? 'text-purple-600' : 'text-slate-300'}`}>
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                      </div>
                      {amenity.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Görseller */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6 border-b border-slate-100 pb-5">
                <ImageIcon className="h-6 w-6 text-[#004aad]" /> Marka Görselleri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo */}
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-2 block">Kare Mağaza Logosu</p>
                  <label className="group relative flex h-40 w-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-[#004aad] hover:bg-blue-50/50">
                    {data?.logoUrl ? (
                      <img src={data.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <Store className="h-10 w-10 text-slate-400 group-hover:text-[#004aad]" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm">
                      <p className="text-sm font-bold text-white">Değiştir</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadMedia(e.target.files?.[0], "LOGO")} />
                  </label>
                </div>

                {/* Cover */}
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-2 block">Geniş Vitrin Kapağı</p>
                  <label className="group relative flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-[#004aad] hover:bg-blue-50/50">
                    {data?.coverUrl ? (
                      <img src={data.coverUrl} alt="Cover" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-slate-400 group-hover:text-[#004aad]" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm">
                      <p className="text-sm font-bold text-white">Değiştir</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => uploadMedia(e.target.files?.[0], "COVER")} />
                  </label>
                </div>
              </div>
            </div>

            {/* 5. Profil ve İletişim */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6 border-b border-slate-100 pb-5">
                <Building2 className="h-6 w-6 text-[#004aad]" /> Profil & İletişim Formu
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Hakkımızda & Açıklama</label>
                  <textarea
                    value={form.vision}
                    onChange={(e) => setForm({ ...form, vision: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none focus:border-[#004aad] focus:ring-4 focus:ring-[#004aad]/10 min-h-[150px] transition-all"
                    placeholder="Müşterilerinize kalitenizi, geçmişinizi ve işletmenizi anlatan çekici bir açıklama yazın..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none focus:border-[#004aad] transition-all font-bold" placeholder="05XX XXX XX XX" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">E-posta</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none focus:border-[#004aad] transition-all font-bold" />
                    </div>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">İl</label>
                      <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value, district: "" })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none focus:border-[#004aad] font-bold">
                        <option value="">Seçiniz</option>
                        {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">İlçe</label>
                      <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none focus:border-[#004aad] font-bold disabled:opacity-50" disabled={!form.city}>
                        <option value="">Seçiniz</option>
                        {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Açık Adres</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 text-sm text-slate-900 outline-none focus:border-[#004aad] min-h-[100px] font-bold" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Sosyal Medya */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6 border-b border-slate-100 pb-5">
                <Instagram className="h-6 w-6 text-[#004aad]" /> Sosyal Medya & Web
              </h2>

              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Gerçek Web Siteniz</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none focus:border-[#004aad] font-bold" placeholder="https://magazaniz.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Instagram</label>
                  <div className="relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-pink-500 transition-all">
                    <div className="pl-4 pr-3 py-4 border-r border-slate-200 text-slate-500 bg-white"><Instagram className="h-5 w-5 text-pink-600" /></div>
                    <input type="url" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-slate-400 font-bold" placeholder="Link..." />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Facebook</label>
                  <div className="relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-blue-500 transition-all">
                    <div className="pl-4 pr-3 py-4 border-r border-slate-200 text-slate-500 bg-white"><Facebook className="h-5 w-5 text-blue-600" /></div>
                    <input type="url" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-slate-400 font-bold" placeholder="Link..." />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Twitter / X</label>
                  <div className="relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-slate-900 transition-all">
                    <div className="pl-4 pr-3 py-4 border-r border-slate-200 text-slate-500 bg-white"><Twitter className="h-5 w-5 text-slate-900" /></div>
                    <input type="url" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-slate-400 font-bold" placeholder="Link..." />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">YouTube</label>
                  <div className="relative flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-red-500 transition-all">
                    <div className="pl-4 pr-3 py-4 border-r border-slate-200 text-slate-500 bg-white"><Youtube className="h-5 w-5 text-red-600" /></div>
                    <input type="url" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} className="w-full bg-transparent px-4 py-4 text-sm outline-none placeholder:text-slate-400 font-bold" placeholder="Link..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Bottom GIGA Buton */}
            <div className="pt-6 pb-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full sm:w-auto ml-auto px-12 py-5 rounded-full bg-slate-900 font-black text-white hover:bg-slate-800 shadow-2xl shadow-slate-900/30 transition-all disabled:opacity-70 text-lg"
              >
                {saving && <Loader2 className="h-6 w-6 animate-spin" />}
                Tüm Değişiklikleri Yayına Al
              </button>
            </div>

          </div>

          {/* Sağ Kolon (Telefon Önizleme E-Commerce Layout) */}
          <div className="xl:col-span-4 hidden xl:block">
            <div className="sticky top-24 rounded-[36px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 tracking-widest uppercase">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  Gerçek Zamanlı Önizleme
                </h2>
              </div>

              <div className="relative rounded-[28px] border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col group transition-all duration-500 pb-4">
                {/* Etiketler (Üst) */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {!form.isActive && (
                    <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">PASİF PROFİL</span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black shadow-md border ${form.isOpen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {form.isOpen ? 'ŞU AN AÇIK' : 'KAPALI'}
                  </span>
                </div>

                {/* Cover */}
                <div className="h-36 w-full bg-slate-800 relative overflow-hidden">
                  {data?.coverUrl ? (
                    <img src={data.coverUrl} className="w-full h-full object-cover transition-transform duration-700 opacity-90 group-hover:scale-105" alt="Kapak" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 border-b border-slate-100">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </div>

                <div className="relative px-5">
                  {/* Modern Overlap Logo */}
                  <div className="absolute -top-12 left-5 h-20 w-20 rounded-2xl border-[3px] border-white bg-white shadow-xl overflow-hidden z-10">
                    {data?.logoUrl ? (
                      <img src={data.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Store className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="pt-10">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight line-clamp-1 mb-1">
                      {data?.name || "Marka Adınız"}
                    </h3>
                    <p className="text-[10px] font-bold text-[#004aad] flex items-center gap-1.5 uppercase tracking-wide">
                      <MapPin className="h-3 w-3" /> {(form.city || form.district) ? `${form.city} ${form.district ? `/ ${form.district}` : ""}` : "Konum belirtilmedi"}
                    </p>

                    <p className="mt-3 text-xs text-slate-500 line-clamp-3 leading-relaxed font-semibold bg-slate-50 p-2 rounded-xl">
                      {form.vision || "İşletmenizi tanıtan detaylı ve profesyonel vizyon açıklamanız burada görünecektir."}
                    </p>

                    {/* Social & Contact Mini */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {form.phone && <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-600"><Phone className="h-3 w-3" /></span>}
                      {form.website && <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-[#004aad]"><Globe className="h-3 w-3" /></span>}
                      {form.instagram && <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 border border-pink-100 text-pink-600"><Instagram className="h-3 w-3" /></span>}
                    </div>

                    {/* Button Emulation */}
                    <div className="mt-5 w-full flex bg-[#004aad] text-white py-3 rounded-xl justify-center font-bold text-xs shadow-md opacity-90">
                      {form.reservationEnabled ? "Rezervasyon Yap" : "İşlem Kısıtlı"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center px-4">
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Müşteri Vitrin Görünümü (Demo)</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
