"use client";

import { AnimatePresence } from "framer-motion";
import { InboxIcon } from "@heroicons/react/24/outline";
import OrderCard from "./OrderCard";

export default function OrdersList({
  orders,
  viewMode,
  onOrderDetails,
  onStatusUpdate,
  onCreateDemoOrders,
}) {
  return (
    <div className={viewMode === "list" ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
      <AnimatePresence mode="popLayout">
        {orders.map((order, idx) => (
          <OrderCard
            key={order && order.id != null ? order.id : `order-${idx}`}
            order={order}
            onDetails={() => onOrderDetails(order)}
            onStatusUpdate={(status) => onStatusUpdate(order.id, status)}
            viewMode={viewMode}
          />
        ))}
        {orders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 bg-white border border-slate-200 rounded-2xl">
            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
              <InboxIcon className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium text-center mb-1">Sipariş bulunamadı</p>
            <p className="text-slate-500 text-sm text-center mb-6 max-w-sm">
              Aradığınız kriterlere uygun sipariş yok. Demo veri yükleyerek sayfayı test edebilirsiniz.
            </p>
            <button
              type="button"
              onClick={onCreateDemoOrders}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors min-h-[44px]"
            >
              Demo siparişleri yükle
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
