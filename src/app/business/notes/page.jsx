"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  DocumentTextIcon,
  ClockIcon,
  TagIcon,
  BoltIcon,
  ArchiveBoxIcon,
  LightBulbIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  AcademicCapIcon,
  CubeIcon,
  IdentificationIcon,
  Squares2X2Icon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const COLOR_OPTIONS = ["blue", "emerald", "purple", "rose", "amber", "slate"];

const COLOR_CLASS_MAP = {
  blue: {
    soft: "bg-blue-50 border-blue-100",
    iconWrap: "bg-blue-100 text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    accent: "from-blue-600 to-indigo-700",
  },
  emerald: {
    soft: "bg-emerald-50 border-emerald-100",
    iconWrap: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    accent: "from-emerald-500 to-emerald-700",
  },
  purple: {
    soft: "bg-purple-50 border-purple-100",
    iconWrap: "bg-purple-100 text-purple-700",
    badge: "bg-purple-100 text-purple-700",
    accent: "from-purple-500 to-violet-700",
  },
  rose: {
    soft: "bg-rose-50 border-rose-100",
    iconWrap: "bg-rose-100 text-rose-700",
    badge: "bg-rose-100 text-rose-700",
    accent: "from-rose-500 to-pink-700",
  },
  amber: {
    soft: "bg-amber-50 border-amber-100",
    iconWrap: "bg-amber-100 text-amber-700",
    badge: "bg-amber-100 text-amber-800",
    accent: "from-amber-400 to-orange-500",
  },
  slate: {
    soft: "bg-slate-50 border-slate-200",
    iconWrap: "bg-slate-100 text-slate-700",
    badge: "bg-slate-100 text-slate-700",
    accent: "from-slate-700 to-slate-900",
  },
};

function getIconByCategory(category) {
  const text = String(category || "").toLowerCase();
  if (text.includes("toplant")) return ChatBubbleBottomCenterTextIcon;
  if (text.includes("pazar")) return MegaphoneIcon;
  if (text.includes("insan") || text.includes("ik")) return AcademicCapIcon;
  if (text.includes("operasyon")) return CubeIcon;
  if (text.includes("strateji")) return IdentificationIcon;
  return LightBulbIcon;
}

