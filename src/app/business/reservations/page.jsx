"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  CalendarDays,
  Settings2,
  ClipboardList,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
const DAY_OPTIONS = [
  { value: "MONDAY", label: "Pazartesi" },
  { value: "TUESDAY", label: "Salı" },
  { value: "WEDNESDAY", label: "Çarşamba" },
  { value: "THURSDAY", label: "Perşembe" },
  { value: "FRIDAY", label: "Cuma" },
  { value: "SATURDAY", label: "Cumartesi" },
  { value: "SUNDAY", label: "Pazar" },
];
const QUESTION_TYPES = [
  { value: "TEXT", label: "Uzun Metin" },
  { value: "SHORT_ANSWER", label: "Kısa Cevap" },
  { value: "SINGLE_CHOICE", label: "Tek Seçim" },
  { value: "MULTI_CHOICE", label: "Çoklu Seçim" },
];

const STATUS_META = {
  PENDING: { label: "Beklemede", color: "text-amber-700 bg-amber-50 border-amber-200", icon: ClockIcon },
  CONFIRMED: { label: "Onaylandı", color: "text-blue-700 bg-blue-50 border-blue-200", icon: CheckCircleIcon },
  COMPLETED: { label: "Tamamlandı", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircleIcon },
  CANCELLED: { label: "İptal", color: "text-rose-700 bg-rose-50 border-rose-200", icon: XCircleIcon },
};

