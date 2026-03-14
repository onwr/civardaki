"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  MapPin,
  Heart,
  Mail,
  Phone,
  Camera,
  Plus,
  CreditCard,
  ShoppingBag,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Edit3,
  Lock,
  X,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80";

const EMPTY_ADDRESS_FORM = {
  title: "",
  city: "",
  district: "",
  mahalle: "",
  line1: "",
  line2: "",
  phone: "",
  isDefault: false,
};

const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const TABS = [
  { id: "info", label: "Profilim", icon: User },
  { id: "orders", label: "Siparislerim", icon: ShoppingBag },
  { id: "addresses", label: "Adreslerim", icon: MapPin },
  { id: "favorites", label: "Favoriler", icon: Heart },
];

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function normalizeText(value) {
  return String(value || "").trim().toLocaleLowerCase("tr-TR");
}

export default function ProfilePage() {
  const { status, update } = useSession();

  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState("");
  const [locationsLoading, setLocationsLoading] = useState({
    cities: false,
    districts: false,
    neighborhoods: false,
  });

  const fileInputRef = useRef(null);

  const firstName = useMemo(() => {
    const raw = profile?.user?.name || "Kullanici";
    return raw.split(" ").filter(Boolean)[0] || "Kullanici";
  }, [profile]);

  const lastName = useMemo(() => {
    const raw = profile?.user?.name || "Panel";
    const parts = raw.split(" ").filter(Boolean);
    return parts.slice(1).join(" ") || "Hesabi";
  }, [profile]);

  async function fetchAddresses() {
    const res = await fetch("/api/user/addresses", { cache: "no-store" });
    if (!res.ok) throw new Error("Adresler yuklenemedi.");
    const json = await res.json();
    setAddresses(Array.isArray(json) ? json : []);
  }

  async function fetchAll() {
    setLoading(true);
    try {
      const [profileRes, ordersRes, addressesRes, favoritesRes] =
        await Promise.all([
          fetch("/api/user/profile", { cache: "no-store" }),
          fetch("/api/user/orders", { cache: "no-store" }),
          fetch("/api/user/addresses", { cache: "no-store" }),
          fetch("/api/user/favorites", { cache: "no-store" }),
        ]);

      if (!profileRes.ok) throw new Error("Profil verisi yuklenemedi.");
      if (!ordersRes.ok) throw new Error("Siparisler yuklenemedi.");
      if (!addressesRes.ok) throw new Error("Adresler yuklenemedi.");
      if (!favoritesRes.ok) throw new Error("Favoriler yuklenemedi.");

      const [profileJson, ordersJson, addressesJson, favoritesJson] =
        await Promise.all([
          profileRes.json(),
          ordersRes.json(),
          addressesRes.json(),
          favoritesRes.json(),
        ]);

      setProfile(profileJson);
      setOrders(Array.isArray(ordersJson) ? ordersJson : []);
      setAddresses(Array.isArray(addressesJson) ? addressesJson : []);
      setFavorites(Array.isArray(favoritesJson) ? favoritesJson : []);
      setProfileForm({
        name: profileJson?.user?.name || "",
        phone: profileJson?.user?.phone || "",
      });
    } catch (err) {
      toast.error(err?.message || "Profil yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") fetchAll();
    if (status === "unauthenticated") setLoading(false);
  }, [status]);

  useEffect(() => {
    if (!isAddressModalOpen) return;
    setLocationsLoading((p) => ({ ...p, cities: true }));
    fetch("/api/locations/cities")
      .then((r) => r.json())
      .then((list) => setCities(Array.isArray(list) ? list : []))
      .catch(() => setCities([]))
      .finally(() => setLocationsLoading((p) => ({ ...p, cities: false })));
  }, [isAddressModalOpen]);

  useEffect(() => {
    if (!selectedCityId) {
      setDistricts([]);
      setSelectedDistrictId("");
      setSelectedNeighborhoodId("");
      return;
    }
    setLocationsLoading((p) => ({ ...p, districts: true }));
    fetch(`/api/locations/districts?sehir_id=${encodeURIComponent(selectedCityId)}`)
      .then((r) => r.json())
      .then((list) => setDistricts(Array.isArray(list) ? list : []))
      .catch(() => setDistricts([]))
      .finally(() => setLocationsLoading((p) => ({ ...p, districts: false })));
  }, [selectedCityId]);

  useEffect(() => {
    if (!selectedDistrictId) {
      setNeighborhoods([]);
      setSelectedNeighborhoodId("");
      return;
    }
    setLocationsLoading((p) => ({ ...p, neighborhoods: true }));
    fetch(
      `/api/locations/neighborhoods?ilce_id=${encodeURIComponent(selectedDistrictId)}`,
    )
      .then((r) => r.json())
      .then((list) => setNeighborhoods(Array.isArray(list) ? list : []))
      .catch(() => setNeighborhoods([]))
      .finally(() =>
        setLocationsLoading((p) => ({ ...p, neighborhoods: false })),
      );
  }, [selectedDistrictId]);

  useEffect(() => {
    if (!isAddressModalOpen || !editingAddressId || cities.length === 0) return;
    const city = cities.find(
      (c) => normalizeText(c?.sehir_adi) === normalizeText(addressForm.city),
    );
    if (city?.sehir_id && !selectedCityId) {
      setSelectedCityId(String(city.sehir_id));
    }
  }, [isAddressModalOpen, editingAddressId, cities, addressForm.city, selectedCityId]);

  useEffect(() => {
    if (!isAddressModalOpen || !editingAddressId || districts.length === 0) return;
    const district = districts.find(
      (d) => normalizeText(d?.ilce_adi) === normalizeText(addressForm.district),
    );
    if (district?.ilce_id && !selectedDistrictId) {
      setSelectedDistrictId(String(district.ilce_id));
    }
  }, [
    isAddressModalOpen,
    editingAddressId,
    districts,
    addressForm.district,
    selectedDistrictId,
  ]);

  useEffect(() => {
    if (
      !isAddressModalOpen ||
      !editingAddressId ||
      neighborhoods.length === 0 ||
      selectedNeighborhoodId
    ) {
      return;
    }
    const neighborhood = neighborhoods.find(
      (n) => normalizeText(n?.mahalle_adi) === normalizeText(addressForm.mahalle),
    );
    if (neighborhood?.mahalle_id) {
      setSelectedNeighborhoodId(String(neighborhood.mahalle_id));
    }
  }, [
    isAddressModalOpen,
    editingAddressId,
    neighborhoods,
    addressForm.mahalle,
    selectedNeighborhoodId,
  ]);

  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) return toast.error("Ad soyad zorunludur.");
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Profil guncellenemedi.");

      setProfile((prev) => ({ ...prev, user: data.user || prev?.user }));
      await update({
        name: data?.user?.name,
        image: data?.user?.image,
        phone: data?.user?.phone,
      });
      toast.success("Profil bilgileri guncellendi.");
    } catch (err) {
      toast.error(err?.message || "Profil guncellenemedi.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    try {
      const res = await fetch("/api/user/profile/image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Resim yuklenemedi.");

      setProfile((prev) => ({
        ...prev,
        user: { ...prev?.user, image: data.image },
      }));
      await update({ image: data.image, name: profile?.user?.name });
      toast.success("Profil resmi guncellendi.");
    } catch (err) {
      toast.error(err?.message || "Profil resmi yuklenemedi.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setSelectedCityId("");
    setSelectedDistrictId("");
    setSelectedNeighborhoodId("");
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      title: addr.title || "",
      city: addr.city || "",
      district: addr.district || "",
      mahalle: addr.mahalle || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      phone: addr.phone || "",
      isDefault: Boolean(addr.isDefault),
    });
    setSelectedCityId("");
    setSelectedDistrictId("");
    setSelectedNeighborhoodId("");
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressForm(EMPTY_ADDRESS_FORM);
    setSelectedCityId("");
    setSelectedDistrictId("");
    setSelectedNeighborhoodId("");
  };

  const handleSaveAddress = async () => {
    if (!addressForm.title.trim() || !addressForm.city.trim() || !addressForm.line1.trim()) {
      return toast.error("Adres basligi, il ve adres satiri zorunludur.");
    }

    setAddressSaving(true);
    try {
      const payload = {
        ...addressForm,
        title: addressForm.title.trim(),
        line1: addressForm.line1.trim(),
        line2: addressForm.line2.trim(),
        city: addressForm.city.trim(),
        district: addressForm.district.trim(),
        mahalle: addressForm.mahalle.trim(),
        phone: addressForm.phone.trim(),
      };

      const isEdit = Boolean(editingAddressId);
      const endpoint = isEdit
        ? `/api/user/addresses/${editingAddressId}`
        : "/api/user/addresses";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Adres kaydedilemedi.");

      await fetchAddresses();
      closeAddressModal();
      toast.success(isEdit ? "Adres guncellendi." : "Adres eklendi.");
    } catch (err) {
      toast.error(err?.message || "Adres kaydedilemedi.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Adres silinemedi.");
      await fetchAddresses();
      toast.success("Adres silindi.");
    } catch (err) {
      toast.error(err?.message || "Adres silinemedi.");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Varsayilan guncellenemedi.");
      setAddresses((prev) =>
        prev.map((addr) => ({ ...addr, isDefault: addr.id === data.id })),
      );
      toast.success("Varsayilan adres guncellendi.");
    } catch (err) {
      toast.error(err?.message || "Varsayilan guncellenemedi.");
    }
  };

  const handleRemoveFavorite = async (businessId) => {
    try {
      const res = await fetch("/api/user/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Favori kaldirilamadi.");
      setFavorites((prev) => prev.filter((f) => f.businessId !== businessId));
      toast.success("Favorilerden kaldirildi.");
    } catch (err) {
      toast.error(err?.message || "Favori kaldirilamadi.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      return toast.error("Tum sifre alanlarini doldurun.");
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Sifre guncellenemedi.");
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setIsSecurityModalOpen(false);
      toast.success("Sifre guncellendi.");
    } catch (err) {
      toast.error(err?.message || "Sifre guncellenemedi.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#004aad]/20 border-t-[#004aad] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
            Yukleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !profile?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-slate-500 font-semibold">Profil bilgisi bulunamadi.</p>
      </div>
    );
  }

  const stats = profile.stats || {};

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <section className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-slate-100 ring-4 ring-white shadow">
              <Image
                src={profile.user.image || DEFAULT_AVATAR}
                alt={profile.user.name || "Profil"}
                fill
                className={`object-cover ${isUploading ? "opacity-40" : "opacity-100"}`}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-lg bg-[#004aad] text-white flex items-center justify-center"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                {firstName} {lastName}
              </h1>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#004aad]" />
                  {profile.user.email}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#004aad]" />
                  {profile.user.phone || "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full lg:w-[320px]">
              {[
                { label: "Siparis", value: stats.totalOrders || 0 },
                { label: "Favori", value: stats.favoriteCount || 0 },
                { label: "Adres", value: stats.addressCount || 0 },
                { label: "Harcama", value: formatMoney(stats.totalSpent || 0) },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {item.label}
                  </p>
                  <p className="text-sm md:text-base font-black text-slate-900 mt-1">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <nav className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-6 min-h-[320px]">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "info" && (
                <InfoTab
                  profile={profile}
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  onSave={handleProfileSave}
                  onOpenSecurity={() => setIsSecurityModalOpen(true)}
                  saving={savingProfile}
                />
              )}
              {activeTab === "orders" && <OrdersTab orders={orders} />}
              {activeTab === "addresses" && (
                <AddressesTab
                  addresses={addresses}
                  onAdd={openAddAddressModal}
                  onEdit={openEditAddressModal}
                  onDelete={handleDeleteAddress}
                  onDefault={handleSetDefault}
                />
              )}
              {activeTab === "favorites" && (
                <FavoritesTab
                  favorites={favorites}
                  onRemove={handleRemoveFavorite}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddressModal}
              className="absolute inset-0 bg-slate-950/70"
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {editingAddressId ? "Adresi Duzenle" : "Yeni Adres Ekle"}
                </h2>
                <button
                  type="button"
                  onClick={closeAddressModal}
                  className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Adres basligi"
                  value={addressForm.title}
                  onChange={(e) =>
                    setAddressForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004aad]/20"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={selectedCityId}
                    onChange={(e) => {
                      const cityId = e.target.value;
                      setSelectedCityId(cityId);
                      setSelectedDistrictId("");
                      setSelectedNeighborhoodId("");
                      const cityObj = cities.find(
                        (c) => String(c.sehir_id) === String(cityId),
                      );
                      setAddressForm((p) => ({
                        ...p,
                        city: cityObj?.sehir_adi || "",
                        district: "",
                        mahalle: "",
                      }));
                    }}
                    className="h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004aad]/20"
                  >
                    <option value="">{locationsLoading.cities ? "Iller yukleniyor..." : "Il secin"}</option>
                    {cities.map((city) => (
                      <option key={city.sehir_id} value={city.sehir_id}>
                        {city.sehir_adi}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDistrictId}
                    onChange={(e) => {
                      const districtId = e.target.value;
                      setSelectedDistrictId(districtId);
                      setSelectedNeighborhoodId("");
                      const districtObj = districts.find(
                        (d) => String(d.ilce_id) === String(districtId),
                      );
                      setAddressForm((p) => ({
                        ...p,
                        district: districtObj?.ilce_adi || "",
                        mahalle: "",
                      }));
                    }}
                    disabled={!selectedCityId}
                    className="h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004aad]/20 disabled:opacity-60"
                  >
                    <option value="">{locationsLoading.districts ? "Ilceler yukleniyor..." : "Ilce secin"}</option>
                    {districts.map((district) => (
                      <option key={district.ilce_id} value={district.ilce_id}>
                        {district.ilce_adi}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedNeighborhoodId}
                    onChange={(e) => {
                      const neighborhoodId = e.target.value;
                      setSelectedNeighborhoodId(neighborhoodId);
                      const neighborhoodObj = neighborhoods.find(
                        (n) => String(n.mahalle_id) === String(neighborhoodId),
                      );
                      setAddressForm((p) => ({
                        ...p,
                        mahalle: neighborhoodObj?.mahalle_adi || "",
                      }));
                    }}
                    disabled={!selectedDistrictId}
                    className="h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004aad]/20 disabled:opacity-60"
                  >
                    <option value="">
                      {locationsLoading.neighborhoods
                        ? "Mahalleler yukleniyor..."
                        : "Mahalle secin"}
                    </option>
                    {neighborhoods.map((neighborhood) => (
                      <option
                        key={neighborhood.mahalle_id}
                        value={neighborhood.mahalle_id}
                      >
                        {neighborhood.mahalle_adi}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Adres satiri"
                  value={addressForm.line1}
                  onChange={(e) =>
                    setAddressForm((p) => ({ ...p, line1: e.target.value }))
                  }
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004aad]/20"
                />
                <input
                  type="text"
                  placeholder="Adres satiri 2 (opsiyonel)"
                  value={addressForm.line2}
                  onChange={(e) =>
                    setAddressForm((p) => ({ ...p, line2: e.target.value }))
                  }
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004aad]/20"
                />
                <input
                  type="text"
                  placeholder="Telefon (opsiyonel)"
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#004aad]/20"
                />

                <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm((p) => ({
                        ...p,
                        isDefault: e.target.checked,
                      }))
                    }
                  />
                  Varsayilan adres yap
                </label>

                <button
                  type="button"
                  disabled={addressSaving}
                  onClick={handleSaveAddress}
                  className="w-full h-12 rounded-xl bg-[#004aad] text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
                >
                  {addressSaving
                    ? "Kaydediliyor..."
                    : editingAddressId
                      ? "Adresi Guncelle"
                      : "Adresi Kaydet"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isSecurityModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSecurityModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-7 border border-slate-100"
            >
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#004aad]" />
                Sifre Guncelle
              </h3>
              <form onSubmit={handlePasswordUpdate} className="space-y-3">
                <input
                  type="password"
                  placeholder="Mevcut sifre"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  type="password"
                  placeholder="Yeni sifre"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  type="password"
                  placeholder="Yeni sifre tekrar"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200"
                />
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full h-12 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
                >
                  {savingPassword ? "Guncelleniyor..." : "Sifreyi Guncelle"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoTab({ profile, profileForm, setProfileForm, onSave, onOpenSecurity, saving }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <section className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-6">
          Bilgilerim
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              E-Posta
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {profile.user.email}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Kayit Tarihi
            </p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {formatDate(profile.user.createdAt)}
            </p>
          </div>
          <input
            className="h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold md:col-span-2"
            placeholder="Ad soyad"
            value={profileForm.name}
            onChange={(e) =>
              setProfileForm((p) => ({ ...p, name: e.target.value }))
            }
          />
          <input
            className="h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold md:col-span-2"
            placeholder="Telefon"
            value={profileForm.phone}
            onChange={(e) =>
              setProfileForm((p) => ({ ...p, phone: e.target.value }))
            }
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="h-11 px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : "Bilgileri Kaydet"}
          </button>
          <button
            onClick={onOpenSecurity}
            className="h-11 px-6 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Guvenlik
          </button>
        </div>
      </section>

      <aside className="lg:col-span-4 bg-gradient-to-br from-[#004aad] to-blue-600 rounded-3xl p-6 text-white">
        <h3 className="text-lg font-black tracking-tight mb-4">Hesap Avantajlari</h3>
        <div className="space-y-3">
          {[
            "Siparis gecmisi",
            "Hizli adres secimi",
            "Favori isletme listesi",
            "Guvenli hesap yonetimi",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-blue-200" />
              {item}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function OrdersTab({ orders }) {
  if (!orders.length) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 text-slate-500">
        Henuz siparisiniz bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((ord) => (
        <div
          key={ord.id}
          className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4"
        >
          <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-slate-100 shrink-0">
            <Image
              src={ord.businessLogo || DEFAULT_AVATAR}
              alt={ord.businessName || "Isletme"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {formatDate(ord.orderDate)}
            </p>
            <h4 className="text-base font-black text-slate-900 truncate">
              {ord.businessName || "Isletme"}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Siparis No: {ord.orderNumber || ord.id}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Toplam
            </p>
            <p className="text-lg font-black text-slate-900">
              {formatMoney(ord.total)}
            </p>
            <Link
              href={`/user/orders/${ord.id}`}
              className="inline-flex items-center gap-1 mt-2 text-[11px] font-black uppercase tracking-wider text-[#004aad]"
            >
              Detay
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function FavoritesTab({ favorites, onRemove }) {
  if (!favorites.length) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 text-slate-500">
        Favori isletme bulunmuyor.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {favorites.map((fav) => (
        <div key={fav.id} className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100 mb-3">
            <Image src={fav.image || DEFAULT_AVATAR} alt={fav.name} fill className="object-cover" />
          </div>
          <h3 className="text-sm font-black text-slate-900 truncate">{fav.name}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
            {fav.category || "Genel"}
          </p>
          <div className="flex gap-2 mt-4">
            <Link href={`/isletme/${fav.slug}`} className="flex-1 h-10 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center">
              Profili Ac
            </Link>
            <button onClick={() => onRemove(fav.businessId)} className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 hover:text-rose-500 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesTab({ addresses, onAdd, onEdit, onDelete, onDefault }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
          Adreslerim
        </h2>
        <button
          onClick={onAdd}
          className="h-10 px-4 bg-[#004aad] text-white rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ekle
        </button>
      </div>

      {!addresses.length ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 text-slate-500">
          Kayitli adres bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">{addr.title}</h3>
                  {addr.isDefault && (
                    <span className="inline-flex mt-2 px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                      Varsayilan
                    </span>
                  )}
                </div>
                <MapPin className="w-4 h-4 text-[#004aad]" />
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                {[addr.line1, addr.line2, addr.mahalle, addr.district, addr.city]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => onEdit(addr)}
                  className="h-9 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Duzenle
                </button>
                <button
                  onClick={() => onDelete(addr.id)}
                  className="h-9 rounded-lg bg-slate-100 text-slate-600 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Sil
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => onDefault(addr.id)}
                    className="col-span-2 h-9 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest"
                  >
                    Varsayilan Yap
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
