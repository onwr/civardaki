"use client";

import { useEffect } from "react";

export default function ConfirmDeleteCategoryModal({ open, name, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Kategoriyi sil</h3>
        <p className="mt-2 text-sm text-slate-600">
          <strong>{name}</strong> kategorisini silmek istediğinize emin misiniz? Alt kategoriler de silinecektir.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl font-medium bg-rose-600 text-white hover:bg-rose-700"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}
