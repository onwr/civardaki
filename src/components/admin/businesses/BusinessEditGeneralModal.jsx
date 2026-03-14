"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

function safeStr(v) {
  return v == null ? "" : String(v).trim();
}

export default function BusinessEditGeneralModal({ business, categories = [], onSave, onClose }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    district: "",
    workingHours: "",
    isActive: true,
    isVerified: false,
    isOpen: true,
    latitude: "",
    longitude: "",
    primaryCategoryId: "",
  });

  useEffect(() => {
    if (!business) return;
    setForm({
      name: safeStr(business.name),
      slug: safeStr(business.slug),
      description: safeStr(business.description),
      email: safeStr(business.email),
      phone: safeStr(business.phone),
      website: safeStr(business.website),
      address: safeStr(business.address),
      city: safeStr(business.city),
      district: safeStr(business.district),
      workingHours: safeStr(business.workingHours),
      isActive: !!business.isActive,
      isVerified: !!business.isVerified,
      isOpen: !!business.isOpen,
      latitude: business.latitude != null ? String(business.latitude) : "",
      longitude: business.longitude != null ? String(business.longitude) : "",
      primaryCategoryId: business.primaryCategoryId ?? "",
    });
  }, [business]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!business?.id || typeof onSave !== "function") return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        email: form.email || null,
        phone: form.phone || null,
        website: form.website || null,
        address: form.address || null,
        city: form.city || null,
        district: form.district || null,
        workingHours: form.workingHours || null,
        isActive: form.isActive,
        isVerified: form.isVerified,
        isOpen: form.isOpen,
        latitude: form.latitude === "" ? null : parseFloat(form.latitude),
        longitude: form.longitude === "" ? null : parseFloat(form.longitude),
        primaryCategoryId: form.primaryCategoryId || null,
      };
      if (Number.isNaN(payload.latitude)) payload.latitude = null;
      if (Number.isNaN(payload.longitude)) payload.longitude = null;
      await onSave(payload);
      onClose?.();
    } catch (err) {
      // onSave may throw; toast is typically shown by parent
    } finally {
      setSaving(false);
    }
  };

  if (!business) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-semibold text-slate-900">İşletme bilgilerini düzenle</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form id="edit-general-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">İşletme adı</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Açıklama</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Kategori</label>
              <select
                value={form.primaryCategoryId}
                onChange={(e) => handleChange("primaryCategoryId", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              >
                <option value="">Seçin</option>
                {Array.isArray(categories) && categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Telefon</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Web site</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Adres</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Şehir</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">İlçe</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Enlem</label>
              <input
                type="text"
                value={form.latitude}
                onChange={(e) => handleChange("latitude", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                placeholder="Örn. 41.0082"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Boylam</label>
              <input
                type="text"
                value={form.longitude}
                onChange={(e) => handleChange("longitude", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                placeholder="Örn. 28.9784"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Çalışma saatleri</label>
              <textarea
                value={form.workingHours}
                onChange={(e) => handleChange("workingHours", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-700">Aktif</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isVerified}
                  onChange={(e) => handleChange("isVerified", e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-700">Doğrulanmış</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isOpen}
                  onChange={(e) => handleChange("isOpen", e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-700">Açık</span>
              </label>
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-100 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm hover:bg-slate-50">
            İptal
          </button>
          <button
            type="submit"
            form="edit-general-form"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
