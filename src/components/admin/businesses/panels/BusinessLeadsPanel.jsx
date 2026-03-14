"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/admin-businesses/formatters";
import { toast } from "sonner";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUOTED", "REPLIED", "CLOSED", "LOST"];

export default function BusinessLeadsPanel({
  businessId,
  leads = [],
  loading,
  totalCount,
  onRefresh,
}) {
  const [actingId, setActingId] = useState(null);
  const count = totalCount ?? leads.length;

  if (loading) return <p className="text-slate-500">Yükleniyor...</p>;

  const updateLead = async (leadId, payload, successText = "Lead güncellendi.") => {
    if (!leadId || !businessId) return;
    setActingId(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Lead güncellenemedi.");
      toast.success(successText);
      onRefresh?.();
    } catch (e) {
      toast.error(e.message || "Lead güncellenemedi.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Toplam <strong>{count}</strong> lead.
      </p>
      {leads.length === 0 ? (
        <p className="text-slate-500">Lead bulunamadı.</p>
      ) : (
        <ul className="divide-y divide-slate-100 space-y-0">
          {leads.slice(0, 50).map((lead) => (
            <li key={lead.id} className="py-3 first:pt-0">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{lead.name ?? "—"}</p>
                  <p className="text-xs text-slate-500">{lead.email ?? lead.phone ?? "—"}</p>
                  {lead.message && <p className="text-xs text-slate-600 mt-1">{lead.message}</p>}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <select
                      disabled={actingId === lead.id}
                      value={lead.status || "NEW"}
                      onChange={(e) =>
                        updateLead(lead.id, { status: e.target.value }, "Lead durumu güncellendi.")
                      }
                      className="h-8 px-2 rounded-md border border-slate-200 text-xs"
                    >
                      {LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={actingId === lead.id}
                      onClick={() =>
                        updateLead(
                          lead.id,
                          { isSuspicious: !lead.isSuspicious },
                          !lead.isSuspicious
                            ? "Lead yüksek öncelik olarak işaretlendi."
                            : "Lead önceliği normalleştirildi.",
                        )
                      }
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        lead.isSuspicious
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {lead.isSuspicious ? "Yüksek öncelik" : "Normal öncelik"}
                    </button>
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{formatDateTime(lead.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {leads.length > 50 && <p className="text-xs text-slate-500">Son 50 kayıt gösteriliyor.</p>}
    </div>
  );
}
