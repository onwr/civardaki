"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MessageSquare,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Zap,
  Star,
  MapPin,
  Calendar,
  ChevronDown,
  Users,
  Briefcase,
  Target,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatTurkishMobileDisplay } from "@/lib/phone-format";

const STATUS_CONFIG = {
  NEW: {
    label: "Yeni",
    pill: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Zap,
  },
  CONTACTED: {
    label: "İletişime Geçildi",
    pill: "border-amber-200 bg-amber-50 text-amber-700",
    icon: MessageSquare,
  },
  QUOTED: {
    label: "Teklif Verildi",
    pill: "border-purple-200 bg-purple-50 text-purple-700",
    icon: Clock,
  },
  REPLIED: {
    label: "Yanıtlandı",
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Kazanıldı",
    pill: "border-emerald-200 bg-emerald-600 text-white",
    icon: Star,
  },
  LOST: {
    label: "Kaybedildi",
    pill: "border-slate-200 bg-slate-100 text-slate-500",
    icon: AlertCircle,
  },
};

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

function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function LeadsClient() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const url =
        filter === "ALL"
          ? "/api/business/leads"
          : `/api/business/leads?status=${filter}`;

      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        toast.error(
          data.error ||
            data.message ||
            (res.status === 401 ? "Oturum gerekli; tekrar giriş yapın." : "Talepler yüklenemedi."),
        );
        return;
      }

      const list = data.leads || [];
      setLeads(list);
      setSelectedLead((sel) => {
        if (!sel && list.length) return list[0];
        if (sel) {
          const fresh = list.find((l) => l.id === sel.id);
          return fresh || list[0] || null;
        }
        return null;
      });
    } catch (error) {
      toast.error("Talepler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (leadId, newStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/business/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Talep durumu güncellendi.");
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
        );
        if (selectedLead?.id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStatus });
        }
      }
    } catch (error) {
      toast.error("Güncelleme başarısız.");
    } finally {
      setIsUpdating(false);
    }
  };

  const dismissLead = async (leadId) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/business/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, dismiss: true }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "İşlem başarısız.");
        return;
      }
      toast.success("Talep geçildi; artık listede görünmez.");
      await fetchLeads();
    } catch {
      toast.error("İşlem başarısız.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const name = l.name?.toLowerCase?.() || "";
    const title = (l.title || "").toLowerCase();
    const message = l.message?.toLowerCase?.() || "";
    const phone = l.phone || "";
    const search = searchTerm.toLowerCase();

    return (
      name.includes(search) ||
      title.includes(search) ||
      message.includes(search) ||
      phone.includes(searchTerm)
    );
  });

  const stats = useMemo(() => {
    return {
      total: leads.length,
      fresh: leads.filter((l) => l.status === "NEW").length,
      contacted: leads.filter((l) =>
        ["CONTACTED", "QUOTED", "REPLIED"].includes(l.status),
      ).length,
      won: leads.filter((l) => l.status === "CLOSED").length,
    };
  }, [leads]);

  const selectedStatus = selectedLead ? STATUS_CONFIG[selectedLead.status] : null;

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <Briefcase className="h-4 w-4" />
                  Müşteri Takip Sistemi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Talep Merkezi
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Gelen müşteri taleplerini görüntüleyin, iletişim kurun, teklif verin
                  ve süreci kazanca dönüştürün.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[380px]">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                    Aktif Filtre
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {filter === "ALL" ? "Tüm Talepler" : STATUS_CONFIG[filter]?.label}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                    Görünen Sonuç
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {filteredLeads.length} kayıt
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Talep"
              value={stats.total}
              sub="Tüm müşteri istekleri"
              icon={Users}
              tone="blue"
            />
            <StatCard
              title="Yeni"
              value={stats.fresh}
              sub="Henüz işlenmemiş talepler"
              icon={Zap}
              tone="amber"
            />
            <StatCard
              title="İşlemde"
              value={stats.contacted}
              sub="İletişim veya teklif aşamasında"
              icon={Target}
              tone="rose"
            />
            <StatCard
              title="Kazanılan"
              value={stats.won}
              sub="Satışa dönüşen kayıtlar"
              icon={TrendingUp}
              tone="emerald"
            />
          </div>
        </section>

        <SectionCard
          title="Arama ve filtreleme"
          subtitle="Başlık, isim, mesaj veya telefon üzerinden talep bulun"
        >
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Başlık, isim, mesaj veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
            >
              <option value="ALL">Tüm Talepler</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionCard
              title="Talep listesi"
              subtitle="Soldan bir kayıt seçerek detaylarını görüntüleyin"
            >
              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 animate-pulse rounded-[24px] border border-slate-200 bg-slate-100"
                    />
                  ))
                ) : filteredLeads.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                      <Search className="h-7 w-7 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Talep bulunamadı</h3>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Aradığınız kriterlere uygun sonuç yok.
                    </p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const status = STATUS_CONFIG[lead.status];
                    return (
                      <motion.div
                        layout
                        key={lead.id}
                        className={`group flex gap-2 rounded-[24px] border p-4 transition sm:p-5 ${
                          selectedLead?.id === lead.id
                            ? "border-blue-300 bg-blue-50/60 shadow-sm"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${status?.pill}`}
                                >
                                  {status?.label}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {formatDistanceToNow(new Date(lead.createdAt), {
                                    addSuffix: true,
                                    locale: tr,
                                  })}
                                </span>
                              </div>

                              <h4 className="truncate text-base font-bold text-slate-900">
                                {lead.title || lead.name}
                              </h4>
                              {lead.title ? (
                                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                                  {lead.name}
                                </p>
                              ) : null}
                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                {lead.message}
                              </p>
                            </div>

                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                                selectedLead?.id === lead.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-slate-400 group-hover:bg-slate-100"
                              }`}
                            >
                              <ChevronDown
                                className={`h-5 w-5 transition-transform ${
                                  selectedLead?.id === lead.id ? "rotate-90" : "-rotate-90"
                                }`}
                              />
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => dismissLead(lead.id)}
                          className="shrink-0 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                          title="İşletmeye uygun değilse gizle"
                        >
                          Geç
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!selectedLead ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <SectionCard title="Talep detayı">
                    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-sm">
                        <ArrowRight className="h-8 w-8 -rotate-45 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Detayları Gör</h3>
                      <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
                        Talebin detaylarını ve iletişim bilgilerini görmek için soldan bir
                        kart seçin.
                      </p>
                    </div>
                  </SectionCard>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedLead.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <SectionCard
                    title="Talep detayı"
                    subtitle="Seçilen müşteri kaydının ayrıntıları"
                    right={
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${selectedStatus?.pill}`}
                      >
                        {selectedStatus?.label}
                      </span>
                    }
                  >
                    <div className="space-y-8">
                      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Users className="h-7 w-7" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                              {selectedLead.name}
                            </h2>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                              <span>
                                {new Date(selectedLead.createdAt).toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span>
                                {formatDistanceToNow(new Date(selectedLead.createdAt), {
                                  addSuffix: true,
                                  locale: tr,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => window.open(`tel:${selectedLead.phone}`)}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 transition hover:bg-slate-100"
                          >
                            <Phone className="h-5 w-5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const phone = selectedLead.phone?.replace(/[^0-9]/g, "");
                              window.open(`https://wa.me/90${phone}`, "_blank");
                              if (selectedLead.status === "NEW") {
                                updateStatus(selectedLead.id, "CONTACTED");
                              }
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                          >
                            <MessageSquare className="h-4 w-4 fill-current" />
                            WhatsApp
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                          {selectedLead.title ? (
                            <div>
                              <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                Talep başlığı
                              </label>
                              <div className="mt-2 rounded-[24px] border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900">
                                {selectedLead.title}
                              </div>
                            </div>
                          ) : null}
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              Mesaj
                            </label>
                            <div className="mt-2 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                              {selectedLead.message}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                Telefon
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-800">
                                {selectedLead.phone
                                  ? formatTurkishMobileDisplay(selectedLead.phone)
                                  : "Belirtilmedi"}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                E-posta
                              </p>
                              <p className="mt-2 truncate text-sm font-semibold text-slate-800">
                                {selectedLead.email || "Belirtilmedi"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="rounded-[24px] border border-blue-100 bg-blue-50 p-5">
                            <div className="mb-4 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-blue-600" />
                              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-blue-900">
                                Hızlı İşlemler
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => dismissLead(selectedLead.id)}
                                className="flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                              >
                                Uygun değil — Geç
                              </button>
                              {[
                                { id: "CONTACTED", label: "İletişime Geçildi" },
                                { id: "QUOTED", label: "Teklif Verildi" },
                                { id: "CLOSED", label: "Kazandım" },
                                { id: "LOST", label: "Kaybettim" },
                              ].map((action) => (
                                <button
                                  key={action.id}
                                  disabled={
                                    selectedLead.status === action.id || isUpdating
                                  }
                                  onClick={() =>
                                    updateStatus(selectedLead.id, action.id)
                                  }
                                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                                    selectedLead.status === action.id
                                      ? "bg-blue-600 text-white"
                                      : "bg-white text-slate-700 hover:bg-slate-100"
                                  } disabled:opacity-50`}
                                >
                                  {action.label}
                                  {selectedLead.status === action.id && (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                  Bölge
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                  {selectedLead.district
                                    ? `${selectedLead.district}, ${selectedLead.city}`
                                    : selectedLead.city || "Konum belirtilmedi"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          <Calendar className="h-4 w-4" />
                          Oluşturulma:
                          {new Date(selectedLead.createdAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>

                        <Link
                          href="/business/dashboard"
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-600 hover:underline"
                        >
                          Dashboard'a Dön
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}