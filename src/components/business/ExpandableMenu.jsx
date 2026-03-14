"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ExpandableMenu({ item, pathname }) {
  const [isExpanded, setIsExpanded] = useState(
    item.children?.some((child) => pathname?.startsWith(child.href)) || false
  );

  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
  const hasActiveChild = item.children?.some((child) => pathname?.startsWith(child.href));

  const toggleExpand = (e) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-1 font-inter">
      {item.href ? (
        <Link
          href={item.href}
          className={`group flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 ${isActive || hasActiveChild
            ? "bg-white text-[#004aad] shadow-xl font-bold translate-x-1"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
        >
          <div className="flex items-center flex-1 min-w-0">
            <item.icon className={`mr-4 flex-shrink-0 w-4.5 h-4.5 transition-colors ${isActive || hasActiveChild ? 'text-[#004aad]' : 'text-blue-300 group-hover:text-white'}`} />
            <span className={`text-[11px] font-black uppercase tracking-widest truncate italic ${isActive || hasActiveChild ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
              {item.name}
            </span>
            {item.badge && (
              <span className={`ml-3 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${isActive || hasActiveChild ? 'bg-[#004aad]/10 text-[#004aad]' : 'bg-white/10 text-white'}`}>
                {item.badge.text}
              </span>
            )}
          </div>
          {item.children && (
            <button
              onClick={toggleExpand}
              className={`ml-2 p-1 rounded-lg transition-colors ${isActive || hasActiveChild ? 'hover:bg-[#004aad]/10' : 'hover:bg-white/10'}`}
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
          className={`group flex items-center justify-between w-full px-5 py-3.5 rounded-2xl transition-all duration-300 ${hasActiveChild
            ? "bg-white text-[#004aad] shadow-xl font-bold translate-x-1"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
        >
          <div className="flex items-center flex-1 min-w-0">
            <item.icon className={`mr-4 flex-shrink-0 w-4.5 h-4.5 transition-colors ${hasActiveChild ? 'text-[#004aad]' : 'text-blue-300 group-hover:text-white'}`} />
            <span className={`text-[11px] font-black uppercase tracking-widest truncate italic ${hasActiveChild ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
              {item.name}
            </span>
            {item.badge && (
              <span className={`ml-3 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${hasActiveChild ? 'bg-[#004aad]/10 text-[#004aad]' : 'bg-white/10 text-white'}`}>
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
            <div className="ml-8 mt-1 space-y-1 pl-4 py-2 border-l border-white/10">
              {item.children.map((child) => {
                const isChildActive = pathname === child.href || pathname?.startsWith(child.href + "/");
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center justify-between px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 italic ${isChildActive
                      ? "text-white translate-x-1 bg-white/20 shadow-inner"
                      : "text-blue-200 hover:text-white hover:translate-x-1 hover:bg-white/5"
                      }`}
                  >
                    <span className="truncate">{child.name}</span>
                    {child.badge && (
                      <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter ${isChildActive ? 'bg-white text-[#004aad]' : 'bg-white/5 text-blue-200'}`}>
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
