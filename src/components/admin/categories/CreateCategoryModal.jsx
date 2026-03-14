"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

export default function CreateCategoryModal({ open, onClose, onSuccess, parentOptions = [] }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setDescription("");
      setIcon("");
      setColor("");
      setImageUrl("");
      setParentId("");
      setSortOrder(0);
      setIsActive(true);
      setIsFeatured(false);
      setKeywords("");
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Kategori adı zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || null,
          icon: icon.trim() || null,
          color: color.trim() || null,
          imageUrl: imageUrl.trim() || null,
          parentId: parentId.trim() || null,
          sortOrder: Number(sortOrder) || 0,
          isActive,
          isFeatured,
          keywords: keywords.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Oluşturulamadı.");
      toast.success("Kategori eklendi.");
      onSuccess?.();
    } catch (e) {
      toast.error(e.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageUploading(true);
    try {
      const form = new FormData();
      form.append("file", f);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız.");
      setImageUrl(data.url || "");
    } catch (err) {
      toast.error(err.message || "Görsel yüklenemedi.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100">
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Yeni kategori</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ad *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Kategori adı"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Boş bırakılırsa otomatik üretilir"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Üst kategori</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">— Üst kategori yok</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Opsiyonel"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">İkon</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200"
                placeholder="örn. Store"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Renk</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200"
                placeholder="örn. #3B82F6"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Görsel</label>
            {imageUrl ? (
              <div className="flex items-center gap-3">
                <img src={imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                <div>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} disabled={imageUploading} />
                <span className="text-sm text-slate-500">{imageUploading ? "Yükleniyor..." : "Dosya seç veya sürükle"}</span>
              </label>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sıra</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Anahtar kelimeler</label>
            <textarea
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-xl border border-slate-200"
              placeholder="Virgülle ayırabilirsiniz"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-slate-300 text-blue-600" />
              <span className="text-sm text-slate-700">Aktif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-slate-300 text-blue-600" />
              <span className="text-sm text-slate-700">Öne çıkan</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50">
              İptal
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Ekleniyor..." : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
