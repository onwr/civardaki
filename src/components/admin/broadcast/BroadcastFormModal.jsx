"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { LAYOUT_OPTIONS, AUDIENCE_OPTIONS, STATUS_OPTIONS } from "@/lib/broadcast/config";

export default function BroadcastFormModal({ open, onClose, onSuccess, editBroadcast = null }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [layout, setLayout] = useState("BANNER");
  const [audience, setAudience] = useState("ALL");
  const [status, setStatus] = useState("DRAFT");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  const isEdit = !!editBroadcast?.id;

  useEffect(() => {
    if (!open) return;
    if (editBroadcast) {
      setTitle(editBroadcast.title ?? "");
      setBody(editBroadcast.body ?? "");
      setImageUrl(editBroadcast.imageUrl ?? "");
      setLinkUrl(editBroadcast.linkUrl ?? "");
      setLinkLabel(editBroadcast.linkLabel ?? "");
      setLayout(editBroadcast.layout ?? "BANNER");
      setAudience(editBroadcast.audience ?? "ALL");
      setStatus(editBroadcast.status ?? "DRAFT");
      setStartAt(editBroadcast.startAt ? editBroadcast.startAt.slice(0, 16) : "");
      setEndAt(editBroadcast.endAt ? editBroadcast.endAt.slice(0, 16) : "");
      setSortOrder(editBroadcast.sortOrder ?? 0);
    } else {
      setTitle("");
      setBody("");
      setImageUrl("");
      setLinkUrl("");
      setLinkLabel("");
      setLayout("BANNER");
      setAudience("ALL");
      setStatus("DRAFT");
      setStartAt("");
      setEndAt("");
      setSortOrder(0);
    }
  }, [open, editBroadcast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim() || null,
        imageUrl: imageUrl.trim() || null,
        linkUrl: linkUrl.trim() || null,
        linkLabel: linkLabel.trim() || null,
        layout,
        audience,
        status,
        startAt: startAt || null,
        endAt: endAt || null,
        sortOrder: Number(sortOrder) || 0,
      };
      const url = isEdit ? `/api/admin/broadcasts/${editBroadcast.id}` : "/api/admin/broadcasts";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi.");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      alert(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" aria-hidden onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">{isEdit ? "Duyuruyu düzenle" : "Yeni duyuru"}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">İçerik (body)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Görsel URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link URL</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link etiketi</label>
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Detay"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yerleşim</label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {LAYOUT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hedef kitle</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bitiş</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sıra</label>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
              İptal
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Oluştur"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
