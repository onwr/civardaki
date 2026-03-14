"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "@heroicons/react/24/outline";
import { useMenuPreferences } from "@/hooks/useMenuPreferences";
import { BusinessTypes, defaultNavigation } from "@/lib/navigation-config";
import { toast } from "sonner";

function SortableMenuItem({
  item,
  itemId,
  isVisible,
  onToggleVisibility,
  index,
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
    opacity: isDragging ? 0.6 : 1,
    scale: isDragging ? 1.02 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-[2rem] border-2 group ${isDragging ? "border-[#004aad] shadow-2xl" : "border-gray-50 shadow-sm hover:border-blue-100"
        } p-6 mb-4 transition-all`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-[#004aad] transition-colors"
          >
            <Bars4Icon className="h-5 w-5" />
          </div>
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-blue-50/50 rounded-2xl flex items-center justify-center text-[#004aad] group-hover:scale-110 transition-transform">
              <item.icon className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-gray-950 uppercase tracking-tighter italic">{item.name}</span>
              <p className="text-[9px] font-black text-gray-400 tracking-widest uppercase mt-0.5">Navigation Module</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => onToggleVisibility(itemId, isVisible)}
          className={`p-4 rounded-2xl transition-all ${isVisible
            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            }`}
        >
          {isVisible ? <EyeIcon className="h-6 w-6" /> : <EyeSlashIcon className="h-6 w-6" />}
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
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-3 ml-12 ${isDragging ? "shadow-xl border-[#004aad]" : "shadow-sm hover:bg-white transition-all"
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 text-gray-300 hover:text-[#004aad]"
          >
            <Bars3Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-gray-700 italic uppercase">
            {child.name}
          </span>
        </div>
        <button
          onClick={() => onToggleVisibility(parentId, childId, isVisible)}
          className={`p-2 rounded-xl transition-all ${isVisible
            ? "bg-emerald-50 text-emerald-500"
            : "bg-white text-gray-300 border border-gray-100"
            }`}
        >
          {isVisible ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
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
    hidden: [
      "/business/ecommerce",
      "/business/hr",
      "/business/cash",
    ],
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
    hidden: ["/business/hr", "/business/cash"],
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
    hidden: ["/business/hr", "/business/cash", "/business/ecommerce", "/business/planning"],
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
        orderPriority: ["/business/hr/leaves", "/business/hr/payroll", "/business/hr/performance", "/business/hr/training"],
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
        orderPriority: ["/business/hr/payroll", "/business/hr/leaves", "/business/hr/performance", "/business/hr/training"],
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
      "/business/cash",
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
      "/business/cash",
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
      "/business/cash",
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
      "/business/cash": {
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
        if (!cancelled && (type === BusinessTypes.INDIVIDUAL || type === BusinessTypes.CORPORATE)) {
          setBusinessType(type);
        }
      } catch {
        // Sessiz fallback: default bireysel
      }
    })();
    return () => { cancelled = true; };
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeIndex = preferences.order.findIndex(item => item.id === active.id);
    const overIndex = preferences.order.findIndex(item => item.id === over.id);
    const newOrder = arrayMove(preferences.order, activeIndex, overIndex);
    updateOrder(newOrder);
    toast.success("Ana menü dizilimi güncellendi.");
  };

  const handleChildDragEnd = (parentId) => (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const parentChildren = preferences.children[parentId]?.order || [];
    const activeIndex = parentChildren.findIndex(item => item.id === active.id);
    const overIndex = parentChildren.findIndex(item => item.id === over.id);
    const newOrder = arrayMove(parentChildren, activeIndex, overIndex);
    updateChildOrder(parentId, newOrder);
    toast.success("Alt menü hiyerarşisi güncellendi.");
  };

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
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
    const prioritized = (preset.orderPriority || []).filter((id) => scopedMainIds.includes(id));
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
      const childPriority = (childPreset.orderPriority || []).filter((id) => allChildIds.includes(id));
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-50 border-t-[#004aad] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 max-w-[1400px] mx-auto px-6 font-sans antialiased text-gray-900">

      {/* 1. ELITE ARCHITECT HERO */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#004aad] rounded-[4rem] p-10 md:p-14 text-white relative overflow-hidden shadow-3xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl pointer-events-none">
          <Squares2X2Icon className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2.5rem] bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/10">
                <Squares2X2Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none italic">Arayüz Mimarı</h1>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.4em] mt-1">UX/UI Navigation Flow & Menu Engineering</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => { reset(); toast.info("Varsayılan düzene dönüldü."); }} className="px-8 py-6 bg-white/10 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-gray-950 transition-all border border-white/10 active:scale-95">
              FABRİKA AYARLARI
            </button>
            <button className="px-10 py-6 bg-white text-[#004aad] rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-4">
              <CheckCircleIcon className="w-6 h-6" /> DÜZENİ ONAYLA
            </button>
          </div>
        </div>
      </motion.div>

      {/* 1.5 PRESET SHORTCUTS */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-8 md:p-10 mx-2">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h3 className="text-2xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">Hazır Düzenler</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">
              İşletme tipi: {businessType === BusinessTypes.CORPORATE ? "Kurumsal" : "Bireysel"}
            </p>
          </div>
          <div className="px-4 py-2 bg-blue-50 text-[#004aad] rounded-xl text-[10px] font-black uppercase tracking-widest">
            Tek tıkla uygula
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {presetOptions.map((preset) => (
            <div key={preset.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#004aad]">
                  <preset.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-gray-900 uppercase tracking-tight">{preset.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => applyPreset(preset)}
                className="mt-auto py-3 px-4 rounded-xl bg-[#004aad] text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                Düzeni Uygula
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MAIN CONFIGURATION CANVAS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 mx-2">

        {/* ARCHITECTURE PANEL */}
        <div className="xl:col-span-12 space-y-8">
          <div className="flex items-center justify-between px-10">
            <div>
              <h3 className="text-2xl font-black text-gray-950 uppercase italic tracking-tighter leading-none">Menü Hiyerarşisi</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Drag & Drop Engine Active</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] bg-blue-50 px-6 py-3 rounded-full text-[#004aad] font-black uppercase tracking-widest">
              <ArrowPathIcon className="w-4 h-4 animate-spin-slow" /> Senkronizasyon Aktif
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedVisiblePrefs.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {sortedVisiblePrefs.map(pref => {
                  const item = visibleNavigation.find(nav => (nav.href || `menu-${visibleNavigation.indexOf(nav)}`) === pref.id);
                  if (!item) return null;
                  const isVisible = !preferences.hidden.includes(pref.id);
                  const isExpanded = expandedItems[pref.id] || false;
                  const childPrefs = preferences.children[pref.id];

                  return (
                    <div key={pref.id} className="group/parent flex flex-col">
                      <SortableMenuItem
                        item={item} itemId={pref.id} isVisible={isVisible} index={pref.index}
                        onToggleVisibility={(id, vis) => { toggleVisibility(id, vis); toast.info(vis ? "Modül devre dışı bırakıldı." : "Modül yayına alındı."); }}
                      />
                      {item.children && isVisible && (
                        <div className="flex flex-col">
                          <button onClick={() => toggleExpanded(pref.id)} className="ml-24 mb-4 flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-wider hover:text-[#004aad] transition-colors">
                            {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                            Alt Katmanlar ({item.children.length})
                          </button>
                          <AnimatePresence>
                            {isExpanded && childPrefs && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChildDragEnd(pref.id)}>
                                  <SortableContext items={childPrefs.order.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    {childPrefs.order.sort((a, b) => a.index - b.index).map(childPref => {
                                      const child = item.children.find(c => c.href === childPref.id);
                                      if (!child) return null;
                                      return <SortableChildMenuItem key={childPref.id} child={child} childId={childPref.id} isVisible={!childPrefs.hidden.includes(childPref.id)} onToggleVisibility={toggleChildVisibility} parentId={pref.id} />;
                                    })}
                                  </SortableContext>
                                </DndContext>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* 3. AI UX INSIGHT */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gray-950 rounded-[4rem] p-12 text-white relative overflow-hidden group mx-2"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
              <SparklesIcon className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">AI UX <span className="text-blue-400">Danışmanı</span></h3>
              <p className="text-gray-400 italic max-w-xl text-sm leading-relaxed">
                İncelediğim kullanım alışkanlıklarınıza göre <span className="text-white font-bold">Finans</span> modülünü en üst sıraya taşımanız günlük operasyon hızınızı <span className="text-emerald-400 font-bold">%12 artırabilir.</span> Az kullanılan modülleri gizleyerek bilişsel yükünüzü optimize edebilirsiniz.
              </p>
            </div>
          </div>
          <button className="px-12 py-6 bg-white text-gray-950 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-400 hover:text-white transition-all shrink-0 italic shadow-4xl">
            ISI HARİTASINI GÖR
          </button>
        </div>
      </motion.div>

    </div>
  );
}
