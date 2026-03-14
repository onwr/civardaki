"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/admin-businesses/formatters";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function BusinessReviewsPanel({ reviews = [], loading, totalCount, onRefresh }) {
  const [actingId, setActingId] = useState(null);
  const count = totalCount ?? reviews.length;

  const handleStatus = async (reviewId, status) => {
    setActingId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem başarısız.");
      toast.success("Yorum durumu güncellendi.");
      onRefresh?.();
    } catch (e) {
      toast.error(e.message || "İşlem başarısız.");
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    setActingId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Silme başarısız.");
      toast.success("Yorum silindi.");
      onRefresh?.();
    } catch (e) {
      toast.error(e.message || "Silme başarısız.");
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <p className="text-slate-500">Yükleniyor...</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Toplam <strong>{count}</strong> yorum.
      </p>
      {reviews.length === 0 ? (
        <p className="text-slate-500">Yorum bulunamadı.</p>
      ) : (
        <ul className="divide-y divide-slate-100 space-y-0">
          {reviews.slice(0, 30).map((r) => (
            <li key={r.id} className="py-3 first:pt-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{r.rating}/5</span> — {r.reviewerName ?? r.user?.name ?? "Anonim"}
                  </p>
                  {r.content && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{r.content}</p>}
                  <p className="text-xs text-slate-400 mt-1">
                    {r.isApproved ? "Onaylı" : "Beklemede"} · {r.status ?? ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-slate-400">{formatDateTime(r.createdAt)}</span>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      type="button"
                      onClick={() => handleStatus(r.id, "APPROVED")}
                      disabled={actingId !== null}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                      title="Onayla"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatus(r.id, "REJECTED")}
                      disabled={actingId !== null}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      title="Reddet"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatus(r.id, "PENDING")}
                      disabled={actingId !== null}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 disabled:opacity-50"
                      title="Beklemede"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      disabled={actingId !== null}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {reviews.length > 30 && <p className="text-xs text-slate-500">Son 30 yorum gösteriliyor.</p>}
    </div>
  );
}
