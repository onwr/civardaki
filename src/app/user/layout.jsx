"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowsPointingOutIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { userNavigation } from "@/lib/user-navigation-config";
import AIAssistant from "@/components/ai/AIAssistant";
import NotificationDropdown from "@/components/notifications/notification-dropdown";
import { NotificationProvider } from "@/components/providers/notification-provider";

function UserLayoutFallback({ message = "Yukleniyor..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#004aad]/20 border-t-[#004aad] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">{message}</p>
      </div>
    </div>
  );
}

export default function UserLayout({ children }) {
  return (
    <NotificationProvider>
      <UserLayoutContent>{children}</UserLayoutContent>
    </NotificationProvider>
  );
}

function UserLayoutContent({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      const isAuthPage =
        pathname === "/user/login" || pathname === "/user/register";
      if (!isAuthPage) {
        router.replace("/user/login?callbackUrl=" + pathname);
      }
    }
  }, [status, mounted, pathname, router]);

  const handleLogout = async () => {
    toast.success("Başarıyla çıkış yapıldı.", {
      description: "Tekrar görüşmek üzere!",
    });
    await signOut({ redirect: false });
    router.push("/user/login");
    router.refresh();
  };

  // Mobil kontrolü
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobil menü - sayfa değişince otomatik kapan
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isAuthPage =
    pathname === "/user/login" || pathname === "/user/register";

  if (!mounted) {
    return <UserLayoutFallback />;
  }

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  // Show loading while checking auth
  if (status === "loading") {
    return <UserLayoutFallback />;
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return <UserLayoutFallback message="Hesap sayfasina yonlendiriliyorsunuz..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Mobil sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed inset-0 flex flex-col w-full bg-[#004aad] z-50 md:hidden"
            >
              <SidebarContent
                session={session}
                pathname={pathname}
                onLogout={handleLogout}
                setSidebarOpen={setSidebarOpen}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarCollapsed ? 80 : 288,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30"
      >
        <div className="flex-1 flex flex-col min-h-0 bg-[#004aad] shadow-2xl">
          <SidebarContent
            session={session}
            pathname={pathname}
            collapsed={sidebarCollapsed}
            onLogout={handleLogout}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        </div>
      </motion.div>

      {/* Expand Button - Only visible when collapsed */}
      {sidebarCollapsed && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          onClick={() => setSidebarCollapsed(false)}
          className="hidden md:flex fixed top-4 left-[88px] z-40 items-center justify-center h-10 w-10 rounded-full bg-[#004aad] text-white shadow-lg hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#004aad] focus:ring-offset-2"
          title="Menüyü Genişlet"
        >
          <ArrowsPointingOutIcon className="h-5 w-5" />
        </motion.button>
      )}

      {/* Main content */}
      <motion.div
        initial={false}
        animate={{
          paddingLeft: isMobile ? 0 : sidebarCollapsed ? 80 : 288,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex flex-col flex-1 min-h-screen"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-lg border-b border-gray-200 sticky top-0 md:static z-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4 md:py-6">
              {/* Sol - Başlık / Mobile Menu Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="-ml-2 p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none md:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>

                <div className="flex items-center space-x-2 sm:space-x-3">
                  <HomeIcon className="h-6 w-6 text-[#004aad] flex-shrink-0 hidden sm:block" />
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate tracking-tight">
                      Kullanıcı Paneli
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden sm:block">
                      Civardaki.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Sağ - Bildirimler & Kullanıcı */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Bildirimler */}
                <NotificationDropdown />

                {/* Kullanıcı menüsü */}
                {session?.user && (
                  <div className="flex items-center space-x-2 bg-gray-50/50 border border-gray-100 rounded-xl px-2 py-1.5 sm:px-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="text-right hidden md:block">
                      <p className="font-bold text-gray-900 text-[11px] leading-none mb-1">
                        {session.user.name || "Kullanıcı"}
                      </p>
                      <p className="text-[9px] text-[#004aad] font-black uppercase tracking-tighter">
                        {session.user.role === "BUSINESS"
                          ? "İşletmeci"
                          : "Üye"}
                      </p>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#004aad] to-blue-600 flex items-center justify-center shadow-md flex-shrink-0 relative overflow-hidden">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt="User"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main content area */}
        <main className="flex-1 bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <Suspense
              fallback={
                <div className="p-10 text-center font-bold italic text-slate-400 uppercase tracking-widest">
                  Yükleniyor...
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </main>
      </motion.div>

      {/* Global AI Assistant */}
      <AIAssistant />
    </div>
  );
}

function SidebarContent({
  session,
  pathname,
  collapsed = false,
  onLogout,
  setSidebarOpen = null,
  setSidebarCollapsed = null,
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with Logo and Close Button */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 flex-shrink-0 relative">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center"
            >
              <div>
                <h2 className="text-[13px] font-black text-white uppercase tracking-wider leading-none">
                  Civardaki
                </h2>
                <p className="text-[9px] text-blue-100/60 font-bold uppercase tracking-tight mt-1">
                  Kullanıcı v2.1
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center w-full"
          >
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
          </motion.div>
        )}

        <div className="flex items-center">
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen && setSidebarOpen(false)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          {/* Desktop collapse button */}
          {!collapsed && setSidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 overflow-y-auto no-scrollbar pb-6 ${collapsed ? "px-2" : "px-3"
          }`}
      >
        {/* Section Indicator */}
        {!collapsed && (
          <p className="px-3 mb-3 text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mt-6">
            Menü
          </p>
        )}

        {/* Desktop - Menu Items */}
        <div className="space-y-0.5">
          {userNavigation.map((item, index) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  href={item.href || "#"}
                  onClick={() => setSidebarOpen && setSidebarOpen(false)}
                  className={`flex items-center justify-center md:justify-start p-2.5 rounded-xl transition-all duration-200 group ${isActive
                      ? "bg-white text-[#004aad] shadow-lg font-bold"
                      : "text-blue-100 hover:bg-white hover:text-[#004aad]"
                    }`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive
                        ? "text-[#004aad]"
                        : "text-blue-300 group-hover:text-[#004aad]"
                      } ${collapsed ? "" : "mr-3"}`}
                  />
                  {!collapsed && (
                    <span className="text-[13px] font-black uppercase tracking-wide truncate">
                      {item.name}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          className={`mb-2 flex items-center justify-center w-full p-3 rounded-xl transition-all duration-200 group ${
            collapsed
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-white/10 text-white hover:bg-white hover:text-[#004aad] gap-3"
          }`}
          title="Civardaki Anasayfa"
        >
          <HomeIcon className="h-5 w-5" />
          {!collapsed && (
            <span className="text-xs font-black uppercase tracking-widest">
              Civardaki'ye Git
            </span>
          )}
        </Link>
        <button
          onClick={onLogout}
          className={`flex items-center justify-center w-full p-3 rounded-xl transition-all duration-200 group ${collapsed
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-white/10 text-white hover:bg-white hover:text-[#004aad] gap-3"
            }`}
          title="Çıkış Yap"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          {!collapsed && (
            <span className="text-xs font-black uppercase tracking-widest">
              Çıkış Yap
            </span>
          )}
        </button>
      </div>
    </div>
  );
}