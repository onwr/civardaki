"use client";

import { Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function ListingGallerySection({ listing }) {
  if (!listing) return null;
  const gallery = listing.gallery || [];

  if (gallery.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center"
      >
        <ImageIcon className="w-14 h-14 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Henüz fotoğraf yok
        </h3>
        <p className="text-slate-500 text-sm">
          Bu işletme henüz galeri fotoğrafı eklemedi.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {gallery.map((img, i) => (
        <div
          key={i}
          className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer"
        >
          <img
            src={img}
            alt={`Galeri ${i + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </motion.div>
  );
}
