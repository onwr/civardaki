"use client";

import Header from "@/components/layout/Header";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  MapPin,
  Phone,
  Mail,
  Upload,
  ArrowRight,
  User,
  Briefcase,
  Globe,
  ShieldCheck,
  Star,
  Sparkles,
  Building2,
  Store,
  Info,
  Calendar,
  AlertTriangle,
  Shapes,
  Tag,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { turkeyLocations, getDistricts } from "@/constants/locations";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterBusinessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const referralCode = useMemo(() => {
    const ref = String(searchParams.get("ref") || "")
      .trim()
      .toUpperCase();
    const via = String(searchParams.get("via") || "")
      .trim()
      .toLowerCase();
    if (!ref) return "";
    if (via && via !== "referral") return "";
    return ref;
  }, [searchParams]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const [categoryTree, setCategoryTree] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  const [formData, setFormData] = useState({
    accountType: "",
    companyTitle: "",
    taxId: "",
    taxOffice: "",
    mersisNo: "",
    logo: null,
    logoPreview: null,
    businessName: "",
    primaryCategoryId: "",
    secondaryCategoryIds: [],
    description: "",
    foundationYear: "",
    address: "",
    city: "",
    district: "",
    phone: "",
    email: "",
    website: "",
    ownerName: "",
    ownerRole: "",
    password: "",
    passwordConfirm: "",
    termsAccepted: false,
  });

  useEffect(() => {
    let ignore = false;

    async function fetchCategories() {
      try {
        setCategoryLoading(true);
        setCategoryError(null);

        const res = await fetch("/api/categories/tree", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Kategoriler alınamadı.");
        }

        if (!ignore) {
          setCategoryTree(data?.categories || []);
        }
      } catch (err) {
        if (!ignore) {
          setCategoryTree([]);
          setCategoryError(err.message || "Kategoriler alınamadı.");
        }
      } finally {
        if (!ignore) {
          setCategoryLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedParentCategory = useMemo(() => {
    return (
      categoryTree.find((cat) => cat.id === formData.primaryCategoryId) || null
    );
  }, [categoryTree, formData.primaryCategoryId]);

  const childCategories = selectedParentCategory?.children || [];

  const selectedChildCategory = useMemo(() => {
    if (!formData.secondaryCategoryIds?.length) return null;
    return (
      childCategories.find(
        (child) => child.id === formData.secondaryCategoryIds[0],
      ) || null
    );
  }, [childCategories, formData.secondaryCategoryIds]);

  const steps = [
    { number: 1, title: "Hesap Türü", icon: User, desc: "Çalışma Şekli" },
    {
      number: 2,
      title: "Temel Bilgiler",
      icon: Store,
      desc: "İşletmenizi Tanıtın",
    },
    {
      number: 3,
      title: "Konum & İletişim",
      icon: MapPin,
      desc: "Size Nasıl Ulaşalım?",
    },
    {
      number: 4,
      title: "Yetkili & Onay",
      icon: ShieldCheck,
      desc: "Güvenlik Adımları",
    },
  ];

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl border-0 ring-1 ring-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 sm:text-sm sm:leading-6 transition-all duration-200 bg-white/50 hover:bg-white focus:bg-white outline-none";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";
  const iconInputClass = "pl-11";
  const iconWrapperClass =
    "absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors";

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  const handleNext = () => {
    setError(null);

    if (currentStep === 1 && !formData.accountType) {
      setError("Lütfen bir hesap türü seçiniz.");
      return;
    }

    if (currentStep === 2) {
      if (!formData.businessName.trim()) {
        setError("Lütfen işletme adını giriniz.");
        return;
      }

      if (!formData.primaryCategoryId) {
        setError("Lütfen ana kategori seçiniz.");
        return;
      }

      if (!formData.secondaryCategoryIds.length) {
        setError("Lütfen alt kategori seçiniz.");
        return;
      }

      if (!formData.description.trim()) {
        setError("Lütfen işletme açıklamasını giriniz.");
        return;
      }

      if (formData.accountType === "corporate") {
        if (
          !formData.companyTitle.trim() ||
          !formData.taxOffice.trim() ||
          !formData.taxId.trim()
        ) {
          setError(
            "Kurumsal hesap için şirket unvanı, vergi dairesi ve vergi no zorunludur.",
          );
          return;
        }
      }
    }

    if (currentStep === 3) {
      const phoneDigits = (formData.phone || "").replace(/\D/g, "");
      if (
        !formData.address.trim() ||
        phoneDigits.length < 10 ||
        !formData.email.trim()
      ) {
        setError(
          "Lütfen adres, geçerli bir telefon (10 hane) ve e-posta alanlarını doldurun.",
        );
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = async () => {
    setError(null);

    try {
      if (!formData.termsAccepted) {
        setError("Devam etmek için kullanım koşullarını kabul etmelisiniz.");
        return;
      }

      if (!formData.ownerName.trim() || !formData.ownerRole.trim()) {
        setError("Lütfen yetkili adı ve görev bilgisini doldurun.");
        return;
      }

      if (formData.password !== formData.passwordConfirm) {
        setError("Şifreler eşleşmiyor.");
        return;
      }

      if (formData.password.length < 6) {
        setError("Şifre en az 6 karakter olmalıdır.");
        return;
      }

      if (!formData.primaryCategoryId) {
        setError("Ana kategori seçimi zorunludur.");
        return;
      }

      if (!formData.secondaryCategoryIds.length) {
        setError("Alt kategori seçimi zorunludur.");
        return;
      }

      const fd = new FormData();

      fd.append("registrationMode", "detailed");
      fd.append("accountType", formData.accountType);
      fd.append("companyTitle", formData.companyTitle);
      fd.append("taxId", formData.taxId);
      fd.append("taxOffice", formData.taxOffice);
      fd.append("mersisNo", formData.mersisNo);
      fd.append("businessName", formData.businessName);
      fd.append("primaryCategoryId", formData.primaryCategoryId);
      fd.append(
        "secondaryCategoryIds",
        JSON.stringify(formData.secondaryCategoryIds || []),
      );
      fd.append("description", formData.description);
      fd.append("foundationYear", formData.foundationYear);
      fd.append("address", formData.address);
      fd.append("city", formData.city);
      fd.append("district", formData.district);
      fd.append("phone", (formData.phone || "").replace(/\D/g, ""));
      fd.append("email", formData.email);
      fd.append("website", formData.website);
      fd.append("ownerName", formData.ownerName);
      fd.append("ownerRole", formData.ownerRole);
      fd.append("password", formData.password);

      if (formData.logo) {
        fd.append("logo", formData.logo);
      }

      const res = await fetch("/api/auth/register-business", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "İşletme kaydında hata oluştu.");
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (signInRes?.error) {
        setError(
          "Hesap oluşturuldu ancak otomatik giriş yapılamadı. Lütfen giriş sayfasından giriş yapın.",
        );
        return;
      }

      setIsSubmitted(true);

      setTimeout(() => {
        router.push("/business/dashboard");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError("Bağlantı hatası oluştu.");
    }
  };

  const formatPhoneDisplay = (raw) => {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 8)
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({
        ...prev,
        phone: formatPhoneDisplay(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleParentCategoryChange = (e) => {
    const newParentId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      primaryCategoryId: newParentId,
      secondaryCategoryIds: [],
    }));
  };

  const handleChildCategoryChange = (e) => {
    const newChildId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      secondaryCategoryIds: newChildId ? [newChildId] : [],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu 5MB'dan büyük olamaz.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        logo: file,
        logoPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const selectAccountType = (type) => {
    setFormData((prev) => ({ ...prev, accountType: type }));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <div className="relative pt-32 pb-24 overflow-hidden bg-primary-600 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-900/50" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-50 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Binlerce İşletme Arasına Katılın</span>
            </span>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
              İşletmenizi <span className="text-blue-200">Büyütmenin</span>
              <br />
              En Kolay Yolu
            </h1>

            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Civardaki.com ile yerel müşterilerinize anında ulaşın, online
              varlığınızı güçlendirin ve satışlarınızı artırın.
            </p>
          </motion.div>

          {referralCode ? (
            <div className="container max-w-2xl mx-auto px-4 mt-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
                <p className="text-sm font-bold">
                  Referans ile kayıt oluyorsunuz:{" "}
                  <span className="font-black">{referralCode}</span>
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  Kayıt tamamlandığında referans takibi otomatik olarak devam
                  eder.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="px-6 lg:px-16 -mt-16 pb-24 relative z-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            <div className="flex flex-col md:flex-row min-h-[600px]">
              <div className="hidden md:flex flex-col w-1/3 bg-gray-50 border-r border-gray-100 p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -ml-32 -mb-32" />

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-10">
                    Başvuru Adımları
                  </h3>

                  <div className="space-y-8">
                    {steps.map((step, idx) => (
                      <div key={step.number} className="relative pl-10 group">
                        {idx !== steps.length - 1 && (
                          <div
                            className={`absolute left-[15px] top-10 w-0.5 h-12 ${
                              currentStep > step.number
                                ? "bg-blue-600"
                                : "bg-gray-200"
                            }`}
                          />
                        )}

                        <div
                          className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                            currentStep === step.number
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110"
                              : currentStep > step.number
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          {currentStep > step.number ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            step.number
                          )}
                        </div>

                        <div>
                          <span
                            className={`block text-base font-bold transition-colors ${
                              currentStep === step.number
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {step.title}
                          </span>
                          <span className="text-sm text-gray-400 font-medium">
                            {step.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-12">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex text-yellow-400 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>

                      <p className="text-sm text-gray-600 italic mb-3">
                        "Civardaki sayesinde müşteri sayımız %40 arttı.
                        Kesinlikle tavsiye ederim."
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
                            alt="User"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            Ahmet Y.
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Restoran Sahibi
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:hidden bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex justify-between items-center px-4">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep >= step.number
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.number}
                      </div>
                      <span className="text-[10px] mt-1 font-medium text-gray-600">
                        {step.title.split(" ")[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-8 md:p-12 lg:p-14 bg-white relative">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                      <Check className="w-12 h-12 text-green-600" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Başvurunuz Alındı!
                    </h2>

                    <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
                      İşletme kaydınız başarıyla oluşturuldu.
                      Yönlendiriliyorsunuz...
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      {...fadeInUp}
                      className="h-full flex flex-col pt-2"
                    >
                      {error && (
                        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 flex gap-3">
                          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="text-sm font-semibold">{error}</div>
                        </div>
                      )}

                      <div className="flex-1">
                        {currentStep === 1 && (
                          <div className="space-y-8">
                            <div className="mb-4">
                              <h2 className="text-2xl font-bold text-gray-900">
                                Hesap Türünü Seçin
                              </h2>
                              <p className="text-gray-500">
                                İşletmenizi nasıl yönetmek istediğinizi
                                belirleyin.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div
                                onClick={() => selectAccountType("individual")}
                                className={`cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col gap-4 ${
                                  formData.accountType === "individual"
                                    ? "border-blue-600 bg-blue-50 ring-4 ring-blue-100"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                }`}
                              >
                                <div
                                  className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-colors ${
                                    formData.accountType === "individual"
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                                  }`}
                                >
                                  <User className="w-7 h-7" />
                                </div>

                                <div>
                                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                                    Bireysel / Şahıs
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Kendi işini yapanlar ve şahıs şirketi
                                    sahipleri için idealdir.
                                  </p>
                                </div>

                                {formData.accountType === "individual" && (
                                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                  </div>
                                )}
                              </div>

                              <div
                                onClick={() => selectAccountType("corporate")}
                                className={`cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col gap-4 ${
                                  formData.accountType === "corporate"
                                    ? "border-blue-600 bg-blue-50 ring-4 ring-blue-100"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                }`}
                              >
                                <div
                                  className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-colors ${
                                    formData.accountType === "corporate"
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                                  }`}
                                >
                                  <Building2 className="w-7 h-7" />
                                </div>

                                <div>
                                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                                    Kurumsal / Şirket
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Limited veya Anonim şirketler için
                                    geliştirilmiş özellikleri içerir.
                                  </p>
                                </div>

                                {formData.accountType === "corporate" && (
                                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                    <Check className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {formData.accountType && (
                              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex gap-3 text-sm text-blue-800 animate-in fade-in slide-in-from-top-2">
                                <Info className="w-5 h-5 flex-shrink-0" />
                                <p>
                                  {formData.accountType === "individual"
                                    ? "Bireysel hesap ile işletmenizi hızlıca oluşturabilir, ürün ve hizmetlerinizi hemen tanıtmaya başlayabilirsiniz."
                                    : "Kurumsal hesap ile vergi bilgilerinizi girerek faturalandırma ve gelişmiş işletme özelliklerinden faydalanabilirsiniz."}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {currentStep === 2 && (
                          <div className="space-y-6">
                            <div className="mb-8">
                              <h2 className="text-2xl font-bold text-gray-900">
                                İşletme Bilgileri
                              </h2>
                              <p className="text-gray-500">
                                Müşterilerinizin sizi tanıması için temel
                                bilgileri girin.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {formData.accountType === "corporate" && (
                                <div className="col-span-1 md:col-span-2 space-y-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                  <div className="flex items-center gap-2 text-blue-900 font-semibold border-b border-gray-200 pb-2 mb-2">
                                    <Building2 className="w-5 h-5" />
                                    <span>Şirket Kayıt Bilgileri</span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1 md:col-span-2">
                                      <label className={labelClass}>
                                        Resmi Şirket Unvanı{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        name="companyTitle"
                                        value={formData.companyTitle}
                                        onChange={handleChange}
                                        placeholder="Örn: Civardaki Teknoloji Anonim Şirketi"
                                        className={inputClass}
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className={labelClass}>
                                        Vergi Dairesi{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        name="taxOffice"
                                        value={formData.taxOffice}
                                        onChange={handleChange}
                                        placeholder="Vergi Dairesi Adı"
                                        className={inputClass}
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className={labelClass}>
                                        Vergi Numarası{" "}
                                        <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        name="taxId"
                                        value={formData.taxId}
                                        onChange={handleChange}
                                        placeholder="Vergi No (10 haneli)"
                                        maxLength={10}
                                        className={inputClass}
                                      />
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                      <label className={labelClass}>
                                        Mersis No (İsteğe Bağlı)
                                      </label>
                                      <input
                                        type="text"
                                        name="mersisNo"
                                        value={formData.mersisNo}
                                        onChange={handleChange}
                                        placeholder="Mersis Numaranız"
                                        className={inputClass}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1 md:col-span-2 group">
                                <label className={labelClass}>
                                  İşletme Adı (Tabela Adı){" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <Store className={iconWrapperClass} />
                                  <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    placeholder="Örn: Lezzet Durağı"
                                    className={`${inputClass} ${iconInputClass}`}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>
                                  Ana Kategori{" "}
                                  <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                  <Shapes className={iconWrapperClass} />
                                  <select
                                    name="primaryCategoryId"
                                    value={formData.primaryCategoryId}
                                    onChange={handleParentCategoryChange}
                                    className={`${inputClass} ${iconInputClass}`}
                                    disabled={categoryLoading}
                                  >
                                    <option value="">
                                      {categoryLoading
                                        ? "Kategoriler yükleniyor..."
                                        : "Ana kategori seçin..."}
                                    </option>

                                    {categoryTree.map((category) => (
                                      <option
                                        key={category.id}
                                        value={category.id}
                                      >
                                        {category.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {categoryError ? (
                                  <p className="text-xs text-rose-600 font-semibold mt-2">
                                    {categoryError}
                                  </p>
                                ) : null}
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>
                                  Alt Kategori{" "}
                                  <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                  {categoryLoading ? (
                                    <Loader2
                                      className={`${iconWrapperClass} animate-spin`}
                                    />
                                  ) : (
                                    <Tag className={iconWrapperClass} />
                                  )}

                                  <select
                                    value={
                                      formData.secondaryCategoryIds[0] || ""
                                    }
                                    onChange={handleChildCategoryChange}
                                    className={`${inputClass} ${iconInputClass}`}
                                    disabled={
                                      !formData.primaryCategoryId ||
                                      categoryLoading
                                    }
                                  >
                                    <option value="">
                                      {!formData.primaryCategoryId
                                        ? "Önce ana kategori seçin"
                                        : "Alt kategori seçin..."}
                                    </option>

                                    {childCategories.map((child) => (
                                      <option key={child.id} value={child.id}>
                                        {child.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {selectedParentCategory ? (
                                <div className="md:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                                  <div className="flex flex-col gap-2">
                                    <p className="text-sm font-bold text-blue-900">
                                      Seçilen Ana Kategori:{" "}
                                      {selectedParentCategory.name}
                                    </p>

                                    {selectedParentCategory.description ? (
                                      <p className="text-sm text-blue-700">
                                        {selectedParentCategory.description}
                                      </p>
                                    ) : null}

                                    {selectedChildCategory ? (
                                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                        Alt Kategori:{" "}
                                        {selectedChildCategory.name}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              ) : null}

                              <div className="space-y-1 group">
                                <label className={labelClass}>Web Sitesi</label>
                                <div className="relative">
                                  <Globe className={iconWrapperClass} />
                                  <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="www.isletmeniz.com"
                                    className={`${inputClass} ${iconInputClass}`}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>
                                  Kuruluş Yılı
                                </label>
                                <div className="relative">
                                  <Calendar className={iconWrapperClass} />
                                  <input
                                    type="number"
                                    name="foundationYear"
                                    value={formData.foundationYear}
                                    onChange={handleChange}
                                    placeholder="Örn: 2020"
                                    min="1900"
                                    max="2026"
                                    className={`${inputClass} ${iconInputClass}`}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 md:col-span-2 group">
                                <label className={labelClass}>
                                  Açıklama{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  rows="4"
                                  name="description"
                                  value={formData.description}
                                  onChange={handleChange}
                                  placeholder="İşletmenizin sunduğu ürün ve hizmetlerden, sizi özel kılan detaylardan bahsedin..."
                                  className={`${inputClass} resize-none`}
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Logo / Görsel Yükle
                                </label>

                                <label
                                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group relative overflow-hidden ${
                                    formData.logoPreview
                                      ? "border-blue-500 bg-blue-50/30"
                                      : "border-gray-200 bg-gray-50/50"
                                  }`}
                                >
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                  />

                                  {formData.logoPreview ? (
                                    <div className="relative w-full h-full flex flex-col items-center">
                                      <div className="w-32 h-32 relative mb-4 rounded-xl overflow-hidden shadow-md">
                                        <img
                                          src={formData.logoPreview}
                                          alt="Logo Preview"
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">
                                            Değiştir
                                          </span>
                                        </div>
                                      </div>
                                      <span className="text-sm text-blue-600 font-medium">
                                        Görsel seçildi
                                      </span>
                                      <span className="text-xs text-gray-400 mt-1">
                                        {formData.logo?.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors text-blue-400 shadow-sm">
                                        <Upload className="w-8 h-8" />
                                      </div>
                                      <span className="text-sm font-semibold text-gray-900 mb-1">
                                        Logonuzu sürükleyin veya seçin
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        PNG, JPG, WEBP (Maksimum 5MB)
                                      </span>
                                    </>
                                  )}
                                </label>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentStep === 3 && (
                          <div className="space-y-6">
                            <div className="mb-8">
                              <h2 className="text-2xl font-bold text-gray-900">
                                Konum ve İletişim
                              </h2>
                              <p className="text-gray-500">
                                Müşterilerin size kolayca ulaşabilmesi için
                                doğru bilgileri girin.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="md:col-span-2 space-y-1 group">
                                <label className={labelClass}>
                                  Açık Adres{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                  <textarea
                                    rows="2"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Mahalle, Cadde, Sokak, No:..."
                                    className={`${inputClass} ${iconInputClass} resize-none`}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>Şehir</label>
                                <select
                                  name="city"
                                  value={formData.city}
                                  onChange={handleChange}
                                  className={inputClass}
                                >
                                  <option value="">Seçiniz...</option>
                                  {Object.keys(turkeyLocations)
                                    .sort()
                                    .map((city) => (
                                      <option key={city} value={city}>
                                        {city}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>İlçe</label>
                                <select
                                  name="district"
                                  value={formData.district}
                                  onChange={handleChange}
                                  className={inputClass}
                                  disabled={!formData.city}
                                >
                                  <option value="">
                                    {formData.city
                                      ? "İlçe seçin..."
                                      : "Önce şehir seçin"}
                                  </option>
                                  {formData.city &&
                                    getDistricts(formData.city).map((dist) => (
                                      <option key={dist} value={dist}>
                                        {dist}
                                      </option>
                                    ))}
                                </select>
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>
                                  Telefon{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <Phone className={iconWrapperClass} />
                                  <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(5XX) XXX XX XX"
                                    className={`${inputClass} ${iconInputClass}`}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>
                                  E-posta{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <Mail className={iconWrapperClass} />
                                  <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="iletisim@isletme.com"
                                    className={`${inputClass} ${iconInputClass}`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {currentStep === 4 && (
                          <div className="space-y-6">
                            <div className="mb-8">
                              <h2 className="text-2xl font-bold text-gray-900">
                                Yetkili Bilgileri
                              </h2>
                              <p className="text-gray-500">
                                Hesap güvenliği ve doğrulama için yetkili
                                kişinin bilgileri.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 max-w-lg">
                              <div className="space-y-1 group">
                                <label className={labelClass}>
                                  Ad Soyad{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <User className={iconWrapperClass} />
                                  <input
                                    type="text"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    placeholder="Adınız Soyadınız"
                                    className={`${inputClass} ${iconInputClass}`}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>
                                  Göreviniz{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                  <Briefcase className={iconWrapperClass} />
                                  <input
                                    type="text"
                                    name="ownerRole"
                                    value={formData.ownerRole}
                                    onChange={handleChange}
                                    placeholder="Örn: İşletme Sahibi, Mağaza Müdürü"
                                    className={`${inputClass} ${iconInputClass}`}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>
                                  Şifre <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="password"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  placeholder="En az 6 karakter"
                                  className={inputClass}
                                />
                              </div>

                              <div className="space-y-1 group">
                                <label className={labelClass}>
                                  Şifre Tekrar{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="password"
                                  name="passwordConfirm"
                                  value={formData.passwordConfirm}
                                  onChange={handleChange}
                                  placeholder="Şifrenizi tekrar girin"
                                  className={inputClass}
                                />
                              </div>

                              <label className="flex gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100 cursor-pointer hover:bg-blue-100/50 transition-colors">
                                <div className="relative flex items-start">
                                  <input
                                    type="checkbox"
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleChange}
                                    className="peer sr-only"
                                  />
                                  <div className="w-6 h-6 border-2 border-blue-300 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-all">
                                    <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100" />
                                  </div>
                                </div>

                                <div className="text-sm">
                                  <span className="font-semibold text-gray-900">
                                    Kullanım Koşullarını Kabul Ediyorum
                                  </span>
                                  <p className="text-gray-500 mt-1">
                                    Civardaki.com{" "}
                                    <Link
                                      href="#"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Hizmet Şartları
                                    </Link>{" "}
                                    ve{" "}
                                    <Link
                                      href="#"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Gizlilik Politikası
                                    </Link>{" "}
                                    şartlarını kabul ediyorum.
                                  </p>
                                </div>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
                        <button
                          onClick={handlePrev}
                          disabled={currentStep === 1}
                          className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                            currentStep === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          Geri Dön
                        </button>

                        <button
                          onClick={
                            currentStep === steps.length
                              ? handleComplete
                              : handleNext
                          }
                          disabled={
                            currentStep === steps.length &&
                            !formData.termsAccepted
                          }
                          className={`flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${
                            currentStep === steps.length &&
                            !formData.termsAccepted
                              ? "bg-gray-300 cursor-not-allowed shadow-none hover:transform-none"
                              : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                          }`}
                        >
                          {currentStep === steps.length
                            ? "Başvuruyu Tamamla"
                            : "Devam Et"}
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  C
                </div>
                <span className="text-2xl font-bold text-white">Civardaki</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                Yerel işletmeleri dijital dünyayla buluşturarak büyümelerine
                katkı sağlıyoruz.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Hızlı Bağlantılar</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Ana Sayfa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/business/register"
                    className="hover:text-blue-400 transition-colors"
                  >
                    İşletme Ekle
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-blue-400 transition-colors"
                  >
                    İletişim
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Destek</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Sıkça Sorulan Sorular
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Yardım Merkezi
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Kullanım Koşulları
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Bize Ulaşın</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>
                    Maslak Mah. Büyükdere Cad. No:123, Sarıyer/İstanbul
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>destek@civardaki.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>0850 123 45 67</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>
              &copy; 2025 Civardaki.com Teknoloji A.Ş. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white transition-colors">
                Instagram
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Twitter
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
