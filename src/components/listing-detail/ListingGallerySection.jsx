"use client";

import { Image as ImageIcon, Camera, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ListingGallerySection({ listing }) {
  if (!listing) return null;

  const gallery = listing.gallery || [];

  if (gallery.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-slate-100 bg-white p-12 text-center shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
      >
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
          <ImageIcon className="h-10 w-10 text-[#0057d9]" />
        </div>

        <h3 className="text-2xl font-black text-slate-950">
          Henüz fotoğraf yok
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          Bu işletme henüz galeri fotoğrafı eklemedi.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8"
    >
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#0057d9]">
            <Camera className="h-4 w-4" />
            Galeri
          </div>

          <h2 className="text-2xl font-black tracking-[-0.02em] text-slate-950">
            İşletme Fotoğrafları
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {gallery.length} fotoğraf listeleniyor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {gallery.map((img, i) => (
          <button
            key={i}
            type="button"
            className={`group relative overflow-hidden rounded-[24px] border border-slate-100 bg-slate-100 ${
              i === 0 ? "col-span-2 row-span-2 aspect-[16/10]" : "aspect-square"
            }`}
          >
            <img
              src={img}
              alt={`Galeri ${i + 1}`}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/25" />

            <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-slate-900 opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100">
              <Maximize2 className="h-5 w-5" />
            </div>

            {i === 0 && (
              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-2 text-sm font-black text-slate-900 shadow-lg backdrop-blur">
                Kapak Fotoğrafı
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.section>
  );
}