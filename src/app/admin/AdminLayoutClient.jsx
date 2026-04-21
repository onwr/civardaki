"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Users,
  Store,
  Settings,
  Bell,
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
  Globe,
  Layers,
  MessageSquare,
  ChevronDown,
  Inbox,
  LayoutTemplate,
  Home,
  ArrowLeftRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export const ADMIN_NAVIGASYON = [
  {
    grup: "ANALİZ",
    items: [
      { name: "Ana Panel", path: "/admin", icon: LayoutDashboard, exact: true },
      { name: "İstatistikler", path: "/admin/stats", icon: BarChart3 },
    ],
  },
  {
    grup: "OPERASYON",
    items: [
      { name: "İşletmeler", path: "/admin/businesses", icon: Store },
      { name: "Kullanıcılar", path: "/admin/users", icon: Users },
      { name: "Ön Kayıtlar", path: "/admin/pre-registrations", icon: Zap },
      { name: "Kategoriler", path: "/admin/categories", icon: Layers },
      { name: "Onaylar", path: "/admin/approvals", icon: ShieldCheck },
      { name: "Müşteri Talepleri", path: "/admin/leads", icon: MessageSquare },
    ],
  },
  {
    grup: "FİNANS",
    items: [
      { name: "Abonelikler", path: "/admin/subscriptions", icon: Zap },
      { name: "Ödemeler", path: "/admin/payments", icon: CreditCard },
      { name: "Faturalar", path: "/admin/invoices", icon: FileText },
    ],
  },
  {
    grup: "VİTRİN",
    items: [
      { name: "Anasayfa Hero", path: "/admin/home/hero", icon: LayoutTemplate },
    ],
  },
  {
    grup: "PAZARLAMA",
    items: [
      { name: "Reklamlar", path: "/admin/ads", icon: Megaphone },
      { name: "Duyurular", path: "/admin/broadcast", icon: Globe },
    ],
  },
  {
    grup: "DESTEK",
    items: [
      { name: "Talepler", path: "/admin/tickets", icon: Inbox },
    ],
  },
  {
    grup: "SİSTEM",
    items: [
      { name: "Altyapı", path: "/admin/infrastructure", icon: Database },
      { name: "Ayarlar", path: "/admin/settings", icon: Settings },
      { name: "Güvenlik", path: "/admin/security", icon: Monitor },
    ],
  },
];

function NavItem({ item, collapsed, pathname }) {
  const isActive = item.exact
    ? pathname === item.path
    : pathname === item.path || pathname.startsWith(item.path + "/");

  return (
    <Link
      href={item.path}
      title={collapsed ? item.name : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        isActive
          ? "bg-white text-[#004aad] shadow-md"
          : "text-blue-100/80 hover:text-white hover:bg-white/10"
      }`}
    >
      <item.icon
        className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
          isActive ? "text-[#004aad]" : ""
        }`}
      />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="text-[13px] font-semibold truncate"
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
          {item.name}
        </div>
      )}
    </Link>
  );
}

