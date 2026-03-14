"use client";

export default function BusinessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#004aad]/20 border-t-[#004aad] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Yukleniyor...</p>
      </div>
    </div>
  );
}
