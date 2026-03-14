"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/admin-businesses/formatters";
import { toast } from "sonner";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"];

export default function BusinessOrdersPanel({
  businessId,
  orders = [],
  loading,
  totalCount,
  onRefresh,
}) {
  const [actingId, setActingId] = useState(null);
  const count = totalCount ?? orders.length;

  if (loading) return <p className="text-slate-500">Yükleniyor...</p>;

  const byStatus = (orders || []).reduce((acc, o) => {
    const s = o.status || "PENDING";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const totalRevenue = (orders || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const handleStatusChange = async (orderId, status) => {
    if (!businessId || !orderId) return;
    setActingId(orderId);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sipariş güncellenemedi.");
      toast.success("Sipariş durumu güncellendi.");
      onRefresh?.();
    } catch (e) {
      toast.error(e.message || "Sipariş güncellenemedi.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Toplam <strong>{count}</strong> sipariş.
        {totalRevenue > 0 && (
          <span className="ml-2 text-slate-500">Toplam tutar: {totalRevenue.toFixed(2)} ₺</span>
        )}
      </p>
      {Object.keys(byStatus).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(byStatus).map(([status, n]) => (
            <span key={status} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs">
              {status}: {n}
            </span>
          ))}
        </div>
      )}
      {orders.length === 0 ? (
        <p className="text-slate-500">Sipariş bulunamadı.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {orders.slice(0, 20).map((o) => (
            <li key={o.id} className="py-3 first:pt-0">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{o.orderNumber ?? o.id}</p>
                  <p className="text-xs text-slate-500">{o.customerName ?? "—"}</p>
                  <p className="text-xs text-slate-600">{Number(o.total)?.toFixed(2)} ₺ · {o.status}</p>
                  <div className="mt-2">
                    <select
                      disabled={actingId === o.id}
                      value={o.status || "PENDING"}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className="h-8 px-2 rounded-md border border-slate-200 text-xs"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{formatDateTime(o.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {orders.length > 20 && <p className="text-xs text-slate-500">Son 20 sipariş gösteriliyor.</p>}
    </div>
  );
}