function UserMenu({ session, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const name = session?.user?.name || "Yönetici";
  const email = session?.user?.email || "";
  const image = session?.user?.image || null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative flex items-center gap-2.5 rounded-2xl border transition-all duration-200 h-[44px] px-2 pr-3 ${
          open
            ? "border-[#004aad]/30 bg-blue-50 shadow-inner"
            : "border-gray-200 bg-white hover:border-[#004aad]/20 hover:bg-slate-50 hover:shadow-sm"
        }`}
      >
        <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {image ? (
            <Image src={image} alt={name} width={32} height={32} className="object-cover w-full h-full" />
          ) : (
            <span className="text-slate-600 text-[11px] font-black tracking-wider select-none">
              {getInitials(name)}
            </span>
          )}
        </div>
        <div className="hidden sm:flex flex-col text-left leading-none">
          <span className="text-[13px] font-bold text-slate-800 truncate max-w-[100px]">{name}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Yönetici</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.16)" }}
          >
            <div className="bg-gradient-to-r from-[#004aad] to-blue-600 px-4 py-3.5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {image ? (
                  <Image src={image} alt={name} width={40} height={40} className="object-cover" />
                ) : (
                  <span className="text-white text-sm font-bold">{getInitials(name)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{name}</p>
                <p className="text-[10px] text-white/70 font-semibold truncate">{email}</p>
              </div>
            </div>

            <div className="p-2">
              <Link
                href="/admin/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Settings className="h-4 w-4" />
                </span>
                Sistem Ayarları
              </Link>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Home className="h-4 w-4" />
                </span>
                Siteye Git
              </Link>
            </div>

            <div className="border-t border-slate-100 px-2 pb-2">
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                  <LogOut className="h-4 w-4" />
                </span>
                Çıkış Yap
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




function SidebarContent({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  logoError,
  setLogoError,
  pathname,
  handleLogout,
  isMobileView = false
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center border-b border-white/10 flex-shrink-0 h-[65px] ${collapsed && !isMobileView ? "justify-center px-3" : "justify-between px-4"
          }`}
      >
        <AnimatePresence initial={false}>
          {(!collapsed || isMobileView) && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5 min-w-0"
            >
              {!logoError ? (
                <Image
                  src="/logo.png"
                  alt="Civardaki"
                  width={120}
                  height={32}
                  priority
                  className="h-7 w-auto object-contain brightness-0 invert"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div>
                  <span className="text-white font-black text-sm uppercase tracking-tight">Civardaki</span>
                  <span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Admin</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && !isMobileView ? (
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
            {!logoError ? (
              <Image src="/logo.png" alt="C" width={28} height={28} className="object-contain brightness-0 invert" onError={() => setLogoError(true)} />
            ) : (
              <ShieldCheck className="w-5 h-5 text-white" />
            )}
          </div>
        ) : null}

        {(!collapsed || isMobileView) && (
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            {isMobileView ? (
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Daralt"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto no-scrollbar py-4 space-y-5 ${collapsed && !isMobileView ? "px-2" : "px-3"}`}>
        {ADMIN_NAVIGASYON.map((group, gi) => (
          <div key={gi}>
            <AnimatePresence initial={false}>
              {(!collapsed || isMobileView) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] px-3 mb-1.5"
                >
                  {group.grup}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  collapsed={collapsed && !isMobileView}
                  pathname={pathname}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={`flex-shrink-0 border-t border-white/10 p-3 space-y-1 ${collapsed && !isMobileView ? "px-2" : ""}`}>
        <Link
          href="/"
          title={collapsed && !isMobileView ? "Siteye Git" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100/70 hover:text-white hover:bg-white/10 transition-all group"
        >
          <Home className="w-[18px] h-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />
          {(!collapsed || isMobileView) && <span className="text-[13px] font-semibold">Siteye Git</span>}
        </Link>
        <button
          onClick={handleLogout}
          title={collapsed && !isMobileView ? "Çıkış Yap" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100/70 hover:text-white hover:bg-rose-500/30 transition-all group"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />
          {(!collapsed || isMobileView) && <span className="text-[13px] font-semibold">Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayoutClient({ children, session }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    toast.success("Çıkış yapıldı.");
    await signOut({ callbackUrl: "/" });
  };

  const currentPageTitle = useMemo(() => {
    for (const group of ADMIN_NAVIGASYON) {
      for (const item of group.items) {
        const isActive = item.exact
          ? pathname === item.path
          : pathname === item.path || pathname.startsWith(item.path + "/");
        if (isActive) return item.name;
      }
    }
    return "Admin Panel";
  }, [pathname]);

  const sidebarProps = {
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
    logoError,
    setLogoError,
    pathname,
    handleLogout
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-72 z-50 md:hidden flex flex-col bg-[#004aad]"
            >
              <SidebarContent {...sidebarProps} isMobileView />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-[#004aad] overflow-hidden"
      >
        <SidebarContent {...sidebarProps} />
      </motion.aside>

      {/* Expand Button when collapsed */}
      {collapsed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setCollapsed(false)}
          className="hidden md:flex fixed top-[18px] left-[80px] z-40 items-center justify-center h-7 w-7 bg-[#004aad] text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Genişlet"
        >
          <PanelLeftOpen className="w-3.5 h-3.5" />
        </motion.button>
      )}

      {/* Main Content Area */}
      <motion.div
        initial={false}
        animate={{ paddingLeft: collapsed ? 68 : 256 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex flex-col min-h-screen md:pl-0"
      >
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-[65px] flex items-center justify-between gap-4">
            {/* Left: Hamburger + Page Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">
                  {currentPageTitle}
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold hidden sm:block">
                  Admin Panel
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Notifications */}
              <button className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white shadow" />
              </button>

              {/* Site link */}
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 text-xs font-bold transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Siteye Git</span>
              </Link>

              {/* User menu */}
              <UserMenu session={session} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </motion.div>
    </div>
  );
}
