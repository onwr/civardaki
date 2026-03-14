"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Send } from "lucide-react";
import { getStatusLabel, getPriorityLabel, getCategoryLabel, getCreatorTypeLabel } from "@/lib/tickets/config";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "@/lib/tickets/config";

function formatDateTime(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function messageAuthor(msg) {
  if (msg.authorType === "ADMIN") return msg.user?.name || "Destek";
  if (msg.authorType === "USER") return msg.user?.name || msg.user?.email || "Kullanıcı";
  if (msg.authorType === "BUSINESS") return msg.business?.name || "İşletme";
  return "—";
}

export default function TicketDetailDrawer({ open, ticketId, onClose, onUpdated }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yüklenemedi.");
      setTicket(data.ticket);
      setStatus(data.ticket?.status ?? "");
      setPriority(data.ticket?.priority ?? "");
    } catch (e) {
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (open && ticketId) fetchTicket();
  }, [open, ticketId, fetchTicket]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSendReply = async () => {
    if (!ticketId || !replyBody.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gönderilemedi.");
      setReplyBody("");
      fetchTicket();
      onUpdated?.();
    } catch (e) {
      alert(e.message || "Bir hata oluştu.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!ticketId || newStatus === ticket?.status) return;
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncellenemedi.");
      setStatus(newStatus);
      setTicket((t) => t ? { ...t, status: newStatus } : null);
      onUpdated?.();
    } catch (e) {
      alert(e.message || "Bir hata oluştu.");
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!ticketId || newPriority === ticket?.priority) return;
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncellenemedi.");
      setPriority(newPriority);
      setTicket((t) => t ? { ...t, priority: newPriority } : null);
      onUpdated?.();
    } catch (e) {
      alert(e.message || "Bir hata oluştu.");
    }
  };

  if (!open) return null;

  const creatorName = ticket?.creatorType === "USER"
    ? (ticket.user?.name || ticket.user?.email || "Kullanıcı")
    : (ticket?.business?.name || ticket?.business?.slug || "İşletme");

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" aria-hidden onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
          <h2 className="text-lg font-semibold text-slate-900">Talep detayı</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-slate-500 text-sm">Yükleniyor...</p>
          ) : !ticket ? (
            <p className="text-slate-500 text-sm">Talep bulunamadı.</p>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {getCreatorTypeLabel(ticket.creatorType)}: {creatorName} · {getCategoryLabel(ticket.category)} · {formatDateTime(ticket.createdAt)}
                </p>
                <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">{ticket.body}</p>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Durum</label>
                  <select
                    value={status}
                    onChange={(e) => { const v = e.target.value; setStatus(v); handleStatusChange(v); }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Öncelik</label>
                  <select
                    value={priority}
                    onChange={(e) => { const v = e.target.value; setPriority(v); handlePriorityChange(v); }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  >
                    {PRIORITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Mesajlar</h4>
                <div className="space-y-4 mb-6">
                  {(ticket.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl border text-sm ${
                        msg.authorType === "ADMIN" ? "bg-blue-50/80 border-blue-100 ml-4" : "bg-slate-50 border-slate-100 mr-4"
                      }`}
                    >
                      <p className="font-medium text-slate-700">{messageAuthor(msg)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(msg.createdAt)}</p>
                      <p className="mt-2 text-slate-800 whitespace-pre-wrap">{msg.body}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-2">Yanıt yaz</label>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={3}
                    placeholder="Mesajınızı yazın..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyBody.trim() || sending}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "Gönderiliyor..." : "Gönder"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
