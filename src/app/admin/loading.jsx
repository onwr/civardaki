"use client";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#004aad]/20 border-t-[#004aad] rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.25em]">
          YUKLENIYOR...
        </p>
      </div>
    </div>
  );
}
