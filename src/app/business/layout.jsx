"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ArrowsPointingOutIcon,
  MapPinIcon,
  PowerIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import NotificationDropdown from "@/components/notifications/notification-dropdown";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { useSocket } from "@/components/providers/SocketProvider";
import { toast } from "sonner";
import { ExpandableMenu } from "@/components/business/ExpandableMenu";
import { Badge } from "@/components/ui/badge";
import { defaultNavigation, BusinessTypes } from "@/lib/navigation-config";
import { loadMenuPreferences } from "@/lib/menu-preferences";
import AIAssistant from "@/components/ai/AIAssistant";
import { Leaf, ChevronDown, ChevronUp } from "lucide-react";

const AUTH_PAGES = ["/business/register", "/business/login"];

function BusinessLayoutFallback({ message = "Yukleniyor..." }) {
  return (
    <NotificationProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#004aad]/20 border-t-[#004aad] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">{message}</p>
        </div>
      </div>
    </NotificationProvider>
  );
}

function getNavigationWithPreferences(businessType = BusinessTypes.INDIVIDUAL) {
  if (typeof window === "undefined") {
    return defaultNavigation.filter(
      (item) => !item.allowedTypes || item.allowedTypes.includes(businessType),
    );
  }

  const preferences = loadMenuPreferences(defaultNavigation);

  const typeFilteredNavigation = defaultNavigation.filter(
    (item) => !item.allowedTypes || item.allowedTypes.includes(businessType),
  );

  const sortedItems = [...preferences.order]
    .sort((a, b) => a.index - b.index)
    .map((pref) => {
      const item = typeFilteredNavigation.find(
        (nav) =>
          (nav.href || `menu-${defaultNavigation.indexOf(nav)}`) === pref.id,
      );
      return item ? { ...item, _prefId: pref.id } : null;
    })
    .filter(Boolean);

  const visibleItems = sortedItems.filter(
    (item) => !preferences.hidden.includes(item._prefId),
  );

  const processedItems = visibleItems.map((item) => {
    if (!item.children) return item;

    const typeFilteredChildren = item.children.filter(
      (child) =>
        !child.allowedTypes || child.allowedTypes.includes(businessType),
    );

    let sortedChildren = typeFilteredChildren;

    if (preferences.children[item._prefId]) {
      const childPrefs = preferences.children[item._prefId];

      sortedChildren = [...childPrefs.order]
        .sort((a, b) => a.index - b.index)
        .map((childPref) => {
          const child = typeFilteredChildren.find(
            (c) => c.href === childPref.id,
          );
          return child && !childPrefs.hidden.includes(childPref.id)
            ? child
            : null;
        })
        .filter(Boolean);
    }

    return {
      ...item,
      children: sortedChildren.length > 0 ? sortedChildren : undefined,
    };
  });

  return processedItems;
}

function getIsActive(pathname, href) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "İ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function LeadNotificationListener() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewLead = (data) => {
      toast.success("Yeni Müşteri Talebi! 🎯", {
        description: `${data.name} size "${data.product}" hakkında ulaştı.`,
        duration: 10000,
        action: {
          label: "Talebe Git",
          onClick: () => {
            window.location.href = "/business/leads";
          },
        },
      });
    };

    socket.on("new_lead", handleNewLead);

    return () => {
      socket.off("new_lead", handleNewLead);
    };
  }, [socket, isConnected]);

  return null;
}

function OrderNotificationListener() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewOrder = (data) => {
      toast.success("Yeni sipariş!", {
        description: `${data.customerName} · ${data.orderNumber} · ${Number(data.total || 0).toLocaleString("tr-TR")}₺`,
        duration: 8000,
        action: {
          label: "Siparişlere git",
          onClick: () => {
            window.location.href = "/business/orders";
          },
        },
      });
    };

    socket.on("new_order", handleNewOrder);

    return () => {
      socket.off("new_order", handleNewOrder);
    };
  }, [socket, isConnected]);

  return null;
}

