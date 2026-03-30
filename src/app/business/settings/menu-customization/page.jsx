"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bars3Icon,
  Bars4Icon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
  Squares2X2Icon,
  BuildingOffice2Icon,
  UserIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useMenuPreferences } from "@/hooks/useMenuPreferences";
import { BusinessTypes, defaultNavigation } from "@/lib/navigation-config";
import { toast } from "sonner";

function StatCard({ title, value, sub, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "from-blue-600 to-indigo-700 text-white",
    emerald: "from-emerald-500 to-emerald-700 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    slate: "from-slate-800 to-slate-900 text-white",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]`}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
          {sub ? <p className="mt-2 text-xs text-white/75">{sub}</p> : null}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
  tone = "white",
  className = "",
  type = "button",
  disabled = false,
}) {
  const tones = {
    green:
      "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white",
    blue: "bg-sky-500 hover:bg-sky-600 border-sky-600 text-white",
    white:
      "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function SortableMenuItem({
  item,
  itemId,
  isVisible,
  onToggleVisibility,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
    zIndex: isDragging ? 40 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-[24px] border bg-white p-5 shadow-sm transition-all ${
        isDragging
          ? "border-[#004aad] shadow-xl"
          : "border-slate-200 hover:border-blue-100 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab rounded-xl bg-slate-100 p-3 text-slate-400 transition hover:text-[#004aad] active:cursor-grabbing"
          >
            <Bars4Icon className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#004aad]">
              <item.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold uppercase tracking-tight text-slate-900">
                {item.name}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Navigation Module
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleVisibility(itemId, isVisible)}
          className={`rounded-2xl p-3 transition ${
            isVisible
              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
          }`}
        >
          {isVisible ? (
            <EyeIcon className="h-5 w-5" />
          ) : (
            <EyeSlashIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function SortableChildMenuItem({
  child,
  childId,
  isVisible,
  onToggleVisibility,
  parentId,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: childId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`ml-10 rounded-2xl border p-4 ${
        isDragging
          ? "border-[#004aad] bg-white shadow-lg"
          : "border-slate-200 bg-slate-50 hover:bg-white"
      } transition-all`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#004aad] active:cursor-grabbing"
          >
            <Bars3Icon className="h-4 w-4" />
          </button>

          <span className="truncate text-sm font-semibold uppercase tracking-tight text-slate-700">
            {child.name}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleVisibility(parentId, childId, isVisible)}
          className={`rounded-xl p-2 transition ${
            isVisible
              ? "bg-emerald-50 text-emerald-500"
              : "border border-slate-200 bg-white text-slate-300"
          }`}
        >
          {isVisible ? (
            <EyeIcon className="h-4 w-4" />
          ) : (
            <EyeSlashIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

const MENU_PRESETS = [
  {
    id: "bireysel_hizli_baslangic",
    title: "Bireysel Hızlı Başlangıç",
    description: "Saha operasyonu, müşteri ve randevu süreçlerini öne alır.",
    allowedTypes: [BusinessTypes.INDIVIDUAL],
    icon: UserIcon,
    showOnly: [
      "/business/dashboard",
      "/business/customers",
      "/business/reservations",
      "/business/orders",
      "/business/products",
      "/business/leads",
      "/business/reviews",
      "/business/analytics",
      "/business/settings",
    ],
    orderPriority: [
      "/business/dashboard",
      "/business/customers",
      "/business/reservations",
      "/business/orders",
      "/business/products",
      "/business/analytics",
    ],
    hidden: ["/business/ecommerce", "/business/hr", "/business/cash/accounts"],
    children: {},
  },
  {
    id: "bireysel_randevu_odakli",
    title: "Bireysel Randevu Odaklı",
    description: "Randevu, takvim ve müşteri takibini önceliklendirir.",
    allowedTypes: [BusinessTypes.INDIVIDUAL],
    icon: UserIcon,
    showOnly: [
      "/business/dashboard",
      "/business/reservations",
      "/business/calendar",
      "/business/customers",
      "/business/orders",
      "/business/leads",
      "/business/analytics",
      "/business/settings",
    ],
    orderPriority: [
      "/business/dashboard",
      "/business/reservations",
      "/business/calendar",
      "/business/customers",
      "/business/orders",
      "/business/analytics",
    ],
    hidden: ["/business/hr", "/business/ecommerce"],
    children: {},
  },
  {
    id: "bireysel_satis_odakli",
    title: "Bireysel Satış Odaklı",
    description: "Sipariş, ürün ve talepleri üstte tutar.",
    allowedTypes: [BusinessTypes.INDIVIDUAL],
    icon: SparklesIcon,
    showOnly: [
      "/business/dashboard",
      "/business/orders",
      "/business/products",
      "/business/leads",
      "/business/customers",
      "/business/reviews",
      "/business/analytics",
      "/business/settings",
    ],
    orderPriority: [
      "/business/dashboard",
      "/business/orders",
      "/business/products",
      "/business/leads",
      "/business/customers",
      "/business/analytics",
    ],
    hidden: ["/business/hr", "/business/cash/accounts"],
    children: {},
  },
  {
    id: "bireysel_sade_panel",
    title: "Bireysel Sade Panel",
    description: "Daha az menü ile sade ve hızlı kullanım sağlar.",
    allowedTypes: [BusinessTypes.INDIVIDUAL],
    icon: UserIcon,
    showOnly: [
      "/business/dashboard",
      "/business/customers",
      "/business/orders",
      "/business/products",
      "/business/reservations",
      "/business/settings",
    ],
    orderPriority: [
      "/business/dashboard",
      "/business/customers",
      "/business/orders",
      "/business/products",
      "/business/reservations",
    ],
    hidden: [
      "/business/hr",
      "/business/cash/accounts",
      "/business/ecommerce",
      "/business/planning",
    ],
    children: {},
  },
  {
    id: "bireysel_pazarlama_odakli",
    title: "Bireysel Pazarlama Odaklı",
    description: "Yorum, talepler ve analitik kartlarını ön plana taşır.",
    allowedTypes: [BusinessTypes.INDIVIDUAL],
    icon: SparklesIcon,
    showOnly: [
      "/business/dashboard",
      "/business/leads",
      "/business/reviews",
      "/business/analytics",
      "/business/customers",
      "/business/orders",
      "/business/settings",
    ],
    orderPriority: [
      "/business/dashboard",
      "/business/leads",
      "/business/reviews",
      "/business/analytics",
      "/business/customers",
      "/business/orders",
    ],
    hidden: ["/business/hr"],
    children: {},
  },
  {
    id: "kurumsal_operasyon",
    title: "Kurumsal Operasyon",
    description: "Sipariş, ekip ve planlama süreçlerini dengeli gösterir.",
    allowedTypes: [BusinessTypes.CORPORATE],
    icon: BuildingOffice2Icon,
    orderPriority: [
      "/business/dashboard",
      "/business/orders",
      "/business/employees",
      "/business/hr",
      "/business/planning",
      "/business/reservations",
      "/business/products",
      "/business/analytics",
    ],
    hidden: [],
    children: {
      "/business/hr": {
        orderPriority: [
          "/business/hr/leaves",
          "/business/hr/payroll",
          "/business/hr/performance",
          "/business/hr/training",
        ],
      },
    },
  },
  {
    id: "kurumsal_hr_odakli",
    title: "Kurumsal İK Odaklı",
    description: "Çalışan ve insan kaynakları süreçlerini üstte konumlandırır.",
    allowedTypes: [BusinessTypes.CORPORATE],
    icon: BuildingOffice2Icon,
    orderPriority: [
      "/business/dashboard",
      "/business/employees",
      "/business/hr",
      "/business/planning",
      "/business/reservations",
      "/business/customers",
      "/business/orders",
    ],
    hidden: [],
    children: {
      "/business/hr": {
        orderPriority: [
          "/business/hr/payroll",
          "/business/hr/leaves",
          "/business/hr/performance",
          "/business/hr/training",
        ],
      },
    },
  },
  {
    id: "kurumsal_ecommerce_odakli",
    title: "Kurumsal E-Ticaret Odaklı",
    description: "E-ticaret operasyonlarını merkezde tutar.",
    allowedTypes: [BusinessTypes.CORPORATE],
    icon: SparklesIcon,
    orderPriority: [
      "/business/dashboard",
      "/business/ecommerce",
      "/business/orders",
      "/business/products",
      "/business/cash/accounts",
      "/business/analytics",
    ],
    hidden: ["/business/hr"],
    children: {
      "/business/ecommerce": {
        orderPriority: [
          "/business/ecommerce/sales",
          "/business/ecommerce/reconciliation",
          "/business/ecommerce/listing",
          "/business/ecommerce/price-update",
          "/business/ecommerce/product-matching",
          "/business/ecommerce/statistics",
        ],
      },
    },
  },
  {
    id: "kurumsal_musteri_odakli",
    title: "Kurumsal Müşteri Odaklı",
    description: "Müşteri, talepler ve değerlendirme akışını öne çıkarır.",
    allowedTypes: [BusinessTypes.CORPORATE],
    icon: BuildingOffice2Icon,
    orderPriority: [
      "/business/dashboard",
      "/business/customers",
      "/business/leads",
      "/business/reviews",
      "/business/reservations",
      "/business/orders",
      "/business/analytics",
    ],
    hidden: [],
    children: {},
  },
  {
    id: "kurumsal_sade_panel",
    title: "Kurumsal Sade Panel",
    description: "Yoğun modülleri gizleyip temel operasyonlara odaklanır.",
    allowedTypes: [BusinessTypes.CORPORATE],
    icon: SparklesIcon,
    orderPriority: [
      "/business/dashboard",
      "/business/orders",
      "/business/customers",
      "/business/products",
      "/business/cash/accounts",
      "/business/analytics",
    ],
    hidden: ["/business/hr", "/business/ecommerce", "/business/planning"],
    children: {},
  },
  {
    id: "kurumsal_finans_odakli",
    title: "Kurumsal Finans Odaklı",
    description: "Finans, e-ticaret ve satış görünürlüğünü artırır.",
    allowedTypes: [BusinessTypes.CORPORATE],
    icon: SparklesIcon,
    orderPriority: [
      "/business/dashboard",
      "/business/cash/accounts",
      "/business/ecommerce",
      "/business/orders",
      "/business/products",
      "/business/analytics",
      "/business/employees",
    ],
    hidden: [],
    children: {
      "/business/ecommerce": {
        orderPriority: [
          "/business/ecommerce/sales",
          "/business/ecommerce/reconciliation",
          "/business/ecommerce/statistics",
          "/business/ecommerce/listing",
        ],
      },
      "/business/cash/accounts": {
        orderPriority: [
          "/business/cash/accounts",
          "/business/cash/expenses",
          "/business/cash/e-invoices",
          "/business/cash/projects",
        ],
      },
    },
  },
];

export default function MenuCustomizationPage() {
  const [navigation] = useState(() => defaultNavigation);
  const {
    preferences,
    isLoading,
    toggleVisibility,
    toggleChildVisibility,
    updateOrder,
    updateChildOrder,
    reset,
    savePreferences,
  } = useMenuPreferences(navigation);

  const [expandedItems, setExpandedItems] = useState({});
  const [businessType, setBusinessType] = useState(BusinessTypes.INDIVIDUAL);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/business/settings", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        const type = String(data?.businessType || data?.type || "").toLowerCase();
        if (
          !cancelled &&
          (type === BusinessTypes.INDIVIDUAL || type === BusinessTypes.CORPORATE)
        ) {
          setBusinessType(type);
        }
      } catch {
        // silent
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleNavigation = useMemo(
    () =>
      navigation.filter(
        (item) => !item.allowedTypes || item.allowedTypes.includes(businessType)
      ),
    [navigation, businessType]
  );

  const presetOptions = useMemo(
    () => MENU_PRESETS.filter((preset) => preset.allowedTypes.includes(businessType)),
    [businessType]
  );

  const stats = useMemo(() => {
    const totalMain = visibleNavigation.length;
    const totalChildren = visibleNavigation.reduce(
      (sum, item) => sum + (item.children?.length || 0),
      0
    );
    const hiddenMain = preferences.hidden.length;
    const activePresets = presetOptions.length;

    return { totalMain, totalChildren, hiddenMain, activePresets };
  }, [visibleNavigation, preferences.hidden, presetOptions]);

  const handleSave = async () => {
    try {
      await savePreferences();
      toast.success("Menü düzeni kaydedildi.");
    } catch {
      toast.error("Menü düzeni kaydedilemedi.");
    }
  };

  const handleReset = () => {
    reset();
    toast.info("Varsayılan düzene dönüldü.");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = preferences.order.findIndex((item) => item.id === active.id);
    const overIndex = preferences.order.findIndex((item) => item.id === over.id);
    const newOrder = arrayMove(preferences.order, activeIndex, overIndex);

    updateOrder(newOrder);
    toast.success("Ana menü dizilimi güncellendi.");
  };

  const handleChildDragEnd = (parentId) => (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const parentChildren = preferences.children[parentId]?.order || [];
    const activeIndex = parentChildren.findIndex((item) => item.id === active.id);
    const overIndex = parentChildren.findIndex((item) => item.id === over.id);
    const newOrder = arrayMove(parentChildren, activeIndex, overIndex);

    updateChildOrder(parentId, newOrder);
    toast.success("Alt menü sırası güncellendi.");
  };

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const applyPreset = (preset) => {
    const mainIds = visibleNavigation.map((item, index) => item.href || `menu-${index}`);
    const navMap = Object.fromEntries(
      visibleNavigation.map((item, index) => [item.href || `menu-${index}`, item])
    );

    const showOnlyIds = Array.isArray(preset.showOnly)
      ? preset.showOnly.filter((id) => mainIds.includes(id))
      : null;

    const scopedMainIds = showOnlyIds?.length ? showOnlyIds : mainIds;
    const prioritized = (preset.orderPriority || []).filter((id) =>
      scopedMainIds.includes(id)
    );
    const remaining = scopedMainIds.filter((id) => !prioritized.includes(id));
    const orderedIds = [...prioritized, ...remaining];

    const order = orderedIds.map((id, index) => ({
      id,
      name: navMap[id]?.name || id,
      index,
    }));

    const autoHidden = showOnlyIds?.length
      ? mainIds.filter((id) => !showOnlyIds.includes(id))
      : [];

    const hidden = Array.from(
      new Set([
        ...autoHidden,
        ...(preset.hidden || []).filter((id) => mainIds.includes(id)),
      ])
    );

    const children = {};
    visibleNavigation.forEach((item, navIndex) => {
      if (!item.children?.length) return;
      const parentId = item.href || `menu-${navIndex}`;
      const allChildIds = item.children.map((child) => child.href).filter(Boolean);
      const childPreset = preset.children?.[parentId] || {};
      const childPriority = (childPreset.orderPriority || []).filter((id) =>
        allChildIds.includes(id)
      );
      const childRemaining = allChildIds.filter((id) => !childPriority.includes(id));
      const childOrderIds = [...childPriority, ...childRemaining];

      children[parentId] = {
        order: childOrderIds.map((id, index) => ({
          id,
          name: item.children.find((child) => child.href === id)?.name || id,
          index,
        })),
        hidden: (childPreset.hidden || []).filter((id) => allChildIds.includes(id)),
      };
    });

    savePreferences({ order, hidden, children });
    toast.success(`${preset.title} düzeni uygulandı.`);
  };

  const sortedVisiblePrefs = useMemo(() => {
    const visibleIds = new Set(
      visibleNavigation.map((item, index) => item.href || `menu-${index}`)
    );

    return [...preferences.order]
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .filter((pref) => visibleIds.has(pref.id));
  }, [preferences.order, visibleNavigation]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 pb-16 pt-8">
        <div className="mx-auto flex max-w-6xl justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                  <Squares2X2Icon className="h-4 w-4" />
                  Menü Düzeni
                </div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Menü Özelleştirme
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Sol menünüzü sürükle bırak ile yeniden sıralayın, görünürlüğünü
                  yönetin ve hazır düzenleri tek tıkla uygulayın.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={handleReset} icon={ArrowPathIcon} tone="white">
                  Varsayılan Düzen
                </ActionButton>
                <ActionButton onClick={handleSave} icon={CheckCircleIcon} tone="green">
                  Değişiklikleri Kaydet
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Ana Menü"
              value={stats.totalMain}
              sub="Görüntülenebilir ana modül"
              icon={Squares2X2Icon}
              tone="blue"
            />
            <StatCard
              title="Alt Menü"
              value={stats.totalChildren}
              sub="Tanımlı alt bağlantılar"
              icon={ChevronRightIcon}
              tone="emerald"
            />
            <StatCard
              title="Gizli Öğeler"
              value={stats.hiddenMain}
              sub="Pasif ana menüler"
              icon={EyeSlashIcon}
              tone="amber"
            />
            <StatCard
              title="Hazır Düzen"
              value={stats.activePresets}
              sub="Bu tipe uygun preset"
              icon={SparklesIcon}
              tone="slate"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hazır Menü Düzenleri</h3>
              <p className="mt-1 text-sm text-slate-500">
                İşletme tipine göre hazırlanmış düzenlerden birini uygulayın.
              </p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#004aad]">
              {businessType === BusinessTypes.CORPORATE ? "Kurumsal" : "Bireysel"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {presetOptions.map((preset) => (
              <div
                key={preset.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#004aad] shadow-sm">
                    <preset.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{preset.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {preset.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="mt-4 w-full rounded-xl bg-[#004aad] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-slate-900"
                >
                  Düzeni Uygula
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Menü Hiyerarşisi</h3>
              <p className="mt-1 text-sm text-slate-500">
                Sürükle bırak ile sıralayın, göz ikonuyla görünürlüğü yönetin.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
              <ArrowPathIcon className="h-4 w-4" />
              Drag & Drop Aktif
            </div>
          </div>

          <div className="p-5">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedVisiblePrefs.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sortedVisiblePrefs.map((pref) => {
                    const item = visibleNavigation.find(
                      (nav) =>
                        (nav.href || `menu-${visibleNavigation.indexOf(nav)}`) === pref.id
                    );
                    if (!item) return null;

                    const isVisible = !preferences.hidden.includes(pref.id);
                    const isExpanded = expandedItems[pref.id] || false;
                    const childPrefs = preferences.children[pref.id];

                    return (
                      <div key={pref.id} className="flex flex-col">
                        <SortableMenuItem
                          item={item}
                          itemId={pref.id}
                          isVisible={isVisible}
                          onToggleVisibility={(id, vis) => {
                            toggleVisibility(id, vis);
                            toast.info(
                              vis ? "Modül gizlendi." : "Modül görünür yapıldı."
                            );
                          }}
                        />

                        {item.children && isVisible ? (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(pref.id)}
                              className="ml-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 transition hover:text-[#004aad]"
                            >
                              {isExpanded ? (
                                <ChevronDownIcon className="h-4 w-4" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4" />
                              )}
                              Alt Menü ({item.children.length})
                            </button>

                            <AnimatePresence>
                              {isExpanded && childPrefs ? (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 overflow-hidden"
                                >
                                  <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleChildDragEnd(pref.id)}
                                  >
                                    <SortableContext
                                      items={childPrefs.order.map((c) => c.id)}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      <div className="space-y-3">
                                        {childPrefs.order
                                          .sort((a, b) => a.index - b.index)
                                          .map((childPref) => {
                                            const child = item.children.find(
                                              (c) => c.href === childPref.id
                                            );
                                            if (!child) return null;

                                            return (
                                              <SortableChildMenuItem
                                                key={childPref.id}
                                                child={child}
                                                childId={childPref.id}
                                                isVisible={
                                                  !childPrefs.hidden.includes(childPref.id)
                                                }
                                                onToggleVisibility={toggleChildVisibility}
                                                parentId={pref.id}
                                              />
                                            );
                                          })}
                                      </div>
                                    </SortableContext>
                                  </DndContext>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </section>
      </div>
    </div>
  );
}