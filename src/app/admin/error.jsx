"use client";

export default function AdminError({ error, reset }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-rose-100 rounded-3xl p-8 shadow-xl shadow-rose-100/60">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-500 mb-3">
          Admin Hata
        </p>
        <h1 className="text-xl font-black text-slate-900 mb-3">
          Bir şeyler ters gitti.
        </h1>
        <p className="text-sm text-slate-500 mb-6 break-words">
          {error?.message || "Beklenmeyen bir hata oluştu."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="w-full inline-flex items-center justify-center px-4 py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.18em] hover:bg-slate-800 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}

