"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BookOpenIcon,
  PlusIcon,
  XMarkIcon,
  BookmarkIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  TrashIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

/* ── Renk haritası ───────────────────────────────────────────── */
const COLOR_MAP = {
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",    dot: "bg-blue-500",    text: "text-blue-700"    },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", text: "text-emerald-700" },
  purple:  { bg: "bg-purple-50",  border: "border-purple-200",  dot: "bg-purple-500",  text: "text-purple-700"  },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    dot: "bg-rose-500",    text: "text-rose-700"    },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-500",   text: "text-amber-700"   },
  slate:   { bg: "bg-slate-50",   border: "border-slate-200",   dot: "bg-slate-500",   text: "text-slate-700"   },
};
const COLORS = Object.keys(COLOR_MAP);

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

/* ── Hızlı not kartı ─────────────────────────────────────────── */
function NoteCard({ note, onPin, onDelete }) {
  const c = COLOR_MAP[note.color] || COLOR_MAP.blue;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative rounded-xl border ${c.border} ${c.bg} px-3 py-2.5 text-sm`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
        <div className="min-w-0 flex-1">
          <p className={`font-semibold truncate ${c.text}`}>{note.title}</p>
          {note.content && (
            <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {note.content}
            </p>
          )}
          <p className="mt-1 text-[10px] text-slate-400">{fmtDate(note.createdAt)}</p>
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => onPin(note)}
            title={note.isPinned ? "Sabiti kaldır" : "Sabitle"}
            className="rounded-md p-1 text-slate-400 hover:text-amber-500 hover:bg-white/60"
          >
            {note.isPinned ? (
              <BookmarkSolidIcon className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <BookmarkIcon className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            title="Sil"
            className="rounded-md p-1 text-slate-400 hover:text-rose-500 hover:bg-white/60"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Yeni not formu ──────────────────────────────────────────── */
function QuickNoteForm({ onCreated, onCancel }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("blue");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Başlık zorunludur."); return; }
    if (!content.trim()) { toast.error("İçerik zorunludur."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/business/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, color, category: "Genel" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
      toast.success("Not eklendi ✓");
      onCreated();
    } catch (e) {
      toast.error(e.message || "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3 space-y-2"
    >
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Not başlığı..."
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Not içeriği..."
        rows={3}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 resize-none"
      />
      {/* Renk seçici */}
      <div className="flex gap-1.5 items-center">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mr-1">Renk</span>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            title={c}
            className={`h-5 w-5 rounded-full ${COLOR_MAP[c].dot} transition-all ${
              color === c ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : "opacity-60 hover:opacity-100"
            }`}
          />
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-xl bg-[#004aad] py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          İptal
        </button>
      </div>
    </motion.div>
  );
}

/* ── Ajanda sekmesi (bugünün takvim etkinlikleri + randevular) ── */
function AgendaTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().slice(0, 10);
    fetch(`/api/business/calendar?from=${today}&to=${today}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const list = Array.isArray(d.events) ? d.events : [];
        setEvents(list);
      })
      .catch(() => { if (!cancelled) setEvents([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const SOURCE_STYLES = {
    RESERVATION: {
      bg: "bg-purple-50 border-purple-100",
      icon: "bg-purple-100 text-purple-600",
      badge: "bg-purple-100 text-purple-700",
      label: "Randevu",
    },
    CALENDAR: {
      bg: "bg-blue-50 border-blue-100",
      icon: "bg-blue-100 text-[#004aad]",
      badge: "bg-blue-100 text-[#004aad]",
      label: "Etkinlik",
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 px-1 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-10 text-center">
        <CalendarDaysIcon className="h-10 w-10 text-slate-200 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-400">Bugün etkinlik veya randevu yok</p>
        <Link
          href="/business/calendar"
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#004aad] hover:underline"
        >
          Takvime git <ChevronRightIcon className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {events.slice(0, 10).map((ev) => {
        const style = SOURCE_STYLES[ev.source] || SOURCE_STYLES.CALENDAR;
        const time = ev.startTime
          ? new Date(ev.startTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
          : null;
        const endTime = ev.endTime
          ? new Date(ev.endTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
          : null;
        return (
          <div
            key={`${ev.source}-${ev.id}`}
            className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${style.bg}`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.icon}`}>
              <CalendarDaysIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold text-slate-800 truncate">{ev.title || "Etkinlik"}</p>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide ${style.badge}`}>
                  {style.label}
                </span>
              </div>
              {ev.customerName && (
                <p className="mt-0.5 text-[11px] text-slate-500 truncate">{ev.customerName}</p>
              )}
              {time && (
                <p className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-400 font-medium">
                  <ClockIcon className="h-3 w-3 shrink-0" />
                  {time}{endTime ? ` – ${endTime}` : ""}
                </p>
              )}
            </div>
          </div>
        );
      })}
      <Link
        href="/business/calendar"
        className="flex items-center justify-center gap-1 py-2 text-xs font-bold text-[#004aad] hover:underline"
      >
        Tüm takvimi gör <ChevronRightIcon className="h-3 w-3" />
      </Link>
    </div>
  );
}

/* ── Ana bileşen ─────────────────────────────────────────────── */
export default function AgendaNotesPanel({ label }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("notes"); // "notes" | "agenda"
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const panelRef = useRef(null);

  /* Dışarı tıklayınca kapat */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Notları fetch et */
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/business/notes?limit=20&pinned=all");
      const data = await res.json();
      setNotes(Array.isArray(data.notes) ? data.notes : []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && tab === "notes") fetchNotes();
  }, [open, tab, fetchNotes]);

  /* Sabitle / kaldır */
  const handlePin = async (note) => {
    try {
      await fetch(`/api/business/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, isPinned: !n.isPinned } : n))
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      );
    } catch {
      toast.error("Sabitleme başarısız");
    }
  };

  /* Sil */
  const handleDelete = async (id) => {
    if (!confirm("Bu notu silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`/api/business/notes/${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Not silindi");
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const filtered = q
    ? notes.filter(
        (n) =>
          n.title?.toLowerCase().includes(q.toLowerCase()) ||
          n.content?.toLowerCase().includes(q.toLowerCase())
      )
    : notes;

  const pinnedCount = notes.filter((n) => n.isPinned).length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger butonu */}
      <button
        type="button"
        id="agenda-notes-trigger"
        onClick={() => { setOpen((v) => !v); setAdding(false); }}
        title="Ajanda & Notlar"
        className={`relative flex items-center gap-1.5 h-[48px] rounded-2xl border transition-colors px-3 sm:px-4 ${
          open
            ? "bg-[#004aad] border-[#004aad] text-white shadow-md"
            : "border-gray-100 bg-gray-50/80 text-slate-600 hover:bg-[#004aad]/10 hover:text-[#004aad] hover:border-[#004aad]/20"
        }`}
      >
        <BookOpenIcon className="h-5 w-5 shrink-0" />
        {label && <span className="hidden md:inline text-xs font-bold">{label}</span>}
        {pinnedCount > 0 && !open && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-white shadow ring-2 ring-white">
            {pinnedCount > 9 ? "9+" : pinnedCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[360px] max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
            style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.18)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-[#004aad] to-blue-600 px-4 py-3">
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-white/80" />
                <span className="text-sm font-bold text-white">Ajanda & Notlar</span>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href="/business/notes"
                  onClick={() => setOpen(false)}
                  title="Tüm notlar"
                  className="flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-[10px] font-bold text-white hover:bg-white/25 transition-colors"
                >
                  Tümünü Gör <ChevronRightIcon className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sekmeler */}
            <div className="flex border-b border-slate-100 bg-slate-50 px-3 pt-2 gap-1">
              {[
                { id: "notes",  label: "Notlar",  icon: BookOpenIcon },
                { id: "agenda", label: "Ajanda",  icon: CalendarDaysIcon },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setTab(t.id); setAdding(false); }}
                  className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-bold transition-colors ${
                    tab === t.id
                      ? "bg-white border border-b-white border-slate-200 text-[#004aad] shadow-sm -mb-px"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                  {t.id === "notes" && notes.length > 0 && (
                    <span className="ml-0.5 rounded-full bg-[#004aad]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#004aad]">
                      {notes.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* İçerik */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {tab === "agenda" ? (
                <AgendaTab />
              ) : (
                <>
                  {/* Arama */}
                  {!adding && (
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Not ara..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-300 focus:bg-white transition-colors"
                      />
                    </div>
                  )}

                  {/* Yeni not formu */}
                  <AnimatePresence>
                    {adding && (
                      <QuickNoteForm
                        onCreated={() => { setAdding(false); fetchNotes(); }}
                        onCancel={() => setAdding(false)}
                      />
                    )}
                  </AnimatePresence>

                  {/* Not listesi */}
                  {loading ? (
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="py-8 text-center">
                      <BookOpenIcon className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-400">
                        {q ? "Eşleşen not bulunamadı" : "Henüz not yok"}
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filtered.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onPin={handlePin}
                          onDelete={handleDelete}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </>
              )}
            </div>

            {/* Alt footer */}
            <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2.5 flex items-center justify-between">
              {tab === "notes" && !adding ? (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#004aad] px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                  Yeni Not Ekle
                </button>
              ) : (
                <span />
              )}
              <Link
                href="/business/notes"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#004aad] transition-colors"
              >
                <CheckCircleIcon className="h-3.5 w-3.5" />
                Notlar sayfası
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