function toInputDateTime(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

function prettyDate(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isChoiceType(type) {
  return type === "SINGLE_CHOICE" || type === "MULTI_CHOICE";
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

export default function ReservationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reservationEnabled, setReservationEnabled] = useState(true);
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceName: "",
    notes: "",
    status: "PENDING",
    startAt: "",
    endAt: "",
  });
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "18:00",
    isEnabled: true,
  });
  const [questionForm, setQuestionForm] = useState({
    label: "",
    type: "TEXT",
    isRequired: false,
    isActive: true,
    optionsText: "",
  });

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/business/reservations?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Rezervasyonlar getirilemedi.");
        return;
      }

      setReservationEnabled(data.reservationEnabled !== false);
      setItems(Array.isArray(data.reservations) ? data.reservations : []);
    } catch {
      setError("Rezervasyonlar yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    setMetaLoading(true);
    try {
      const res = await fetch("/api/business/reservations/settings", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Ayarlar alınamadı.");

      setReservationEnabled(data.reservationEnabled !== false);
      setAvailability(Array.isArray(data.availability) ? data.availability : []);
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
    } catch (e) {
      toast.error(e.message || "Rezervasyon meta verileri yüklenemedi.");
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  useEffect(() => {
    fetchMeta();
  }, []);

  const totals = useMemo(() => {
    const total = items.length;
    const pending = items.filter((i) => i.status === "PENDING").length;
    const confirmed = items.filter((i) => i.status === "CONFIRMED").length;
    const completed = items.filter((i) => i.status === "COMPLETED").length;
    return { total, pending, confirmed, completed };
  }, [items]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReservations();
  };

  const handleToggle = async () => {
    const nextValue = !reservationEnabled;
    setReservationEnabled(nextValue);

    try {
      const res = await fetch("/api/business/reservations/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationEnabled: nextValue }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setReservationEnabled(!nextValue);
        toast.error(data.error || "Ayar güncellenemedi.");
        return;
      }

      toast.success(nextValue ? "Rezervasyon alımı açıldı." : "Rezervasyon alımı kapatıldı.");
    } catch {
      setReservationEnabled(!nextValue);
      toast.error("Ayar güncellenirken hata oluştu.");
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      customerName: item.customerName || "",
      customerPhone: item.customerPhone || "",
      customerEmail: item.customerEmail || "",
      serviceName: item.serviceName || "",
      notes: item.notes || "",
      status: item.status || "PENDING",
      startAt: toInputDateTime(item.startAt),
      endAt: toInputDateTime(item.endAt),
    });
  };

  const saveEdit = async () => {
    if (!editing?.id) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/business/reservations/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          startAt: new Date(form.startAt).toISOString(),
          endAt: new Date(form.endAt).toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Rezervasyon güncellenemedi.");
        return;
      }

      toast.success("Rezervasyon güncellendi.");
      setEditing(null);
      fetchReservations();
    } catch {
      toast.error("Güncelleme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const deleteReservation = async (id) => {
    if (!id) return;
    if (!window.confirm("Bu rezervasyonu silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/business/reservations/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Rezervasyon silinemedi.");
        return;
      }

      toast.success("Rezervasyon silindi.");
      fetchReservations();
    } catch {
      toast.error("Silme sırasında hata oluştu.");
    }
  };

  const addAvailability = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/business/reservations/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(availabilityForm),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Saat aralığı eklenemedi.");
        return;
      }

      toast.success("Saat aralığı eklendi.");
      setAvailabilityForm((prev) => ({ ...prev, startTime: "09:00", endTime: "18:00" }));
      fetchMeta();
    } catch {
      toast.error("Saat aralığı ekleme sırasında hata oluştu.");
    }
  };

  const toggleAvailability = async (row) => {
    try {
      const res = await fetch(`/api/business/reservations/availability/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !row.isEnabled }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Saat aralığı güncellenemedi.");
        return;
      }

      fetchMeta();
    } catch {
      toast.error("Saat aralığı güncellenirken hata oluştu.");
    }
  };

  const deleteAvailability = async (id) => {
    if (!window.confirm("Bu saat aralığını kaldırmak istiyor musunuz?")) return;

    try {
      const res = await fetch(`/api/business/reservations/availability/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Saat aralığı silinemedi.");
        return;
      }

      toast.success("Saat aralığı silindi.");
      fetchMeta();
    } catch {
      toast.error("Saat aralığı silinirken hata oluştu.");
    }
  };

  const resetQuestionForm = () => {
    setEditingQuestionId("");
    setQuestionForm({
      label: "",
      type: "TEXT",
      isRequired: false,
      isActive: true,
      optionsText: "",
    });
  };

  const submitQuestion = async (e) => {
    e.preventDefault();

    const options = questionForm.optionsText
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    const payload = {
      label: questionForm.label,
      type: questionForm.type,
      isRequired: questionForm.isRequired,
      isActive: questionForm.isActive,
      options,
    };

    const isEdit = Boolean(editingQuestionId);
    const url = isEdit
      ? `/api/business/reservations/questions/${editingQuestionId}`
      : "/api/business/reservations/questions";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Soru kaydedilemedi.");
        return;
      }

      toast.success(isEdit ? "Soru güncellendi." : "Soru eklendi.");
      resetQuestionForm();
      fetchMeta();
    } catch {
      toast.error("Soru kaydedilirken hata oluştu.");
    }
  };

  const editQuestion = (qItem) => {
    setEditingQuestionId(qItem.id);
    setQuestionForm({
      label: qItem.label || "",
      type: qItem.type || "TEXT",
      isRequired: Boolean(qItem.isRequired),
      isActive: qItem.isActive !== false,
      optionsText: Array.isArray(qItem.options)
        ? qItem.options.map((o) => o.label).join("\n")
        : "",
    });
  };

  const quickToggleQuestion = async (qItem, field) => {
    try {
      const res = await fetch(`/api/business/reservations/questions/${qItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !qItem[field] }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Soru güncellenemedi.");
        return;
      }

      fetchMeta();
    } catch {
      toast.error("Soru güncellenirken hata oluştu.");
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Bu soruyu kaldırmak istiyor musunuz?")) return;

    try {
      const res = await fetch(`/api/business/reservations/questions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Soru silinemedi.");
        return;
      }

      toast.success("Soru silindi.");
      if (editingQuestionId === id) resetQuestionForm();
      fetchMeta();
    } catch {
      toast.error("Soru silinirken hata oluştu.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <CalendarDays className="h-4 w-4" />
                  Hizmet Takvimi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Rezervasyon Yönetimi
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Gelen rezervasyon taleplerini yönetin, açık gün ve saat aralıklarını
                  belirleyin, rezervasyon formundaki soruları özelleştirin.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                      Rezervasyon Alımı
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {reservationEnabled ? "Şu anda aktif" : "Şu anda kapalı"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggle}
                    className={`relative h-8 w-14 rounded-full transition-colors ${
                      reservationEnabled ? "bg-emerald-400" : "bg-slate-400"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
                        reservationEnabled ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Rezervasyon"
              value={totals.total}
              sub="Tüm kayıtlar"
              icon={ClipboardList}
              tone="blue"
            />
            <StatCard
              title="Bekleyen"
              value={totals.pending}
              sub="İşlem bekleyen kayıtlar"
              icon={ClockIcon}
              tone="amber"
            />
            <StatCard
              title="Onaylı"
              value={totals.confirmed}
              sub="Onaylanmış talepler"
              icon={CheckCircleIcon}
              tone="rose"
            />
            <StatCard
              title="Tamamlanan"
              value={totals.completed}
              sub="Sonuçlanan rezervasyonlar"
              icon={CheckCircleIcon}
              tone="emerald"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard
            title="Açık gün / saat yönetimi"
            subtitle="Rezervasyon alınabilecek gün ve saat aralıklarını belirleyin"
            right={<Settings2 className="h-5 w-5 text-slate-400" />}
          >
            <form onSubmit={addAvailability} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <select
                value={availabilityForm.dayOfWeek}
                onChange={(e) => setAvailabilityForm((p) => ({ ...p, dayOfWeek: e.target.value }))}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={availabilityForm.startTime}
                onChange={(e) => setAvailabilityForm((p) => ({ ...p, startTime: e.target.value }))}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
              />

              <input
                type="time"
                value={availabilityForm.endTime}
                onChange={(e) => setAvailabilityForm((p) => ({ ...p, endTime: e.target.value }))}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
              />

              <button className="h-12 rounded-2xl bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-800">
                Ekle
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {metaLoading ? (
                <p className="text-sm text-slate-500">Yükleniyor...</p>
              ) : availability.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-500">
                  Henüz saat aralığı tanımlanmadı.
                </div>
              ) : (
                availability.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <p className="text-sm font-semibold text-slate-700">
                      {DAY_OPTIONS.find((d) => d.value === row.dayOfWeek)?.label || row.dayOfWeek}
                      {" · "}
                      {row.startTime} - {row.endTime}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAvailability(row)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold ${
                          row.isEnabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {row.isEnabled ? "Açık" : "Kapalı"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteAvailability(row.id)}
                        className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Rezervasyon özel soruları"
            subtitle="Kullanıcıların rezervasyon sırasında dolduracağı alanları yönetin"
            right={<Sparkles className="h-5 w-5 text-slate-400" />}
          >
            <form onSubmit={submitQuestion} className="space-y-3">
              <input
                value={questionForm.label}
                onChange={(e) => setQuestionForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="Soru metni"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  value={questionForm.type}
                  onChange={(e) => setQuestionForm((p) => ({ ...p, type: e.target.value }))}
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <div className="flex h-12 items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={questionForm.isRequired}
                      onChange={(e) =>
                        setQuestionForm((p) => ({ ...p, isRequired: e.target.checked }))
                      }
                    />
                    Zorunlu
                  </label>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={questionForm.isActive}
                      onChange={(e) =>
                        setQuestionForm((p) => ({ ...p, isActive: e.target.checked }))
                      }
                    />
                    Aktif
                  </label>
                </div>
              </div>

              {isChoiceType(questionForm.type) && (
                <textarea
                  rows={3}
                  value={questionForm.optionsText}
                  onChange={(e) => setQuestionForm((p) => ({ ...p, optionsText: e.target.value }))}
                  placeholder={"Seçenekler (her satıra bir seçenek)\nÖr: Evet\nHayır"}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                />
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button className="h-11 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800">
                  {editingQuestionId ? "Soruyu Güncelle" : "Soru Ekle"}
                </button>

                {editingQuestionId && (
                  <button
                    type="button"
                    onClick={resetQuestionForm}
                    className="h-11 rounded-2xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>
                )}
              </div>
            </form>

            <div className="mt-5 space-y-3">
              {metaLoading ? (
                <p className="text-sm text-slate-500">Yükleniyor...</p>
              ) : questions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-500">
                  Henüz soru eklenmedi.
                </div>
              ) : (
                questions.map((qItem) => (
                  <div key={qItem.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{qItem.label}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {QUESTION_TYPES.find((t) => t.value === qItem.type)?.label || qItem.type}
                        </p>

                        {Array.isArray(qItem.options) && qItem.options.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {qItem.options.map((opt) => (
                              <span
                                key={opt.id}
                                className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600"
                              >
                                {opt.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editQuestion(qItem)}
                          className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700"
                        >
                          Düzenle
                        </button>

                        <button
                          type="button"
                          onClick={() => quickToggleQuestion(qItem, "isActive")}
                          className={`rounded-xl px-3 py-2 text-xs font-bold ${
                            qItem.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {qItem.isActive ? "Aktif" : "Pasif"}
                        </button>

                        <button
                          type="button"
                          onClick={() => quickToggleQuestion(qItem, "isRequired")}
                          className={`rounded-xl px-3 py-2 text-xs font-bold ${
                            qItem.isRequired
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {qItem.isRequired ? "Zorunlu" : "Opsiyonel"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteQuestion(qItem.id)}
                          className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Rezervasyon arama ve filtreleme"
          subtitle="Müşteri, telefon, e-posta veya hizmet adına göre arayın"
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Müşteri, telefon, e-posta veya hizmet ara..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
              >
                <option value="all">Tüm Durumlar</option>
                {STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {STATUS_META[value].label}
                  </option>
                ))}
              </select>

              <button className="h-12 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white transition hover:bg-slate-800">
                Ara
              </button>
            </div>
          </form>
        </SectionCard>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
          </div>
        ) : error ? (
          <SectionCard title="Bir sorun oluştu" subtitle="Rezervasyonlar yüklenemedi">
            <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-semibold text-rose-700">{error}</p>
              <button
                type="button"
                onClick={fetchReservations}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white"
              >
                Tekrar Dene
              </button>
            </div>
          </SectionCard>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const status = STATUS_META[item.status] || STATUS_META.PENDING;

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-500">
                        {prettyDate(item.startAt)} - {prettyDate(item.endAt).slice(11)}
                      </p>

                      <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                        {item.customerName}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {item.serviceName}
                      </p>

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {item.customerPhone || "-"}
                        {item.customerEmail ? ` • ${item.customerEmail}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${status.color}`}
                      >
                        <status.icon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>

                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-white"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Düzenle
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteReservation(item.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Sil
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {items.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  Filtreye uygun rezervasyon bulunamadı.
                </p>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.98 }}
                className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                      Rezervasyon Düzenle
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Kayıt detaylarını güncelleyin
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Müşteri adı"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                  <input
                    value={form.customerPhone}
                    onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="Telefon"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                  <input
                    value={form.customerEmail}
                    onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="E-posta"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                  <input
                    value={form.serviceName}
                    onChange={(e) => setForm((prev) => ({ ...prev, serviceName: e.target.value }))}
                    placeholder="Hizmet adı"
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                  <input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                  <input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_META[status].label}
                      </option>
                    ))}
                  </select>

                  <div className="hidden md:block" />

                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notlar"
                    className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveEdit}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}