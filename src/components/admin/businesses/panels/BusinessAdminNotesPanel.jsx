"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDateTime } from "@/lib/admin-businesses/formatters";
import { toast } from "sonner";

export default function BusinessAdminNotesPanel({ businessId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = useCallback(() => {
    if (!businessId) return;
    setLoading(true);
    fetch(`/api/admin/businesses/${businessId}/notes`)
      .then((r) => r.json())
      .then((d) => setNotes(d.notes ?? []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [businessId]);

  useEffect(() => {
    if (businessId) fetchNotes();
  }, [businessId, fetchNotes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = newNote.trim();
    if (!text || !businessId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydetme başarısız.");
      toast.success("Not eklendi.");
      setNewNote("");
      fetchNotes();
    } catch (err) {
      toast.error(err.message || "Kaydetme başarısız.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!businessId) return <p className="text-slate-500">İşletme seçilmedi.</p>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Yeni not</label>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="İşletme ile ilgili iç not..."
          rows={3}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-300 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !newNote.trim()}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Ekleniyor..." : "Not ekle"}
        </button>
      </form>

      <div>
        <p className="text-sm text-slate-600 mb-2">
          Toplam <strong>{notes.length}</strong> not.
        </p>
        {loading ? (
          <p className="text-slate-500">Yükleniyor...</p>
        ) : notes.length === 0 ? (
          <p className="text-slate-500">Henüz not yok.</p>
        ) : (
          <ul className="divide-y divide-slate-100 space-y-0">
            {notes.map((n) => (
              <li key={n.id} className="py-3 first:pt-0">
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{n.note}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDateTime(n.createdAt)}
                  {n.author?.name || n.author?.email ? ` — ${n.author.name || n.author.email}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
