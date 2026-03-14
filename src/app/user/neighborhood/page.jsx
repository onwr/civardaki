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
} from "lucide-react";
import Image from "next/image";
import {
    getNeighborhoodPosts,
    getNeighborhoodPostById,
    toggleNeighborhoodPostLike,
} from "@/lib/api/neighborhood";

const tabs = [
    { id: "AGENDA", label: "GÜNDEM", icon: Megaphone },
    { id: "MARKETPLACE", label: "İLANLAR", icon: Tag },
    { id: "EVENTS", label: "ETKİNLİKLER", icon: CalendarDays },
    { id: "HELP", label: "YARDIMLAŞMA", icon: HandHeart },
];

const categories = [
    { id: "ALL", label: "TÜMÜ", icon: Zap },
    { id: "SECONDHAND", label: "İKİNCİ EL", icon: Archive },
    { id: "VEHICLE", label: "VASITA", icon: Car },
    { id: "REALESTATE", label: "EMLAK", icon: Home },
    { id: "JOBS", label: "İŞ İLANLARI", icon: Briefcase },
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

function normalizeText(text) {
    return String(text || "")
        .toLocaleLowerCase("tr-TR")
        .replace(/\s+/g, " ")
        .trim();
}

function formatRelativeDate(dateString) {
    if (!dateString) return "ŞİMDİ";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "ŞİMDİ";

    const now = new Date();
    const diffMs = now - date;

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "AZ ÖNCE";
    if (minutes < 60) return `${minutes} DK ÖNCE`;
    if (hours < 24) return `${hours} SAAT ÖNCE`;
    if (days === 1) return "DÜN";
    if (days < 7) return `${days} GÜN ÖNCE`;

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
    if (category === "VEHICLE") return "VASITA";
    if (category === "REALESTATE") return "EMLAK";
    if (category === "SECONDHAND") return "İKİNCİ EL";
    if (category === "JOBS") return "İŞ İLANI";
    return "İLAN";
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
            title: "İLAN YAYINLA",
            subtitle: "Mahalle sakinlerine ürün veya hizmetini duyur",
            icon: Tag,
        };
    }

    if (activeTab === "EVENTS") {
        return {
            title: "ETKİNLİK DUYUR",
            subtitle: "Mahallende olacak etkinliği paylaş",
            icon: CalendarDays,
        };
    }

    if (activeTab === "HELP") {
        return {
            title: "YARDIM TALEBİ OLUŞTUR",
            subtitle: "Komşularından destek iste veya destek ver",
            icon: HandHeart,
        };
    }

    return {
        title: "PAYLAŞIM YAP",
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
            } catch (error) {
                console.error("Cities fetch error:", error);
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
                const res = await fetch(`/api/locations/districts?sehir_id=${encodeURIComponent(selectedCityId)}`, {
                    cache: "no-store",
                });
                const data = await res.json().catch(() => []);
                const list = Array.isArray(data) ? data : [];
                setDistricts(list);
                setSelectedDistrictId((prev) => {
                    if (list.some((item) => String(item.ilce_id) === String(prev))) return prev;
                    if (preferredDistrictName) {
                        const matched = list.find(
                            (item) =>
                                normalizeText(item.ilce_adi) === normalizeText(preferredDistrictName)
                        );
                        if (matched) return String(matched.ilce_id);
                    }
                    return "";
                });
            } catch (error) {
                console.error("Districts fetch error:", error);
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
            } catch (error) {
                console.error("Form districts fetch error:", error);
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
            } catch (error) {
                console.error("Default address fetch error:", error);
            }
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
        } catch (error) {
            console.error("Posts fetch error:", error);
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
        } catch (error) {
            console.error("Post detail fetch error:", error);
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
            return {
                ...basePayload,
                tab: "AGENDA",
                type: "SOCIAL",
            };
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Paylaşım oluşturulamadı.");
            }

            closeCreateModal();
            await fetchPosts();
        } catch (error) {
            console.error("Create post error:", error);
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
        } catch (error) {
            console.error("Like error:", error);
            setPosts(previousPosts);
        }
    };

    return (
        <div className="space-y-12 pb-20 font-inter antialiased text-left">
            <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#004aad]">
                            Sosyal Ağ
                        </span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black text-slate-950 tracking-tighter leading-none italic uppercase">
                        MAHALLE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aad] to-blue-500">
                            PANOSU
                        </span>
                    </h1>

                    <p className="text-slate-400 font-bold text-lg lg:text-xl italic opacity-80 max-w-2xl">
                        Komşularınla iletişimde kal, etkinlikleri takip et veya ihtiyacın olanı bul. Hepsi tek
                        bir yerde.
                    </p>
                </div>

                <div className="w-full xl:w-auto xl:min-w-[400px]">
                    <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center">
                        <div className="w-14 h-14 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 shrink-0">
                            <Search className="w-6 h-6" />
                        </div>

                        <input
                            type="text"
                            placeholder={getTabPlaceholder(activeTab)}
                            className="flex-1 h-full bg-transparent border-none outline-none px-4 font-bold italic text-slate-700 placeholder:text-slate-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setPage(1);
                        }}
                        className={`px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab.id
                                ? "bg-slate-950 text-white shadow-xl scale-105"
                                : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-blue-400" : ""}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-wider">
                    <Navigation className="w-4 h-4 text-[#004aad]" />
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
                    className="h-12 px-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:border-blue-500"
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
                    className="h-12 px-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
                >
                    <option value="">İlçe seçin</option>
                    {districts.map((district) => (
                        <option key={district.ilce_id} value={district.ilce_id}>
                            {district.ilce_adi}
                        </option>
                    ))}
                </select>
                <div className="px-3 py-2 rounded-lg bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {locationSource === "GPS"
                        ? "Aktif Konum: GPS"
                        : locationSource === "ADDRESS"
                            ? "Aktif Konum: Kayıtlı Adres"
                            : locationSource === "MANUAL"
                                ? "Aktif Konum: Manuel Seçim"
                                : locationStatus === "fallback"
                                    ? "Konum izni yok"
                                    : "Konum otomatik"}
                </div>
            </div>

            <AnimatePresence>
                {activeTab === "MARKETPLACE" && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-wrap items-center gap-4 pl-4 border-l-4 border-blue-500/20"
                    >
                        <Filter className="w-5 h-5 text-slate-300 mr-2" />

                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setPage(1);
                                }}
                                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat.id
                                        ? "bg-white border-blue-500 text-blue-600 shadow-lg"
                                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <div
                        onClick={openCreateModal}
                        className="bg-white p-5 rounded-[3.5rem] border border-slate-100 shadow-xl flex items-center gap-5 group cursor-pointer hover:border-blue-200 transition-all relative overflow-hidden"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-400 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                            <createBar.icon className="w-8 h-8" />
                        </div>

                        <div className="flex-1 space-y-1">
                            <p className="text-lg font-black text-slate-950 uppercase tracking-tighter italic">
                                {createBar.title}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {createBar.subtitle}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                openCreateModal();
                            }}
                            className="h-20 px-8 bg-[#004aad] rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 group-hover:bg-blue-700 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px] gap-2"
                        >
                            OLUŞTUR <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-xl flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#004aad]" />
                            <p className="font-black text-slate-400 uppercase tracking-widest text-sm">
                                Yükleniyor...
                            </p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-xl text-center">
                            <p className="font-black text-slate-400 uppercase tracking-widest text-sm">
                                {selectedCity?.sehir_adi
                                    ? `${selectedCity.sehir_adi}${selectedDistrict?.ilce_adi ? ` / ${selectedDistrict.ilce_adi}` : ""} için kayıt bulunamadı`
                                    : "Kayıt bulunamadı"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <AnimatePresence mode="popLayout">
                                {posts.map((post) => {
                                    const content = getPostContent(post);
                                    const postLocation = getPostLocation(post);

                                    return (
                                        <motion.article
                                            key={post.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`bg-white rounded-[3.5rem] border border-slate-100 shadow-4xl overflow-hidden hover:shadow-[0_45px_100px_rgba(0,0,0,0.04)] transition-all duration-500 group ${post.tab === "MARKETPLACE" ? "cursor-pointer" : ""
                                                }`}
                                            onClick={() => openPostDetails(post)}
                                        >
                                            <div className="p-10 flex items-center justify-between border-b border-slate-50/50">
                                                <div className="flex items-center gap-6">
                                                    <div
                                                        className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white font-black italic shadow-xl relative shrink-0 ${post.role === "business" ? "bg-[#004aad]" : "bg-slate-800"
                                                            }`}
                                                    >
                                                        {getAvatarText(post)}

                                                        {post.role === "business" && (
                                                            <div className="absolute -bottom-1 -right-1 bg-white text-blue-600 p-1 rounded-full border border-slate-100">
                                                                <Sparkles className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h3 className="font-black italic text-lg text-slate-950 uppercase tracking-tighter leading-none">
                                                            {post.author || "Bilinmiyor"}
                                                        </h3>

                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3 mt-2 italic">
                                                            {post.badge || "Mahalleli"} • {formatRelativeDate(post.time)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {post.price !== null && post.price !== undefined && (
                                                    <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-100 flex flex-col items-end">
                                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">
                                                            FİYAT
                                                        </span>
                                                        <span className="text-xl font-black italic tracking-tighter leading-none">
                                                            {formatPrice(post.price, post.currency)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-10 py-8 space-y-4">
                                                <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter leading-tight">
                                                    {post.title}
                                                </h2>

                                                {post.attributes?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {post.attributes.map((attr, i) => (
                                                            <span
                                                                key={attr.id || i}
                                                                className="px-4 py-2 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 italic"
                                                            >
                                                                {attr.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {content ? (
                                                    <p className="text-base font-medium text-slate-600 leading-relaxed italic line-clamp-3">
                                                        {content}
                                                    </p>
                                                ) : null}

                                                {post.eventStartAt && (
                                                    <div className="inline-flex items-center gap-3 px-5 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest border border-blue-100 mt-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(post.eventStartAt).toLocaleDateString("tr-TR", {
                                                            day: "2-digit",
                                                            month: "long",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                        {postLocation ? ` • ${postLocation}` : ""}
                                                    </div>
                                                )}
                                            </div>

                                            {post.images?.length > 0 && (
                                                <div className="px-4 pb-4">
                                                    <div className="relative aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl">
                                                        <Image
                                                            src={post.images[0]}
                                                            alt={post.title || "Post görseli"}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
                                                        />

                                                        {post.tab === "MARKETPLACE" && (
                                                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                                <Camera className="w-3 h-3" /> {post.images.length} FOTO
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-8 flex items-center justify-between bg-slate-50/50 mt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleLike(e, post.id)}
                                                        className="h-12 px-6 rounded-[1.5rem] flex items-center gap-2 transition-all bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 shadow-sm"
                                                    >
                                                        <Heart className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            {post.stats?.likes || 0}
                                                        </span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-12 px-6 rounded-[1.5rem] bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-500 shadow-sm flex items-center gap-2 transition-all"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                                            {post.stats?.comments || 0}
                                                        </span>
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-12 w-12 rounded-[1.5rem] bg-white text-slate-400 hover:bg-[#004aad] hover:text-white shadow-sm flex items-center justify-center transition-all"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.article>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-8 hidden lg:block">
                    <div className="bg-[#004aad] p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <User className="w-40 h-40" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-lg">
                                <MapPin className="w-7 h-7 text-white" />
                            </div>

                            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
                                Mahalle <br />
                                Sakinleri
                            </h3>

                            <p className="text-blue-100 font-bold text-sm italic opacity-80 leading-relaxed">
                                Aktif konum: {activeLocationText}
                            </p>

                            <div className="flex -space-x-4 pt-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-[#004aad]" />
                                ))}
                                <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-[#004aad] flex items-center justify-center text-[9px] font-black">
                                    +2K
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8">
                        <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter flex items-center gap-3">
                            <Zap className="w-5 h-5 text-amber-500" /> Gündemdekiler
                        </h3>

                        <div className="space-y-4">
                            {[
                                { title: "#MahallePanosu", count: `${posts.length} Gönderi` },
                                { title: "#Komşuluk", count: "Canlı Akış" },
                                { title: "#İlanlar", count: activeTab === "MARKETPLACE" ? "Aktif Sekme" : "Keşfet" },
                            ].map((topic, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center group cursor-pointer border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                                >
                                    <div>
                                        <p className="font-black text-slate-700 italic group-hover:text-[#004aad] transition-colors">
                                            {topic.title}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {topic.count}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
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
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 50 }}
                            className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[3.5rem] shadow-4xl overflow-hidden flex flex-col lg:flex-row"
                        >
                            <button
                                type="button"
                                onClick={closeDetailModal}
                                className="absolute top-6 right-6 z-[160] p-4 bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-slate-950 rounded-2xl transition-all shadow-lg border border-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {postDetailLoading ? (
                                <div className="w-full h-[70vh] flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-10 h-10 animate-spin text-[#004aad]" />
                                        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">
                                            İlan detayı yükleniyor...
                                        </p>
                                    </div>
                                </div>
                            ) : selectedPost ? (
                                <>
                                    <div className="lg:w-[60%] bg-slate-950 relative overflow-hidden group min-h-[360px]">
                                        {selectedPost.images?.length > 0 ? (
                                            <>
                                                <div className="absolute inset-0">
                                                    <Image
                                                        src={selectedPost.images[currentImageIndex]?.url || selectedPost.images[currentImageIndex]}
                                                        alt={selectedPost.title || "Detail"}
                                                        fill
                                                        className="object-cover transition-all duration-700"
                                                        priority
                                                    />
                                                </div>

                                                {selectedPost.images.length > 1 && (
                                                    <div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                prevImage();
                                                            }}
                                                            className="p-4 bg-white/10 backdrop-blur rounded-2xl text-white hover:bg-white/20 transition-all"
                                                        >
                                                            <ChevronLeft className="w-6 h-6" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                nextImage();
                                                            }}
                                                            className="p-4 bg-white/10 backdrop-blur rounded-2xl text-white hover:bg-white/20 transition-all"
                                                        >
                                                            <ChevronRight className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-6 overflow-x-auto no-scrollbar">
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
                                                                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${currentImageIndex === idx
                                                                        ? "border-white scale-110 shadow-xl"
                                                                        : "border-white/20 opacity-60"
                                                                    }`}
                                                            >
                                                                <Image
                                                                    src={imageUrl}
                                                                    alt={`Thumb ${idx + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                                                <Camera className="w-20 h-20 opacity-20" />
                                                <p className="mt-4 font-black text-slate-800 uppercase italic">Görsel Yok</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="lg:w-[40%] bg-white flex flex-col h-full overflow-y-auto custom-scrollbar">
                                        <div className="p-10 lg:p-12 space-y-10 flex-1">
                                            <div className="space-y-4 border-b border-slate-50 pb-8">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                        {getMarketplaceLabel(selectedPost.marketplaceCategory)}
                                                    </span>

                                                    {selectedPost.location && (
                                                        <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                            {selectedPost.location}
                                                        </span>
                                                    )}
                                                </div>

                                                <h2 className="text-3xl lg:text-4xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
                                                    {selectedPost.title}
                                                </h2>

                                                {selectedPost.price !== null && selectedPost.price !== undefined && (
                                                    <p className="text-4xl font-black text-[#004aad] italic tracking-tighter">
                                                        {Number(selectedPost.price).toLocaleString("tr-TR")}{" "}
                                                        <span className="text-lg">{selectedPost.currency || "TL"}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                <div
                                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg ${selectedPost.authorBusiness ? "bg-[#004aad]" : "bg-slate-800"
                                                        }`}
                                                >
                                                    {(selectedPost.authorBusiness?.name || selectedPost.authorUser?.name || "NA")
                                                        .slice(0, 2)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="flex-1">
                                                    <p className="font-black text-slate-950 uppercase italic">
                                                        {selectedPost.authorBusiness?.name ||
                                                            selectedPost.authorUser?.name ||
                                                            "Bilinmiyor"}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex text-amber-500">
                                                            <Heart className="w-3 h-3 fill-current" />
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {selectedPost.authorBusiness?.isVerified
                                                                ? "DOĞRULANMIŞ SATICI"
                                                                : "SATICI PROFİLİ"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="p-3 bg-white rounded-xl text-slate-900 shadow-sm border border-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {selectedPost.attributes?.length > 0 && (
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                    {selectedPost.attributes.map((attr, i) => (
                                                        <div
                                                            key={attr.id || i}
                                                            className="flex justify-between items-center border-b border-slate-50 pb-2"
                                                        >
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                                {attr.label}
                                                            </span>
                                                            <span className="text-sm font-black text-slate-900 italic text-right">
                                                                {attr.value}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                                                    <Archive className="w-4 h-4" /> AÇIKLAMA
                                                </h3>

                                                <p className="text-sm font-medium text-slate-600 leading-7 italic bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50">
                                                    {selectedPost.description || selectedPost.content || "Açıklama bulunmuyor."}
                                                </p>
                                            </div>

                                            <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex gap-4">
                                                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                                                <div>
                                                    <h4 className="font-black text-amber-700 text-xs uppercase tracking-widest mb-1">
                                                        GÜVENLİK UYARISI
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-amber-600/80 leading-relaxed">
                                                        Dolandırıcılık mağduru olmamak için ürünü görmeden kapora göndermeyin.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 z-10 flex gap-4">
                                            <button
                                                type="button"
                                                className="flex-1 py-5 bg-[#004aad] text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Phone className="w-4 h-4" /> ARA
                                            </button>

                                            <button
                                                type="button"
                                                className="flex-1 py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                            >
                                                <Send className="w-4 h-4" /> MESAJ AT
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
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 40 }}
                            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100"
                        >
                            <button
                                type="button"
                                onClick={closeCreateModal}
                                className="absolute top-6 right-6 p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <form onSubmit={handleCreateSubmit} className="p-8 md:p-10 space-y-8">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#004aad]">
                                        Yeni Kayıt
                                    </p>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950">
                                        {activeTab === "MARKETPLACE"
                                            ? "İlan Oluştur"
                                            : activeTab === "EVENTS"
                                                ? "Etkinlik Oluştur"
                                                : activeTab === "HELP"
                                                    ? "Yardım Talebi Oluştur"
                                                    : "Paylaşım Oluştur"}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                            Başlık
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleFormChange("title", e.target.value)}
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                                            placeholder="Başlık girin"
                                        />
                                    </div>

                                    {(activeTab === "AGENDA" || activeTab === "HELP") && (
                                        <div className="md:col-span-2">
                                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                İçerik
                                            </label>
                                            <textarea
                                                rows={5}
                                                value={formData.content}
                                                onChange={(e) => handleFormChange("content", e.target.value)}
                                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-slate-700 resize-none"
                                                placeholder="Detaylı açıklama yazın"
                                            />
                                        </div>
                                    )}

                                    {activeTab === "MARKETPLACE" && (
                                        <>
                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                    Açıklama
                                                </label>
                                                <textarea
                                                    rows={5}
                                                    value={formData.description}
                                                    onChange={(e) => handleFormChange("description", e.target.value)}
                                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-slate-700 resize-none"
                                                    placeholder="İlan açıklaması"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                    Fiyat
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => handleFormChange("price", e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                                                    placeholder="Örn: 25000"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                    Para Birimi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.currency}
                                                    onChange={(e) => handleFormChange("currency", e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                                                    placeholder="TL"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {activeTab === "EVENTS" && (
                                        <>
                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                    Açıklama
                                                </label>
                                                <textarea
                                                    rows={5}
                                                    value={formData.content}
                                                    onChange={(e) => handleFormChange("content", e.target.value)}
                                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-slate-700 resize-none"
                                                    placeholder="Etkinlik açıklaması"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                    Başlangıç Tarihi
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.eventStartAt}
                                                    onChange={(e) => handleFormChange("eventStartAt", e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                    Bitiş Tarihi
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.eventEndAt}
                                                    onChange={(e) => handleFormChange("eventEndAt", e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                                    Etkinlik Konumu
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.eventLocation}
                                                    onChange={(e) => handleFormChange("eventLocation", e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                                                    placeholder="Örn: Cumhuriyet İlkokulu Bahçesi"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                            Konum
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => handleFormChange("location", e.target.value)}
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                                            placeholder="Örn: Yeşilköy Mah."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
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
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
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
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
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
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700 disabled:opacity-50"
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
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                            Telefon
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.contactPhone}
                                            onChange={(e) => handleFormChange("contactPhone", e.target.value)}
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                                            placeholder="05xx xxx xx xx"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                            WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.contactWhatsapp}
                                            onChange={(e) => handleFormChange("contactWhatsapp", e.target.value)}
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700"
                                            placeholder="05xx xxx xx xx"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                                            Görseller
                                        </h3>
                                    </div>

                                    <div className="space-y-3">
                                        <label
                                            htmlFor="neighborhood-image-upload"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate">
                                                        {imageFiles.length
                                                            ? `${imageFiles.length} dosya seçildi`
                                                            : "Görsel seçin"}
                                                    </p>
                                                    <p className="text-[11px] font-semibold text-slate-500">
                                                        JPG, PNG veya WEBP (maks. 8MB / dosya)
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-700">
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
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {imageFiles.map((file, index) => (
                                                    <div
                                                        key={`${file.name}-${index}`}
                                                        className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
                                                    >
                                                        <div className="relative aspect-square bg-slate-100">
                                                            <img
                                                                src={imagePreviewUrls[index]}
                                                                alt={file.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImageFile(index)}
                                                                className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="px-3 py-2">
                                                            <p className="text-[11px] font-semibold text-slate-600 truncate">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-slate-400">
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] font-semibold text-slate-400">Henüz görsel seçilmedi.</p>
                                        )}
                                    </div>
                                </div>

                                {activeTab === "MARKETPLACE" && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                                                Özellikler
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={addAttributeField}
                                                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Özellik Ekle
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {formData.attributes.map((attr, index) => (
                                                <div
                                                    key={index}
                                                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3"
                                                >
                                                    <input
                                                        type="text"
                                                        value={attr.label}
                                                        onChange={(e) =>
                                                            handleAttributeChange(index, "label", e.target.value)
                                                        }
                                                        className="h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-slate-700"
                                                        placeholder="Örn: Marka"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={attr.value}
                                                        onChange={(e) =>
                                                            handleAttributeChange(index, "value", e.target.value)
                                                        }
                                                        className="h-14 px-5 rounded-2xl border border-slate-200 outline-none focus:border-blue-500 font-medium text-slate-700"
                                                        placeholder="Örn: Honda"
                                                    />
                                                    {formData.attributes.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttributeField(index)}
                                                            className="px-4 rounded-2xl bg-rose-50 text-rose-600 font-black"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeCreateModal}
                                        className="flex-1 h-14 rounded-[1.5rem] bg-slate-100 text-slate-700 font-black uppercase tracking-widest text-[10px]"
                                    >
                                        Vazgeç
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 h-14 rounded-[1.5rem] bg-[#004aad] text-white font-black uppercase tracking-widest text-[10px] shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {createLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Kaydediliyor
                                            </>
                                        ) : (
                                            <>
                                                Paylaş
                                                <ArrowRight className="w-4 h-4" />
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
    );
}