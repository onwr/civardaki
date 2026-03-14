"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  ArchiveBoxIcon,
  PuzzlePieceIcon,
  ChartBarIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

export default function ProductDefinitionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetch("/api/business/products?status=all&limit=100")
      .then((r) => r.json())
      .then((data) => setProducts(data?.items ?? []))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.slug || "").toLowerCase().includes(searchTerm.toLowerCase());
      const categoryName = product.category?.name;
      const matchesCategory =
        filterCategory === "all" || categoryName === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filterCategory, products]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category?.name).filter(Boolean))], [products]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-50 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 max-w-[1600px] mx-auto px-4">

      {/* 1. MASTER HEADER - BENTO CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white rounded-[4rem] p-10 md:p-14 border border-gray-100 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute -right-20 -bottom-20 opacity-[0.03] group-hover:scale-110 transition-transform">
            <BeakerIcon className="w-96 h-96 text-[#004aad]" />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4">
                <Link href="/business/products" className="inline-flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#004aad] transition-colors">
                  <ArrowLeftIcon className="w-3 h-3 mr-2" /> Panoya Dön
                </Link>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gray-950 rounded-[1.8rem] flex items-center justify-center shadow-2xl">
                    <PuzzlePieceIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">Katalog Tanımları</h1>
                    <p className="text-[#004aad] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Master Product Definitions</p>
                  </div>
                </div>
              </div>
              <Link
                href="/business/products"
                className="px-10 py-5 bg-[#004aad] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3 active:scale-95"
              >
                <PlusIcon className="w-5 h-5" /> YENİ ÜRÜN EKLE
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-gray-900 rounded-[4rem] p-10 text-white flex flex-col justify-between shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Katalog Özeti</p>
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <ChartBarIcon className="w-5 h-5 text-[#00ffcc]" />
            </div>
          </div>
          <div className="space-y-6 mt-6">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <span className="text-xs font-bold text-gray-400">Tanımlı Ürün</span>
              <span className="text-3xl font-black">{products.length}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-gray-400">Aktif Kategori</span>
              <span className="text-3xl font-black">{categories.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. ADVANCED FILTERS */}
      <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl flex flex-wrap gap-6 items-center justify-between">
        <div className="flex-1 min-w-[300px] relative group">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
          <input
            type="text"
            placeholder="Ürün ismi veya barkod ile hızlı filtrele..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-gray-50 rounded-3xl border-none outline-none focus:ring-4 focus:ring-[#004aad]/5 font-bold transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-gray-100 rounded-2xl">
            {['all', ...categories.slice(0, 3)].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${filterCategory === cat ? 'bg-white text-[#004aad] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {cat === 'all' ? 'Tümü' : cat}
              </button>
            ))}
          </div>
          <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-[#004aad] hover:text-white transition-all">
            <FunnelIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 3. DEFINITIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3.5rem] border border-gray-100 shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col group"
            >
              {/* Product Visual */}
              <div className="relative h-64 overflow-hidden bg-gray-50">
                {product.imageUrl ? (
                  <img src={product.imageUrl.startsWith("http") ? product.imageUrl : product.imageUrl.startsWith("/") ? product.imageUrl : `/${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="w-16 h-16 text-gray-200" />
                  </div>
                )}

                <div className="absolute top-5 left-5">
                  <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[9px] font-black text-[#004aad] shadow-lg">#{product.slug}</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <div className="flex gap-3 w-full">
                    <Link href="/business/products" className="flex-1 py-3 bg-white text-gray-900 rounded-xl font-black text-[10px] uppercase hover:bg-[#004aad] hover:text-white transition-all shadow-xl text-center">
                      DÜZENLE
                    </Link>
                    <Link href={`/business/products/variants?productId=${product.id}`} className="py-3 px-4 bg-violet-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-black transition-all shadow-xl">
                      VARYANTLAR
                    </Link>
                  </div>
                </div>
              </div>

              {/* Product Meta */}
              <div className="p-8 space-y-6 flex-1 flex flex-col">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-3 h-3 text-[#004aad]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category?.name || "Kategorisiz"}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-[#004aad] transition-colors leading-tight">{product.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase">FİYAT</p>
                    <p className="text-lg font-black text-gray-900">{(product.discountPrice ?? product.price ?? 0).toLocaleString("tr-TR")} ₺</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase">STOK / MAX</p>
                    <p className="text-lg font-black text-gray-700">{product.stock != null ? product.stock : "—"} / {product.maxOrderQty != null ? product.maxOrderQty : "∞"}</p>
                  </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-3">
                    <ArchiveBoxIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">{product.variants?.length ? `${product.variants.length} varyant` : "Varyant yok"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
