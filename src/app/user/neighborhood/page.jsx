"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Send,
  Sparkles,
  Zap,
  User,
  Megaphone,
  Search,
  ArrowRight,
  Archive,
  Car,
  Home,
  Briefcase,
  Tag,
  Filter,
  Camera,
  X,
  Phone,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  HandHeart,
  CalendarDays,
  Loader2,
  Plus,
  Navigation,
  Upload,
  Trash2,
  LayoutGrid,
  Clock3,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import {
  getNeighborhoodPosts,
  getNeighborhoodPostById,
  toggleNeighborhoodPostLike,
} from "@/lib/api/neighborhood";

const tabs = [
  { id: "AGENDA", label: "Gündem", icon: Megaphone },
  { id: "MARKETPLACE", label: "İlanlar", icon: Tag },
  { id: "EVENTS", label: "Etkinlikler", icon: CalendarDays },
  { id: "HELP", label: "Yardımlaşma", icon: HandHeart },
];

const categories = [
  { id: "ALL", label: "Tümü", icon: LayoutGrid },
  { id: "SECONDHAND", label: "İkinci El", icon: Archive },
  { id: "VEHICLE", label: "Vasıta", icon: Car },
  { id: "REALESTATE", label: "Emlak", icon: Home },
  { id: "JOBS", label: "İş İlanları", icon: Briefcase },
];

const DEFAULT_FORM = {
  title: "",
  content: "",
  description: "",
  price: "",
  currency: "TL",
  location: "",
  city: "",
  district: "",
  cityId: "",
  districtId: "",
  eventStartAt: "",
  eventEndAt: "",
  eventLocation: "",
  contactPhone: "",
  contactWhatsapp: "",
  images: [],
  attributes: [{ label: "", value: "" }],
};

