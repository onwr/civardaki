"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

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
  PENDING: { label: "Beklemede", color: "text-amber-600 bg-amber-50", icon: ClockIcon },
  CONFIRMED: { label: "Onaylandı", color: "text-blue-600 bg-blue-50", icon: CheckCircleIcon },
  COMPLETED: { label: "Tamamlandı", color: "text-emerald-600 bg-emerald-50", icon: CheckCircleIcon },
  CANCELLED: { label: "İptal", color: "text-rose-600 bg-rose-50", icon: XCircleIcon },
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
    return { total, pending, confirmed };
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
      const res = await fetch(`/api/business/reservations/availability/${id}`, { method: "DELETE" });
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
      optionsText: Array.isArray(qItem.options) ? qItem.options.map((o) => o.label).join("\n") : "",
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
      const res = await fetch(`/api/business/reservations/questions/${id}`, { method: "DELETE" });
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
    <div className="space-y-8 pb-16">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#004aad] text-white rounded-3xl p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tight uppercase">
              Rezervasyon Yönetimi
            </h1>
            <p className="text-blue-100 mt-2 font-semibold">
              Gelen talepleri yönetin, açık saatleri ayarlayın ve rezervasyon sorularını özelleştirin.
            </p>
          </div>
          <label className="inline-flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl">
            <span className="font-semibold text-sm">Rezervasyon Alımı</span>
            <button
              type="button"
              onClick={handleToggle}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                reservationEnabled ? "bg-emerald-400" : "bg-slate-400"
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                  reservationEnabled ? "right-1" : "left-1"
                }`}
              />
            </button>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Stat title="Toplam" value={totals.total} />
          <Stat title="Bekleyen" value={totals.pending} />
          <Stat title="Onaylı" value={totals.confirmed} />
        </div>
      </motion.section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-5">
          <h2 className="text-lg font-black text-slate-900 mb-4">Açık Gün / Saat Yönetimi</h2>
          <form onSubmit={addAvailability} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <select
              value={availabilityForm.dayOfWeek}
              onChange={(e) => setAvailabilityForm((p) => ({ ...p, dayOfWeek: e.target.value }))}
              className="h-11 rounded-xl border border-slate-200 px-3"
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
              className="h-11 rounded-xl border border-slate-200 px-3"
            />
            <input
              type="time"
              value={availabilityForm.endTime}
              onChange={(e) => setAvailabilityForm((p) => ({ ...p, endTime: e.target.value }))}
              className="h-11 rounded-xl border border-slate-200 px-3"
            />
            <button className="h-11 rounded-xl bg-slate-950 text-white font-semibold">Ekle</button>
          </form>
          <div className="mt-4 space-y-2 max-h-64 overflow-auto">
            {metaLoading ? (
              <p className="text-sm text-slate-500">Yükleniyor...</p>
            ) : availability.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz saat aralığı tanımlanmadı.</p>
            ) : (
              availability.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl">
                  <p className="text-sm font-semibold text-slate-700">
                    {DAY_OPTIONS.find((d) => d.value === row.dayOfWeek)?.label || row.dayOfWeek} • {row.startTime} -{" "}
                    {row.endTime}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleAvailability(row)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                        row.isEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {row.isEnabled ? "Açık" : "Kapalı"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAvailability(row.id)}
                      className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-rose-100 text-rose-700"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5">
          <h2 className="text-lg font-black text-slate-900 mb-4">Rezervasyon Özel Soruları</h2>
          <form onSubmit={submitQuestion} className="space-y-2">
            <input
              value={questionForm.label}
              onChange={(e) => setQuestionForm((p) => ({ ...p, label: e.target.value }))}
              placeholder="Soru metni"
              className="w-full h-11 rounded-xl border border-slate-200 px-3"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={questionForm.type}
                onChange={(e) => setQuestionForm((p) => ({ ...p, type: e.target.value }))}
                className="h-11 rounded-xl border border-slate-200 px-3"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-4 px-3 h-11 rounded-xl border border-slate-200">
                <label className="text-sm text-slate-700 inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={questionForm.isRequired}
                    onChange={(e) => setQuestionForm((p) => ({ ...p, isRequired: e.target.checked }))}
                  />
                  Zorunlu
                </label>
                <label className="text-sm text-slate-700 inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={questionForm.isActive}
                    onChange={(e) => setQuestionForm((p) => ({ ...p, isActive: e.target.checked }))}
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            )}
            <div className="flex items-center gap-2">
              <button className="h-10 px-4 rounded-xl bg-slate-950 text-white font-semibold">
                {editingQuestionId ? "Soruyu Güncelle" : "Soru Ekle"}
              </button>
              {editingQuestionId && (
                <button
                  type="button"
                  onClick={resetQuestionForm}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Vazgeç
                </button>
              )}
            </div>
          </form>

          <div className="mt-4 space-y-2 max-h-64 overflow-auto">
            {metaLoading ? (
              <p className="text-sm text-slate-500">Yükleniyor...</p>
            ) : questions.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz soru eklenmedi.</p>
            ) : (
              questions.map((qItem) => (
                <div key={qItem.id} className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{qItem.label}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editQuestion(qItem)}
                        className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-blue-100 text-blue-700"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => quickToggleQuestion(qItem, "isActive")}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                          qItem.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {qItem.isActive ? "Aktif" : "Pasif"}
                      </button>
                      <button
                        type="button"
                        onClick={() => quickToggleQuestion(qItem, "isRequired")}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                          qItem.isRequired ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {qItem.isRequired ? "Zorunlu" : "Opsiyonel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(qItem.id)}
                        className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-rose-100 text-rose-700"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {QUESTION_TYPES.find((t) => t.value === qItem.type)?.label || qItem.type}
                  </p>
                  {Array.isArray(qItem.options) && qItem.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {qItem.options.map((opt) => (
                        <span
                          key={opt.id}
                          className="inline-flex text-[11px] px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600"
                        >
                          {opt.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-3xl p-5">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Müşteri, telefon, e-posta veya hizmet ara..."
              className="w-full h-12 pl-11 pr-3 rounded-xl border border-slate-200 outline-none focus:border-[#004aad]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 px-3 rounded-xl border border-slate-200"
            >
              <option value="all">Tüm Durumlar</option>
              {STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {STATUS_META[value].label}
                </option>
              ))}
            </select>
            <button className="h-12 px-5 rounded-xl bg-slate-950 text-white font-semibold">
              Ara
            </button>
          </div>
        </form>
      </section>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#004aad] rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center justify-between">
          <p className="text-rose-700 font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchReservations}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg"
          >
            Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const status = STATUS_META[item.status] || STATUS_META.PENDING;
            return (
              <article key={item.id} className="bg-white border border-slate-100 rounded-2xl p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 font-semibold">
                      {prettyDate(item.startAt)} - {prettyDate(item.endAt).slice(11)}
                    </p>
                    <h3 className="text-xl font-black italic text-slate-900 mt-1">{item.customerName}</h3>
                    <p className="text-slate-600 font-semibold">{item.serviceName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.customerPhone || "-"} {item.customerEmail ? `• ${item.customerEmail}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${status.color}`}
                    >
                      <status.icon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold"
                    >
                      <PencilSquareIcon className="w-4 h-4" /> Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteReservation(item.id)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-sm font-semibold"
                    >
                      <TrashIcon className="w-4 h-4" /> Sil
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {items.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500 font-semibold">
              Filtreye uygun rezervasyon bulunamadı.
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black italic text-slate-900">Rezervasyon Düzenle</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={form.customerName}
                onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="Müşteri adı"
                className="h-11 px-3 rounded-lg border border-slate-200"
              />
              <input
                value={form.customerPhone}
                onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="Telefon"
                className="h-11 px-3 rounded-lg border border-slate-200"
              />
              <input
                value={form.customerEmail}
                onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="E-posta"
                className="h-11 px-3 rounded-lg border border-slate-200"
              />
              <input
                value={form.serviceName}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceName: e.target.value }))}
                placeholder="Hizmet adı"
                className="h-11 px-3 rounded-lg border border-slate-200"
              />
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
                className="h-11 px-3 rounded-lg border border-slate-200"
              />
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
                className="h-11 px-3 rounded-lg border border-slate-200"
              />
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="h-11 px-3 rounded-lg border border-slate-200"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_META[status].label}
                  </option>
                ))}
              </select>
              <div className="hidden md:block" />
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notlar"
                className="md:col-span-2 p-3 rounded-lg border border-slate-200"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={saveEdit}
                className="px-5 py-2 rounded-lg bg-[#004aad] text-white font-semibold disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white/10 rounded-xl p-4 border border-white/10">
      <p className="text-xs uppercase tracking-wider text-blue-100 font-bold">{title}</p>
      <p className="text-3xl font-black italic mt-1">{value}</p>
    </div>
  );
}
