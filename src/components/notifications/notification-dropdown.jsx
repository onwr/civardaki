"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, X, Check, MessageSquare, Package, Zap, Star, ChevronRight } from "lucide-react";
import { useNotifications } from "../providers/notification-provider";

const TYPE_CONFIG = {
  LEAD: { icon: MessageSquare, color: "bg-blue-100 text-blue-600", emoji: "🎯" },
  PRODUCT: { icon: Package, color: "bg-emerald-100 text-emerald-600", emoji: "📦" },
  REVIEW: { icon: Star, color: "bg-amber-100 text-amber-600", emoji: "⭐" },
  SYSTEM: { icon: Zap, color: "bg-amber-100 text-amber-600", emoji: "⚡" },
};

function getCtaLabel(notif) {
  if (notif.type === "REVIEW") return "Değerlendirmelere git";
  if (notif.type === "LEAD") return "Talebe git";
  return "Görüntüle";
}

const formatTimeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dk önce`;
  if (h < 24) return `${h} sa önce`;
  if (d < 7) return `${d} gün önce`;
  return new Date(date).toLocaleDateString("tr-TR");
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { notifications, unreadCount, isLoading, markAllAsRead, markOneAsRead, refresh } = useNotifications();

  const handleNotificationClick = (notif) => {
    if (notif.linkUrl) {
      if (!notif.isRead) markOneAsRead(notif.id);
      setIsOpen(false);
      router.push(notif.linkUrl);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) refresh(); // Refresh on open
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center h-[48px] w-[48px] rounded-2xl border border-gray-100 bg-gray-50/80 text-slate-500 hover:text-[#004aad] hover:bg-[#004aad]/10 hover:border-[#004aad]/20 transition-all"
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white shadow ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[300] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                Bildirimler
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#004aad] text-white text-[9px] font-black">
                  {unreadCount} yeni
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[10px] font-black text-[#004aad] hover:opacity-70 uppercase tracking-widest transition-opacity"
                >
                  <Check className="w-3 h-3" />
                  Tümünü Oku
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm font-semibold animate-pulse">
                Yükleniyor...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">Henüz bildirim yok</p>
                <p className="text-xs text-slate-300 mt-1">Yeni bildirimler burada görünecek.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
                const Icon = cfg.icon;
                const hasLink = !!notif.linkUrl;
                const RowWrapper = hasLink ? "button" : "div";
                const rowProps = hasLink
                  ? {
                      type: "button",
                      onClick: () => handleNotificationClick(notif),
                      className: "w-full text-left",
                    }
                  : {};
                return (
                  <div
                    key={notif.id}
                    className={`flex flex-col gap-2 px-5 py-4 border-b border-slate-50 transition-colors ${notif.isRead ? "bg-white" : "bg-blue-50/40 border-l-2 border-l-[#004aad]"
                      }`}
                  >
                    <RowWrapper
                      {...rowProps}
                      className={`flex items-start gap-4 min-w-0 ${rowProps.className || ""} ${hasLink ? "cursor-pointer hover:bg-slate-50/50 rounded-xl -m-1 p-1" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold leading-snug ${notif.isRead ? "text-slate-600" : "text-slate-900"}`}>
                          {notif.title}
                        </p>
                        {notif.body && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 font-medium italic">
                            &quot;{notif.body}&quot;
                          </p>
                        )}
                        <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">
                          {formatTimeAgo(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#004aad] shrink-0 mt-1.5" />
                      )}
                    </RowWrapper>
                    {hasLink && (
                      <Link
                        href={notif.linkUrl}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNotificationClick(notif);
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-black text-[#004aad] uppercase tracking-widest hover:opacity-80"
                      >
                        {getCtaLabel(notif)}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
