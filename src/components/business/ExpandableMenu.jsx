"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isNavHrefActive } from "@/lib/nav-active";

export function ExpandableMenu({ item, pathname }) {
  const isDisabled = Boolean(item.disabled);

  const [isExpanded, setIsExpanded] = useState(
    !isDisabled &&
      (item.children?.some((child) =>
        isNavHrefActive(pathname, child.href, child.activePathMatch),
      ) ||
        false),
  );

  const isActive =
    !isDisabled &&
    isNavHrefActive(pathname, item.href, item.activePathMatch);
  const hasActiveChild =
    !isDisabled &&
    item.children?.some((child) =>
      isNavHrefActive(pathname, child.href, child.activePathMatch),
    );

  const toggleExpand = (e) => { 
    e.preventDefault();
    if (isDisabled) return;
    setIsExpanded(!isExpanded);
  };

  if (isDisabled) {
    return (
      <div className="mb-1 font-sans">
        <div
          className="group flex items-center justify-between px-4 py-2.5 rounded-xl cursor-not-allowed opacity-45 text-blue-100/90"
          title={item.disabledReason || "Yakında"}
        >
          <div className="flex items-center flex-1 min-w-0">
            <item.icon className="mr-3 flex-shrink-0 w-4 h-4 text-blue-200/60" />
            <span className="text-[13px] font-medium tracking-normal truncate">
              {item.name}
            </span>
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-white/70">
                {item.badge.text}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-1 font-sans">
      {item.href ? (
        <Link
          href={item.href}
          className={`group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 ${
            isActive || hasActiveChild
              ? "bg-white text-[#004aad] shadow-lg"
              : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
        >
          <div className="flex items-center flex-1 min-w-0">
            <item.icon
              className={`mr-3 flex-shrink-0 w-4 h-4 transition-colors ${
                isActive || hasActiveChild
                  ? "text-[#004aad]"
                  : "text-blue-200 group-hover:text-white"
              }`}
            />
            <span
              className={`text-[13px] font-medium tracking-normal truncate ${
                isActive || hasActiveChild
                  ? "opacity-100"
                  : "opacity-90 group-hover:opacity-100"
              }`}
            >
              {item.name}
            </span>
            {item.badge && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                  isActive || hasActiveChild
                    ? "bg-[#004aad]/10 text-[#004aad]"
                    : "bg-white/10 text-white"
                }`}
              >
                {item.badge.text}
              </span>
            )}
          </div>
          {item.children && (
            <button
              onClick={toggleExpand}
              className={`ml-2 p-1 rounded-lg transition-colors ${
                isActive || hasActiveChild
                  ? "hover:bg-[#004aad]/10"
                  : "hover:bg-white/10"
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </Link>
      ) : (
        <button
          onClick={toggleExpand}
          className={`group flex items-center justify-between w-full px-4 py-2.5 rounded-xl transition-all duration-200 ${
            hasActiveChild
              ? "bg-white text-[#004aad] shadow-lg"
              : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
        >
          <div className="flex items-center flex-1 min-w-0">
            <item.icon
              className={`mr-3 flex-shrink-0 w-4 h-4 transition-colors ${
                hasActiveChild
                  ? "text-[#004aad]"
                  : "text-blue-200 group-hover:text-white"
              }`}
            />
            <span
              className={`text-[13px] font-medium tracking-normal truncate ${
                hasActiveChild ? "opacity-100" : "opacity-90 group-hover:opacity-100"
              }`}
            >
              {item.name}
            </span>
            {item.badge && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                  hasActiveChild
                    ? "bg-[#004aad]/10 text-[#004aad]"
                    : "bg-white/10 text-white"
                }`}
              >
                {item.badge.text}
              </span>
            )}
          </div>
          {item.children && (
            <div className="ml-2">
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              )}
            </div>
          )}
        </button>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="overflow-hidden"
          >
            <div className="ml-7 mt-1 space-y-1 pl-3 py-2 border-l border-white/10">
              {item.children.map((child) => {
                const isChildActive = isNavHrefActive(
                  pathname,
                  child.href,
                  child.activePathMatch,
                );
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isChildActive
                        ? "text-white translate-x-0.5 bg-white/20 shadow-inner"
                        : "text-blue-200 hover:text-white hover:translate-x-0.5 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{child.name}</span>
                    {child.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                          isChildActive
                            ? "bg-white text-[#004aad]"
                            : "bg-white/5 text-blue-200"
                        }`}
                      >
                        {child.badge.text}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