function normalizeTagsInput(text) {
  return String(text || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    slate: "from-slate-800 to-slate-900 text-white",
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

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "white",
  className = "",
  type = "button",
  disabled = false,
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
    rose: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function ModalShell({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Not İşlemi
              </p>
              <h2 className="mt-1 text-lg font-bold">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 p-2 transition hover:bg-white/15"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-5">{children}</div>

        {footer ? (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState(["all"]);
  const [summary, setSummary] = useState({
    total: 0,
    thisWeek: 0,
    categories: 0,
    important: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "Genel",
    color: "blue",
    tagsText: "",
    isPinned: false,
  });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (filterCategory !== "all") params.set("category", filterCategory);
      params.set("limit", "100");

      const res = await fetch(`/api/business/notes?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Notlar alınamadı.");

      setNotes(Array.isArray(data.notes) ? data.notes : []);
      setCategories(
        Array.isArray(data.categories) && data.categories.length
          ? data.categories
          : ["all"]
      );
      setSummary({
        total: Number(data.summary?.total || 0),
        thisWeek: Number(data.summary?.thisWeek || 0),
        categories: Number(data.summary?.categories || 0),
        important: Number(data.summary?.important || 0),
      });
    } catch (e) {
      setNotes([]);
      setCategories(["all"]);
      setSummary({ total: 0, thisWeek: 0, categories: 0, important: 0 });
      setError(e.message || "Notlar alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(fetchNotes, searchTerm ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchNotes, searchTerm]);

  const noteSummaryText = useMemo(() => {
    if (!notes.length) return "Henüz not bulunmuyor. İlk notunuzu ekleyin.";

    const topCategory = Object.entries(
      notes.reduce((acc, item) => {
        const key = String(item.category || "Genel");
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0];

    const recentTag = notes
      .flatMap((item) => (Array.isArray(item.tags) ? item.tags : []))
      .map((tag) => String(tag || "").trim())
      .filter(Boolean)[0];

    const tagText = recentTag
      ? `Öne çıkan etiket: ${recentTag}.`
      : "Henüz etiket bulunmuyor.";

    return `En yoğun kategori: ${topCategory || "Genel"}. ${tagText}`;
  }, [notes]);

  function openCreateModal() {
    setEditingNote(null);
    setForm({
      title: "",
      content: "",
      category: "Genel",
      color: "blue",
      tagsText: "",
      isPinned: false,
    });
    setIsModalOpen(true);
  }

  function openEditModal(note) {
    setEditingNote(note);
    setForm({
      title: note.title || "",
      content: note.content || "",
      category: note.category || "Genel",
      color: note.color || "blue",
      tagsText: Array.isArray(note.tags) ? note.tags.join(", ") : "",
      isPinned: Boolean(note.isPinned),
    });
    setIsModalOpen(true);
  }

  async function submitForm(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Not başlığı zorunlu.");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Not içeriği zorunlu.");
      return;
    }

    setSaving(true);
    try {
      const method = editingNote ? "PATCH" : "POST";
      const targetUrl = editingNote
        ? `/api/business/notes/${editingNote.id}`
        : "/api/business/notes";

      const payload = {
        title: form.title,
        content: form.content,
        category: form.category,
        color: form.color,
        tags: normalizeTagsInput(form.tagsText),
        isPinned: form.isPinned,
      };

      const res = await fetch(targetUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Not kaydedilemedi.");

      toast.success(editingNote ? "Not güncellendi." : "Not oluşturuldu.");
      setIsModalOpen(false);
      await fetchNotes();
    } catch (err) {
      toast.error(err.message || "Not kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(noteId) {
    if (!confirm("Bu not silinsin mi?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/business/notes/${noteId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || "Not silinemedi.");

      toast.success("Not arşivlendi.");
      await fetchNotes();
    } catch (err) {
      toast.error(err.message || "Not silinemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePinned(note) {
    setSaving(true);
    try {
      const res = await fetch(`/api/business/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Önemli not durumu güncellenemedi.");
      }

      await fetchNotes();
    } catch (err) {
      toast.error(err.message || "Önemli not durumu güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 pb-16 pt-8">
        <div className="mx-auto flex max-w-6xl justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 pb-16 pt-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <DocumentTextIcon className="h-4 w-4" />
                  Not Yönetimi
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Dijital Not Defteri
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Toplantı, operasyon, pazarlama ve strateji notlarınızı tek merkezde
                  yönetin. Etiketleyin, sabitleyin ve hızlıca bulun.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={openCreateModal} icon={PlusIcon} tone="green">
                  Yeni Not Ekle
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Toplam Not"
              value={summary.total}
              sub="Tüm not kayıtları"
              icon={Squares2X2Icon}
              tone="blue"
            />
            <StatCard
              title="Bu Hafta"
              value={summary.thisWeek}
              sub="Yeni eklenen notlar"
              icon={ClockIcon}
              tone="emerald"
            />
            <StatCard
              title="Önemli"
              value={summary.important}
              sub="Sabitlenmiş notlar"
              icon={BoltIcon}
              tone="amber"
            />
            <StatCard
              title="Kategori"
              value={summary.categories}
              sub="Kullanılan kategori sayısı"
              icon={ArchiveBoxIcon}
              tone="slate"
            />
          </div>
        </section>

        <SectionCard
          title="Not Özeti"
          subtitle="Arşiv içinden kısa görünüm"
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
            {noteSummaryText}
          </div>
        </SectionCard>

        <SectionCard
          title="Filtreler"
          subtitle="Arama ve kategori bazlı daraltma"
        >
          <div className="flex flex-col gap-4">
            <div className="relative max-w-xl">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Not başlığı, içerik veya etiketlerde ara..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition ${
                    filterCategory === cat
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat === "all" ? "Tümü" : String(cat)}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <SectionCard
          title="Not Kartları"
          subtitle="Düzenlemek için ilgili karttaki butonları kullanın"
        >
          {notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
              <p className="text-sm font-medium text-slate-500">
                Not bulunamadı.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {notes.map((note, idx) => {
                  const color = COLOR_CLASS_MAP[note.color] || COLOR_CLASS_MAP.blue;
                  const NoteIcon = getIconByCategory(note.category);
                  const tags = Array.isArray(note.tags) ? note.tags : [];

                  return (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`relative overflow-hidden rounded-[24px] border bg-white p-5 shadow-sm transition hover:shadow-md ${color.soft}`}
                    >
                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/50 blur-2xl" />

                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color.iconWrap}`}
                          >
                            <NoteIcon className="h-6 w-6" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${color.badge}`}
                              >
                                {note.category || "Genel"}
                              </span>
                              {note.isPinned ? (
                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                                  Önemli
                                </span>
                              ) : null}
                            </div>

                            <h3 className="mt-2 line-clamp-2 text-lg font-bold tracking-tight text-slate-900">
                              {note.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => togglePinned(note)}
                            className={`rounded-lg p-2 transition ${
                              note.isPinned
                                ? "bg-amber-100 text-amber-700"
                                : "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                            }`}
                            title="Sabitlenmiş not"
                          >
                            <BoltIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(note)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title="Düzenle"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => deleteNote(note.id)}
                            className="rounded-lg p-2 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            title="Sil"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="relative mt-4 line-clamp-5 text-sm leading-6 text-slate-600">
                        {note.content}
                      </p>

                      {tags.length > 0 ? (
                        <div className="relative mt-4 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600"
                            >
                              <TagIcon className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="relative mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-slate-400" />
                          <span>
                            {new Date(note.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <span>{note.author?.name || "İsimsiz"}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </SectionCard>
      </div>

      <AnimatePresence>
        {isModalOpen ? (
          <ModalShell
            title={editingNote ? "Notu Düzenle" : "Yeni Not"}
            onClose={() => setIsModalOpen(false)}
            footer={
              <div className="flex justify-end gap-3">
                <ActionButton
                  onClick={() => setIsModalOpen(false)}
                  tone="white"
                >
                  Vazgeç
                </ActionButton>
                <ActionButton
                  type="submit"
                  onClick={submitForm}
                  icon={CheckCircleIcon}
                  tone="green"
                  disabled={saving}
                >
                  {saving
                    ? "Kaydediliyor..."
                    : editingNote
                    ? "Notu Güncelle"
                    : "Notu Kaydet"}
                </ActionButton>
              </div>
            }
          >
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submitForm}>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Not Başlığı
                </span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Kategori
                </span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Renk Teması
                </span>
                <select
                  value={form.color}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>
                      {color.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Etiketler
                </span>
                <input
                  type="text"
                  value={form.tagsText}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, tagsText: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="Örn: toplantı, ürün, kampanya"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Not İçeriği
                </span>
                <textarea
                  rows="7"
                  value={form.content}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, content: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 resize-none"
                />
              </label>

              <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isPinned: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Önemli not olarak sabitle
              </label>
            </form>
          </ModalShell>
        ) : null}
      </AnimatePresence>
    </div>
  );
}