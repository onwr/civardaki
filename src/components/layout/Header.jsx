"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  User,
  PlusCircle,
  LogIn,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  LogOut,
  Building2,
  ShieldCheck,
  Search,
  Heart,
  Newspaper,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  canAccessBusinessPanel,
  getPanelHrefForUser,
  isBusinessPanelUser,
} from "@/lib/session-business-access";
import LocationPicker from "@/components/layout/LocationPicker";
import { isPanelDebugEnabled, logPanelDebug, logPanelDebugTable } from "@/lib/panel-debug";

function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
  }

  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

export default function Header() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const user = session?.user;

  const userName = user?.name || "Kullanıcı";
  const userEmail = user?.email || "";
  const userImage = user?.image || "";
  const userRole = user?.role || "USER";
  const businessId = user?.businessId || null;
  const hasBusiness = !!user?.hasBusiness;
  const businessSlug = user?.businessSlug || null;

  const isAdmin = userRole === "ADMIN";
  const canAccessBusiness = canAccessBusinessPanel(user);
  const isBusinessPanel = isBusinessPanelUser(user);
  const showBusinessLinks = canAccessBusiness;

  const panelHref = useMemo(() => {
    if (status === "loading") return null;
    if (status === "unauthenticated") return "/user/login";
    return getPanelHrefForUser(user);
  }, [status, user]);

  useEffect(() => {
    if (status !== "authenticated" || !user?.id || isAdmin) return;
    if (businessId || hasBusiness) return;
    logPanelDebug("Header → session.update(refreshBusiness)", { userId: user.id });
    void update({ refreshBusiness: true });
  }, [status, user?.id, businessId, hasBusiness, isAdmin, update]);

  useEffect(() => {
    if (!isPanelDebugEnabled()) return;
    if (status === "loading") {
      logPanelDebug("Header — oturum yükleniyor (panelHref henüz kesin değil)", {
        status,
      });
      return;
    }

    logPanelDebugTable("Header — panel kararı (oturum hazır)", [
      { alan: "status", deger: status },
      { alan: "user.id", deger: user?.id ?? "(yok)" },
      { alan: "user.email", deger: userEmail || "(yok)" },
      { alan: "user.role", deger: userRole },
      { alan: "hasBusiness", deger: String(hasBusiness) },
      { alan: "businessId", deger: businessId ?? "(yok)" },
      { alan: "businessSlug", deger: businessSlug ?? "(yok)" },
      { alan: "canAccessBusiness", deger: String(canAccessBusiness) },
      { alan: "isBusinessPanel", deger: String(isBusinessPanel) },
      { alan: "panelHref", deger: panelHref ?? "(bekle)" },
      { alan: "isAdmin", deger: String(isAdmin) },
    ]);

    if (status !== "authenticated") return;

    fetch("/api/debug/panel-access")
      .then((r) => r.json())
      .then((data) => {
        logPanelDebug("Header — sunucu /api/debug/panel-access", data);
        if (data?.diagnosis) {
          console.warn("[Civardaki Panel Debug] Teşhis:", data.diagnosis);
        }
      })
      .catch((err) => {
        logPanelDebug("Header — debug API hatası", { message: String(err) });
      });
  }, [
    status,
    user?.id,
    userEmail,
    userRole,
    hasBusiness,
    businessId,
    businessSlug,
    canAccessBusiness,
    isBusinessPanel,
    panelHref,
    isAdmin,
  ]);

  const businessProfileHref = useMemo(() => {
    if (businessSlug) return `/isletme/${businessSlug}`;
    return "/business/dashboard";
  }, [businessSlug]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const navItems = [
    { href: "/", label: "Keşfet", icon: Search },
    { href: "/kampanyalar", label: "Kampanyalar", icon: Sparkles },
    { href: "/favorilerim", label: "Favorilerim", icon: Heart },
    { href: "/blog", label: "Blog", icon: Newspaper },
    { href: "/about", label: "Hakkımızda", icon: User },
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto container">
          <div className="flex h-[88px] items-center justify-between rounded-[28px] border border-white/80 bg-white/90 px-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Civardaki"
                className="w-[175px] object-contain"
              />
            </Link>

            <nav className="hidden items-center gap-10 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[15px] font-bold transition ${
                    pathname === item.href
                      ? "text-[#0057d9]"
                      : "text-slate-900 hover:text-[#0057d9]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-4 md:flex">
              <LocationPicker />

              {status === "loading" ? (
                <div className="h-12 w-48 animate-pulse rounded-full bg-slate-100" />
              ) : isAuthenticated ? (
                <>
                  <Link href={panelHref ?? "/user"}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-[15px] font-black text-slate-800 transition hover:border-blue-200 hover:text-[#0057d9]"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {isBusinessPanel ? "İşletmem" : "Panel"}
                    </motion.div>
                  </Link>

                  <div className="relative" ref={userMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                      className="flex h-12 items-center gap-3 rounded-full border border-slate-200 bg-white pl-2 pr-4 shadow-sm"
                    >
                      {userImage ? (
                        <img
                          src={userImage}
                          alt={userName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0057d9] text-xs font-black text-white">
                          {getInitials(userName, userEmail)}
                        </div>
                      )}

                      <div className="text-left leading-tight">
                        <p className="max-w-[130px] truncate text-sm font-black text-slate-900">
                          {userName}
                        </p>
                        <p className="max-w-[130px] truncate text-[11px] font-semibold text-slate-500">
                          {isAdmin
                            ? "Yönetici"
                            : isBusinessPanel
                              ? "İşletme Hesabı"
                              : "Üye"}
                        </p>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          className="absolute right-0 mt-4 w-72 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-2xl"
                        >
                          <div className="border-b border-slate-100 bg-slate-50 p-4">
                            <p className="font-black text-slate-900">
                              {userName}
                            </p>
                            <p className="truncate text-sm text-slate-500">
                              {userEmail}
                            </p>
                          </div>

                          <div className="p-2">
                            {isAdmin && (
                              <Link
                                href="/admin"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-[#0057d9] hover:bg-blue-50"
                              >
                                <ShieldCheck className="h-5 w-5 text-[#0057d9]" />
                                Admin Paneli
                              </Link>
                            )}

                            <Link
                              href={panelHref ?? "/user"}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <LayoutDashboard className="h-5 w-5 text-slate-400" />
                              {isBusinessPanel ? "İşletme Paneline Git" : "Panele Git"}
                            </Link>

                            {showBusinessLinks && (
                              <Link
                                href={businessProfileHref}
                                className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <Building2 className="h-5 w-5 text-slate-400" />
                                İşletme Profili
                              </Link>
                            )}

                            {!isBusinessPanel && (
                              <Link
                                href="/user"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <User className="h-5 w-5 text-slate-400" />
                                Hesabım
                              </Link>
                            )}

                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              <LogOut className="h-5 w-5" />
                              Çıkış Yap
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/user/login">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-[15px] font-black text-[#0057d9] transition hover:bg-blue-50"
                    >
                      Giriş Yap
                    </motion.div>
                  </Link>

                  <Link href="/business/register">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex h-12 items-center justify-center rounded-2xl bg-[#0057d9] px-8 text-[15px] font-black text-white shadow-[0_14px_34px_rgba(0,87,217,0.28)] transition hover:bg-[#004cc2]"
                    >
                      İşletme Hesabı Aç
                    </motion.div>
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 right-0 top-0 z-[60] flex w-[86%] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <img src="/logo.png" alt="Civardaki" className="w-36" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <motion.div className="flex-1 overflow-y-auto p-4">
                <div className="mb-4">
                  <LocationPicker variant="mobile" />
                </div>

                <div className="mb-5 rounded-[28px] bg-gradient-to-br from-blue-50 to-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0057d9]">
                    Civardaki
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">
                    Mahallendeki en iyi işletmeleri keşfet.
                  </h3>
                </div>

                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-4 font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-[#0057d9]" />
                        {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </Link>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  {isAuthenticated ? (
                    <>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 font-black text-[#0057d9]"
                        >
                          <ShieldCheck className="h-5 w-5" />
                          Admin Paneli
                        </Link>
                      )}

                      <Link
                        href={panelHref ?? "/user"}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#0057d9] px-5 py-4 font-black text-white"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        {isBusinessPanel ? "İşletme Paneline Git" : "Panele Git"}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-5 py-4 font-black text-rose-600"
                      >
                        <LogOut className="h-5 w-5" />
                        Çıkış Yap
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/user/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 font-black text-[#0057d9]"
                      >
                        <LogIn className="h-5 w-5" />
                        Giriş Yap
                      </Link>

                      <Link
                        href="/business/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#0057d9] px-5 py-4 font-black text-white"
                      >
                        <PlusCircle className="h-5 w-5" />
                        İşletme Hesabı Aç
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}