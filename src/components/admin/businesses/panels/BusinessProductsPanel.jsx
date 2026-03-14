"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function BusinessProductsPanel({ businessId, productCount = 0, products = [], onRefresh }) {
  const [actingId, setActingId] = useState(null);

  const handleToggle = async (product) => {
    if (!businessId) return;
    setActingId(product.id);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncelleme başarısız.");
      toast.success(product.isActive ? "Ürün pasif yapıldı." : "Ürün aktif yapıldı.");
      onRefresh?.();
    } catch (e) {
      toast.error(e.message || "Güncelleme başarısız.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Toplam <strong>{productCount}</strong> ürün/hizmet.
      </p>
      {products.length === 0 ? (
        <p className="text-slate-500">
          {productCount > 0 ? "Liste yüklenemedi." : "Ürün/hizmet yok."}
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {products.slice(0, 20).map((p) => (
            <li key={p.id} className="py-3 first:pt-0 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">{p.name ?? p.id}</p>
                <span className={`text-xs ${p.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                  {p.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(p)}
                disabled={actingId !== null}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  p.isActive
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {p.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                {p.isActive ? "Pasif yap" : "Aktif yap"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {products.length > 20 && <p className="text-xs text-slate-500">İlk 20 ürün gösteriliyor.</p>}
    </div>
  );
}
