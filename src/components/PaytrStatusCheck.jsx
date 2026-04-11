"use client";

import { useState } from "react";

export default function PaytrStatusCheck() {
  const [merchantOid, setMerchantOid] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/payments/paytr/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantOid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "İstek başarısız.");
        setResult(data);
        return;
      }
      setResult(data);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">PayTR Durum Sorgu</h3>
      <p className="mt-1 text-sm text-slate-600">
        Bu ekran ödeme başlatmaz. Var olan <code className="font-mono">merchant_oid</code> için PayTR durum
        sorgusu yapar.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          value={merchantOid}
          onChange={(e) => setMerchantOid(e.target.value)}
          placeholder="merchant_oid (örn: SP...)"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !merchantOid.trim()}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Sorgulanıyor..." : "Sorgula"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </p>
      ) : null}

      {result ? (
        <pre className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
{JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

