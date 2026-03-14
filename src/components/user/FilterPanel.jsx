"use client";

import { useState } from "react";
import { Filter, X, ChevronDown, Star, MapPin, Zap, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FilterPanel({ onFilterChange, filters }) {
  const [isOpen, setIsOpen] = useState(false);

  const filterConfigs = [
    {
      key: "distance",
      label: "MESAFE",
      icon: MapPin,
      options: [
        { value: null, label: "TÜMÜ" },
        { value: 1, label: "0-1 KM" },
        { value: 5, label: "1-5 KM" },
        { value: 10, label: "5-10 KM" },
      ]
    },
    {
      key: "status",
      label: "DURUM",
      icon: Zap,
      options: [
        { value: "all", label: "TÜMÜ" },
        { value: "open", label: "ŞİMDİ AÇIK" },
      ]
    },
    {
      key: "price",
      label: "FİYAT",
      icon: DollarSign,
      options: [
        { value: "all", label: "TÜMÜ" },
        { value: "ekonomik", label: "EKONOMİK" },
        { value: "orta", label: "ORTA" },
        { value: "luks", label: "LÜKS" },
      ]
    },
    {
      key: "rating",
      label: "PUAN",
      icon: Star,
      options: [
        { value: null, label: "TÜMÜ" },
        { value: 4, label: "4+ YILDIZ" },
        { value: 5, label: "5 YILDIZ" },
      ]
    }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      distance: null,
      status: "all",
      price: "all",
      rating: null,
    });
  };

  const activeFilterCount =
    (filters.distance !== null ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0) +
    (filters.price !== "all" ? 1 : 0) +
    (filters.rating !== null ? 1 : 0);

  return (
    <div className="font-inter text-left">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${isOpen ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
        >
          <Filter className={`w-4 h-4 ${isOpen ? "text-blue-300" : "text-slate-400"}`} />
          <span>Filtreler</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#004aad] text-white px-2 py-0.5 rounded-md text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
          >
            Temizle
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {filterConfigs.map((config) => (
                <div key={config.key} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <config.icon className="w-4 h-4 text-[#004aad]" />
                    <label className="text-xs font-semibold text-slate-600">{config.label}</label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {config.options.map((opt) => {
                      const isSelected = filters[config.key] === opt.value;
                      return (
                        <button
                          key={String(opt.value)}
                          onClick={() => handleFilterChange(config.key, opt.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${isSelected ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
