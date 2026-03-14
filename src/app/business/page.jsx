"use client";

import { useState } from "react";
import Link from "next/link";
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
  Bars4Icon,
  EyeIcon,
  EyeSlashIcon,
  Squares2X2Icon,
  ChartBarIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useMenuPreferences } from "@/hooks/useMenuPreferences";
import { useDashboardPreferences } from "@/hooks/useDashboardPreferences";
import { defaultNavigation } from "@/lib/navigation-config";
import { DEFAULT_WIDGET_LABELS } from "@/lib/dashboard-preferences";
import { toast } from "sonner";

function SortableNavItem({ item, itemId, isVisible, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: itemId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  const Icon = item.icon;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-4 p-4 rounded-2xl border-2 bg-white ${isDragging ? "border-[#004aad] shadow-lg" : "border-gray-100"} hover:border-blue-100 transition-all`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-[#004aad] shrink-0">
          <Bars4Icon className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#004aad] shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-bold text-gray-900 truncate">{item.name}</span>
      </div>
      <button
        type="button"
        onClick={() => onToggle(itemId, isVisible)}
        className={`p-2.5 rounded-xl shrink-0 ${isVisible ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}
        title={isVisible ? "Gizle" : "Göster"}
      >
        {isVisible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
      </button>
    </div>
  );
}

function SortableWidgetItem({ widgetId, label, isVisible, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widgetId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-4 p-4 rounded-2xl border-2 bg-white ${isDragging ? "border-[#004aad] shadow-lg" : "border-gray-100"} hover:border-blue-100 transition-all`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-[#004aad] shrink-0">
          <Bars4Icon className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          <ChartBarIcon className="w-5 h-5" />
        </div>
        <span className="font-bold text-gray-900 truncate">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => onToggle(widgetId, isVisible)}
        className={`p-2.5 rounded-xl shrink-0 ${isVisible ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}
        title={isVisible ? "Gizle" : "Göster"}
      >
        {isVisible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default function BusinessCustomizationPage() {
  const navigation = defaultNavigation;
  const { preferences: menuPrefs, toggleVisibility: menuToggle, updateOrder: menuUpdateOrder } = useMenuPreferences(navigation);
  const { preferences: dashboardPrefs, toggleVisibility: dashboardToggle, updateOrder: dashboardUpdateOrder } = useDashboardPreferences();

  const [menuExpanded, setMenuExpanded] = useState(true);
  const [dashboardExpanded, setDashboardExpanded] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const menuOrder = (menuPrefs.order || []).slice().sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  const dashboardOrder = (dashboardPrefs.order || []).slice().sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const handleMenuDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = menuOrder.map((o) => o.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(menuOrder, oldIndex, newIndex).map((item, index) => ({ ...item, index }));
    menuUpdateOrder(newOrder);
    toast.success("Sidebar sırası güncellendi.");
  };

  const handleDashboardDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = dashboardOrder.map((o) => o.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(ids, oldIndex, newIndex).map((id, index) => ({ id, index }));
    dashboardUpdateOrder(newOrder);
    toast.success("Anasayfa kart sırası güncellendi.");
  };

  return (
    <div className="min-h-screen bg-gray-50/80 p-6 md:p-10 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Başlık + Dashboard link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#004aad] flex items-center justify-center">
              <Cog6ToothIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Özelleştirme</h1>
              <p className="text-sm text-gray-500 mt-0.5">Sidebar ve anasayfa kartlarını sıralayın, gizleyin.</p>
            </div>
          </div>
          <Link
            href="/business/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#004aad] text-white rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors"
          >
            Dashboard&apos;a git <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Sidebar menüsü */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setMenuExpanded((e) => !e)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Squares2X2Icon className="w-6 h-6 text-[#004aad]" />
              <h2 className="text-lg font-black text-gray-900">Sidebar menüsü</h2>
            </div>
            <span className="text-gray-400 text-sm font-bold">{menuExpanded ? "Daralt" : "Genişlet"}</span>
          </button>
          {menuExpanded && (
            <div className="px-6 pb-6 space-y-3">
              <p className="text-xs text-gray-500 mb-4">Sürükleyerek sıralayın, göz ikonu ile gizleyin veya gösterin.</p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMenuDragEnd}>
                <SortableContext items={menuOrder.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                  {menuOrder.map((pref) => {
                    const item = navigation.find((n) => (n.href || `menu-${navigation.indexOf(n)}`) === pref.id);
                    if (!item) return null;
                    const isVisible = !(menuPrefs.hidden || []).includes(pref.id);
                    return (
                      <SortableNavItem
                        key={pref.id}
                        item={item}
                        itemId={pref.id}
                        isVisible={isVisible}
                        onToggle={(id, visible) => {
                          menuToggle(id, visible);
                          toast.success(visible ? "Menü öğesi gizlendi." : "Menü öğesi gösterildi.");
                        }}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
              <Link href="/business/settings/menu-customization" className="inline-block mt-4 text-sm font-bold text-[#004aad] hover:underline">
                Alt menüleri de düzenle →
              </Link>
            </div>
          )}
        </section>

        {/* Anasayfa kartları */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setDashboardExpanded((e) => !e)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-6 h-6 text-[#004aad]" />
              <h2 className="text-lg font-black text-gray-900">Anasayfa (Dashboard) kartları</h2>
            </div>
            <span className="text-gray-400 text-sm font-bold">{dashboardExpanded ? "Daralt" : "Genişlet"}</span>
          </button>
          {dashboardExpanded && (
            <div className="px-6 pb-6 space-y-3">
              <p className="text-xs text-gray-500 mb-4">Sürükleyerek sıralayın, göz ikonu ile kartı gizleyin veya gösterin.</p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDashboardDragEnd}>
                <SortableContext items={dashboardOrder.map((o) => o.id)} strategy={verticalListSortingStrategy}>
                  {dashboardOrder.map((pref) => {
                    const label = DEFAULT_WIDGET_LABELS[pref.id] || pref.id;
                    const isVisible = !(dashboardPrefs.hidden || []).includes(pref.id);
                    return (
                      <SortableWidgetItem
                        key={pref.id}
                        widgetId={pref.id}
                        label={label}
                        isVisible={isVisible}
                        onToggle={(id, visible) => {
                          dashboardToggle(id, visible);
                          toast.success(visible ? "Kart gizlendi." : "Kart gösterildi.");
                        }}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
              <Link href="/business/dashboard?customize=1" className="inline-block mt-4 text-sm font-bold text-[#004aad] hover:underline">
                Dashboard&apos;da özelleştir modunda aç →
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
