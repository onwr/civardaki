"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { UserCircleIcon, MapPinIcon, TruckIcon, BanknotesIcon, CheckIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { getStatusCardConfig } from "../lib/order-status";
import { formatCurrency, formatOrderTime, formatOrderDate } from "../lib/order-formatters";

export default function OrderCard({ order, onDetails, onStatusUpdate, viewMode }) {
  if (!order) return null;
  const isList = viewMode === "list";
  const config = getStatusCardConfig(order.status);
  const orderNumber = order.orderNumber != null ? String(order.orderNumber) : "—";
  const customerName = order.customerName != null ? String(order.customerName) : "—";
  const customerLoc = order.customerLoc != null ? String(order.customerLoc) : "—";
  const items = Array.isArray(order.items) ? order.items : [];
  const status = order.status;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow transition-shadow ${isList ? "p-4 flex flex-col md:flex-row md:items-center gap-4" : "p-5 flex flex-col gap-4"}`}
    >
      <div className={`flex items-center gap-4 min-w-0 ${isList ? "md:w-[280px] shrink-0" : ""}`}>
        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 relative overflow-hidden shrink-0 flex items-center justify-center">
          {order.customerAvatar && typeof order.customerAvatar === "string" && order.customerAvatar.trim() !== "" ? (
            <Image src={order.customerAvatar} alt={customerName} fill className="object-cover" />
          ) : (
            <UserCircleIcon className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-xs font-semibold text-slate-500 font-mono">{orderNumber}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 ${config.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot} ${status === "PENDING" ? "animate-pulse" : ""}`} />
              {config.text}
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 truncate">{customerName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
            <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
            <p className="text-xs truncate">{customerLoc}</p>
          </div>
        </div>
      </div>

      <div className={`flex-1 min-w-0 ${isList ? "md:border-x border-slate-100 md:px-5 md:flex md:items-center md:gap-6" : "border-t border-slate-100 pt-4"}`}>
        {isList ? (
          <>
            <div className="hidden lg:block min-w-0 flex-1 max-w-[200px]">
              <p className="text-xs text-slate-500 mb-0.5">Sipariş özeti</p>
              <p className="text-sm text-slate-700 truncate">
                {items.map((i) => (i && i.name != null ? String(i.name) : "—")).join(", ")}
              </p>
            </div>
            <div className="shrink-0 text-center">
              <p className="text-xs text-slate-500 mb-0.5">Saat / Tarih</p>
              <p className="text-sm font-semibold text-slate-900">{formatOrderTime(order.createdAt)}</p>
              <p className="text-xs text-slate-500">{formatOrderDate(order.createdAt)}</p>
            </div>
            <div className="shrink-0 text-right min-w-0">
              <p className="text-xs text-slate-500 mb-0.5">Tutar</p>
              <p className="text-lg font-semibold text-slate-900 truncate">{formatCurrency(order.total)}</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-2">Sipariş içeriği</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 truncate max-w-[140px]">
                      {item && item.name != null ? String(item.name) : "—"} ×{item && item.qty != null ? Number(item.qty) : 0}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500 mb-0.5">Toplam</p>
                <p className="text-lg font-semibold text-slate-900">{formatCurrency(order.total)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <TruckIcon className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs font-medium text-slate-700 truncate">{order.deliveryType != null ? String(order.deliveryType) : "—"}</span>
              </div>
              <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <BanknotesIcon className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs font-medium text-slate-700 truncate">{order.paymentMethod != null ? String(order.paymentMethod) : "—"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`flex gap-2 ${isList ? "md:w-[200px] shrink-0 md:flex-col lg:flex-row" : "border-t border-slate-100 pt-4"}`}>
        <button
          type="button"
          onClick={onDetails}
          className="flex-1 min-h-[40px] py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors"
        >
          Detaylar
        </button>
        {status === "PENDING" ? (
          <button
            type="button"
            onClick={() => onStatusUpdate("CONFIRMED")}
            className="flex-1 min-h-[40px] py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <CheckIcon className="w-4 h-4 shrink-0" /> Onayla
          </button>
        ) : status === "DELIVERED" ? (
          <div className="flex-1 min-h-[40px] py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 inline-flex items-center justify-center gap-1.5" aria-hidden>
            <CheckCircleIcon className="w-4 h-4 shrink-0" /> Tamamlandı
          </div>
        ) : (
          <button
            type="button"
            onClick={onDetails}
            className="flex-1 min-h-[40px] py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            Durumu Güncelle
          </button>
        )}
      </div>
    </motion.div>
  );
}