export default function BusinessLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [businessType, setBusinessType] = useState(BusinessTypes.INDIVIDUAL);
  const [navigation, setNavigation] = useState(defaultNavigation);
  const [bizPanelExpanded, setBizPanelExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isAuthPage = AUTH_PAGES.includes(pathname);

  const user = session?.user || null;
  const userRole = user?.role || "USER";
  const isAllowed = userRole === "BUSINESS" || userRole === "ADMIN";

  const businessName = user?.businessName || "İşletme Hesabı";
  const businessSlug = user?.businessSlug || null;
  const businessLocation = "Civardaki İşletme Paneli";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/business/settings");
        if (!r.ok || cancelled) return;
        const d = await r.json();
        const t = String(d.businessType || d.type || "").toUpperCase();
        if (t === "CORPORATE") setBusinessType(BusinessTypes.CORPORATE);
      } catch (_) {
        /* sessiz */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setExpandedItem(null);
  }, [pathname]);

  useEffect(() => {
    if (session?.user?.businessIsOpen !== undefined) {
      setIsBusinessOpen(session.user.businessIsOpen);
    }
  }, [session?.user?.businessIsOpen]);

  useEffect(() => {
    const updateNavigation = () => {
      setNavigation(getNavigationWithPreferences(businessType));
    };

    updateNavigation();

    const handleStorageChange = (e) => {
      if (
        e.key === "business-menu-preferences" ||
        e.key === "business-menu-preferences-bh-v1"
      ) {
        updateNavigation();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("menuPreferencesChanged", updateNavigation);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("menuPreferencesChanged", updateNavigation);
    };
  }, [businessType, pathname]);

  useEffect(() => {
    if (!mounted || isAuthPage) return;

    if (status === "unauthenticated") {
      router.replace(
        `/business/login?callbackUrl=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    if (status === "authenticated" && !isAllowed) {
      router.replace("/user/login");
    }
  }, [mounted, status, isAllowed, pathname, router, isAuthPage]);

  const handleLogout = async () => {
    toast.success("Çıkış yapıldı.");
    await signOut({ redirect: false });
    router.push("/business/login");
    router.refresh();
  };

  const userDisplayName = useMemo(() => {
    return user?.name || "İşletme Kullanıcısı";
  }, [user]);

  if (!mounted) {
    return <BusinessLayoutFallback />;
  }

  if (isAuthPage) {
    return <NotificationProvider>{children}</NotificationProvider>;
  }

  if (status === "loading") {
    return <BusinessLayoutFallback />;
  }

  if (status === "unauthenticated" || !isAllowed) {
    return <BusinessLayoutFallback message="Panele yonlendiriliyorsunuz..." />;
  }

  function SidebarContent({ collapsed = false }) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b flex-shrink-0 relative"
          style={{ borderColor: "var(--bh-sidebar-border)" }}
        >
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 min-w-0"
              >
                {!logoError ? (
                  <Image
                    src="/logo.png"
                    alt="Civardaki"
                    width={128}
                    height={32}
                    priority
                    sizes="(min-width: 768px) 128px, 120px"
                    className="h-7 w-auto object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Leaf
                      className="h-5 w-5 text-emerald-300 shrink-0"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <h2 className="text-[12px] font-bold text-white tracking-tight leading-none lowercase">
                        civardaki
                      </h2>
                      <p className="text-[8px] text-white/45 font-semibold uppercase tracking-wide mt-0.5">
                        İşletme Paneli
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center w-full"
            >
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                {!logoError ? (
                  <Image
                    src="/logo.png"
                    alt="Civardaki"
                    width={40}
                    height={40}
                    sizes="40px"
                    className="h-10 w-10 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Leaf className="h-6 w-6 text-emerald-300" />
                )}
              </div>
            </motion.div>
          )}

          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {!collapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden md:flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {!collapsed && (
          <div className="mx-3 mt-2 mb-2 space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-white truncate">
                  {businessName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`text-[8px] font-bold uppercase ${isBusinessOpen ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {isBusinessOpen ? "Açık" : "Kapalı"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBizPanelExpanded((v) => !v)}
                className="p-1.5 rounded-md bg-white/10 text-white/80 hover:bg-white/15 shrink-0"
                title="Detay"
                aria-expanded={bizPanelExpanded}
              >
                {bizPanelExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            {bizPanelExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-2 overflow-hidden"
              >
                <div className="flex items-center gap-1 text-white/40">
                  <MapPinIcon className="w-3 h-3 shrink-0" />
                  <span className="text-[8px] font-semibold truncate">
                    {businessLocation}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const next = !isBusinessOpen;
                      try {
                        const res = await fetch("/api/business/open-status", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ isOpen: next }),
                        });
                        if (res.ok) {
                          const dat = await res.json();
                          setIsBusinessOpen(dat.isOpen);
                          toast.success(dat.isOpen ? "İşletme açıldı." : "İşletme kapatıldı.");
                        } else toast.error("Durum güncellenemedi.");
                      } catch (_) {
                        toast.error("Bir hata oluştu.");
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[8px] font-bold uppercase ${
                      isBusinessOpen
                        ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                        : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    }`}
                  >
                    <PowerIcon className="w-3.5 h-3.5" />
                    {isBusinessOpen ? "Kapat" : "Aç"}
                  </button>
                  <Link
                    href={businessSlug ? `/isletme/${businessSlug}` : "/business/onboarding"}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/10 text-white text-[8px] font-bold uppercase hover:bg-white/15"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    Profil
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <nav
          className={`flex-1 overflow-y-auto no-scrollbar pb-5 ${collapsed ? "px-2" : "px-3"}`}
        >
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-medium text-white/50 tracking-[0.18em] mt-2">
              Menü
            </p>
          )}

          <div className="hidden md:block space-y-0.5">
            {navigation.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                {collapsed ? (
                  <div className="relative group mb-1">
                    {item.disabled ? (
                      <div
                        className="flex items-center justify-center p-2.5 rounded-xl cursor-not-allowed opacity-40 text-blue-100"
                        title={item.disabledReason || item.name}
                        aria-disabled
                      >
                        <item.icon className="h-5 w-5" />
                      </div>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 ${
                          getIsActive(pathname, item.href)
                            ? "bg-white text-[#004aad] shadow-lg"
                            : "text-blue-100 hover:bg-white hover:text-[#004aad]"
                        }`}
                        title={item.name}
                      >
                        <item.icon className="h-5 w-5" />
                      </Link>
                    )}

                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[11px] font-bold rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                      {item.disabled ? item.disabledReason || `${item.name} (yakında)` : item.name}
                    </div>
                  </div>
                ) : (
                  <ExpandableMenu item={item} pathname={pathname} />
                )}
              </motion.div>
            ))}
          </div>

          <div className="md:hidden">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: index * 0.03,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.disabled ? (
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(item.disabledReason || "Bu menü yakında açılacak.")
                      }
                      className="relative w-full flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 cursor-not-allowed opacity-50 bg-white/5 text-blue-100/80"
                      aria-disabled
                    >
                      <item.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 mb-1.5 sm:mb-2" />
                      <span className="text-[11px] sm:text-xs md:text-sm font-medium text-center leading-tight">
                        {item.name}
                      </span>

                      {item.badge && (
                        <Badge
                          variant={item.badge.variant || "new"}
                          className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5"
                        >
                          {item.badge.text}
                        </Badge>
                      )}
                    </button>
                  ) : item.children ? (
                    <button
                      type="button"
                      onClick={() => setExpandedItem(item)}
                      className={`relative w-full flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                        getIsActive(pathname, item.href)
                          ? "bg-white text-[#004aad] shadow-lg"
                          : "bg-white/10 text-blue-100 hover:bg-white/20"
                      }`}
                    >
                      <item.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 mb-1.5 sm:mb-2" />
                      <span className="text-[11px] sm:text-xs md:text-sm font-medium text-center leading-tight">
                        {item.name}
                      </span>

                      {item.badge && (
                        <Badge
                          variant={item.badge.variant || "new"}
                          className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5"
                        >
                          {item.badge.text}
                        </Badge>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative w-full flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                        getIsActive(pathname, item.href)
                          ? "bg-white text-[#004aad] shadow-lg"
                          : "bg-white/10 text-blue-100 hover:bg-white/20"
                      }`}
                    >
                      <item.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 mb-1.5 sm:mb-2" />
                      <span className="text-[11px] sm:text-xs md:text-sm font-medium text-center leading-tight">
                        {item.name}
                      </span>

                      {item.badge && (
                        <Badge
                          variant={item.badge.variant || "new"}
                          className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5"
                        >
                          {item.badge.text}
                        </Badge>
                      )}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {expandedItem && expandedItem.children && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setExpandedItem(null)}
                  className="fixed inset-0 bg-black/50 z-[60] md:hidden"
                />

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ type: "spring", damping: 25 }}
                  className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] md:hidden max-h-[80vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">
                      {expandedItem.name}
                    </h3>
                    <button
                      onClick={() => setExpandedItem(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                  </div>

                  <div className="p-6 space-y-2">
                    {expandedItem.children.map((child) => {
                      const isChildActive = getIsActive(pathname, child.href);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => {
                            setSidebarOpen(false);
                            setExpandedItem(null);
                          }}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                            isChildActive
                              ? "bg-[#004aad] text-white shadow-lg"
                              : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          <span className="font-medium">{child.name}</span>
                          {child.badge && (
                            <Badge
                              variant={child.badge.variant || "new"}
                              className="ml-2"
                            >
                              {child.badge.text}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className={`mt-4 ${collapsed ? "px-0" : "px-1"}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : "justify-start gap-3"
              } p-3 rounded-xl transition-all duration-200 group ${
                collapsed
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-white/10 text-white hover:bg-white hover:text-[#004aad]"
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
        </nav>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <LeadNotificationListener />
      <OrderNotificationListener />

      <div className="min-h-screen" style={{ background: "var(--bh-main-bg)" }}>
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
                className="fixed inset-0 flex flex-col w-full z-50 md:hidden"
                style={{ background: "var(--bh-sidebar-bg)" }}
              >
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div
          initial={false}
          animate={{
            width: sidebarCollapsed ? 80 : 288,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30"
        >
          <div
            className="flex-1 flex flex-col min-h-0 shadow-2xl"
            style={{ background: "var(--bh-sidebar-bg)" }}
          >
            <SidebarContent collapsed={sidebarCollapsed} />
          </div>
        </motion.div>

        {sidebarCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => setSidebarCollapsed(false)}
            className="hidden md:flex fixed top-4 left-[88px] z-40 items-center justify-center h-10 w-10 rounded-full text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ background: "var(--bh-sidebar-bg)" }}
            title="Sidebar'ı Genişlet"
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </motion.button>
        )}

        <motion.div
          initial={false}
          animate={{
            paddingLeft: isMobile ? 0 : sidebarCollapsed ? 80 : 288,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex flex-col flex-1 min-h-screen"
        >
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-lg border-b border-gray-200 sticky top-0 md:static z-20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-3 sm:py-4 md:py-6">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="min-w-0 border-slate-200">
                    <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight uppercase">
                      {businessName}
                    </h1>
                    <p className="text-[10px] text-slate-500 font-semibold hidden sm:block">
                      İşletme özeti
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <NotificationDropdown />

                  <div className="flex items-center space-x-2 bg-gray-50/50 border border-gray-100 rounded-xl px-2 py-1.5 sm:px-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="text-right hidden md:block">
                      <p className="font-bold text-gray-900 text-[11px] leading-none mb-1">
                        {userDisplayName}
                      </p>
                      <p className="text-[9px] text-[#004aad] font-black uppercase tracking-tighter">
                        {userRole === "ADMIN" ? "Yönetici" : "İşletme Hesabı"}
                      </p>
                    </div>

                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#004aad] to-blue-600 flex items-center justify-center shadow-md flex-shrink-0 relative overflow-hidden">
                      {user?.image ? (
                        <Image
                          src={user.image}
                          alt={userDisplayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs font-bold">
                          {getInitials(userDisplayName)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          <main className="flex-1" style={{ background: "var(--bh-main-bg)" }}>
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
      </div>

      <AIAssistant />
    </NotificationProvider>
  );
}
