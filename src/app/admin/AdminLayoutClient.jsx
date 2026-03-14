"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Users,
  Store,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Database,
  Monitor,
  CreditCard,
  FileText,
  Megaphone,
  Briefcase,
  LifeBuoy,
  ShieldAlert,
  Inbox,
  Globe,
  Layers,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

export const ADMIN_NAVIGASYON = [
  {
    grup: "ANALİZ VE RAPOR",
    items: [
      { name: "ANA PANEL", path: "/admin", icon: LayoutDashboard },
      { name: "İSTATİSTİKLER", path: "/admin/stats", icon: BarChart3 },
    ],
  },
  {
    grup: "OPERASYON",
    items: [
      { name: "İŞLETMELER", path: "/admin/businesses", icon: Store },
      { name: "KULLANICILAR", path: "/admin/users", icon: Users },
      { name: "ÖN KAYITLAR", path: "/admin/pre-registrations", icon: Zap },
      { name: "KATEGORİLER", path: "/admin/categories", icon: Layers },
      { name: "ONAYLAR", path: "/admin/approvals", icon: ShieldCheck },
      { name: "MÜŞTERİ TALEPLERİ", path: "/admin/leads", icon: MessageSquare },
    ],
  },
  {
    grup: "FİNANS",
    items: [
      { name: "ABONELİKLER", path: "/admin/subscriptions", icon: Zap },
      { name: "ÖDEMELER", path: "/admin/payments", icon: CreditCard },
      { name: "FATURALAR", path: "/admin/invoices", icon: FileText },
    ],
  },
  {
    grup: "PAZARLAMA",
    items: [
      { name: "REKLAMLAR", path: "/admin/ads", icon: Megaphone },
      { name: "DUYURULAR", path: "/admin/broadcast", icon: Globe },
    ],
  },
  {
    grup: "DESTEK",
    items: [{ name: "TALEPLER", path: "/admin/tickets", icon: Inbox }],
  },
  {
    grup: "SİSTEM",
    items: [
      { name: "ALTYAPI", path: "/admin/infrastructure", icon: Database },
      { name: "AYARLAR", path: "/admin/settings", icon: Settings },
      { name: "GÜVENLİK", path: "/admin/security", icon: Monitor },
    ],
  },
];

export default function AdminLayoutClient({ children, session }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 selection:bg-[#004aad]/10 selection:text-[#004aad]">
      {/* 1. YAN MENÜ */}
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-[#004aad] z-50 hidden lg:flex flex-col shadow-2xl shadow-blue-900/40">
        {/* LOGO VE MARKA */}
        <div className="px-8 pt-8 pb-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
            <ShieldCheck className="w-7 h-7 text-[#004aad]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter leading-none uppercase">
              CİVARDAKİ
            </h2>
            <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded-lg">
              <div className="w-1 h-1 rounded-full bg-blue-200 animate-pulse" />
              <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest italic">
                ADMİN
              </span>
            </div>
          </div>
        </div>

        {/* KULLANICI PROFİLİ */}
        <div className="px-8 py-4">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-5 flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-black italic shadow-lg uppercase">
              {session?.user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white italic truncate uppercase tracking-tight">
                {session?.user?.name || "Yönetici"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold text-blue-200/60 uppercase tracking-widest italic">
                  Yönetici Hesabı
                </span>
                <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* NAVİGASYON */}
        <nav className="flex-1 px-4 pb-10 space-y-8 overflow-y-auto no-scrollbar scroll-smooth">
          {ADMIN_NAVIGASYON.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <div className="px-4 mb-4">
                <p className="text-[9px] font-black tracking-[0.3em] text-white/30 uppercase italic">
                  {group.grup}
                </p>
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all group relative ${
                        isActive
                          ? "bg-white text-[#004aad] shadow-xl translate-x-1"
                          : "text-blue-100/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon
                        className={`w-4.5 h-4.5 ${isActive ? "text-[#004aad]" : "group-hover:text-white group-hover:scale-110"} transition-all`}
                      />
                      <span className="text-[11px] font-black tracking-widest uppercase italic">
                        {item.name}
                      </span>

                      {item.badge && (
                        <span
                          className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-lg ${
                            isActive
                              ? "bg-[#004aad] text-white"
                              : "bg-white/20 text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {isActive && (
                        <motion.div className="absolute right-0 w-1.5 h-5 bg-[#004aad] rounded-l-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ALT AKSİYON */}
        <div className="p-6 border-t border-white/5 bg-black/10">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl text-blue-100/60 hover:text-white hover:bg-rose-500 transition-all font-black text-[10px] uppercase tracking-widest italic border border-white/5 group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
            ÇIKIŞ YAP
          </button>
        </div>
      </aside>

      {/* 2. ÜST BAR */}
      <header className="lg:pl-80 fixed top-0 right-0 left-0 bg-white/70 backdrop-blur-3xl border-b border-slate-100 z-40">
        <div className="h-24 px-8 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 bg-slate-50 rounded-xl text-slate-900 border border-slate-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <button className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#004aad] hover:border-[#004aad]/20 hover:shadow-xl hover:shadow-blue-900/5 transition-all group relative">
              <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-lg" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. ANA İÇERİK */}
      <main className="lg:pl-80 pt-24 min-h-screen">
        <div className="p-8 lg:p-14 max-w-[1800px] mx-auto">{children}</div>
      </main>

      {/* 4. MOBİL MENÜ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] bg-[#004aad] z-[70] flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <span className="text-2xl font-black tracking-tighter text-white italic uppercase">
                  CİVARDAKİ<span className="text-blue-300 text-3xl">.</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-white/10 rounded-xl text-white shadow-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 space-y-8 p-6 overflow-y-auto no-scrollbar">
                {ADMIN_NAVIGASYON.map((group, idx) => (
                  <div key={idx} className="space-y-4">
                    <p className="text-[10px] font-black text-white/30 tracking-[0.2em] px-4 italic">
                      {group.grup}
                    </p>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-6 p-6 rounded-[2.5rem] transition-all shadow-inner ${
                            pathname === item.path
                              ? "bg-white text-[#004aad] shadow-2xl"
                              : "text-blue-100"
                          }`}
                        >
                          <item.icon className="w-6 h-6" />
                          <span className="text-sm font-black tracking-[0.2em] uppercase italic">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
