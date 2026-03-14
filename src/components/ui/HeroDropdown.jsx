"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

/**
 * @param {string} value - Seçili değer
 * @param {(value: string) => void} onChange
 * @param {{ value: string, label: string }[] | string[]} options - string[] ise value=label kullanılır
 * @param {string} placeholder
 * @param {boolean} [disabled]
 * @param {React.ReactNode} [leftIcon]
 * @param {string} [className]
 */
export default function HeroDropdown({
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  leftIcon,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [panelRect, setPanelRect] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const panelRef = useRef(null);

  const normalized = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );
  const selected = normalized.find((o) => o.value === value);
  const displayLabel = selected ? selected.label : placeholder;

  const updatePosition = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPanelRect({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useLayoutEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPanelRect({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      const inTrigger = ref.current?.contains(e.target);
      const inPanel = panelRef.current?.contains(e.target);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    const handleScrollOrResize = () => updatePosition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  const panel = open && typeof document !== "undefined" && (
    <div
      ref={panelRef}
      role="listbox"
      className="max-h-60 overflow-auto rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-xl shadow-2xl py-2"
      style={{
        position: "fixed",
        top: panelRect.top,
        left: panelRect.left,
        width: panelRect.width,
        zIndex: 9998,
      }}
    >
      <button
        type="button"
        role="option"
        aria-selected={!value}
        onClick={() => {
          onChange("");
          setOpen(false);
        }}
        className="w-full px-4 py-3 text-left bg-slate-800/50 text-white/80 hover:bg-white/15 hover:text-white transition-colors border-0"
      >
        {placeholder}
      </button>
      {normalized.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="option"
          aria-selected={value === opt.value}
          onClick={() => {
            onChange(opt.value);
            setOpen(false);
          }}
          className={`w-full px-4 py-3 text-left transition-colors border-0 ${
            value === opt.value
              ? "bg-[#004aad]/60 text-white font-semibold"
              : "bg-slate-800/50 text-white hover:bg-white/15"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={`w-full h-12 pl-4 pr-10 bg-white/5 border border-white/10 rounded-2xl text-left font-medium text-white transition-all flex items-center gap-3 ${
          open
            ? "bg-white/10 border-white/30 ring-2 ring-white/20"
            : "focus:outline-none focus:bg-white/10 focus:border-white/30"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      >
        {leftIcon && (
          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70">
            {leftIcon}
          </span>
        )}
        <span
          className={selected ? "text-white" : "text-white/60 truncate flex-1"}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-white/60 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {typeof document !== "undefined" &&
        panel &&
        createPortal(panel, document.body)}
    </div>
  );
}
