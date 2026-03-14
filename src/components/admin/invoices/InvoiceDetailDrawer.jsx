"use client";

import { useEffect, useState } from "react";
import { X, Building2, Calendar, FileText, Pencil, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { formatDate, formatAmount } from "@/lib/admin-invoices/formatters";
import { getTypeLabel, getStatusLabel, getStatusBadgeClass } from "@/lib/admin-invoices/status-config";
import { generateInvoicePdf } from "@/lib/admin-invoices/generate-invoice-pdf";

export default function InvoiceDetailDrawer({ open, invoice, onClose, onEdit }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleDownloadPdf = async () => {
    if (!invoice || pdfLoading) return;
    setPdfLoading(true);
    try {
      await generateInvoicePdf(invoice);
    } catch (err) {
      alert(err?.message || "PDF oluşturulurken bir hata oluştu.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (!open || !invoice) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" aria-hidden onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/80">
          <h2 className="text-lg font-semibold text-slate-900">Fatura detayı</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Fatura belge tasarımı */}
          <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-800 px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Fatura</p>
              <p className="text-2xl font-bold text-white mt-0.5">{invoice.invoiceNumber || "—"}</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Kesim tarihi</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(invoice.issueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Vade tarihi</p>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Alıcı / İşletme</p>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <Building2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{invoice.business?.name ?? "—"}</p>
                    <p className="text-sm text-slate-500">{invoice.business?.slug ?? ""}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-100">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Tip</p>
                  <p className="text-sm font-medium text-slate-900">{getTypeLabel(invoice.type)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Durum</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Tutar</p>
                <p className="text-3xl font-bold text-slate-900">{formatAmount(invoice.amount)}</p>
                {invoice.currency && invoice.currency !== "TRY" && (
                  <p className="text-sm text-slate-500 mt-0.5">Para birimi: {invoice.currency}</p>
                )}
              </div>

              {invoice.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Açıklama
                  </p>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.description}</p>
                  </div>
                </div>
              )}

              {invoice.subscriptionPayment && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">İlişkili ödeme</p>
                  <p className="text-sm text-slate-600">
                    Ödeme tutarı: {formatAmount(invoice.subscriptionPayment.amount)}
                    {invoice.subscriptionPayment.paidAt && (
                      <span className="text-slate-500 ml-2">
                        · {formatDate(invoice.subscriptionPayment.paidAt)}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-200 text-emerald-700 font-medium hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {pdfLoading ? "İndiriliyor..." : "PDF İndir"}
            </button>
            <button
              type="button"
              onClick={() => { onEdit?.(invoice); onClose?.(); }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              <Pencil className="w-4 h-4" />
              Düzenle
            </button>
            {invoice.business?.id && (
              <Link
                href={`/admin/businesses?highlight=${invoice.business.id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-blue-200 text-blue-600 font-medium hover:bg-blue-50"
              >
                <ExternalLink className="w-4 h-4" />
                İşletmeye git
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
