"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { getOrderStatusText } from "@/lib/mock-data/user-orders";

export function OrderCard({ order }) {
  const statusText = getOrderStatusText(order.status);

  const statusIcons = {
    pending: ClockIcon,
    confirmed: CheckCircleIcon,
    preparing: ClockIcon,
    on_the_way: TruckIcon,
    delivered: CheckCircleIcon,
    completed: CheckCircleIcon,
    cancelled: XCircleIcon,
  };

  const statusColors = {
    pending: "bg-orange-100 text-orange-800",
    confirmed: "bg-[#004aad]/10 text-[#004aad]",
    preparing: "bg-purple-100 text-purple-800",
    on_the_way: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const StatusIcon = statusIcons[order.status] || ClockIcon;
  const statusColorClass = statusColors[order.status] || "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl hover:shadow-[#004aad]/10 transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={order.businessLogo}
            alt={order.businessName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <Link href={`/isletme/${order.businessSlug || order.businessName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}`}>
            <h3 className="font-semibold text-gray-900 hover:text-[#004aad]">
              {order.businessName}
            </h3>
          </Link>
          <p className="text-sm text-gray-600">
            {order.orderDate.toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColorClass}`}
          >
            <StatusIcon className="h-4 w-4" />
            {statusText}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {item.quantity}x {item.productName}
                {item.variant && ` (${item.variant.value})`}
              </span>
              <span className="text-gray-900 font-semibold">{item.total.toFixed(2)} ₺</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Toplam</p>
          <p className="text-xl font-bold text-[#004aad]">{order.total.toFixed(2)} ₺</p>
        </div>
        <div className="flex gap-2">
          {order.status === "completed" && !order.rating && (
            <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-semibold flex items-center gap-1">
              <StarIcon className="h-4 w-4" />
              Değerlendir
            </button>
          )}
          {order.trackingNumber && (
            <div className="text-sm text-gray-600">
              <p className="font-semibold">Takip No:</p>
              <p>{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>

      {order.rating && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${i < order.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          {order.review && <p className="text-sm text-gray-700">{order.review}</p>}
        </div>
      )}
    </div>
  );
}

