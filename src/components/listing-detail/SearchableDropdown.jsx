"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronsUpDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Arama yapılabilir dropdown.
 * @param {Array} options - Seçenek listesi
 * @param {string} value - Seçili değer (getOptionValue ile eşleşen)
 * @param {function} onSelect - (option) => void
 * @param {function} getOptionValue - (option) => string
 * @param {function} getOptionLabel - (option) => string
 * @param {string} placeholder
 * @param {boolean} disabled
 * @param {boolean} loading
 * @param {string} emptyMessage
 */
export default function SearchableDropdown({
  options = [],
  value,
  onSelect,
  getOptionValue = (o) => o?.id ?? o?.value ?? "",
  getOptionLabel = (o) => o?.name ?? o?.label ?? "",
  placeholder = "Seçin...",
  disabled = false,
  loading = false,
  emptyMessage = "Sonuç yok",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find((o) => getOptionValue(o) === value);
  const displayLabel = selectedOption ? getOptionLabel(selectedOption) : "";

  const queryLower = (query || "").trim().toLowerCase();
  const filtered =
    queryLower.length === 0
      ? options
      : options.filter((o) => getOptionLabel(o).toLowerCase().includes(queryLower));

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && !loading && setOpen((v) => !v)}
        disabled={disabled || loading}
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 outline-none text-sm text-left flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className={displayLabel ? "text-slate-900" : "text-slate-400"}>
          {loading ? "Yükleniyor..." : displayLabel || placeholder}
        </span>
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-all ${
            open ? "text-slate-700 border-slate-300" : ""
          }`}
        >
          <ChevronsUpDown className="w-3.5 h-3.5 shrink-0" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ara..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">{emptyMessage}</div>
              ) : (
                <ul className="py-1">
                  {filtered.map((option) => {
                    const optValue = getOptionValue(option);
                    const optLabel = getOptionLabel(option);
                    const isSelected = optValue === value;
                    return (
                      <li key={optValue}>
                        <button
                          type="button"
                          onClick={() => handleSelect(option)}
                          className={`w-full px-3 py-2.5 text-left text-sm hover:bg-slate-100 transition-colors ${
                            isSelected ? "bg-slate-100 font-medium text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {optLabel}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
