"use client";

import { AnimatePresence } from "framer-motion";
import { InboxIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import OrderCard from "./OrderCard";

export default function OrdersList({
  orders,
  viewMode,
  onOrderDetails,
  onStatusUpdate,
  onCreateDemoOrders,
}) {
  return (
    <section
      className={
        viewMode === "list"
          ? "space-y-3"
          : "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
      }
    >
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
          <div className="col-span-full rounded-[32px] border border-slate-100 bg-white px-6 py-16 text-center shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-blue-50">
              <InboxIcon className="h-12 w-12 text-[#0057d9]" />
            </div>

            <h3 className="text-2xl font-black text-slate-950">
              Sipariş bulunamadı
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
              Aradığınız kriterlere uygun sipariş yok. Demo veri yükleyerek
              sipariş ekranını test edebilirsiniz.
            </p>

            <button
              type="button"
              onClick={onCreateDemoOrders}
              className="mt-8 inline-flex h-13 items-center gap-2 rounded-2xl bg-[#0057d9] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,87,217,0.24)] transition hover:bg-[#004cc2]"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Demo Siparişleri Yükle
            </button>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}