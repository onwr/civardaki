"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  User,
  Info,
  HelpCircle,
  PlusCircle,
  LogIn,
  ChevronRight,
  Sparkles,
  LayoutDashboard,
  LogOut,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import PreRegistrationModal from "@/components/modals/PreRegistrationModal";

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
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPreRegModalOpen, setIsPreRegModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pathname = usePathname();
  const userMenuRef = useRef(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const user = session?.user;

  const userName = user?.name || "Kullanıcı";
  const userEmail = user?.email || "";
  const userImage = user?.image || "";
  const userRole = user?.role || "USER";
  const hasBusiness = !!user?.hasBusiness;
  const businessSlug = user?.businessSlug || null;

  const isBusinessUser = userRole === "BUSINESS" || hasBusiness;
  const showBusinessLinks = hasBusiness || userRole === "BUSINESS";
  const isDevelopment = true;

  const isHome = pathname === "/";
  const isListingPage = pathname.startsWith("/isletme/");
  const shouldUseTransparentHeader = isHome || isListingPage;

  const dashboardHref = useMemo(() => {
    if (userRole === "ADMIN") return "/admin";
    if (isBusinessUser) return "/business/dashboard";
    return "/user";
  }, [userRole, isBusinessUser]);

  const businessProfileHref = useMemo(() => {
    if (businessSlug) return `/isletme/${businessSlug}`;
    return "/business/dashboard";
  }, [businessSlug]);
  const businessDashboardHref = "/business/dashboard";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const headerClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${!shouldUseTransparentHeader
      ? "bg-[#004aad] border-[#003d8f] py-3 shadow-md"
      : isScrolled
        ? "bg-gray-900/90 backdrop-blur-xl border-gray-800 py-3 shadow-lg"
        : "bg-transparent border-transparent py-5"
    }`;

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  const handleBecomeAdmin = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Rol güncellenemedi.");
      }

      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Admin rolüne geçiş hatası:", error);
      window.alert("Admin rolüne geçiş sırasında bir hata oluştu.");
    }
  };

  return (
    <>
      <header className={headerClass}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            <div className="flex-shrink-0 z-20">
              <Link href="/" className="flex items-center gap-2 group">
                <img
                  src="/logo.png"
                  className="w-32 md:w-40 transition-all brightness-0 invert"
                  alt="Civardaki Logo"
                />
              </Link>
            </div>

            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <nav className="flex items-center space-x-1">
                {[
                  { href: "/about", label: "Hakkımızda", icon: Info },
                  {
                    href: "/how-it-works",
                    label: "Nasıl Çalışır",
                    icon: HelpCircle,
                  },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-4 py-2 rounded-lg text-sm font-medium text-white/90 transition-all duration-300 hover:text-white group flex items-center gap-2 overflow-hidden"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                    />
                    <link.icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors relative z-10" />
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3 z-20">
              <div className="hidden md:flex items-center gap-3">
                {status === "loading" ? (
                  <div className="h-11 w-40 rounded-full bg-white/10 animate-pulse" />
                ) : isAuthenticated ? (
                  <>
                    <Link href={dashboardHref}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Panel
                      </motion.div>
                    </Link>

                    <div className="relative" ref={userMenuRef}>
                      <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsUserMenuOpen((prev) => !prev)}
                        className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-white text-slate-900 shadow-lg hover:bg-slate-50 transition-all duration-300"
                      >
                        {userImage ? (
                          <img
                            src={userImage}
                            alt={userName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#004aad] text-white flex items-center justify-center text-xs font-bold">
                            {getInitials(userName, userEmail)}
                          </div>
                        )}

                        <div className="text-left leading-tight">
                          <p className="text-sm font-bold max-w-[140px] truncate">
                            {userName}
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-[140px] truncate">
                            {userRole === "ADMIN"
                              ? "Yönetici"
                              : isBusinessUser
                                ? "İşletme Hesabı"
                                : "Üye"}
                          </p>
                        </div>
                      </motion.button>

                      <AnimatePresence>
                        {isUserMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            className="absolute right-0 mt-3 w-72 rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
                          >
                            <div className="p-4 border-b bg-slate-50">
                              <div className="flex items-center gap-3">
                                {userImage ? (
                                  <img
                                    src={userImage}
                                    alt={userName}
                                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-[#004aad] text-white flex items-center justify-center text-sm font-bold">
                                    {getInitials(userName, userEmail)}
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">
                                    {userName}
                                  </p>
                                  <p className="text-sm text-slate-500 truncate">
                                    {userEmail}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-2">
                              <Link
                                href={dashboardHref}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 text-slate-700 transition-colors"
                              >
                                <LayoutDashboard className="w-5 h-5 text-slate-400" />
                                <span className="font-medium">
                                  {userRole === "ADMIN" ? "Admin Paneline Git" : "Panele Git"}
                                </span>
                              </Link>

                              {showBusinessLinks && (
                                <Link
                                  href={userRole === "ADMIN" ? businessDashboardHref : businessProfileHref}
                                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 text-slate-700 transition-colors"
                                >
                                  <Building2 className="w-5 h-5 text-slate-400" />
                                  <span className="font-medium">
                                    {userRole === "ADMIN" ? "İşletme Paneline Git" : "İşletme Profili"}
                                  </span>
                                </Link>
                              )}

                              {isDevelopment && showBusinessLinks && userRole !== "ADMIN" && (
                                <button
                                  onClick={handleBecomeAdmin}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-amber-50 text-amber-700 transition-colors"
                                >
                                  <Sparkles className="w-5 h-5" />
                                  <span className="font-medium">Admin Ol (Dev)</span>
                                </button>
                              )}

                              <Link
                                href="/user"
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 text-slate-700 transition-colors"
                              >
                                <User className="w-5 h-5 text-slate-400" />
                                <span className="font-medium">Hesabım</span>
                              </Link>

                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-rose-50 text-rose-600 transition-colors"
                              >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Çıkış Yap</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsPreRegModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all duration-300 bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600"
                    >
                      <Sparkles className="w-4 h-4" />
                      Ön Kayıt Ol
                    </motion.button>

                    <Link href="/user/login">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
                      >
                        <LogIn className="w-4 h-4" />
                        Giriş Yap
                      </motion.div>
                    </Link>

                    <Link href="/business/register">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300 bg-white text-[#004aad] shadow-black/10 hover:bg-gray-50"
                      >
                        <PlusCircle className="w-4 h-4" />
                        İşletmeni Ekle
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-full text-white hover:bg-white/10"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <PreRegistrationModal
        isOpen={isPreRegModalOpen}
        onClose={() => setIsPreRegModalOpen(false)}
      />

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-sm bg-white shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                <span className="font-bold text-xl text-[#004aad]">
                  Civardaki
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
                {status === "loading" ? (
                  <div className="h-24 rounded-3xl bg-slate-100 animate-pulse mb-6" />
                ) : isAuthenticated ? (
                  <div className="mb-6 rounded-3xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                      {userImage ? (
                        <img
                          src={userImage}
                          alt={userName}
                          className="w-14 h-14 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#004aad] text-white flex items-center justify-center font-bold">
                          {getInitials(userName, userEmail)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {userName}
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <Link
                        href={dashboardHref}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#004aad] text-white hover:bg-blue-700 transition-colors gap-2 shadow-lg shadow-blue-200"
                      >
                        <LayoutDashboard className="w-6 h-6" />
                        <span className="font-semibold text-sm">Panel</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors gap-2"
                      >
                        <LogOut className="w-6 h-6" />
                        <span className="font-semibold text-sm">Çıkış Yap</span>
                      </button>
                    </div>

                    {showBusinessLinks && (
                      <Link
                        href={userRole === "ADMIN" ? businessDashboardHref : businessProfileHref}
                        onClick={() => setIsMenuOpen(false)}
                        className="mt-3 flex items-center justify-center p-4 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors gap-2"
                      >
                        <Building2 className="w-5 h-5" />
                        <span className="font-semibold text-sm">
                          {userRole === "ADMIN" ? "İşletme Paneline Git" : "İşletme Profili"}
                        </span>
                      </Link>
                    )}

                    {isDevelopment && showBusinessLinks && userRole !== "ADMIN" && (
                      <button
                        onClick={handleBecomeAdmin}
                        className="mt-3 w-full flex items-center justify-center p-4 rounded-2xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors gap-2"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span className="font-semibold text-sm">Admin Ol (Dev)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mb-6">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsPreRegModalOpen(true);
                      }}
                      className="flex items-center justify-center p-4 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors gap-2 shadow-lg shadow-emerald-200"
                    >
                      <Sparkles className="w-6 h-6" />
                      <span className="font-semibold text-sm">Ön Kayıt Ol</span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/user/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#004aad]/5 text-blue-700 hover:bg-blue-100 transition-colors gap-2"
                      >
                        <User className="w-6 h-6" />
                        <span className="font-semibold text-sm">Giriş Yap</span>
                      </Link>

                      <Link
                        href="/business/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#004aad] text-white hover:bg-blue-700 transition-colors gap-2 shadow-lg shadow-blue-200"
                      >
                        <PlusCircle className="w-6 h-6" />
                        <span className="font-semibold text-sm">
                          İşletme Ekle
                        </span>
                      </Link>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Menü
                  </p>

                  {[
                    { href: "/about", label: "Hakkımızda", icon: Info },
                    {
                      href: "/how-it-works",
                      label: "Nasıl Çalışır",
                      icon: HelpCircle,
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 text-gray-700 transition-all font-medium group"
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        {item.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t bg-gray-50 text-center text-xs text-gray-400">
                &copy; 2024 Civardaki. Tüm hakları saklıdır.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
