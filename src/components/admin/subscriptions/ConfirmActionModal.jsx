"use client";

import { useEffect } from "react";

export default function ConfirmActionModal({
  open = false,
  title = "Emin misiniz?",
  message,
  confirmLabel = "Onayla",
  cancelLabel = "İptal",
  onConfirm,
  onCancel,
  loading = false,
}) {
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
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {loading ? "İşleniyor..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