function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      {(title || subtitle || right) && (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            {title ? <h3 className="text-base font-bold text-slate-900">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-500 to-orange-600 text-white",
    rose: "from-rose-500 to-pink-700 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function normalizeText(text) {
  return String(text || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .trim();
}

function formatRelativeDate(dateString) {
  if (!dateString) return "Şimdi";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Şimdi";

  const now = new Date();
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(value, currency = "TL") {
  if (value === null || value === undefined || value === "") return null;
  return `${Number(value).toLocaleString("tr-TR")} ${currency}`;
}

function getMarketplaceLabel(category) {
  if (category === "VEHICLE") return "Vasıta";
  if (category === "REALESTATE") return "Emlak";
  if (category === "SECONDHAND") return "İkinci El";
  if (category === "JOBS") return "İş İlanı";
  return "İlan";
}

function getTabPlaceholder(activeTab) {
  if (activeTab === "MARKETPLACE") return "İlanlarda ara...";
  if (activeTab === "EVENTS") return "Etkinliklerde ara...";
  if (activeTab === "HELP") return "Yardımlaşma panosunda ara...";
  return "Panoda ara...";
}

function getCreateBarText(activeTab) {
  if (activeTab === "MARKETPLACE") {
    return {
      title: "İlan yayınla",
      subtitle: "Mahalle sakinlerine ürün veya hizmetini duyur",
      icon: Tag,
    };
  }
  if (activeTab === "EVENTS") {
    return {
      title: "Etkinlik duyur",
      subtitle: "Mahallende olacak etkinliği paylaş",
      icon: CalendarDays,
    };
  }
  if (activeTab === "HELP") {
    return {
      title: "Yardım talebi oluştur",
      subtitle: "Komşularından destek iste veya destek ver",
      icon: HandHeart,
    };
  }
  return {
    title: "Paylaşım yap",
    subtitle: "Mahalle sakinlerine ulaş",
    icon: Megaphone,
  };
}

function getAvatarText(post) {
  if (post?.avatar) return post.avatar;
  if (post?.author) return post.author.slice(0, 2).toUpperCase();
  return "NA";
}

function getPostContent(post) {
  return post?.content || post?.description || "";
}

function getPostLocation(post) {
  return post?.eventLocation || post?.location || post?.district || post?.city || "";
}

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default function NeighborhoodBoardPage() {
  const [activeTab, setActiveTab] = useState("AGENDA");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState(null);
  const [postDetailLoading, setPostDetailLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [page, setPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formDistricts, setFormDistricts] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [activeLocationText, setActiveLocationText] = useState("Konum belirleniyor...");
  const [locationSource, setLocationSource] = useState("AUTO");
  const [locationStatus, setLocationStatus] = useState("idle");
  const [preferredDistrictName, setPreferredDistrictName] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const createBar = useMemo(() => getCreateBarText(activeTab), [activeTab]);
  const selectedCity = useMemo(
    () => cities.find((item) => String(item.sehir_id) === String(selectedCityId)),
    [cities, selectedCityId]
  );
  const selectedDistrict = useMemo(
    () => districts.find((item) => String(item.ilce_id) === String(selectedDistrictId)),
    [districts, selectedDistrictId]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [selectedCityId, selectedDistrictId]);

  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/locations/cities", { cache: "no-store" });
        const data = await res.json().catch(() => []);
        setCities(Array.isArray(data) ? data : []);
      } catch {
        setCities([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCityId) {
      setDistricts([]);
      setSelectedDistrictId("");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/locations/districts?sehir_id=${encodeURIComponent(selectedCityId)}`,
          { cache: "no-store" }
        );
        const data = await res.json().catch(() => []);
        const list = Array.isArray(data) ? data : [];
        setDistricts(list);

        setSelectedDistrictId((prev) => {
          if (list.some((item) => String(item.ilce_id) === String(prev))) return prev;
          if (preferredDistrictName) {
            const matched = list.find(
              (item) => normalizeText(item.ilce_adi) === normalizeText(preferredDistrictName)
            );
            if (matched) return String(matched.ilce_id);
          }
          return "";
        });
      } catch {
        setDistricts([]);
        setSelectedDistrictId("");
      }
    })();
  }, [selectedCityId, preferredDistrictName]);

  useEffect(() => {
    if (!formData.cityId) {
      setFormDistricts([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/locations/districts?sehir_id=${encodeURIComponent(formData.cityId)}`,
          { cache: "no-store" }
        );
        const data = await res.json().catch(() => []);
        const list = Array.isArray(data) ? data : [];
        setFormDistricts(list);

        setFormData((prev) => {
          const exists = list.some((item) => String(item.ilce_id) === String(prev.districtId));
          if (exists) return prev;
          return { ...prev, districtId: "", district: "" };
        });
      } catch {
        setFormDistricts([]);
      }
    })();
  }, [formData.cityId]);

  useEffect(() => {
    if (!cities.length) return;

    (async () => {
      try {
        const res = await fetch("/api/user/addresses", { cache: "no-store" });
        if (!res.ok) return;
        const list = await res.json().catch(() => []);
        const addresses = Array.isArray(list) ? list : [];
        const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
        if (!defaultAddress?.city) return;

        const cityMatch = cities.find(
          (item) => normalizeText(item.sehir_adi) === normalizeText(defaultAddress.city)
        );
        if (!cityMatch) return;

        setSelectedCityId(String(cityMatch.sehir_id));
        setPreferredDistrictName(defaultAddress.district || "");
        setActiveLocationText(
          `${cityMatch.sehir_adi}${defaultAddress.district ? ` / ${defaultAddress.district}` : ""}`
        );
        setLocationSource("ADDRESS");
        setLocationStatus("ok");
      } catch {}
    })();
  }, [cities]);

  useEffect(() => {
    if (!selectedCityId && !selectedDistrictId) {
      setActiveLocationText("Konum seçilmedi");
      return;
    }
    const cityLabel = selectedCity?.sehir_adi || "";
    const districtLabel = selectedDistrict?.ilce_adi || "";
    setActiveLocationText(
      `${cityLabel}${districtLabel ? ` / ${districtLabel}` : ""}` || "Konum seçilmedi"
    );
  }, [selectedCity, selectedDistrict, selectedCityId, selectedDistrictId]);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationSource("GPS");
        setLocationStatus("ok");
        setActiveLocationText(
          `Canlı konum: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        );
      },
      () => {
        setLocationStatus("fallback");
      },
      { timeout: 8000, maximumAge: 120000 }
    );
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getNeighborhoodPosts({
        tab: activeTab,
        category: activeTab === "MARKETPLACE" ? activeCategory : undefined,
        search: debouncedSearch,
        city: selectedCity?.sehir_adi || undefined,
        district: selectedDistrict?.ilce_adi || undefined,
        page,
        limit: 10,
      });

      setPosts(response?.items || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeCategory, debouncedSearch, page, selectedCity, selectedDistrict]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const nextImage = () => {
    if (selectedPost?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedPost.images.length);
    }
  };

  const prevImage = () => {
    if (selectedPost?.images?.length) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + selectedPost.images.length) % selectedPost.images.length
      );
    }
  };

  const openPostDetails = async (post) => {
    if (post.tab !== "MARKETPLACE") return;

    try {
      setPostDetailLoading(true);
      const response = await getNeighborhoodPostById(post.id);
      setSelectedPost(response?.item || null);
      setCurrentImageIndex(0);
    } catch {
      setSelectedPost(null);
    } finally {
      setPostDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedPost(null);
    setCurrentImageIndex(0);
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setImageFiles([]);
    setImagePreviewUrls([]);
    setUploadedImageUrls([]);
  };

  const openCreateModal = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      cityId: selectedCityId,
      districtId: selectedDistrictId,
      city: selectedCity?.sehir_adi || "",
      district: selectedDistrict?.ilce_adi || "",
    }));
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    setImageFiles(files);
  };

  const removeImageFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index, key, value) => {
    setFormData((prev) => {
      const updatedAttributes = [...prev.attributes];
      updatedAttributes[index] = {
        ...updatedAttributes[index],
        [key]: value,
      };

      return {
        ...prev,
        attributes: updatedAttributes,
      };
    });
  };

  const addAttributeField = () => {
    setFormData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { label: "", value: "" }],
    }));
  };

  const removeAttributeField = (index) => {
    setFormData((prev) => {
      const updatedAttributes = prev.attributes.filter((_, i) => i !== index);
      return {
        ...prev,
        attributes: updatedAttributes.length ? updatedAttributes : [{ label: "", value: "" }],
      };
    });
  };

  const getCreatePayload = () => {
    const cityName =
      cities.find((item) => String(item.sehir_id) === String(formData.cityId))?.sehir_adi ||
      formData.city.trim() ||
      null;

    const districtName =
      formDistricts.find((item) => String(item.ilce_id) === String(formData.districtId))?.ilce_adi ||
      formData.district.trim() ||
      null;

    const basePayload = {
      title: formData.title.trim(),
      content: formData.content.trim() || null,
      description: formData.description.trim() || null,
      location: formData.location.trim() || null,
      city: cityName,
      district: districtName,
      contactPhone: formData.contactPhone.trim() || null,
      contactWhatsapp: formData.contactWhatsapp.trim() || null,
      images: uploadedImageUrls,
      attributes: formData.attributes.filter(
        (attr) => attr.label.trim() !== "" && attr.value.trim() !== ""
      ),
    };

    if (activeTab === "AGENDA") {
      return { ...basePayload, tab: "AGENDA", type: "SOCIAL" };
    }

    if (activeTab === "MARKETPLACE") {
      return {
        ...basePayload,
        tab: "MARKETPLACE",
        type: "LISTING",
        marketplaceCategory: activeCategory || "ALL",
        price: formData.price ? Number(formData.price) : null,
        currency: formData.currency.trim() || "TL",
        description: formData.description.trim() || formData.content.trim() || null,
      };
    }

    if (activeTab === "EVENTS") {
      return {
        ...basePayload,
        tab: "EVENTS",
        type: "EVENT",
        eventStartAt: formData.eventStartAt || null,
        eventEndAt: formData.eventEndAt || null,
        eventLocation: formData.eventLocation.trim() || formData.location.trim() || null,
      };
    }

    return {
      ...basePayload,
      tab: "HELP",
      type: "HELP_REQUEST",
    };
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Başlık zorunlu.");
      return;
    }

    try {
      setCreateLoading(true);
      let imageUrls = [];

      if (imageFiles.length > 0) {
        const uploadFormData = new FormData();
        imageFiles.forEach((file) => uploadFormData.append("files", file));

        const uploadRes = await fetch("/api/neighborhood/uploads", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json().catch(() => ({}));

        if (!uploadRes.ok || !uploadData?.success) {
          throw new Error(uploadData?.error || "Görsel yüklenemedi.");
        }

        imageUrls = Array.isArray(uploadData.urls) ? uploadData.urls : [];
        setUploadedImageUrls(imageUrls);
      }

      const payload = {
        ...getCreatePayload(),
        images: imageUrls,
      };

      const res = await fetch("/api/neighborhood/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Paylaşım oluşturulamadı.");
      }

      closeCreateModal();
      await fetchPosts();
    } catch (error) {
      alert(error.message || "Paylaşım oluşturulamadı.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLike = async (e, postId) => {
    e.stopPropagation();
    const previousPosts = [...posts];

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              stats: {
                ...post.stats,
                likes: (post.stats?.likes || 0) + 1,
              },
            }
          : post
      )
    );

    try {
      const result = await toggleNeighborhoodPostLike(postId);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                stats: {
                  ...post.stats,
                  likes: result?.likeCount || 0,
                },
              }
            : post
        )
      );

      if (selectedPost?.id === postId) {
        setSelectedPost((prev) =>
          prev
            ? {
                ...prev,
                likeCount: result?.likeCount || 0,
              }
            : prev
        );
      }
    } catch {
      setPosts(previousPosts);
    }
  };

  const totalCount = posts.length;
  const listingCount = posts.filter((p) => p.tab === "MARKETPLACE").length;
  const eventCount = posts.filter((p) => p.tab === "EVENTS").length;
  const helpCount = posts.filter((p) => p.tab === "HELP").length;

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <Megaphone className="h-4 w-4" />
                  Mahalle İletişim Ağı
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Mahalle Panosu
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Mahalle paylaşımlarını, ilanları, etkinlikleri ve yardımlaşma
                  kayıtlarını tek panelde görüntüleyin.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-1">
                <MiniInfo label="Aktif Konum" value={activeLocationText} />
                <MiniInfo
                  label="Konum Kaynağı"
                  value={
                    locationSource === "GPS"
                      ? "GPS"
                      : locationSource === "ADDRESS"
                      ? "Kayıtlı Adres"
                      : locationSource === "MANUAL"
                      ? "Manuel Seçim"
                      : locationStatus === "fallback"
                      ? "İzin Yok"
                      : "Otomatik"
                  }
                />
                <MiniInfo label="Aktif Sekme" value={tabs.find((t) => t.id === activeTab)?.label || "-"} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Kayıt"
              value={totalCount}
              sub="Listelenen içerik sayısı"
              icon={LayoutGrid}
              tone="blue"
            />
            <StatCard
              title="İlanlar"
              value={listingCount}
              sub="Marketplace kayıtları"
              icon={Tag}
              tone="emerald"
            />
            <StatCard
              title="Etkinlikler"
              value={eventCount}
              sub="Aktif etkinlik duyuruları"
              icon={CalendarDays}
              tone="amber"
            />
            <StatCard
              title="Yardımlaşma"
              value={helpCount}
              sub="Destek ve yardım kayıtları"
              icon={HandHeart}
              tone="rose"
            />
          </div>
        </section>

        <SectionCard
          title="Filtreler"
          subtitle="Sekme, arama ve konuma göre panoyu daraltın"
        >
          <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={getTabPlaceholder(activeTab)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-[56px] items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <createBar.icon className="h-4 w-4" />
                {createBar.title}
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <Navigation className="h-4 w-4 text-blue-600" />
                {activeLocationText}
              </div>

              <select
                value={selectedCityId}
                onChange={(e) => {
                  setSelectedCityId(e.target.value);
                  setSelectedDistrictId("");
                  setPreferredDistrictName("");
                  setLocationSource("MANUAL");
                }}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60"
              >
                <option value="">İl seçin</option>
                {cities.map((city) => (
                  <option key={city.sehir_id} value={city.sehir_id}>
                    {city.sehir_adi}
                  </option>
                ))}
              </select>

              <select
                value={selectedDistrictId}
                onChange={(e) => {
                  setSelectedDistrictId(e.target.value);
                  setPreferredDistrictName("");
                  setLocationSource("MANUAL");
                }}
                disabled={!selectedCityId}
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">İlçe seçin</option>
                {districts.map((district) => (
                  <option key={district.ilce_id} value={district.ilce_id}>
                    {district.ilce_adi}
                  </option>
                ))}
              </select>
            </div>

            <AnimatePresence>
              {activeTab === "MARKETPLACE" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    <Filter className="h-4 w-4" />
                    Kategori
                  </div>

                  {categories.map((cat) => {
                    const active = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setPage(1);
                        }}
                        className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition ${
                          active
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {loading ? (
              <div className="rounded-[28px] border border-slate-200 bg-white p-12 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm font-semibold text-slate-500">Yükleniyor...</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <SectionCard title="Kayıt bulunamadı">
                <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                  <Megaphone className="mb-4 h-14 w-14 text-slate-300" />
                  <p className="text-lg font-semibold text-slate-700">
                    {selectedCity?.sehir_adi
                      ? `${selectedCity.sehir_adi}${selectedDistrict?.ilce_adi ? ` / ${selectedDistrict.ilce_adi}` : ""} için kayıt bulunamadı`
                      : "Kayıt bulunamadı"}
                  </p>
                </div>
              </SectionCard>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {posts.map((post) => {
                    const content = getPostContent(post);
                    const postLocation = getPostLocation(post);

                    return (
                      <motion.article
                        key={post.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onClick={() => openPostDetails(post)}
                        className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${
                          post.tab === "MARKETPLACE" ? "cursor-pointer" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-5 p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-4">
                              <div
                                className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-bold text-white ${
                                  post.role === "business" ? "bg-blue-600" : "bg-slate-800"
                                }`}
                              >
                                {getAvatarText(post)}
                                {post.role === "business" && (
                                  <div className="absolute -bottom-1 -right-1 rounded-full border border-white bg-white p-1 text-blue-600">
                                    <Sparkles className="h-3 w-3" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                  {post.author || "Bilinmiyor"}
                                </h3>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                  {post.badge || "Mahalleli"} · {formatRelativeDate(post.time)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {post.price !== null && post.price !== undefined && (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                  {formatPrice(post.price, post.currency)}
                                </span>
                              )}
                              {post.tab === "MARKETPLACE" && (
                                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                  {getMarketplaceLabel(post.marketplaceCategory)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                              {post.title}
                            </h2>

                            {post.attributes?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {post.attributes.map((attr, i) => (
                                  <span
                                    key={attr.id || i}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600"
                                  >
                                    {attr.value}
                                  </span>
                                ))}
                              </div>
                            )}

                            {content ? (
                              <p className="text-sm leading-7 text-slate-600 line-clamp-3">
                                {content}
                              </p>
                            ) : null}

                            {(postLocation || post.eventStartAt) && (
                              <div className="flex flex-wrap gap-2">
                                {post.eventStartAt && (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(post.eventStartAt).toLocaleDateString("tr-TR", {
                                      day: "2-digit",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                                {postLocation && (
                                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                                    <MapPin className="h-4 w-4" />
                                    {postLocation}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {post.images?.length > 0 && (
                            <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                              <Image
                                src={post.images[0]}
                                alt={post.title || "Post görseli"}
                                fill
                                className="object-cover transition duration-700 hover:scale-[1.03]"
                              />
                              {post.tab === "MARKETPLACE" && (
                                <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                                  {post.images.length} foto
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => handleLike(e, post.id)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Heart className="h-4 w-4" />
                                {post.stats?.likes || 0}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <MessageCircle className="h-4 w-4" />
                                {post.stats?.comments || 0}
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <SectionCard title="Mahalle görünümü" subtitle="Kısa özet">
              <div className="space-y-4">
                <div className="rounded-[24px] bg-gradient-to-br from-blue-700 to-slate-900 p-5 text-white">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold">Mahalle sakinleri</h4>
                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    Aktif konum: {activeLocationText}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    Kayıt Türü
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {tabs.find((t) => t.id === activeTab)?.label || "-"}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Gündemdekiler">
              <div className="space-y-3">
                {[
                  { title: "#MahallePanosu", count: `${posts.length} gönderi` },
                  { title: "#Komşuluk", count: "Canlı akış" },
                  {
                    title: "#İlanlar",
                    count: activeTab === "MARKETPLACE" ? "Aktif sekme" : "Keşfet",
                  },
                ].map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{topic.title}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{topic.count}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        <AnimatePresence>
          {(selectedPost || postDetailLoading) && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDetailModal}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 24 }}
                className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl lg:flex-row"
              >
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="absolute right-5 top-5 z-[160] rounded-2xl border border-white/20 bg-black/50 p-3 text-white backdrop-blur hover:bg-black/60"
                >
                  <X className="h-5 w-5" />
                </button>

                {postDetailLoading ? (
                  <div className="flex h-[70vh] w-full items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                      <p className="text-sm font-semibold text-slate-500">
                        İlan detayı yükleniyor...
                      </p>
                    </div>
                  </div>
                ) : selectedPost ? (
                  <>
                    <div className="relative min-h-[360px] bg-slate-950 lg:w-[58%]">
                      {selectedPost.images?.length > 0 ? (
                        <>
                          <Image
                            src={selectedPost.images[currentImageIndex]?.url || selectedPost.images[currentImageIndex]}
                            alt={selectedPost.title || "Detail"}
                            fill
                            className="object-cover"
                            priority
                          />

                          {selectedPost.images.length > 1 && (
                            <>
                              <div className="absolute inset-y-0 left-0 flex items-center p-4">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage();
                                  }}
                                  className="rounded-2xl bg-black/40 p-3 text-white backdrop-blur hover:bg-black/60"
                                >
                                  <ChevronLeft className="h-6 w-6" />
                                </button>
                              </div>

                              <div className="absolute inset-y-0 right-0 flex items-center p-4">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage();
                                  }}
                                  className="rounded-2xl bg-black/40 p-3 text-white backdrop-blur hover:bg-black/60"
                                >
                                  <ChevronRight className="h-6 w-6" />
                                </button>
                              </div>

                              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 overflow-x-auto px-6">
                                {selectedPost.images.map((img, idx) => {
                                  const imageUrl = img?.url || img;
                                  return (
                                    <button
                                      type="button"
                                      key={img?.id || idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                      }}
                                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 ${
                                        currentImageIndex === idx
                                          ? "border-white"
                                          : "border-white/30 opacity-70"
                                      }`}
                                    >
                                      <Image src={imageUrl} alt={`Thumb ${idx + 1}`} fill className="object-cover" />
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="flex h-full min-h-[360px] items-center justify-center text-slate-400">
                          <div className="text-center">
                            <Camera className="mx-auto h-20 w-20 opacity-30" />
                            <p className="mt-4 text-sm font-semibold">Görsel yok</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex h-full flex-col overflow-y-auto lg:w-[42%]">
                      <div className="flex-1 space-y-8 p-8">
                        <div className="space-y-3 border-b border-slate-100 pb-6">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                              {getMarketplaceLabel(selectedPost.marketplaceCategory)}
                            </span>
                            {selectedPost.location && (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                                {selectedPost.location}
                              </span>
                            )}
                          </div>

                          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            {selectedPost.title}
                          </h2>

                          {selectedPost.price !== null && selectedPost.price !== undefined && (
                            <p className="text-3xl font-bold text-blue-700">
                              {Number(selectedPost.price).toLocaleString("tr-TR")}{" "}
                              <span className="text-lg">{selectedPost.currency || "TL"}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl font-bold text-white ${
                              selectedPost.authorBusiness ? "bg-blue-600" : "bg-slate-800"
                            }`}
                          >
                            {(selectedPost.authorBusiness?.name || selectedPost.authorUser?.name || "NA")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">
                              {selectedPost.authorBusiness?.name ||
                                selectedPost.authorUser?.name ||
                                "Bilinmiyor"}
                            </p>
                            <p className="mt-1 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                              <BadgeCheck className="h-4 w-4 text-amber-500" />
                              {selectedPost.authorBusiness?.isVerified
                                ? "Doğrulanmış satıcı"
                                : "Satıcı profili"}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </button>
                        </div>

                        {selectedPost.attributes?.length > 0 && (
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {selectedPost.attributes.map((attr, i) => (
                              <div
                                key={attr.id || i}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                              >
                                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                  {attr.label}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {attr.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-3">
                          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">
                            Açıklama
                          </h3>
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm leading-7 text-slate-600">
                              {selectedPost.description || selectedPost.content || "Açıklama bulunmuyor."}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                          <div>
                            <h4 className="text-sm font-bold text-amber-700">Güvenlik uyarısı</h4>
                            <p className="mt-1 text-xs leading-6 text-amber-700/80">
                              Dolandırıcılık mağduru olmamak için ürünü görmeden kapora göndermeyin.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-6">
                        <button
                          type="button"
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800"
                        >
                          <Phone className="h-4 w-4" />
                          Ara
                        </button>

                        <button
                          type="button"
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                          <Send className="h-4 w-4" />
                          Mesaj At
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreateModalOpen && (
            <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeCreateModal}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              />

              <motion.div
                initial={{ scale: 0.97, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: 24 }}
                className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-slate-200 bg-white shadow-2xl"
              >
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="absolute right-5 top-5 rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>

                <form onSubmit={handleCreateSubmit} className="space-y-8 p-8 md:p-10">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
                      Yeni Kayıt
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      {activeTab === "MARKETPLACE"
                        ? "İlan oluştur"
                        : activeTab === "EVENTS"
                        ? "Etkinlik oluştur"
                        : activeTab === "HELP"
                        ? "Yardım talebi oluştur"
                        : "Paylaşım oluştur"}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Başlık
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleFormChange("title", e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                        placeholder="Başlık girin"
                      />
                    </div>

                    {(activeTab === "AGENDA" || activeTab === "HELP") && (
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-800">
                          İçerik
                        </label>
                        <textarea
                          rows={5}
                          value={formData.content}
                          onChange={(e) => handleFormChange("content", e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                          placeholder="Detaylı açıklama yazın"
                        />
                      </div>
                    )}

                    {activeTab === "MARKETPLACE" && (
                      <>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Açıklama
                          </label>
                          <textarea
                            rows={5}
                            value={formData.description}
                            onChange={(e) => handleFormChange("description", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                            placeholder="İlan açıklaması"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Fiyat
                          </label>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleFormChange("price", e.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                            placeholder="Örn: 25000"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Para Birimi
                          </label>
                          <input
                            type="text"
                            value={formData.currency}
                            onChange={(e) => handleFormChange("currency", e.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                            placeholder="TL"
                          />
                        </div>
                      </>
                    )}

                    {activeTab === "EVENTS" && (
                      <>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Açıklama
                          </label>
                          <textarea
                            rows={5}
                            value={formData.content}
                            onChange={(e) => handleFormChange("content", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                            placeholder="Etkinlik açıklaması"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Başlangıç Tarihi
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.eventStartAt}
                            onChange={(e) => handleFormChange("eventStartAt", e.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Bitiş Tarihi
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.eventEndAt}
                            onChange={(e) => handleFormChange("eventEndAt", e.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-slate-800">
                            Etkinlik Konumu
                          </label>
                          <input
                            type="text"
                            value={formData.eventLocation}
                            onChange={(e) => handleFormChange("eventLocation", e.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                            placeholder="Örn: Cumhuriyet İlkokulu Bahçesi"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Konum
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleFormChange("location", e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                        placeholder="Örn: Yeşilköy Mah."
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Şehir
                      </label>
                      <select
                        value={formData.cityId}
                        onChange={(e) => {
                          const cityId = e.target.value;
                          const cityObj = cities.find((item) => String(item.sehir_id) === String(cityId));
                          setFormData((prev) => ({
                            ...prev,
                            cityId,
                            city: cityObj?.sehir_adi || "",
                            districtId: "",
                            district: "",
                          }));
                        }}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                      >
                        <option value="">Şehir seçin</option>
                        {cities.map((city) => (
                          <option key={city.sehir_id} value={city.sehir_id}>
                            {city.sehir_adi}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        İlçe
                      </label>
                      <select
                        value={formData.districtId}
                        onChange={(e) => {
                          const districtId = e.target.value;
                          const districtObj = formDistricts.find(
                            (item) => String(item.ilce_id) === String(districtId)
                          );
                          setFormData((prev) => ({
                            ...prev,
                            districtId,
                            district: districtObj?.ilce_adi || "",
                          }));
                        }}
                        disabled={!formData.cityId}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">İlçe seçin</option>
                        {formDistricts.map((district) => (
                          <option key={district.ilce_id} value={district.ilce_id}>
                            {district.ilce_adi}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        Telefon
                      </label>
                      <input
                        type="text"
                        value={formData.contactPhone}
                        onChange={(e) => handleFormChange("contactPhone", e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                        placeholder="05xx xxx xx xx"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-800">
                        WhatsApp
                      </label>
                      <input
                        type="text"
                        value={formData.contactWhatsapp}
                        onChange={(e) => handleFormChange("contactWhatsapp", e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                        placeholder="05xx xxx xx xx"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">
                      Görseller
                    </h3>

                    <label
                      htmlFor="neighborhood-image-upload"
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {imageFiles.length ? `${imageFiles.length} dosya seçildi` : "Görsel seçin"}
                          </p>
                          <p className="text-xs text-slate-500">
                            JPG, PNG veya WEBP
                          </p>
                        </div>
                      </div>
                      <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                        Dosya Seç
                      </span>
                    </label>

                    <input
                      id="neighborhood-image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageFilesChange}
                      className="hidden"
                    />

                    {imageFiles.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {imageFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                          >
                            <div className="relative aspect-square bg-slate-100">
                              <img
                                src={imagePreviewUrls[index]}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImageFile(index)}
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white transition hover:bg-rose-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="px-3 py-2">
                              <p className="truncate text-xs font-medium text-slate-600">{file.name}</p>
                              <p className="text-[11px] font-semibold text-slate-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Henüz görsel seçilmedi.</p>
                    )}
                  </div>

                  {activeTab === "MARKETPLACE" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-900">
                          Özellikler
                        </h3>
                        <button
                          type="button"
                          onClick={addAttributeField}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                          Özellik Ekle
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formData.attributes.map((attr, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]"
                          >
                            <input
                              type="text"
                              value={attr.label}
                              onChange={(e) => handleAttributeChange(index, "label", e.target.value)}
                              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                              placeholder="Örn: Marka"
                            />
                            <input
                              type="text"
                              value={attr.value}
                              onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                              placeholder="Örn: Honda"
                            />
                            {formData.attributes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeAttributeField(index)}
                                className="rounded-2xl bg-rose-50 px-4 text-rose-600"
                              >
                                <X className="mx-auto h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Vazgeç
                    </button>

                    <button
                      type="submit"
                      disabled={createLoading}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {createLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Kaydediliyor
                        </>
                      ) : (
                        <>
                          Paylaş
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}