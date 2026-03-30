"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function CustomerSearchModal({ open, onClose, onSelect }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQ("");
      setResults([]);
      return;
    }

    if (q.length < 3) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `/api/business/customers?status=all&q=${encodeURIComponent(q)}`
        );
        const data = await res.json();
        setResults(data.customers || []);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [open, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                Müşteri Arama
              </p>
              <h2 className="mt-1 text-lg font-bold">
                Kayıtlı müşteriyi seçin
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-slate-700">
            Satış yapacağınız müşteriyi isim, telefon veya vergi / TC numarası
            ile arayabilirsiniz.
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Müşteri Ara
            </label>

            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                placeholder="İsim, Telefon, Vergi/TC No ile arama yapabilirsiniz..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            {q.length > 0 && q.length < 3 && (
              <p className="mt-2 text-xs text-amber-700">En az 3 karakter yazın.</p>
            )}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {loading && (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                Aranıyor...
              </div>
            )}

            {!loading && q.length >= 3 && results.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                Sonuç bulunamadı.
              </div>
            )}

            {!loading && results.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-slate-50"
                      onClick={() => onSelect?.(c)}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-500">
                          <UserCircleIcon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {c.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Müşteri kaydı
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                        Seç
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!loading && q.length < 3 && (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                Arama yapmak için en az 3 karakter girin.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}