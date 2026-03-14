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
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

const COLOR_OPTIONS = ["blue", "emerald", "purple", "rose", "amber", "slate"];

const COLOR_CLASS_MAP = {
  blue: {
    dot: "bg-blue-500/20",
    icon: "text-blue-500",
    pill: "bg-blue-50 text-blue-600",
  },
  emerald: {
    dot: "bg-emerald-500/20",
    icon: "text-emerald-500",
    pill: "bg-emerald-50 text-emerald-600",
  },
  purple: {
    dot: "bg-purple-500/20",
    icon: "text-purple-500",
    pill: "bg-purple-50 text-purple-600",
  },
  rose: {
    dot: "bg-rose-500/20",
    icon: "text-rose-500",
    pill: "bg-rose-50 text-rose-600",
  },
  amber: {
    dot: "bg-amber-500/20",
    icon: "text-amber-500",
    pill: "bg-amber-50 text-amber-600",
  },
  slate: {
    dot: "bg-slate-500/20",
    icon: "text-slate-500",
    pill: "bg-slate-50 text-slate-600",
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
      const res = await fetch(`/api/business/notes?${params.toString()}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Notlar alınamadı.");

      setNotes(Array.isArray(data.notes) ? data.notes : []);
      setCategories(Array.isArray(data.categories) && data.categories.length ? data.categories : ["all"]);
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

    const tagText = recentTag ? `Öne çıkan etiket: ${recentTag}.` : "Henüz etiket bulunmuyor.";
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
      const targetUrl = editingNote ? `/api/business/notes/${editingNote.id}` : "/api/business/notes";
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
    setSaving(true);
    try {
      const res = await fetch(`/api/business/notes/${noteId}`, { method: "DELETE" });
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
      if (!res.ok) throw new Error(data.error || "Önemli not durumu güncellenemedi.");
      await fetchNotes();
    } catch (err) {
      toast.error(err.message || "Önemli not durumu güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-12 pb-24 max-w-[1600px] mx-auto px-6 font-sans antialiased text-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <DocumentTextIcon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <PencilIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">Dijital Not Defteri</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Business Notes Hub</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-10 py-6 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95"
          >
            <PlusIcon className="w-6 h-6" /> YENİ NOT
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mt-14 pt-10 border-t border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Toplam Arşiv</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{summary.total} Not</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Haftalık Fikir</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">+{summary.thisWeek} Yeni</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">Kritik Notlar</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-white tracking-tighter italic">{summary.important} Adet</span>
              <BoltIcon className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2">Kategorizasyon</p>
            <span className="text-4xl font-black text-white tracking-tighter italic">{summary.categories} Birim</span>
          </div>
        </div>
      </motion.div>

      <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 mx-2 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <MagnifyingGlassIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Not başlığı, içerik veya etiketlerde ara..."
            className="w-full h-20 pl-20 pr-8 bg-gray-50/50 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-[#004aad]/5 font-black text-lg border-2 border-transparent focus:border-[#004aad]/10 transition-all text-gray-900 placeholder:text-gray-400 italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                filterCategory === cat ? "bg-[#004aad] text-white shadow-2xl scale-105" : "bg-gray-50 text-gray-400 hover:text-[#004aad]"
              }`}
            >
              {cat === "all" ? "TÜMÜ" : String(cat).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mx-2 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 font-semibold">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mx-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-[3rem] bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="mx-2 rounded-[3rem] border border-gray-100 bg-white p-12 text-center text-gray-500 font-semibold">
          Not bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mx-2">
          <AnimatePresence mode="popLayout">
            {notes.map((note, idx) => {
              const color = COLOR_CLASS_MAP[note.color] || COLOR_CLASS_MAP.blue;
              const NoteIcon = getIconByCategory(note.category);
              const tags = Array.isArray(note.tags) ? note.tags : [];
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-[4.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden flex flex-col p-10"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 rounded-full blur-2xl -mr-16 -mt-16 ${color.dot}`} />

                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-16 h-16 rounded-[1.8rem] bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform shadow-inner ${color.icon}`}>
                      <NoteIcon className="w-8 h-8" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => togglePinned(note)}
                        className={`p-3 rounded-xl transition-all ${note.isPinned ? "bg-amber-50 text-amber-500" : "bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-500"}`}
                      >
                        <BoltIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(note)}
                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => deleteNote(note.id)}
                        className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="space-y-1">
                      <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${color.pill}`}>
                        {note.category}
                      </span>
                      <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter italic leading-none mt-2">
                        {note.title}
                      </h3>
                    </div>
                    <p className="text-sm font-medium text-gray-500 italic leading-relaxed line-clamp-4">
                      "{note.content}"
                    </p>

                    <div className="flex flex-wrap gap-2 pt-4">
                      {tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-gray-100">
                          <TagIcon className="w-3 h-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase italic">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-[#004aad]" />
                      <span>{new Date(note.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <span className="text-[#004aad]">{note.author?.name || "İsimsiz"}</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gray-950 rounded-[4rem] p-12 text-white relative overflow-hidden group mx-2"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
              <ArchiveBoxIcon className="w-10 h-10 text-blue-300" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                Not Özeti
              </h3>
              <p className="text-gray-300 max-w-xl text-sm leading-relaxed">{noteSummaryText}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] p-8 md:p-10 shadow-4xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">
                  {editingNote ? "Notu Düzenle" : "Yeni Not"}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-6" onSubmit={submitForm}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Not Başlığı</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none font-semibold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Kategori</label>
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none font-semibold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Renk Teması</label>
                    <select
                      value={form.color}
                      onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none font-semibold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10"
                    >
                      {COLOR_OPTIONS.map((color) => (
                        <option key={color} value={color}>
                          {color.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Etiketler (virgülle ayır)</label>
                  <input
                    type="text"
                    value={form.tagsText}
                    onChange={(e) => setForm((prev) => ({ ...prev, tagsText: e.target.value }))}
                    className="w-full h-14 px-5 bg-gray-50 rounded-2xl outline-none font-semibold text-gray-950 border-2 border-transparent focus:border-[#004aad]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Not İçeriği</label>
                  <textarea
                    rows="5"
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-medium text-gray-900 border-2 border-transparent focus:border-[#004aad]/10 resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm((prev) => ({ ...prev, isPinned: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Önemli not olarak sabitle
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-[#004aad] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl disabled:opacity-60"
                >
                  {saving ? "KAYDEDİLİYOR..." : editingNote ? "NOTU GÜNCELLE" : "NOTU KAYDET"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
